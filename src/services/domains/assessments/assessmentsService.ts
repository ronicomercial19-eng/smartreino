/**
 * 9FIT Domain Service: Assessments
 * 
 * Unified service for physical assessments and evaluations.
 * Consolidates access to: avaliacoes_unificadas, avaliacoes_fisicas, avaliacoes
 */
import { supabase } from "@/lib/api/client";

// ── Types ──────────────────────────────────────────────
export interface Assessment {
  id: string;
  alunoId: string;
  dataAvaliacao: string;
  peso?: number;
  altura?: number;
  imc?: number;
  gorduraCorporal?: number;
  massaMuscular?: number;
  observacoes?: string;
  origem: string;
}

// ── Service ────────────────────────────────────────────
export const assessmentsService = {
  /** Get all assessments for a student (unified view) */
  async getStudentAssessments(alunoId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('avaliacoes_unificadas')
      .select('*')
      .eq('aluno_id', alunoId)
      .order('data_avaliacao', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /** Save a new assessment via RPC */
  async saveAssessment(alunoId: string, assessmentData: Record<string, any>) {
    const { data, error } = await supabase.rpc('salvar_avaliacao', {
      p_estudante_id: alunoId,
      p_dados: assessmentData,
    });

    if (error) throw error;
    return data;
  },

  /** Analyze periodization via AI edge function */
  async analyzePeriodization(params: {
    objetivo?: string;
    nivel?: string;
    tempo_disponivel?: number;
    restricoes?: string;
    periodizacao?: string;
    periodizacao_texto?: string;
  }) {
    const { data, error } = await supabase.functions.invoke('analyze-periodization', {
      body: params,
    });

    if (error) throw new Error(error.message);
    return data;
  },
};
