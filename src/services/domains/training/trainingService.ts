/**
 * 9FIT Domain Service: Training
 * 
 * Unified service for workouts, plans, models, and AI generation.
 * Consolidates: workoutAIService, planosTreinoService, workoutModelsService
 */
import { supabase } from "@/lib/api/client";
import { invokeFunction } from "@/lib/api/client";

// ── Types ──────────────────────────────────────────────
export interface WorkoutPlan {
  id: string;
  alunoId: string;
  professorId: string;
  nomePlano: string;
  objetivo: string;
  duracaoSemanas: number;
  frequenciaSemanal: number;
  semanaAtual: number;
  estruturaTreino: any;
  status: string;
  tipoPeriodizacao?: string;
  faseAtual?: string;
  createdAt: string;
}

export interface WorkoutGenerationParams {
  studentId: string;
  objetivo?: string;
  nivel?: string;
  frequenciaSemanal?: number;
  restricoes?: string;
  ambiente?: string;
  quizAnswers?: any;
}

export interface FullPlanGenerationParams {
  studentId: string;
  periodizationModelId?: string;
  periodizationText?: string;
  formData?: {
    objetivo?: string;
    nivel?: string;
    frequencia_semanal?: number;
  };
}

// ── Service ────────────────────────────────────────────
export const trainingService = {
  // ─── AI Generation ───────────────────────────────────
  
  /** Generate a workout plan via AI edge function */
  async generateWorkout(params: WorkoutGenerationParams) {
    const { data, error } = await invokeFunction('generate-workout', params);
    if (error) throw new Error(error);
    if (!data?.success) throw new Error(data?.error || 'Erro ao gerar treino');
    return data.plan;
  },

  /** Generate a full periodized plan via AI */
  async generateFullPlan(params: FullPlanGenerationParams) {
    const { data, error } = await invokeFunction('generate-full-plan', params);
    if (error) throw new Error(error);
    if (!data?.success) throw new Error(data?.error || 'Erro ao gerar plano');
    return data;
  },

  /** Modify an existing workout via AI */
  async modifyWorkout(workoutPlanId: string, currentPlan: any, userCommand: string) {
    const { data, error } = await invokeFunction('modify-workout', {
      workoutPlanId, currentPlan, userCommand,
    });
    if (error) throw new Error(error);
    return data;
  },

  // ─── Plans CRUD ──────────────────────────────────────

  /** Get all plans for a student */
  async getStudentPlans(alunoId: string): Promise<WorkoutPlan[]> {
    const { data, error } = await supabase
      .from('planos_treino_aluno')
      .select('*')
      .eq('aluno_id', alunoId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as WorkoutPlan[];
  },

  /** Create a new workout plan */
  async createPlan(plan: {
    aluno_id: string;
    nome_plano: string;
    objetivo: string;
    duracao_semanas: number;
    frequencia_semanal: number;
    estrutura_treino: any;
    descricao?: string;
    tipo_periodizacao?: string;
  }) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Não autenticado');

    const { data, error } = await supabase
      .from('planos_treino_aluno')
      .insert({
        ...plan,
        professor_id: userData.user.id,
        fase_atual: 'Base',
        semana_atual: 1,
        status: 'ativo',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /** Activate a plan (deactivates others for same student) */
  async activatePlan(alunoId: string, planoId: string) {
    await supabase
      .from('planos_treino_aluno')
      .update({ status: 'inativo' })
      .eq('aluno_id', alunoId)
      .neq('id', planoId);

    const { error } = await supabase
      .from('planos_treino_aluno')
      .update({ status: 'ativo', data_inicio: new Date().toISOString() })
      .eq('id', planoId);

    if (error) throw error;
  },

  // ─── Workout Models ──────────────────────────────────

  /** Get all workout models */
  async getWorkoutModels(filters?: { level?: string; phase?: string; search?: string }) {
    let query = supabase.from('workout_models').select('*');

    if (filters?.level) query = query.eq('level', filters.level);
    if (filters?.phase) query = query.eq('periodization_phase', filters.phase);
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,general_objective.ilike.%${filters.search}%`);
    }

    query = query.order('model_order', { ascending: true });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /** Get a single workout model by ID */
  async getWorkoutModelById(id: string) {
    const { data, error } = await supabase
      .from('workout_models')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },
};
