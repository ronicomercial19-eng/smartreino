/**
 * Serviço completo para gerenciamento de alunos
 * Utiliza a nova tabela 'alunos' com RLS
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

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
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('alunos')
      .insert({
        professor_id: userData.user.id,
        ...aluno,
        status: 'ativo'
      })
      .select()
      .single();

    if (error) {
      logger.error('Erro ao criar aluno', 'AlunosService.criarAluno', error);
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
