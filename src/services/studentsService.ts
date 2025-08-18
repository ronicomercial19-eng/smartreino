
import { supabase } from "@/integrations/supabase/client";

export interface Student {
  id: string;
  professor_id: string;
  nome: string;
  email: string;
  objetivo: string;
  telefone?: string;
  data_nascimento?: string;
  peso_kg?: number;
  altura_cm?: number;
  nivel_experiencia?: string;
  observacoes?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export type NewStudentInput = {
  nome: string;
  email: string;
  objetivo: string;
  telefone?: string;
  data_nascimento?: string;
  peso_kg?: number;
  altura_cm?: number;
  nivel_experiencia?: string;
  observacoes?: string;
};

export class StudentsService {
  static async getAllStudents(): Promise<Student[]> {
    console.log('👥 Buscando todos os alunos...');
    
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('ativo', true)
      .order('nome', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar alunos:', error);
      throw error;
    }

    console.log(`✅ ${data?.length || 0} alunos encontrados`);
    return (data || []) as Student[];
  }

  static async getStudentById(id: string): Promise<Student | null> {
    console.log(`👤 Buscando aluno por ID: ${id}`);
    
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar aluno:', error);
      throw error;
    }

    console.log('✅ Aluno encontrado:', data?.nome);
    return data as Student;
  }

  static async createStudent(student: NewStudentInput): Promise<Student> {
    console.log(`➕ Criando novo aluno: ${student.nome}`);
    
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('❌ Erro ao obter usuário autenticado:', userError);
      throw userError;
    }
    const professorId = userData.user?.id;
    if (!professorId) {
      const authErr = new Error('Usuário não autenticado. Faça login para adicionar alunos.');
      console.error('❌', authErr);
      throw authErr;
    }

    // Montar payload válido para RLS (professor_id deve ser o auth.uid())
    const payload = {
      professor_id: professorId,
      nome: student.nome,
      email: student.email,
      objetivo: student.objetivo,
      telefone: student.telefone,
      data_nascimento: student.data_nascimento,
      peso_kg: student.peso_kg,
      altura_cm: student.altura_cm,
      nivel_experiencia: student.nivel_experiencia,
      observacoes: student.observacoes,
      // 'ativo', 'created_at' e 'updated_at' são definidos pelo banco (defaults)
    };

    const { data, error } = await supabase
      .from('students')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar aluno:', error);
      throw error;
    }

    console.log('✅ Aluno criado com sucesso');
    return data as Student;
  }

  static async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    console.log(`🔄 Atualizando aluno: ${id}`);
    
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar aluno:', error);
      throw error;
    }

    console.log('✅ Aluno atualizado com sucesso');
    return data as Student;
  }

  static async deleteStudent(id: string): Promise<void> {
    console.log(`🗑️ Excluindo aluno (soft delete): ${id}`);
    
    const { error } = await supabase
      .from('students')
      .update({ ativo: false })
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao excluir aluno:', error);
      throw error;
    }

    console.log('✅ Aluno excluído com sucesso');
  }
}
