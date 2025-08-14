
import { supabaseUntyped } from "@/integrations/supabase/untypedClient";
import { supabase } from "@/integrations/supabase/client";

export interface StudentPeriodization {
  id: string;
  student_id: string;
  periodization_plan_id: string;
  assigned_by: string;
  created_at: string;
}

export class StudentPeriodizationService {
  static async assignPeriodizationToStudent(studentId: string, periodizationId: string): Promise<void> {
    console.log(`📅 Atribuindo periodização ${periodizationId} ao aluno ${studentId}`);
    
    const { data: user } = await supabase.auth.getUser();
    
    const { error } = await supabaseUntyped
      .from('student_periodizations')
      .insert({
        student_id: studentId,
        periodization_plan_id: periodizationId,
        assigned_by: user.user?.id || ''
      });

    if (error) {
      console.error('❌ Erro ao atribuir periodização:', error);
      throw error;
    }

    console.log('✅ Periodização atribuída com sucesso');
  }

  static async getStudentPeriodizations(studentId: string): Promise<any[]> {
    console.log(`📊 Buscando periodizações do aluno ${studentId}`);
    
    const { data, error } = await supabaseUntyped
      .from('vw_student_periodizations')
      .select('*')
      .eq('student_id', studentId);

    if (error) {
      console.error('❌ Erro ao buscar periodizações:', error);
      throw error;
    }

    console.log(`✅ ${data?.length || 0} periodizações encontradas`);
    return data || [];
  }

  static async hasStudentPeriodization(studentId: string): Promise<boolean> {
    const periodizations = await this.getStudentPeriodizations(studentId);
    return periodizations.length > 0;
  }
}
