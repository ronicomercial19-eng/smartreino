import { useState, useEffect } from "react";
import { PageLayout } from "@/components/shared/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, Dumbbell, Zap, Heart, Sparkles, Loader2, X, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Protocol {
  id: string;
  pillar: string;
  pillar_label: string;
  protocol_id: number;
  protocol_name: string;
  protocol_axis: string;
  variation_id: number;
  variation_name: string;
  variation_focus: string;
  model_id: number;
  model_description: string;
  block_neural: string;
  block_integration: string;
  block_9_template: any;
  block_reset: string;
  rpe_range: string;
  goal_tags: string[];
}

const PILLAR_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  performance: { icon: Zap, color: "text-green-400", bg: "bg-green-500/20 border-green-500/30" },
  estrutural: { icon: Dumbbell, color: "text-blue-400", bg: "bg-blue-500/20 border-blue-500/30" },
  longevidade: { icon: Heart, color: "text-amber-400", bg: "bg-amber-500/20 border-amber-500/30" },
};

const GOAL_FILTERS = [
  { label: "Todos", value: "" },
  { label: "Força", value: "forca" },
  { label: "Hipertrofia", value: "hipertrofia" },
  { label: "Emagrecimento", value: "emagrecimento" },
  { label: "Performance", value: "performance" },
  { label: "Funcional", value: "funcional" },
  { label: "Longevidade", value: "longevidade" },
];

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function isoDay(offset: number): string {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const d = new Date(monday);
  d.setDate(monday.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export default function ProtocolCatalog() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [search, setSearch] = useState("");
  const [goalFilter, setGoalFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [athletes, setAthletes] = useState<{ id: string; nome: string }[]>([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>("");
  const [applyingId, setApplyingId] = useState<string | null>(null);

  // Week mode: até 7 protocolos, 1 por dia (Seg..Dom)
  const [weekMode, setWeekMode] = useState(false);
  const [weekPlan, setWeekPlan] = useState<(string | null)[]>([null, null, null, null, null, null, null]);
  const [applyingWeek, setApplyingWeek] = useState(false);

  // daily_workouts existentes do aluno na semana (dedupe)
  const [existingByDate, setExistingByDate] = useState<Record<string, string>>({});
  // últimos daily_workout_ids gerados
  const [lastGenerated, setLastGenerated] = useState<{ date: string; id: string; protocol: string }[]>([]);

  useEffect(() => {
    loadProtocols();
    loadAthletes();
  }, []);

  useEffect(() => {
    if (selectedAthleteId) loadExisting();
    else setExistingByDate({});
  }, [selectedAthleteId]);

  const loadProtocols = async () => {
    const { data, error } = await (supabase as any)
      .from("smart_treino_protocols")
      .select("*")
      .order("protocol_id")
      .order("variation_id")
      .order("model_id")
      .limit(1000);
    if (error) console.error("Error loading protocols:", error);
    if (data) setProtocols(data as any);
    setLoading(false);
  };

  const loadAthletes = async () => {
    const { data } = await (supabase as any)
      .from("vw_alunos_canonical")
      .select("id, athlete_id, nome");
    if (data) {
      setAthletes(
        data.map((a: any) => ({ id: a.athlete_id ?? a.id, nome: a.nome ?? "Aluno" }))
      );
    }
  };

  const loadExisting = async () => {
    const start = isoDay(0);
    const end = isoDay(6);
    const { data } = await (supabase as any)
      .from("daily_workouts")
      .select("id, workout_date")
      .eq("athlete_id", selectedAthleteId)
      .gte("workout_date", start)
      .lte("workout_date", end);
    const map: Record<string, string> = {};
    (data ?? []).forEach((r: any) => { map[r.workout_date] = r.id; });
    setExistingByDate(map);
  };

  const applyOneProtocol = async (protocolCode: string, workoutDate: string, opts?: { skipConfirm?: boolean }): Promise<any | null> => {
    if (existingByDate[workoutDate] && !opts?.skipConfirm) {
      const ok = window.confirm(
        `Já existe um treino gravado em ${workoutDate} para este aluno.\nDeseja substituir aplicando o protocolo ${protocolCode}?`
      );
      if (!ok) return null;
    }
    const { data, error } = await (supabase as any).rpc("fn_aplicar_protocolo_9x9x9", {
      p_athlete_id: selectedAthleteId,
      p_protocol_id: protocolCode,
      p_data: workoutDate,
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    console.log("[applyProtocol] payload:", data);
    return data;
  };

  const applyProtocolSingle = async (protocolCode: string) => {
    if (!selectedAthleteId) return;
    setApplyingId(protocolCode);
    try {
      const hoje = isoDay(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
      const data = await applyOneProtocol(protocolCode, hoje);
      if (!data) return;

      const generatedId = data?.daily_workout_id ?? data?.id ?? existingByDate[hoje];
      toast({
        title: `Protocolo ${protocolCode} aplicado`,
        description: `${data?.protocol_name ?? ""} — daily_workout_id: ${generatedId ?? "?"}`,
      });
      if (generatedId) {
        setLastGenerated(prev => [{ date: hoje, id: generatedId, protocol: protocolCode }, ...prev].slice(0, 10));
      }
      await loadExisting();

      (supabase as any).functions.invoke("fitpro-deliver-workout", {
        body: { athlete_id: selectedAthleteId, workout_date: hoje, source: "protocol_catalog", treino: data },
      });
    } catch (e: any) {
      toast({ title: "Erro ao aplicar protocolo", description: e.message, variant: "destructive" });
    } finally {
      setApplyingId(null);
    }
  };

  const assignToWeek = (protocolCode: string) => {
    setWeekPlan(prev => {
      const idx = prev.findIndex(v => v === null);
      if (idx === -1) {
        toast({ title: "Semana cheia", description: "7 dias já preenchidos. Remova algum para adicionar outro.", variant: "destructive" });
        return prev;
      }
      const next = [...prev];
      next[idx] = protocolCode;
      return next;
    });
  };

  const clearDay = (i: number) => {
    setWeekPlan(prev => {
      const next = [...prev];
      next[i] = null;
      return next;
    });
  };

  const applyWeek = async () => {
    if (!selectedAthleteId) return;
    const filled = weekPlan.filter(v => v !== null).length;
    if (filled === 0) {
      toast({ title: "Nenhum dia selecionado", description: "Adicione ao menos 1 protocolo à semana.", variant: "destructive" });
      return;
    }
    const conflicts = weekPlan
      .map((code, i) => (code && existingByDate[isoDay(i)] ? isoDay(i) : null))
      .filter(Boolean) as string[];
    if (conflicts.length > 0) {
      const ok = window.confirm(
        `Já existem treinos gravados em: ${conflicts.join(", ")}.\nDeseja substituir todos?`
      );
      if (!ok) return;
    }

    setApplyingWeek(true);
    const results: { date: string; id: string; protocol: string }[] = [];
    try {
      for (let i = 0; i < 7; i++) {
        const code = weekPlan[i];
        if (!code) continue;
        const workoutDate = isoDay(i);
        const data = await applyOneProtocol(code, workoutDate, { skipConfirm: true });
        if (!data) continue;
        const generatedId = data?.daily_workout_id ?? data?.id ?? "";
        results.push({ date: workoutDate, id: generatedId, protocol: code });
      }
      setLastGenerated(prev => [...results, ...prev].slice(0, 20));
      await loadExisting();

      (supabase as any).functions.invoke("fitpro-deliver-week", {
        body: { athlete_id: selectedAthleteId, source: "protocol_catalog_week" },
      });

      toast({
        title: `Semana aplicada (${results.length} dias)`,
        description: results.map(r => `${r.date}: ${r.protocol}`).join(" | "),
      });
    } catch (e: any) {
      toast({ title: "Erro ao aplicar semana", description: e.message, variant: "destructive" });
    } finally {
      setApplyingWeek(false);
    }
  };

  const grouped = protocols.reduce((acc, p) => {
    if (!acc[p.pillar]) acc[p.pillar] = {};
    const pKey = `${p.protocol_id}-${p.protocol_name}`;
    if (!acc[p.pillar][pKey]) acc[p.pillar][pKey] = { name: p.protocol_name, axis: p.protocol_axis, label: p.pillar_label, variations: {} };
    const vKey = `${p.variation_id}-${p.variation_name}`;
    if (!acc[p.pillar][pKey].variations[vKey]) acc[p.pillar][pKey].variations[vKey] = { name: p.variation_name, focus: p.variation_focus, models: [] };
    acc[p.pillar][pKey].variations[vKey].models.push(p);
    return acc;
  }, {} as any);

  const matchesFilter = (p: Protocol) => {
    const matchSearch = !search || p.model_description.toLowerCase().includes(search.toLowerCase()) ||
      p.protocol_name.toLowerCase().includes(search.toLowerCase()) ||
      p.variation_name.toLowerCase().includes(search.toLowerCase());
    const matchGoal = !goalFilter || (p.goal_tags && p.goal_tags.includes(goalFilter));
    return matchSearch && matchGoal;
  };

  if (loading) return <PageLayout title="Catálogo de Protocolos" subtitle="Carregando..."><div /></PageLayout>;

  return (
    <PageLayout title="📋 Catálogo 9x9x9" subtitle={`${protocols.length} protocolos disponíveis na matriz Smart Treino`}>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={selectedAthleteId} onValueChange={setSelectedAthleteId}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Selecionar aluno..." />
            </SelectTrigger>
            <SelectContent>
              {athletes.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 rounded-md border border-border/40 px-3 py-1.5">
            <Switch id="week-mode" checked={weekMode} onCheckedChange={setWeekMode} disabled={!selectedAthleteId} />
            <Label htmlFor="week-mode" className="text-sm cursor-pointer">Modo Semana (até 7)</Label>
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar protocolo..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {GOAL_FILTERS.map((f) => (
              <Badge
                key={f.value}
                variant={goalFilter === f.value ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setGoalFilter(f.value)}
              >
                {f.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Week plan slots */}
        {weekMode && selectedAthleteId && (
          <Card className="border-primary/30">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Semana do aluno · 1 protocolo por dia</CardTitle>
              <Button
                size="sm"
                onClick={applyWeek}
                disabled={applyingWeek || weekPlan.every(v => v === null)}
                className="gap-1"
              >
                {applyingWeek ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                Aplicar semana + entregar FitPro
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {DAY_LABELS.map((lbl, i) => {
                  const code = weekPlan[i];
                  const date = isoDay(i);
                  const exists = !!existingByDate[date];
                  return (
                    <div key={i} className={`rounded border p-2 text-xs space-y-1 ${code ? "bg-primary/10 border-primary/40" : "bg-muted/30 border-border/30"}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-muted-foreground">{lbl} · {date.slice(5)}</span>
                        {code && (
                          <button onClick={() => clearDay(i)} className="text-muted-foreground hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <div className="font-medium">{code ?? <span className="text-muted-foreground">—</span>}</div>
                      {exists && <div className="text-[10px] text-amber-500">já existe (será substituído)</div>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Last generated ids */}
        {lastGenerated.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Últimos daily_workout_id gerados</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1">
              {lastGenerated.map((g, i) => (
                <div key={i} className="font-mono flex gap-2">
                  <span className="text-muted-foreground">{g.date}</span>
                  <Badge variant="outline">{g.protocol}</Badge>
                  <span className="truncate">{g.id}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Pillar sections */}
        {Object.entries(grouped).map(([pillar, protos]: [string, any]) => {
          const cfg = PILLAR_CONFIG[pillar] || PILLAR_CONFIG.performance;
          const Icon = cfg.icon;

          return (
            <Card key={pillar} className={`border ${cfg.bg}`}>
              <CardHeader className="pb-2">
                <CardTitle className={`flex items-center gap-2 ${cfg.color}`}>
                  <Icon className="h-5 w-5" />
                  {(Object.values(protos) as any[])[0]?.label || pillar}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="space-y-1">
                  {Object.entries(protos).map(([pKey, proto]: [string, any]) => (
                    <AccordionItem key={pKey} value={pKey} className="border-border/30">
                      <AccordionTrigger className="text-sm font-medium hover:no-underline">
                        <span>{proto.name} — <span className="text-muted-foreground font-normal">{proto.axis}</span></span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <Accordion type="multiple" className="ml-4 space-y-1">
                          {Object.entries(proto.variations).map(([vKey, variation]: [string, any]) => {
                            const filteredModels = variation.models.filter(matchesFilter);
                            if (filteredModels.length === 0) return null;

                            return (
                              <AccordionItem key={vKey} value={vKey} className="border-border/20">
                                <AccordionTrigger className="text-sm hover:no-underline">
                                  <span>{variation.name} <span className="text-muted-foreground">({variation.focus})</span></span>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="grid gap-2 ml-4">
                                    {filteredModels.map((m: Protocol) => {
                                      const b9 = typeof m.block_9_template === 'string' ? JSON.parse(m.block_9_template) : m.block_9_template;
                                      const isApplying = applyingId === m.id;
                                      const inWeek = weekPlan.includes(m.id);
                                      return (
                                        <div key={m.id} className="flex items-center justify-between bg-background/50 rounded-md p-2 text-sm border border-border/20">
                                          <div>
                                            <span className="font-medium">{m.model_id}.</span> {m.model_description}
                                          </div>
                                          <div className="flex gap-1.5 items-center text-xs text-muted-foreground">
                                            {b9?.sets && <Badge variant="outline" className="text-xs">{b9.sets}×{b9.reps}</Badge>}
                                            {b9?.cadence && <span>⏱ {b9.cadence}</span>}
                                            <span>RPE {m.rpe_range}</span>
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <span>
                                                    {weekMode ? (
                                                      <Button
                                                        size="sm"
                                                        variant={inWeek ? "secondary" : "outline"}
                                                        className="h-7 gap-1"
                                                        disabled={!selectedAthleteId}
                                                        onClick={() => assignToWeek(m.id)}
                                                      >
                                                        <Sparkles className="h-3 w-3" />
                                                        {inWeek ? "Na semana" : "+ dia"}
                                                      </Button>
                                                    ) : (
                                                      <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 gap-1"
                                                        disabled={!selectedAthleteId || isApplying}
                                                        onClick={() => applyProtocolSingle(m.id)}
                                                      >
                                                        {isApplying ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                                        Gerar
                                                      </Button>
                                                    )}
                                                  </span>
                                                </TooltipTrigger>
                                                {!selectedAthleteId && (
                                                  <TooltipContent>Selecione um aluno antes</TooltipContent>
                                                )}
                                              </Tooltip>
                                            </TooltipProvider>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            );
                          })}
                        </Accordion>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageLayout>
  );
}
