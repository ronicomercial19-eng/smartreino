/**
 * Auto-entrega de treinos ao FitPro após qualquer geração/salvamento.
 * Fire-and-forget: falha silenciosa (log apenas) para não travar o fluxo de UI.
 */
import { supabase } from "@/integrations/supabase/client";

export interface AutoDeliverParams {
  athleteId: string;
  planoId?: string | null;
  workoutDate?: string;
  treino?: any;
  contexto?: any;
}

export async function autoDeliverToFitpro(params: AutoDeliverParams): Promise<void> {
  if (!params.athleteId) return;
  const today = params.workoutDate ?? new Date().toISOString().slice(0, 10);
  try {
    const { data, error } = await supabase.functions.invoke("fitpro-deliver-workout", {
      body: {
        athlete_id: params.athleteId,
        aluno_id: params.athleteId,         // compat legacy
        plano_id: params.planoId ?? null,
        workout_date: today,
        historico_id: params.planoId ?? null,
        treino: params.treino ?? { auto: true, plano_id: params.planoId, workout_date: today },
        contexto: params.contexto,
      },
    });
    if (error) console.warn("[autoDeliverToFitpro] erro:", error.message);
    else console.log("[autoDeliverToFitpro] entregue:", data);
  } catch (e: any) {
    console.warn("[autoDeliverToFitpro] exceção:", e?.message ?? e);
  }
}
