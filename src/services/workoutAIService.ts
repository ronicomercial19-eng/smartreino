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
  estudante_id: string;
  professor_id: string;
  nome_plano: string;
  objetivo: string;
  nivel: string;
  duracao_semanas: number;
  plano_completo: any;
  status: string;
  created_at: string;
}

export class WorkoutAIService {
  static async generateWorkout(params: WorkoutGenerationParams): Promise<GeneratedWorkoutPlan> {
    const { data, error } = await supabase.functions.invoke('generate-workout', {
      body: params
    });

    if (error) {
      console.error('Error generating workout:', error);
      throw new Error(error.message || 'Falha ao gerar treino');
    }

    if (!data.success) {
      throw new Error(data.error || 'Erro ao gerar plano de treino');
    }

    return data.plan;
  }

  static async getStudentWorkouts(studentId: string): Promise<GeneratedWorkoutPlan[]> {
    const { data, error } = await supabase
      .from('planos_de_treino_gerados')
      .select('*')
      .eq('estudante_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching workouts:', error);
      throw new Error('Erro ao buscar treinos');
    }

    return (data as any) || [];
  }

  static async getWorkoutById(planId: string): Promise<GeneratedWorkoutPlan> {
    const { data, error } = await supabase
      .from('planos_de_treino_gerados')
      .select('*')
      .eq('id', planId)
      .single();

    if (error) {
      console.error('Error fetching workout:', error);
      throw new Error('Erro ao buscar treino');
    }

    return data as any;
  }

  static async updateWorkout(planId: string, updates: Partial<GeneratedWorkoutPlan>): Promise<GeneratedWorkoutPlan> {
    const { data, error } = await supabase
      .from('planos_de_treino_gerados')
      .update(updates as any)
      .eq('id', planId)
      .select()
      .single();

    if (error) {
      console.error('Error updating workout:', error);
      throw new Error('Erro ao atualizar treino');
    }

    return data as any;
  }

  static async deleteWorkout(planId: string): Promise<void> {
    const { error } = await supabase
      .from('planos_de_treino_gerados')
      .delete()
      .eq('id', planId);

    if (error) {
      console.error('Error deleting workout:', error);
      throw new Error('Erro ao deletar treino');
    }
  }
}
