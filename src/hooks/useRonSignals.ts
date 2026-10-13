/**
 * useRonSignals — os três sinais reais que aparecem no card de Treino de Hoje:
 * Sync Score (calibração do próprio app do aluno no FitPro), PDI (perfil
 * dinâmico individual) e a semana/fase atual da periodização ativa.
 *
 * Mesmo banco compartilhado do FitPro (mfrydtrzjxscbkaiwfnw). PDI e
 * periodização ficam vazios pra boa parte dos alunos até o professor rodar o
 * wizard correspondente — por isso cada sinal carrega um estado "ready":
 * quando false, a tela mostra ação (calibrar/gerar) em vez de inventar
 * número ou travar o fluxo de prescrição.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type RonSignals = {
  sync: { ready: true; score: number; updatedAt: string | null } | { ready: false };
  pdi: { ready: true; fatigueLevel: "baixa" | "moderada" | "alta"; volumeTolerance: number } | { ready: false };
  cycle: { ready: true; weekLabel: string; phase: string | null } | { ready: false };
  loading: boolean;
};

function pdiFatigueFromParams(p: {
  recovery_rate?: string | null;
  stress_sensitivity?: number | null;
}): "baixa" | "moderada" | "alta" {
  const slowRecovery = p.recovery_rate === "lenta";
  const highStress = (p.stress_sensitivity ?? 0) >= 7;
  if (slowRecovery && highStress) return "alta";
  if (slowRecovery || highStress) return "moderada";
  return "baixa";
}

export function useRonSignals(athleteId: string | null | undefined) {
  const [signals, setSignals] = useState<RonSignals>({
    sync: { ready: false },
    pdi: { ready: false },
    cycle: { ready: false },
    loading: true,
  });

  useEffect(() => {
    if (!athleteId) return;
    let cancelled = false;

    (async () => {
      const [syncRes, pdiRes, cycleRes] = await Promise.all([
        (supabase as any).from("athletes").select("sync_score, sync_score_updated_at").eq("id", athleteId).maybeSingle(),
        (supabase as any).from("user_parameters").select("recovery_rate, stress_sensitivity, volume_tolerance").eq("user_id", athleteId).maybeSingle(),
        (supabase as any).from("vw_periodizacao_ativa_aluno").select("semana_atual, fase_atual, tem_periodizacao").eq("aluno_id", athleteId).maybeSingle(),
      ]);
      if (cancelled) return;

      const sync = syncRes.data?.sync_score != null
        ? { ready: true as const, score: syncRes.data.sync_score, updatedAt: syncRes.data.sync_score_updated_at }
        : { ready: false as const };

      const pdi = pdiRes.data
        ? {
            ready: true as const,
            fatigueLevel: pdiFatigueFromParams(pdiRes.data),
            volumeTolerance: pdiRes.data.volume_tolerance ?? 0,
          }
        : { ready: false as const };

      const cycle = cycleRes.data?.tem_periodizacao && cycleRes.data?.semana_atual
        ? {
            ready: true as const,
            weekLabel: `Semana ${cycleRes.data.semana_atual}`,
            phase: cycleRes.data.fase_atual ?? null,
          }
        : { ready: false as const };

      setSignals({ sync, pdi, cycle, loading: false });
    })();

    return () => { cancelled = true; };
  }, [athleteId]);

  return signals;
}
