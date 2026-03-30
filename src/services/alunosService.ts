/**
 * Serviço completo para gerenciamento de alunos
 * Utiliza a tabela 'alunos' com RLS
 * REGRA: sempre usar getSession() para auth (nunca getUser())
 */

import { supabase } from "@/integrations/supabase/client";

export interface Aluno {
  id: string;
  professor_id: string;
  nome: string;
  email: string;
  telefone?: string;
  genero?: string;
  data_nascimento?: string;
  peso_atual?: number;
  altura_cm?: number;
  objetivo: string;
  nivel_experiencia?: string;
  ambiente_treino?: string;
  restricoes_medicas?: string;
  observacoes?: string;
  frequencia_semanal?: number;
  status: 'ativo' | 'inativo' | 'suspenso';
  data_cadastro: string;
  ultima_atualizacao: string;
  tempo_disponivel_min?: number;
  historico_lesoes?: string;
  foco_muscular?: string;
  condicionamento_cardio?: string;
  experiencia_pesos_livres?: string;
  preferencia_intensidade?: string;
  preferencia_cardio?: string;
  preferencia_equipamento?: string;
  treina_sozinho?: boolean;
  horario_preferido?: string;
  meta_tempo_meses?: number;
}

export type NovoAlunoInput = Omit<Aluno, 'id' | 'professor_id' | 'data_cadastro' | 'ultima_atualizacao' | 'status'>;

/** Helper: get current user id from local session */
async function getAuthUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    throw new Error('Usuário não autenticado. Faça login novamente.');
  }
  return session.user.id;
}

export class AlunosService {
  static async listarAlunos(): Promise<Aluno[]> {
    await getAuthUserId(); // ensure auth

    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('status', 'ativo')
      .order('nome', { ascending: true });

    if (error) throw new Error(`Erro ao listar alunos: ${error.message}`);
    return (data ?? []) as Aluno[];
  }

  static async buscarAlunoPorId(id: string): Promise<Aluno | null> {
    await getAuthUserId();

    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Erro ao buscar aluno: ${error.message}`);
    return data as Aluno;
  }

  static async criarAluno(aluno: NovoAlunoInput): Promise<Aluno> {
    const userId = await getAuthUserId();

    // Generate placeholder email if not provided
    const email = aluno.email?.trim()
      ? aluno.email.trim()
      : `${aluno.nome.toLowerCase().replace(/[^a-z0-9]/g, '.')}.${Date.now()}@smartreino.app`;

    const payload = {
      professor_id: userId,
      nome: aluno.nome.trim(),
      email,
      objetivo: aluno.objetivo || 'hipertrofia',
      telefone: aluno.telefone || null,
      data_nascimento: aluno.data_nascimento || null,
      peso_atual: aluno.peso_atual || null,
      altura_cm: aluno.altura_cm || null,
      nivel_experiencia: aluno.nivel_experiencia || null,
      ambiente_treino: aluno.ambiente_treino || null,
      restricoes_medicas: aluno.restricoes_medicas || null,
      observacoes: aluno.observacoes || null,
      frequencia_semanal: aluno.frequencia_semanal || null,
      genero: aluno.genero || null,
      tempo_disponivel_min: aluno.tempo_disponivel_min || null,
      historico_lesoes: aluno.historico_lesoes || null,
      foco_muscular: aluno.foco_muscular || null,
      condicionamento_cardio: aluno.condicionamento_cardio || null,
      experiencia_pesos_livres: aluno.experiencia_pesos_livres || null,
      preferencia_intensidade: aluno.preferencia_intensidade || null,
      preferencia_cardio: aluno.preferencia_cardio || null,
      preferencia_equipamento: aluno.preferencia_equipamento || null,
      treina_sozinho: aluno.treina_sozinho ?? null,
      horario_preferido: aluno.horario_preferido || null,
      meta_tempo_meses: aluno.meta_tempo_meses || null,
      status: 'ativo' as const,
    };

    console.log('[AlunosService] criarAluno payload:', { userId, nome: payload.nome, email: payload.email });

    const { data, error } = await supabase
      .from('alunos')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('[AlunosService] Insert error:', error);
      if (error.code === '23505') {
        throw new Error('Aluno já cadastrado com este email.');
      }
      if (error.message?.includes('row-level security')) {
        throw new Error('Permissão negada. Verifique se você tem papel de professor.');
      }
      throw new Error(`Erro ao cadastrar aluno: ${error.message}`);
    }

    console.log('[AlunosService] Aluno criado:', data.id);
    return data as Aluno;
  }

  static async atualizarAluno(id: string, updates: Partial<NovoAlunoInput>): Promise<Aluno> {
    await getAuthUserId();

    const { data, error } = await supabase
      .from('alunos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Erro ao atualizar aluno: ${error.message}`);
    return data as Aluno;
  }

  static async excluirAluno(id: string): Promise<void> {
    await getAuthUserId();

    const { error } = await supabase
      .from('alunos')
      .update({ status: 'inativo' })
      .eq('id', id);

    if (error) throw new Error(`Erro ao excluir aluno: ${error.message}`);
  }

  static async reativarAluno(id: string): Promise<void> {
    await getAuthUserId();

    const { error } = await supabase
      .from('alunos')
      .update({ status: 'ativo' })
      .eq('id', id);

    if (error) throw new Error(`Erro ao reativar aluno: ${error.message}`);
  }

  static async obterEstatisticas() {
    const userId = await getAuthUserId();

    const { data, error } = await supabase
      .from('alunos')
      .select('status, objetivo, nivel_experiencia')
      .eq('professor_id', userId);

    if (error) throw new Error(`Erro ao obter estatísticas: ${error.message}`);

    const allData = data ?? [];
    const total = allData.length;
    const ativos = allData.filter(a => a.status === 'ativo').length;
    const porObjetivo = allData.reduce((acc, a) => {
      if (a.objetivo) acc[a.objetivo] = (acc[a.objetivo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, ativos, inativos: total - ativos, porObjetivo };
  }
}
