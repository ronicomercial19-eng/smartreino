import { supabase } from "@/integrations/supabase/client";

export interface PeriodizacaoAtivaRow {
  aluno_id: string;
  objetivo: string | null;
  nivel: string | null;
  fase_atual: string | null;
  semana_atual: number | null;
  volume_level: string | null;
  intensity_level: string | null;
  recovery_status: string | null;
  adherence_level: number | null;
  fatigue_level: number | null;
  annual_plan_id: string | null;
  athlete_periodization_id: string | null;
  fitpro_periodization_id: string | null;
  fonte: "internal" | "fitpro" | null;
  tem_periodizacao: boolean;
}

export async function getPeriodizacaoAtiva(alunoId: string): Promise<PeriodizacaoAtivaRow | null> {
  if (!alunoId) return null;
  const { data, error } = await (supabase as any)
    .from("vw_periodizacao_ativa_aluno")
    .select("*")
    .eq("aluno_id", alunoId)
    .maybeSingle();
  if (error) {
    console.warn("[periodizacao] erro view:", error.message);
    return null;
  }
  return data as PeriodizacaoAtivaRow;
}

export async function notificarFaltaPeriodizacao(alunoId: string) {
  const { data, error } = await (supabase as any).rpc("notificar_falta_periodizacao", {
    p_aluno_id: alunoId,
  });
  if (error) throw error;
  return data;
}

export interface QuickWorkoutResult {
  success: boolean;
  motivo?: string;
  message?: string;
  prescrição?: any;
  delivery?: any;
}

export async function gerarTreinoRapido(params: {
  alunoId?: string;
  data?: string;
  deliverToFitpro?: boolean;
  objetivo:string;
  tempoMin:number;
  equipamentos:string[];
}): Promise<QuickWorkoutResult> {
  const { data, error } = await supabase.functions.invoke("generate-quick-workout", {
    body: {
      aluno_id: params.alunoId ?? null,
      objetivo:params.objetivo,tempo_min:params.tempoMin,equipamentos:params.equipamentos,
      data: params.data ?? new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo'}).format(new Date()),
      deliver_to_fitpro: params.deliverToFitpro ?? true,
    },
  });
  if (error) {
    // Edge function returns 409 for missing periodization with a JSON body
    const ctx: any = (error as any).context;
    if(ctx instanceof Response){const parsed=await ctx.clone().json().catch(()=>null);if(parsed)return parsed as QuickWorkoutResult;}
    if (ctx?.body) {
      try {
        const parsed = typeof ctx.body === "string" ? JSON.parse(ctx.body) : ctx.body;
        return parsed as QuickWorkoutResult;
      } catch {/* ignore */}
    }
    throw error;
  }
  return data as QuickWorkoutResult;
}

export async function entregarTreinoFitpro(params: {
  alunoId: string;
  treino: any;
  historicoId?: string;
  contexto?: any;
}) {
  const id=params.treino?.daily_workout_id || params.contexto?.daily_workout_id;
  if(!id)throw new Error('Publique a sessão revisada no banco compartilhado antes de confirmar a entrega.');
  const {data,error}=await (supabase as any).from('daily_workouts').select('id,prescription_issue,workout_exercises(id)').eq('id',id).eq('athlete_id',params.alunoId).single();
  if(error)throw error;
  if(data.prescription_issue || !data.workout_exercises?.length)throw new Error('A prescrição precisa de revisão antes da entrega.');
  return {success:true,daily_workout_id:data.id,channel:'shared_database'};
}
