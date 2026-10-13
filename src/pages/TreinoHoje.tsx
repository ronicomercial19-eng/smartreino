import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
  RefreshCw,
  Send,
  Sparkles,
  Check,
  Loader2,
  Flame,
  BatteryMedium,
  ArrowLeftRight,
  Undo2,
  Redo2,
  Wand2,
  CalendarClock,
  Zap,
  Clock,
  AlertCircle,
  Brain,
  Link2,
  RotateCcw,
} from "lucide-react";
import { useTreinoDoDia } from "@/hooks/useTreinoDoDia";
import { useRonSignals } from "@/hooks/useRonSignals";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PeriodizacaoMissingBanner } from "@/components/workout/PeriodizacaoMissingBanner";
import { entregarTreinoFitpro } from "@/services/fitproDelivery";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { ExercicioPrescrito, TreinoPrescrito } from "@/services/prescreverTreinoService";

type Bloco = "neural" | "integracao" | "bloco9" | "reset";

const BLOCOS: { key: Bloco; label: string; icon: typeof Brain }[] = [
  { key: "neural", label: "Neural", icon: Brain },
  { key: "integracao", label: "Integração", icon: Link2 },
  { key: "bloco9", label: "Bloco 9", icon: Flame },
  { key: "reset", label: "Reset", icon: RotateCcw },
];

const INTENSITY_LABEL: Record<string, string> = { leve: "Leve", moderada: "Moderada", alta: "Alta" };

type SwapOption = { id: string; nome: string; grupo_muscular: string | null; matchLabel: string };

export default function TreinoHoje() {
  const { id } = useParams();
  const [search] = useSearchParams();
  const alunoId = id ?? search.get("aluno") ?? undefined;
  const data = search.get("data") ?? undefined;
  const [delivering, setDelivering] = useState(false);

  const { data: treino, isLoading, error, refetch, isFetching } = useTreinoDoDia(alunoId, data);
  const signals = useRonSignals(alunoId);

  // Edições locais aplicadas em cima da prescrição (série/reps/descanso por exercício),
  // trocas de exercício, reverts e override de intensidade — tudo client-side até
  // "Aplicar", quando viram p_changes para aplicar_ajuste_treino_dia.
  const [edits, setEdits] = useState<Record<string, Partial<ExercicioPrescrito>>>({});
  const [revertedIds, setRevertedIds] = useState<Set<string>>(new Set());
  const [swapOpenId, setSwapOpenId] = useState<string | null>(null);
  const [swapOptions, setSwapOptions] = useState<Record<string, SwapOption[]>>({});
  const [swapLoading, setSwapLoading] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [intensityOverride, setIntensityOverride] = useState<"leve" | "moderada" | "alta" | null>(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const gaugeRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  // Reseta edições locais sempre que uma nova prescrição chega (re-prescrever ou troca de aluno/data)
  useEffect(() => {
    setEdits({});
    setRevertedIds(new Set());
    setIntensityOverride(null);
    setApplied(false);
  }, [treino?.historico_id]);

  const semPeriodizacao =
    treino && (treino as any).sucesso === false &&
    (treino as any).motivo === "sem_periodizacao_ativa";

  // Todos os exercícios dos 4 blocos, achatados, com o bloco de origem — usado
  // pro painel de volume e pra achar o exercício ao abrir o menu de troca.
  const allExercises: (ExercicioPrescrito & { bloco: Bloco })[] = useMemo(() => {
    if (!treino?.treino) return [];
    return BLOCOS.flatMap(({ key }) => (treino.treino![key] ?? []).map((ex) => ({ ...ex, bloco: key })));
  }, [treino]);

  const effective = (ex: ExercicioPrescrito & { bloco: Bloco }) => {
    if (revertedIds.has(ex.id)) return ex;
    const e = edits[ex.id];
    return e ? { ...ex, ...e } : ex;
  };

  const changedCount = allExercises.filter((ex) => edits[ex.id] && !revertedIds.has(ex.id)).length;
  const hasEdits = changedCount > 0 || intensityOverride !== null;

  const toggleRevert = (id: string) => {
    setRevertedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const patch = (id: string, delta: Partial<ExercicioPrescrito>) => {
    setEdits((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), ...delta } }));
  };

  // Trocar exercício: busca alternativas reais do catálogo com o mesmo grupo
  // muscular — não precisa abandonar a prescrição inteira pra trocar um item.
  const openSwapMenu = async (ex: ExercicioPrescrito) => {
    if (swapOpenId === ex.id) { setSwapOpenId(null); return; }
    setSwapOpenId(ex.id);
    if (swapOptions[ex.id]) return;
    setSwapLoading(ex.id);
    try {
      const grupo = ex.grupo_muscular ? [ex.grupo_muscular] : [ex.nome];
      const { data: rows } = await (supabase as any)
        .from("exercises")
        .select("id, name, target_muscles")
        .overlaps("target_muscles", grupo)
        .neq("id", ex.id)
        .limit(4);
      const options: SwapOption[] = ((rows as any[]) || []).map((r) => ({
        id: r.id,
        nome: r.name,
        grupo_muscular: r.target_muscles?.[0] ?? null,
        matchLabel: "mesmo grupo",
      }));
      setSwapOptions((prev) => ({ ...prev, [ex.id]: options }));
    } finally {
      setSwapLoading(null);
    }
  };

  const pickSwap = (exId: string, option: SwapOption) => {
    patch(exId, { id: option.id, nome: option.nome, grupo_muscular: option.grupo_muscular ?? undefined } as any);
    setSwapOpenId(null);
  };

  const onGaugePointerMove = (clientX: number) => {
    if (!draggingRef.current || !gaugeRef.current) return;
    const rect = gaugeRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setIntensityOverride(pct < 0.33 ? "leve" : pct < 0.66 ? "moderada" : "alta");
  };

  // Volume dinâmico: total de séries + distribuição por grupo muscular,
  // recalculado a cada edição — só aparece no modo manual.
  const manualVolume = useMemo(() => {
    const byMuscle: Record<string, number> = {};
    let total = 0;
    allExercises.forEach((ex) => {
      const eff = effective(ex);
      total += eff.series;
      const grupo = eff.grupo_muscular || "outros";
      byMuscle[grupo] = (byMuscle[grupo] || 0) + eff.series;
    });
    return { total, byMuscle };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allExercises, edits, revertedIds]);

  const applyAdjustments = async () => {
    if (!treino?.contexto?.aluno_id || !treino.data) return;
    setApplying(true);
    try {
      const changes: Record<string, any> = {};
      if (intensityOverride) changes.intensidade_override = intensityOverride;
      const exercicios: Record<string, any> = {};
      Object.entries(edits).forEach(([exId, delta]) => {
        if (revertedIds.has(exId)) return;
        exercicios[exId] = delta;
      });
      if (Object.keys(exercicios).length > 0) changes.exercicios = exercicios;

      const { error } = await (supabase as any).rpc("aplicar_ajuste_treino_dia", {
        p_athlete_id: treino.contexto.aluno_id,
        p_data: treino.data,
        p_changes: changes,
      });
      if (error) throw error;
      setApplied(true);
      toast({ title: "Ajuste salvo", description: "As alterações foram registradas para o dia." });
    } catch (e: any) {
      toast({ title: "Falha ao aplicar ajuste", description: e.message, variant: "destructive" });
    } finally {
      setApplying(false);
    }
  };

  const enviarFitpro = async () => {
    if (!treino?.sucesso || !treino.contexto) return;
    setDelivering(true);
    try {
      const res: any = await entregarTreinoFitpro({
        alunoId: treino.contexto.aluno_id,
        historicoId: treino.historico_id,
        contexto: treino.contexto,
        treino: treino.treino,
      });
      if (res?.success) {
        toast({
          title: "Treino enviado ao FitPro",
          description: res.mapped ? "Aluno mapeado com sucesso." : "Enviado sem mapeamento — usando aluno_id como referência.",
        });
      } else {
        toast({ title: "Falha ao entregar", description: res?.error ?? "Erro desconhecido", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Erro de rede", description: e.message, variant: "destructive" });
    } finally {
      setDelivering(false);
    }
  };

  const intensity = intensityOverride ?? "moderada";
  const intensityPct = { leve: 20, moderada: 50, alta: 85 }[intensity];
  const needleAngle = { leve: 25, moderada: 90, alta: 155 }[intensity];

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">9FIT · Treino de Hoje</h1>
            <p className="text-sm text-muted-foreground">Prescrição automática · Estrutura NINE</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Re-prescrever
            </Button>
            {treino?.sucesso && (
              <Button size="sm" onClick={enviarFitpro} disabled={delivering} className="gap-2">
                <Send className={`h-4 w-4 ${delivering ? "animate-pulse" : ""}`} />
                Enviar ao FitPro
              </Button>
            )}
          </div>
        </div>

        {semPeriodizacao && alunoId && <PeriodizacaoMissingBanner alunoId={alunoId} />}

        {isLoading && (
          <div className="space-y-4 animate-fade-in">
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-primary text-xs font-semibold tracking-wide">
                  <Sparkles className="w-4 h-4 animate-pulse" /> Ron Coach está lendo o dia…
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {error && (
          <Card className="border-destructive/50">
            <CardContent className="pt-6 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium">Erro ao prescrever treino</p>
                <p className="text-sm text-muted-foreground">{error.message}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {treino && !treino.sucesso && !semPeriodizacao && (
          <Card className="border-primary/40 animate-fade-in">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="font-display font-bold text-lg">Treino indisponível</p>
                  <p className="text-sm text-muted-foreground">Motivo: {treino.motivo}</p>
                </div>
              </div>
              {treino.sugestao_cta === "gerar_smart_treino" && (
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link to="/smart-treino-builder">Gerar plano agora</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {treino?.sucesso && (
          <>
            {/* Card Ron Coach — sinais reais + gauge de intensidade arrastável */}
            <div className="rounded-[28px] border border-primary/25 bg-gradient-to-br from-primary/[0.10] via-card/60 to-transparent p-5">
              <div className="grid grid-cols-3 gap-2 mb-4">
                <SignalTile
                  icon={<RefreshCw className="w-2.5 h-2.5" />}
                  label="Sync"
                  ready={signals.sync.ready}
                  value={signals.sync.ready ? `${signals.sync.score}%` : undefined}
                  flagged={signals.sync.ready && signals.sync.score < 90}
                  emptyAction={null}
                />
                <SignalTile
                  icon={<Zap className="w-2.5 h-2.5" />}
                  label="PDI"
                  ready={signals.pdi.ready}
                  value={signals.pdi.ready ? capitalize(signals.pdi.fatigueLevel) : undefined}
                  flagged={signals.pdi.ready && signals.pdi.fatigueLevel !== "baixa"}
                  emptyAction={alunoId ? { label: "Pedir calibração", onClick: () => toast({ title: "Pedido enviado", description: "O aluno será avisado para calibrar o PDI no app." }) } : null}
                />
                <SignalTile
                  icon={<CalendarClock className="w-2.5 h-2.5" />}
                  label="Ciclo"
                  ready={signals.cycle.ready}
                  value={signals.cycle.ready ? signals.cycle.weekLabel : `Sem. ${treino.contexto!.semana_atual}`}
                  flagged={false}
                  emptyAction={null}
                />
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-[10px] bg-gradient-to-br from-primary to-orange-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold leading-tight">
                    Ron Coach prescreveu o treino de {treino.contexto!.aluno_nome}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Semana {treino.contexto!.semana_atual} · Fase {treino.contexto!.fase}
                    {treino.contexto!.protocolo && ` · ${treino.contexto!.protocolo}`}
                  </p>
                </div>
                {changedCount > 0 && (
                  <span className="text-[10px] font-data px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 shrink-0">
                    {changedCount} {changedCount === 1 ? "ajuste" : "ajustes"}
                  </span>
                )}
              </div>

              {treino.rationale && (
                <p className="mt-3 text-[15px] leading-relaxed text-foreground/90">{treino.rationale}</p>
              )}

              <div className="mt-5 flex items-center gap-4">
                <div
                  ref={gaugeRef}
                  className="relative w-20 h-11 shrink-0 cursor-grab active:cursor-grabbing touch-none"
                  onPointerDown={(e) => { draggingRef.current = true; (e.target as Element).setPointerCapture(e.pointerId); onGaugePointerMove(e.clientX); }}
                  onPointerMove={(e) => onGaugePointerMove(e.clientX)}
                  onPointerUp={() => { draggingRef.current = false; }}
                  onPointerCancel={() => { draggingRef.current = false; }}
                >
                  <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible">
                    <path d="M 6 50 A 44 44 0 0 1 94 50" fill="none" stroke="hsl(var(--muted) / 0.3)" strokeWidth="7" strokeLinecap="round" />
                    <path
                      d="M 6 50 A 44 44 0 0 1 94 50"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={`${(intensityPct / 100) * 138} 138`}
                      className="transition-all duration-200 ease-out"
                    />
                    <line
                      x1="50" y1="50"
                      x2={50 + 34 * Math.cos((Math.PI * (180 - needleAngle)) / 180)}
                      y2={50 - 34 * Math.sin((Math.PI * (180 - needleAngle)) / 180)}
                      stroke="hsl(var(--foreground))"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className="transition-all duration-200 ease-out"
                    />
                    <circle cx="50" cy="50" r="3.5" fill="hsl(var(--foreground))" />
                  </svg>
                  <p className="text-center text-[8px] text-muted-foreground/60 mt-0.5">arraste</p>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                      <Flame className="w-3 h-3" /> Intensidade
                    </p>
                    <p className="text-sm font-bold text-foreground mt-0.5">{INTENSITY_LABEL[intensity]}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> RPE alvo
                    </p>
                    <p className="text-sm font-bold text-foreground mt-0.5">{treino.parametros?.rpe_alvo}</p>
                  </div>
                </div>
              </div>

              {applied && (
                <div className="mt-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2.5 flex items-center gap-2 text-xs text-emerald-300">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  Ajuste registrado para o dia de hoje.
                </div>
              )}
            </div>

            {/* Blocos NINE */}
            <div className="flex items-center justify-between px-1">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Exercícios do dia</p>
              {!manualMode && (
                <button
                  onClick={() => setManualMode(true)}
                  className="text-[11px] text-muted-foreground/70 hover:text-foreground underline decoration-dotted underline-offset-4"
                >
                  ver volume por grupo muscular
                </button>
              )}
            </div>

            {BLOCOS.map(({ key, label, icon: Icon }) => {
              const items = treino.treino?.[key] ?? [];
              if (items.length === 0) return null;
              return (
                <div key={key} className="space-y-2.5">
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 px-1">
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </p>
                  {items.map((ex) => {
                    const exWithBloco = { ...ex, bloco: key };
                    const eff = effective(exWithBloco);
                    const isChanged = !!edits[ex.id] && !revertedIds.has(ex.id);
                    const isReverted = revertedIds.has(ex.id);
                    return (
                      <div
                        key={ex.id}
                        className={`rounded-2xl border p-4 transition-colors ${
                          isChanged ? "border-primary/40 bg-primary/[0.05]" : "border-white/10 bg-card"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate flex items-center gap-1.5">
                              {eff.nome}
                              {isChanged && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                            </p>
                            <p className="text-[12px] text-muted-foreground mt-1 font-data">
                              {eff.series}×{eff.reps} · RPE {eff.rpe} · {eff.descanso}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => openSwapMenu(ex)}
                              aria-label="Trocar exercício"
                              className={`w-7 h-7 rounded-[9px] flex items-center justify-center border transition-colors ${
                                swapOpenId === ex.id ? "bg-primary/15 border-primary/40 text-primary" : "bg-white/5 border-white/10 text-muted-foreground"
                              }`}
                            >
                              <ArrowLeftRight className="w-3 h-3" />
                            </button>
                            {isChanged && (
                              <button
                                onClick={() => toggleRevert(ex.id)}
                                className="text-[10px] font-semibold px-2 py-1 rounded-full border flex items-center gap-1 border-white/10 bg-white/5 text-muted-foreground hover:text-primary hover:border-primary/30"
                              >
                                <Undo2 className="w-2.5 h-2.5" /> desfazer
                              </button>
                            )}
                            {isReverted && (
                              <button
                                onClick={() => toggleRevert(ex.id)}
                                className="text-[10px] font-semibold px-2 py-1 rounded-full border flex items-center gap-1 border-white/10 bg-white/5 text-muted-foreground hover:text-primary hover:border-primary/30"
                              >
                                <Redo2 className="w-2.5 h-2.5" /> refazer
                              </button>
                            )}
                          </div>
                        </div>

                        {swapOpenId === ex.id && (
                          <div className="mt-3 space-y-1.5">
                            {swapLoading === ex.id && (
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 py-1">
                                <Loader2 className="w-3 h-3 animate-spin" /> Buscando alternativas…
                              </div>
                            )}
                            {swapOptions[ex.id]?.length === 0 && swapLoading !== ex.id && (
                              <p className="text-[11px] text-muted-foreground py-1">Nenhuma alternativa encontrada pro mesmo grupo.</p>
                            )}
                            {swapOptions[ex.id]?.map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => pickSwap(ex.id, opt)}
                                className="w-full text-left px-3 py-2 rounded-xl bg-background border border-white/10 text-xs text-foreground/85 flex items-center justify-between hover:border-primary/30"
                              >
                                <span>{opt.nome}</span>
                                <span className="text-[10px] text-emerald-400 font-semibold">{opt.matchLabel}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {manualMode && (
                          <div className="mt-3 grid grid-cols-3 gap-2">
                            <label className="text-[10px] uppercase text-muted-foreground">
                              Séries
                              <input
                                type="number" min={1} max={10} value={eff.series}
                                onChange={(e) => patch(ex.id, { series: Number(e.target.value) })}
                                className="w-full mt-1 bg-transparent border-b border-white/10 py-1 text-sm text-foreground focus:outline-none focus:border-primary"
                              />
                            </label>
                            <label className="text-[10px] uppercase text-muted-foreground">
                              Reps
                              <input
                                value={eff.reps}
                                onChange={(e) => patch(ex.id, { reps: e.target.value })}
                                className="w-full mt-1 bg-transparent border-b border-white/10 py-1 text-sm text-foreground focus:outline-none focus:border-primary"
                              />
                            </label>
                            <label className="text-[10px] uppercase text-muted-foreground">
                              Descanso
                              <input
                                value={eff.descanso}
                                onChange={(e) => patch(ex.id, { descanso: e.target.value })}
                                className="w-full mt-1 bg-transparent border-b border-white/10 py-1 text-sm text-foreground focus:outline-none focus:border-primary"
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Volume dinâmico — só no modo manual */}
            {manualMode && (
              <div className="rounded-[20px] border border-white/10 bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] text-muted-foreground">Volume da sessão</p>
                  <span className="text-xs font-bold font-data">{manualVolume.total} séries</span>
                </div>
                <div className="space-y-2">
                  {Object.entries(manualVolume.byMuscle).map(([muscle, count]) => {
                    const max = Math.max(1, ...Object.values(manualVolume.byMuscle));
                    return (
                      <div key={muscle} className="flex items-center gap-2.5">
                        <span className="text-[11px] text-muted-foreground w-20 shrink-0 truncate capitalize">{muscle}</span>
                        <div className="flex-1 h-[7px] rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${(count / max) * 100}%` }} />
                        </div>
                        <span className="text-[11px] font-bold font-data w-6 text-right shrink-0">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CTA aplicar ajustes — só aparece quando há algo a aplicar */}
            {hasEdits && (
              <button
                onClick={applyAdjustments}
                disabled={applying}
                className={`w-full rounded-full py-4 font-bold tracking-widest uppercase disabled:opacity-40 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform ${
                  applied ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground"
                }`}
              >
                {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {applying ? "Aplicando…" : applied ? "Aplicado" : "Aplicar ajustes de hoje"}
              </button>
            )}

            {/* Nota de persistência: ajuste é registrado em changes_json, mas uma
                nova prescrição (Re-prescrever) ainda regera os exercícios do zero
                a partir do protocolo — correção de fundo planejada em fase separada. */}
            {hasEdits && (
              <p className="text-[10px] text-muted-foreground/60 text-center px-4">
                O ajuste fica registrado para hoje. Se o treino for re-prescrito, ele pode ser substituído pela prescrição original do protocolo.
              </p>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function SignalTile({
  icon,
  label,
  ready,
  value,
  flagged,
  emptyAction,
}: {
  icon: React.ReactNode;
  label: string;
  ready: boolean;
  value?: string;
  flagged?: boolean;
  emptyAction: { label: string; onClick: () => void } | null;
}) {
  return (
    <div className={`rounded-[14px] border px-2.5 py-2 ${flagged ? "border-primary/40 bg-primary/[0.08]" : "border-white/10 bg-white/[0.03]"}`}>
      <p className="text-[9px] text-muted-foreground flex items-center gap-1">{icon} {label}</p>
      {ready ? (
        <p className={`text-sm font-bold mt-0.5 ${flagged ? "text-primary" : "text-foreground"}`}>{value}</p>
      ) : value ? (
        <p className="text-sm font-bold mt-0.5 text-foreground">{value}</p>
      ) : emptyAction ? (
        <button onClick={emptyAction.onClick} className="mt-1 text-[10px] font-semibold text-primary flex items-center gap-1">
          <Wand2 className="w-2.5 h-2.5" /> {emptyAction.label}
        </button>
      ) : (
        <p className="text-sm font-bold mt-0.5 text-muted-foreground">—</p>
      )}
    </div>
  );
}
