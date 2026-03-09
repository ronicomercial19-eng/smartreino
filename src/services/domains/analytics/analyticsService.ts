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

  // ─── Canonical Views ─────────────────────────────────

  /** Query v_exercises_canonical — unified exercise library */
  async getCanonicalExercises(filters?: {
    search?: string;
    muscle?: string;
    limit?: number;
  }) {
    let query = supabase.from('v_exercises_canonical' as any).select('*');
    if (filters?.search) query = query.ilike('name', `%${filters.search}%`);
    if (filters?.muscle) query = query.contains('target_muscles', [filters.muscle]);
    query = query.order('name', { ascending: true }).limit(filters?.limit || 200);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /** Query v_plans_canonical — unified commercial plans */
  async getCanonicalPlans() {
    const { data, error } = await supabase
      .from('v_plans_canonical' as any)
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) throw error;
    return data || [];
  },
};
