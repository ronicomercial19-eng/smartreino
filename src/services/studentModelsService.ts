
import { supabaseUntyped } from "@/integrations/supabase/untypedClient";
import { supabase } from "@/integrations/supabase/client";

export interface StudentSelectedModel {
  id: string;
  student_id: string;
  model_id: string;
  assigned_by: string;
  notes?: string;
  created_at: string;
}

export interface WorkoutModality {
  modality: string;
  model_count: number;
  levels_available: string[];
}

export class StudentModelsService {
  static async getWorkoutModalities(): Promise<WorkoutModality[]> {
    console.log('🎯 Buscando modalidades de treino...');
    
    const { data, error } = await supabaseUntyped
      .from('vw_workout_modalities')
      .select('*');

    if (error) {
      console.error('❌ Erro ao buscar modalidades:', error);
      throw error;
    }

    return (data || []) as WorkoutModality[];
  }

  static async assignModelToStudent(studentId: string, modelId: string, notes?: string): Promise<void> {
    
    const { data: user } = await supabase.auth.getUser();
    
    const { error } = await supabaseUntyped
      .from('student_selected_models')
      .insert({
        student_id: studentId,
        model_id: modelId,
        assigned_by: user.user?.id || '',
        notes
      });

    if (error) {
      console.error('❌ Erro ao atribuir modelo:', error);
      throw error;
    }

    // Modelo atribuído com sucesso
  }

  static async getStudentSelectedModels(studentId: string): Promise<any[]> {
    console.log(`👤 Buscando modelos selecionados do aluno ${studentId}`);
    
    const { data, error } = await supabaseUntyped
      .from('vw_student_selected_models')
      .select('*')
      .eq('student_id', studentId);

    if (error) {
      console.error('❌ Erro ao buscar modelos do aluno:', error);
      throw error;
    }

    return data || [];
  }

  static async removeModelFromStudent(studentId: string, modelId: string): Promise<void> {
    console.log(`🗑️ Removendo modelo ${modelId} do aluno ${studentId}`);
    
    const { error } = await supabaseUntyped
      .from('student_selected_models')
      .delete()
      .eq('student_id', studentId)
      .eq('model_id', modelId);

    if (error) {
      console.error('❌ Erro ao remover modelo:', error);
      throw error;
    }

    // Modelo removido com sucesso
  }
}
