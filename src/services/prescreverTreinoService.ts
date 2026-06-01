import { supabase } from "@/integrations/supabase/client";

export interface ExercicioPrescrito {
  id: string;
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
  data?: string
): Promise<TreinoPrescrito> {
  const { data: result, error } = await db.rpc("prescrever_treino", {
    p_aluno_id: alunoId ?? null,
    p_data: data ?? new Date().toISOString().slice(0, 10),
  });
  if (error) throw error;
  return result as TreinoPrescrito;
}

export async function prescreverTreinoHtml(
  alunoId?: string,
  data?: string
): Promise<string> {
  const { data: html, error } = await db.rpc("prescrever_treino_html", {
    p_aluno_id: alunoId ?? null,
    p_data: data ?? new Date().toISOString().slice(0, 10),
  });
  if (error) throw error;
  return html as string;
}
