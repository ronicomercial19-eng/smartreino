import { supabase } from '@/integrations/supabase/client';

export interface WorkoutGenerationParams {
  studentId: string;
  objetivo?: string;
  nivel?: string;
  frequenciaSemanal?: number;
  restricoes?: string;
  ambiente?: string;
}

export interface GeneratedWorkoutPlan {
  id: string;
  aluno_id: string;
  professor_id: string;
  nome_plano: string;
  descricao: string;
  objetivo: string;
  nivel: string;
  duracao_semanas: number;
  frequencia_semanal: number;
  estrutura_treino: any;
  status: string;
  created_at: string;
  // Alias for backward compat
  plano_completo?: any;
}

function mapPlan(row: any): GeneratedWorkoutPlan {
  return {
    ...row,
    nivel: row.nivel || row.objetivo || '',
    plano_completo: row.estrutura_treino, // alias
  };
}

export class WorkoutAIService {
  static async generateWorkout(params: WorkoutGenerationParams): Promise<GeneratedWorkoutPlan> {
    const { data, error } = await supabase.functions.invoke('generate-workout', {
      body: params
    });

    if (error) throw new Error(error.message || 'Falha ao gerar treino');
    if (!data.success) throw new Error(data.error || 'Erro ao gerar plano de treino');

    return mapPlan(data.plan);
  }

  static async getWorkoutById(planId: string): Promise<GeneratedWorkoutPlan> {
    const { data, error } = await supabase
      .from('planos_treino_aluno')
      .select('*')
      .eq('id', planId)
      .maybeSingle();

    if (error) throw new Error('Erro ao buscar treino');
    if (!data) throw new Error('Plano não encontrado');

    return mapPlan(data);
  }

  static async getStudentWorkouts(studentId: string): Promise<GeneratedWorkoutPlan[]> {
    const { data, error } = await supabase
      .from('planos_treino_aluno')
      .select('*')
      .eq('aluno_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw new Error('Erro ao buscar treinos');
    return (data || []).map(mapPlan);
  }

  static async updateWorkout(planId: string, updates: Partial<GeneratedWorkoutPlan>): Promise<GeneratedWorkoutPlan> {
    // Map plano_completo back to estrutura_treino
    const dbUpdates: any = { ...updates };
    if (dbUpdates.plano_completo) {
      dbUpdates.estrutura_treino = dbUpdates.plano_completo;
      delete dbUpdates.plano_completo;
    }

    const { data, error } = await supabase
      .from('planos_treino_aluno')
      .update(dbUpdates)
      .eq('id', planId)
      .select()
      .single();

    if (error) throw new Error('Erro ao atualizar treino');
    return mapPlan(data);
  }

  static async deleteWorkout(planId: string): Promise<void> {
    const { error } = await supabase
      .from('planos_treino_aluno')
      .delete()
      .eq('id', planId);

    if (error) throw new Error('Erro ao deletar treino');
  }
}
