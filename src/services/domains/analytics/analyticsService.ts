/**
 * 9FIT Domain Service: Analytics
 * 
 * Unified service for AI recommendations, analyses, and reporting.
 * Consolidates: generate-recommendations edge function, analises_ia_aluno
 */
import { supabase } from "@/lib/api/client";
import { invokeFunction } from "@/lib/api/client";

// ── Types ──────────────────────────────────────────────
export interface AIRecommendation {
  type: 'warning' | 'suggestion' | 'success';
  title: string;
  description: string;
  action: string;
}

// ── Service ────────────────────────────────────────────
export const analyticsService = {
  /** Generate AI recommendations for a student */
  async generateRecommendations(studentId: string, studentData: any): Promise<AIRecommendation[]> {
    const { data, error } = await invokeFunction<{ recommendations: AIRecommendation[] }>(
      'generate-recommendations',
      { studentId, studentData }
    );

    if (error) throw new Error(error);
    return data?.recommendations || [];
  },

  /** Get stored AI analyses for a student */
  async getStudentAnalyses(alunoId: string) {
    const { data, error } = await supabase
      .from('analises_ia_aluno')
      .select('*')
      .eq('aluno_id', alunoId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  },

  /** Get system health metrics */
  async getSystemHealth() {
    const { data, error } = await supabase
      .from('system_events')
      .select('event_type, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  },
};
