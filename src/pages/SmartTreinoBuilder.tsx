import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  SmartTreinoProfile,
  SmartTreinoMacroRules,
  GeneratedStructure,
  getProfile,
  upsertProfile,
  getMacroRules,
  upsertMacroRules,
  getMuscleVolumes,
  saveMuscleVolumes,
  generateSmartTreino,
  verifyWeekWorkouts,
  type WeekWorkoutRow,
  MUSCLE_GROUPS,
} from "@/services/smartTreinoService";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import StepAthleteProfile from "@/components/smart-treino/StepAthleteProfile";
import StepMacroRules from "@/components/smart-treino/StepMacroRules";
import StepMuscleVolume from "@/components/smart-treino/StepMuscleVolume";
import StepParameters from "@/components/smart-treino/StepParameters";
import StepDistribution from "@/components/smart-treino/StepDistribution";
import StepReviewGenerate from "@/components/smart-treino/StepReviewGenerate";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";

const STEPS = [
  "Perfil do Atleta",
  "Periodização",
  "Volume Muscular",
  "Parâmetros",
  "Distribuição",
  "Revisão & Geração",
];

interface MuscleEntry {
  muscle_group: string;
  weekly_sets: number;
  is_emphasis: boolean;
  distribution_json: Record<string, number>;
}

export default function SmartTreinoBuilder() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [selectedAlunoId, setSelectedAlunoId] = useState(searchParams.get("aluno") || "");
  const [athleteName, setAthleteName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // Data state
  const [profile, setProfile] = useState<Partial<SmartTreinoProfile>>({ dominant_profile: "equilibrado", score_global: 0, gargalos_tecnicos: [], riscos_estruturais: [], modalidade_principal: "geral" });
  const [rules, setRules] = useState<Partial<SmartTreinoMacroRules>>({ macro_number: 1, macro_objetivo: "Base técnica / estrutural", reps_range: "8-12", rpe_target: 5.5, progression_type: "technique_first", density_control: true, volume_locked: true, deload_planned: true, descanso_compostos: "75-90s", descanso_acessorios: "60s", descanso_core: "45-60s", carga_inicial_percent: 60, weekly_frequency: 4, status: "active" });
  const [muscles, setMuscles] = useState<MuscleEntry[]>([]);
  const [generatedResult, setGeneratedResult] = useState<GeneratedStructure | null>(null);
  const [savedRulesId, setSavedRulesId] = useState<string | null>(null);

  // Load user + alunos from canonical view (vw_alunos_canonical)
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;
      setUserId(session.user.id);

      const { data: canonical, error } = await (supabase as any)
        .from("vw_alunos_canonical")
        .select("id, athlete_id, nome, objetivo, nivel, status");

      if (error) {
        console.error("[SmartTreinoBuilder] vw_alunos_canonical error:", error);
        toast({
          title: "Erro ao carregar alunos",
          description: error.message,
          variant: "destructive",
        });
        setAthletes([]);
        return;
      }

      const unified = (canonical ?? []).map((a: any) => ({
        id: a.athlete_id ?? a.id,          // uuid canônico
        name: a.nome ?? 'Aluno',           // nome legível
        objetivo: a.objetivo,
        nivel: a.nivel,
        status: a.status,
      }));
      setAthletes(unified);
    });
  }, []);

  // Load existing data when athlete selected
  useEffect(() => {
    if (!selectedAlunoId || !userId) return;
    const athlete = athletes.find(a => a.id === selectedAlunoId);
    setAthleteName(athlete?.name || "");
    setGeneratedResult(null);

    (async () => {
      try {
        const existingProfile = await getProfile(selectedAlunoId);
        if (existingProfile) setProfile(existingProfile);
        else setProfile({ dominant_profile: "equilibrado", score_global: 0, gargalos_tecnicos: [], riscos_estruturais: [], modalidade_principal: "geral" });

        const existingRules = await getMacroRules(selectedAlunoId);
        if (existingRules) {
          setRules(existingRules);
          setSavedRulesId(existingRules.id!);
          const vols = await getMuscleVolumes(existingRules.id!);
          if (vols.length > 0) {
            setMuscles(vols.map(v => ({ muscle_group: v.muscle_group, weekly_sets: v.weekly_sets, is_emphasis: v.is_emphasis, distribution_json: v.distribution_json || {} })));
          } else {
            setMuscles([]);
          }
        } else {
          setSavedRulesId(null);
          setMuscles([]);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [selectedAlunoId, userId, athletes]);

  const saveCurrentStep = async () => {
    if (!userId || !selectedAlunoId) return;
    try {
      if (step === 0) {
        await upsertProfile({ ...profile, aluno_id: selectedAlunoId, professor_id: userId } as SmartTreinoProfile);
        toast({ title: "Perfil salvo" });
      } else if (step === 1 || step === 3) {
        const saved = await upsertMacroRules({ ...rules, aluno_id: selectedAlunoId, professor_id: userId } as SmartTreinoMacroRules);
        setSavedRulesId(saved.id!);
        setRules(saved);
        toast({ title: "Regras salvas" });
      } else if ((step === 2 || step === 4) && savedRulesId) {
        await saveMuscleVolumes(savedRulesId, muscles);
        toast({ title: "Volume salvo" });
      }
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
    }
  };

  const handleNext = async () => {
    await saveCurrentStep();
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const handleGenerate = async (): Promise<GeneratedStructure> => {
    if (!savedRulesId) throw new Error("Salve as regras primeiro");
    await saveCurrentStep();

    // Mapeia objetivo do macro → categoria aceita pela RPC fn_gerar_treino_semana
    const obj = (rules.macro_objetivo ?? "").toLowerCase();
    const categoria =
      obj.includes("força") || obj.includes("forca") ? "Força"
      : obj.includes("condicion") ? "Condicionamento"
      : obj.includes("perda") || obj.includes("emagrec") ? "Perda de Peso"
      : obj.includes("mobil") ? "Mobilidade"
      : "Hipertrofia";
    const diasSemana = rules.weekly_frequency ?? 4;

    const result = await generateSmartTreino(selectedAlunoId, savedRulesId, {
      categoria,
      diasSemana,
    });
    setGeneratedResult(result);

    // Auto-entrega da semana inteira ao FitPro (fire-and-forget)
    try {
      (supabase as any).functions.invoke("fitpro-deliver-week", {
        body: { athlete_id: selectedAlunoId, plano_id: savedRulesId },
      });
    } catch (e) {
      console.warn("[SmartTreinoBuilder] fitpro-deliver-week falhou:", e);
    }

    toast({
      title: "Semana de treino gerada",
      description: `${diasSemana} dias de ${categoria} salvos e enviados ao FitPro.`,
    });
    return result;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <Zap className="h-6 w-6 text-orange-500" />
              <h1 className="text-2xl font-bold">Smart Treino Builder</h1>
              <Badge variant="secondary">v2.0 Premium</Badge>
            </div>

            {/* Athlete selector */}
            <div className="flex items-center gap-4">
              <Select value={selectedAlunoId} onValueChange={v => { setSelectedAlunoId(v); setStep(0); }}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Selecionar atleta..." />
                </SelectTrigger>
                <SelectContent>
                  {athletes.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAlunoId && (
              <>
                {/* Steps indicator */}
                <div className="flex items-center gap-1 overflow-x-auto pb-2">
                  {STEPS.map((s, i) => (
                    <button
                      key={s}
                      onClick={() => setStep(i)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                        i === step
                          ? "bg-primary text-primary-foreground"
                          : i < step
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i + 1}. {s}
                    </button>
                  ))}
                </div>

                {/* Step content */}
                {step === 0 && <StepAthleteProfile profile={profile} onChange={setProfile} athleteName={athleteName} />}
                {step === 1 && <StepMacroRules rules={rules} onChange={setRules} />}
                {step === 2 && <StepMuscleVolume muscles={muscles} onChange={m => setMuscles(m as MuscleEntry[])} />}
                {step === 3 && <StepParameters rules={rules} onChange={setRules} />}
                {step === 4 && <StepDistribution muscles={muscles} onChange={setMuscles} weeklyFrequency={rules.weekly_frequency ?? 4} />}
                {step === 5 && (
                  <StepReviewGenerate
                    profile={profile}
                    rules={rules}
                    muscles={muscles}
                    athleteName={athleteName}
                    onGenerate={handleGenerate}
                    generatedResult={generatedResult}
                  />
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button variant="outline" disabled={step === 0} onClick={() => setStep(s => s - 1)}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                  </Button>
                  {step < STEPS.length - 1 && (
                    <Button onClick={handleNext}>
                      Próximo <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
