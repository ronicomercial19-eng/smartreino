/**
 * Serviço completo para gerenciamento de alunos
 * Utiliza a nova tabela 'alunos' com RLS
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { SecurityService } from "./securityService";

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
  // Novos campos de treino
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

export class AlunosService {
  /**
   * Buscar todos os alunos ativos do professor logado
   */
  static async listarAlunos(): Promise<Aluno[]> {
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('status', 'ativo')
      .order('nome', { ascending: true });

    if (error) {
      logger.error('Erro ao listar alunos', 'AlunosService.listarAlunos', error);
      throw error;
    }

    return data as Aluno[];
  }

  /**
   * Buscar aluno por ID
   */
  static async buscarAlunoPorId(id: string): Promise<Aluno | null> {
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Erro ao buscar aluno', 'AlunosService.buscarAlunoPorId', { id, error });
      throw error;
    }

    return data as Aluno;
  }

  /**
   * Criar novo aluno
   */
  static async criarAluno(aluno: NovoAlunoInput): Promise<Aluno> {
    // 1. Get authenticated user — prefer getSession (local) over getUser (network)
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      logger.error('Usuário não autenticado ao criar aluno', 'AlunosService.criarAluno', null);
      throw new Error('Usuário não autenticado. Faça login novamente.');
    }
    const userId = session.user.id;

    // 2. Generate email if not provided (field is required by DB)
    const email = aluno.email && aluno.email.trim()
      ? aluno.email.trim()
      : `${aluno.nome.toLowerCase().replace(/[^a-z0-9]/g, '.')}.${Date.now()}@smartreino.app`;

    // 3. Insert directly — let DB constraints handle uniqueness
    const { data, error } = await supabase
      .from('alunos')
      .insert({
        professor_id: userData.user.id,
        nome: aluno.nome,
        email,
        objetivo: aluno.objetivo,
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
        status: 'ativo'
      })
      .select()
      .single();

    if (error) {
      logger.error('Erro ao criar aluno', 'AlunosService.criarAluno', error);
      if (error.code === '23505') {
        throw new Error('Aluno já cadastrado com este email');
      }
      throw error;
    }

    logger.info('Aluno criado com sucesso', 'AlunosService.criarAluno', { alunoId: data.id });
    return data as Aluno;
  }

  /**
   * Atualizar dados do aluno
   */
  static async atualizarAluno(id: string, updates: Partial<NovoAlunoInput>): Promise<Aluno> {
    const { data, error } = await supabase
      .from('alunos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Erro ao atualizar aluno', 'AlunosService.atualizarAluno', { id, error });
      throw error;
    }

    logger.info('Aluno atualizado com sucesso', 'AlunosService.atualizarAluno', { id });
    return data as Aluno;
  }

  /**
   * Soft delete - marca aluno como inativo
   */
  static async excluirAluno(id: string): Promise<void> {
    const { error } = await supabase
      .from('alunos')
      .update({ status: 'inativo' })
      .eq('id', id);

    if (error) {
      logger.error('Erro ao excluir aluno', 'AlunosService.excluirAluno', { id, error });
      throw error;
    }

    logger.info('Aluno excluído com sucesso', 'AlunosService.excluirAluno', { id });
  }

  /**
   * Reativar aluno
   */
  static async reativarAluno(id: string): Promise<void> {
    const { error } = await supabase
      .from('alunos')
      .update({ status: 'ativo' })
      .eq('id', id);

    if (error) {
      logger.error('Erro ao reativar aluno', 'AlunosService.reativarAluno', { id, error });
      throw error;
    }

    logger.info('Aluno reativado com sucesso', 'AlunosService.reativarAluno', { id });
  }

  /**
   * Buscar estatísticas dos alunos
   */
  static async obterEstatisticas() {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('alunos')
      .select('status, objetivo, nivel_experiencia')
      .eq('professor_id', userData.user.id);

    if (error) {
      logger.error('Erro ao obter estatísticas', 'AlunosService.obterEstatisticas', error);
      throw error;
    }

    const total = data.length;
    const ativos = data.filter(a => a.status === 'ativo').length;
    const porObjetivo = data.reduce((acc, a) => {
      acc[a.objetivo] = (acc[a.objetivo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      ativos,
      inativos: total - ativos,
      porObjetivo
    };
  }
}
