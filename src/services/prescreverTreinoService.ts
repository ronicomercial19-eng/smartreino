import { supabase } from "@/integrations/supabase/client";

export interface ExercicioPrescrito {
  id: string;
  workout_exercise_id?: string;
  nome: string;
  grupo_muscular?: string;
  video_url?: string;
  series: number;
  reps: string;
  rpe: number;
  descanso: string;
  cadencia?: string;
  carga?: string;
  nota_tecnica?: string;
}

export interface TreinoPrescrito {
  sucesso: boolean;
  daily_workout_id?: string;
  updated_at?: string;
  preserved?: boolean;
  motivo?: string;
  sugestao_cta?: string;
  data?: string;
  historico_id?: string;
  contexto?: {
    aluno_id: string;
    aluno_nome: string;
    periodizacao_id: string;
    annual_plan_id?: string | null;
    semana_atual: number;
    fase: string;
    protocolo?: string;
    protocol_code?: string;
    variacao?: string;
    pillar?: string;
  };
  parametros?: {
    rpe_alvo: string;
    descanso_padrao: string;
    cadencia_padrao: string;
    duracao_estimada: string;
    reps_range: string;
    progressao: string;
  };
  treino?: {
    neural: ExercicioPrescrito[];
    integracao: ExercicioPrescrito[];
    bloco9: ExercicioPrescrito[];
    reset: ExercicioPrescrito[];
  };
  rationale?: string;
}

const db = supabase as any;

export async function prescreverTreino(
  alunoId?: string,
  data?: string,
  signal?: AbortSignal
): Promise<TreinoPrescrito> {
  const day = data ?? new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo'}).format(new Date());
  const identity = alunoId ? {data:alunoId,error:null} : await db.rpc('fn_current_athlete_id').abortSignal(signal);
  if(identity.error) throw identity.error;
  if(!identity.data) return {sucesso:false,motivo:'aluno_nao_encontrado'};
  const args={p_aluno_id:identity.data,p_data:day};
  const saved=await db.rpc('fn_get_saved_prescription',args).abortSignal(signal);
  if(saved.error) throw saved.error;
  if(saved.data?.motivo !== 'saved_prescription_not_found') return saved.data as TreinoPrescrito;
  const {data:result,error}=await db.rpc('prescrever_treino',args).abortSignal(signal);
  if(error)throw error;
  // Read again for stable row ids, optimistic timestamp and the doses actually saved.
  if(result?.sucesso){const current=await db.rpc('fn_get_saved_prescription',args).abortSignal(signal);if(current.error)throw current.error;return {...current.data,preserved:false};}
  return result as TreinoPrescrito;
}

export async function prescreverTreinoHtml(
  alunoId?: string,
  data?: string
): Promise<string> {
  const { data: html, error } = await db.rpc("prescrever_treino_html", {
    p_aluno_id: alunoId ?? null,
    p_data: data ?? new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo'}).format(new Date()),
  });
  if (error) throw error;
  return html as string;
}
