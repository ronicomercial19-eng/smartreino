/**
 * Serviço para gerenciar planos de treino dos alunos
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

export interface PlanoTreino {
  id: string;
  aluno_id: string;
  professor_id: string;
  nome_plano: string;
  descricao?: string;
  objetivo: string;
  tipo_periodizacao?: string;
  fase_atual?: string;
  duracao_semanas: number;
  frequencia_semanal: number;
  semana_atual: number;
  data_inicio?: string;
  data_fim?: string;
  estrutura_treino: any;
  status: string;
  created_at: string;
  updated_at: string;
}

export type NovoPlanoInput = {
  aluno_id: string;
  nome_plano: string;
  descricao?: string;
  objetivo: string;
  tipo_periodizacao?: string;
  duracao_semanas: number;
  frequencia_semanal: number;
  estrutura_treino: any;
};

export class PlanosTreinoService {
  /**
   * Criar plano de treino para aluno
   */
  static async criarPlano(plano: NovoPlanoInput): Promise<PlanoTreino> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('planos_treino_aluno')
      .insert({
        ...plano,
        professor_id: userData.user.id,
        fase_atual: 'Base',
        semana_atual: 1,
        status: 'ativo'
      })
      .select()
      .single();

    if (error) {
      logger.error('Erro ao criar plano', 'PlanosTreinoService.criarPlano', error);
      throw error;
    }

    logger.info('Plano de treino criado', 'PlanosTreinoService.criarPlano', { planoId: data.id });
    return data as PlanoTreino;
  }

  /**
   * Buscar planos do aluno
   */
  static async buscarPlanosDoAluno(alunoId: string): Promise<PlanoTreino[]> {
    const { data, error } = await supabase
      .from('planos_treino_aluno')
      .select('*')
      .eq('aluno_id', alunoId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Erro ao buscar planos', 'PlanosTreinoService.buscarPlanosDoAluno', { alunoId, error });
      throw error;
    }

    return data as PlanoTreino[];
  }

  /**
   * Atualizar plano de treino
   */
  static async atualizarPlano(id: string, updates: Partial<PlanoTreino>): Promise<PlanoTreino> {
    const { data, error } = await supabase
      .from('planos_treino_aluno')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Erro ao atualizar plano', 'PlanosTreinoService.atualizarPlano', { id, error });
      throw error;
    }

    return data as PlanoTreino;
  }

  /**
   * Ativar plano de treino (desativa outros do mesmo aluno)
   */
  static async ativarPlano(alunoId: string, planoId: string): Promise<void> {
    // Desativar outros planos
    await supabase
      .from('planos_treino_aluno')
      .update({ status: 'inativo' })
      .eq('aluno_id', alunoId)
      .neq('id', planoId);

    // Ativar o plano selecionado
    const { error } = await supabase
      .from('planos_treino_aluno')
      .update({ 
        status: 'ativo',
        data_inicio: new Date().toISOString()
      })
      .eq('id', planoId);

    if (error) {
      logger.error('Erro ao ativar plano', 'PlanosTreinoService.ativarPlano', { planoId, error });
      throw error;
    }

    logger.info('Plano ativado', 'PlanosTreinoService.ativarPlano', { planoId });
  }

  /**
   * Avançar semana do plano
   */
  static async avancarSemana(planoId: string): Promise<void> {
    const { data: plano, error: fetchError } = await supabase
      .from('planos_treino_aluno')
      .select('semana_atual, duracao_semanas')
      .eq('id', planoId)
      .single();

    if (fetchError || !plano) {
      throw new Error('Plano não encontrado');
    }

    const novaSemana = plano.semana_atual + 1;
    
    if (novaSemana > plano.duracao_semanas) {
      throw new Error('Plano já foi concluído');
    }

    const { error } = await supabase
      .from('planos_treino_aluno')
      .update({ semana_atual: novaSemana })
      .eq('id', planoId);

    if (error) {
      logger.error('Erro ao avançar semana', 'PlanosTreinoService.avancarSemana', { planoId, error });
      throw error;
    }

    logger.info('Semana avançada', 'PlanosTreinoService.avancarSemana', { planoId, novaSemana });
  }
}
