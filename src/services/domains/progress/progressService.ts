/**
 * 9FIT Domain Service: Progress
 * 
 * Unified service for workout logs, exercise tracking, and history.
 * Consolidates access to: historico_treinos_realizados, workout_logs, exercise_logs
 */
import { supabase } from "@/lib/api/client";

// ── Types ──────────────────────────────────────────────
export interface WorkoutLog {
  id: string;
  alunoId: string;
  dataTreino: string;
  diaTreino?: number;
  duracaoMinutos?: number;
  exerciciosRealizados: any;
  pseSessao?: number;
  volumeTotalKg?: number;
  notasAluno?: string;
  notasProfessor?: string;
}

// ── Service ────────────────────────────────────────────
export const progressService = {
  /** Get workout history for a student */
  async getStudentHistory(alunoId: string, limit = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from('historico_treinos_realizados')
      .select('*')
      .eq('aluno_id', alunoId)
      .order('data_treino', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /** Log a completed workout */
  async logWorkout(log: {
    aluno_id: string;
    data_treino: string;
    dia_treino?: number;
    duracao_minutos?: number;
    exercicios_realizados: any;
    pse_sessao?: number;
    volume_total_kg?: number;
    notas_aluno?: string;
    plano_treino_id?: string;
    semana_treino?: number;
  }) {
    const { data, error } = await supabase
      .from('historico_treinos_realizados')
      .insert(log)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /** Get progress summary stats for a student */
  async getProgressSummary(alunoId: string) {
    const { data, error } = await supabase
      .from('historico_treinos_realizados')
      .select('data_treino, pse_sessao, volume_total_kg, duracao_minutos')
      .eq('aluno_id', alunoId)
      .order('data_treino', { ascending: false })
      .limit(30);

    if (error) throw error;

    const logs = data || [];
    return {
      totalSessions: logs.length,
      avgPSE: logs.length ? logs.reduce((s, l) => s + (l.pse_sessao || 0), 0) / logs.length : 0,
      totalVolume: logs.reduce((s, l) => s + (l.volume_total_kg || 0), 0),
      avgDuration: logs.length ? logs.reduce((s, l) => s + (l.duracao_minutos || 0), 0) / logs.length : 0,
    };
  },

  // ─── Canonical Views ─────────────────────────────────

  /** Query v_progress_canonical — unified view across all progress tables */
  async getCanonicalProgress(studentId: string, limit = 50) {
    const { data, error } = await supabase
      .from('v_progress_canonical' as any)
      .select('*')
      .eq('student_id', studentId)
      .order('workout_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },
};
