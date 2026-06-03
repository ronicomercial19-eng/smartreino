/**
 * Serviço de alunos — fonte canônica `vw_alunos_canonical`
 * Listagem usa a view canônica (FitPro + SmartPeriodizer).
 * Criação/edição/exclusão continuam em `public.alunos` como fallback administrativo.
 */

import { supabase } from "@/integrations/supabase/client";

export interface Aluno {
  id: string;                       // id canônico (fitpro_student_id quando aplicável)
  athlete_id?: string | null;       // vínculo interno UUID quando existir
  professor_id?: string | null;
  nome?: string;
  email?: string;
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
  data_cadastro?: string;
  ultima_atualizacao?: string;

  // Campos canônicos extras
  fase_atual?: string;
  volume_level?: string;
  intensity_level?: string;
  recovery_status?: string;
  adherence_level?: number;
  fatigue_level?: number;

  // Campos estendidos de treino (usados pelo FormularioAluno)
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

export type NovoAlunoInput = Omit<
  Aluno,
  'id' | 'athlete_id' | 'professor_id' | 'data_cadastro' | 'ultima_atualizacao' | 'status'
>;

async function getAuthUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    throw new Error('Usuário não autenticado. Faça login novamente.');
  }
  return session.user.id;
}

// Map status from canonical view (active/inactive) to app status (ativo/inativo/suspenso)
function mapStatus(s?: string | null): 'ativo' | 'inativo' | 'suspenso' {
  if (!s) return 'ativo';
  const v = s.toLowerCase();
  if (v === 'active' || v === 'ativo') return 'ativo';
  if (v === 'suspended' || v === 'suspenso') return 'suspenso';
  return 'inativo';
}

const db = supabase as any;

export class AlunosService {
  // ============================================
  // LISTAR — fonte canônica
  // ============================================
  static async listarAlunos(): Promise<Aluno[]> {
    await getAuthUserId();

    const { data, error } = await db
      .from('vw_alunos_canonical')
      .select('*');

    if (error) {
      console.error('[AlunosService] vw_alunos_canonical error:', error);
      throw new Error(`Erro ao listar alunos: ${error.message}`);
    }

    return (data ?? []).map((row: any) => ({
      id: row.id,
      athlete_id: row.athlete_id ?? null,
      professor_id: row.professor_id ?? null,
      nome: row.id, // sem nome na view canônica — exibimos id
      email: '',
      objetivo: row.objetivo ?? 'Não definido',
      nivel_experiencia: row.nivel ?? 'intermediario',
      status: mapStatus(row.status),
      fase_atual: row.fase_atual,
      volume_level: row.volume_level,
      intensity_level: row.intensity_level,
      recovery_status: row.recovery_status,
      adherence_level: row.adherence_level,
      fatigue_level: row.fatigue_level,
    })) as Aluno[];
  }

  static async buscarAlunoPorId(id: string): Promise<Aluno | null> {
    await getAuthUserId();
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) return null;
    return data as Aluno | null;
  }

  static async criarAluno(aluno: NovoAlunoInput): Promise<Aluno> {
    const userId = await getAuthUserId();
    const email = aluno.email?.trim()
      ? aluno.email.trim()
      : `${(aluno.nome ?? 'aluno').toLowerCase().replace(/[^a-z0-9]/g, '.')}.${Date.now()}@smartreino.app`;

    const payload = {
      professor_id: userId,
      nome: (aluno.nome ?? '').trim(),
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
      status: 'ativo' as const,
    };

    const { data, error } = await supabase
      .from('alunos')
      .insert(payload)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new Error('Aluno já cadastrado com este email.');
      throw new Error(`Erro ao cadastrar aluno: ${error.message}`);
    }
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

  // ============================================
  // ESTATÍSTICAS — também da view canônica
  // ============================================
  static async obterEstatisticas() {
    await getAuthUserId();

    const { data, error } = await db
      .from('vw_alunos_canonical')
      .select('status, objetivo, nivel');

    if (error) {
      console.error('[AlunosService] obterEstatisticas error:', error);
      return { total: 0, ativos: 0, inativos: 0, porObjetivo: {} as Record<string, number> };
    }

    const all = (data ?? []) as any[];
    const total = all.length;
    const ativos = all.filter(a => mapStatus(a.status) === 'ativo').length;
    const porObjetivo = all.reduce((acc: Record<string, number>, a: any) => {
      const k = a.objetivo || 'Não definido';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    return { total, ativos, inativos: total - ativos, porObjetivo };
  }
}
