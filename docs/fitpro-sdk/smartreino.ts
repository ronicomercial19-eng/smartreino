/**
 * SmartReino SDK para FitPro
 * Drop-in client TS/JS — sem dependências externas.
 *
 * Uso:
 *   const sr = new SmartReinoClient({ apiKey: process.env.SMARTREINO_KEY! });
 *   const t = await sr.quickWorkout({ student_external_id: "abc", respostas:{tempo_min:45,foco:"superior",energia:"alta"} });
 */
export interface SmartReinoConfig {
  apiKey: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

export interface QuickWorkoutInput {
  student_external_id: string;
  respostas: { tempo_min: number; foco: string; energia: "baixa" | "media" | "alta" | string };
}

export interface QuickWorkoutQuestionsResponse {
  success: true;
  perguntas: Array<{ id: "tempo_min" | "foco" | "energia"; label: string; type: string; options: Array<string | number> }>;
}

export type AdjustAction = "swap" | "load" | "sets" | "add" | "remove";
export interface AdjustChange {
  action: AdjustAction;
  exercise_id?: string;
  new_exercise_id?: string;
  load_percentage?: number;
  sets?: number;
  reps_range?: string;
}
export interface AdjustWorkoutInput {
  student_external_id: string;
  // Structured (preferred): affects ONLY today's workout_exercises with override_locked=true
  changes?: AdjustChange[];
  workout_date?: string; // YYYY-MM-DD (defaults to today)
  // NLP fallback (legacy)
  treino_atual_id?: string;
  treino_atual?: unknown;
  mensagem?: string;
}

export interface CopilotAdjustInput {
  student_external_id: string;
  command: string;
  workout_date?: string;
}

export interface WeekWorkoutsInput { student_external_id: string }
export interface StreamingFeedInput { student_external_id: string }
export interface CompleteWorkoutInput {
  student_external_id: string;
  execution_id?: string;
  workout_date?: string;
  duration_minutes?: number;
  total_volume_kg?: number;
  avg_rpe?: number;
  notes?: string;
  rating?: number;
}

export interface PlanWorkoutInput {
  student_external_id: string;
  data?: string; // YYYY-MM-DD
}

export interface BlocoTreino {
  tipo: "neural" | "integration" | "block9" | "reset";
  cor: string;
  titulo: string;
  exercicios: unknown[];
}

export interface WorkoutResponse {
  success: true;
  treino_id: string | null;
  aluno_id: string;
  aluno_source?: "fitpro_map" | "alunos" | "athletes" | "students";
  treino?: unknown;
  blocos: BlocoTreino[];
  duracao_min?: number;
  perguntas_usadas?: { tempo_min: number; foco: string; energia: string };
  periodizacao?: { fonte: string; objetivo: string; fase_atual: string; semana_atual: number };
  infoproduto_sugerido?: { id: string; titulo: string; thumb: string; cta_url: string } | null;
  contexto?: unknown;
  delivery?: unknown;
}

export interface AdjustResponse {
  success: true;
  treino_id: string | null;
  aluno_id: string;
  aluno_source?: "fitpro_map" | "alunos" | "athletes" | "students";
  treino_ajustado: { neural: unknown[]; integracao: unknown[]; bloco9: unknown[]; reset: unknown[] };
  blocos: BlocoTreino[];
  delta: string[];
  mensagem_ron: string;
  contexto?: unknown;
  delivery?: unknown;
}

export interface LibraryResponse {
  success: true;
  biblioteca: {
    exercicios: Array<{ id: string; nome: string; grupo: string | null; video_url: string | null; player_url: string | null; thumb: string | null }>;
    protocolos_9x9x9: Array<Record<string, unknown>>;
    infoprodutos: Array<{ id: string; titulo: string; categoria: string | null; thumb: string | null; cta_url: string | null }>;
    videos_aulas: Array<{ id: string; titulo: string; categoria: string | null; thumb: string | null; player_url: string | null }>;
  };
  contagens: { exercicios: number; protocolos: number; infoprodutos: number; videos: number };
  personalizado_para: { id: string; nome: string; objetivo: string; nivel: string } | null;
}

export class SmartReinoError extends Error {
  status: number;
  code?: string;
  cta_url?: string;
  body?: unknown;
  constructor(msg: string, status: number, body?: any) {
    super(msg);
    this.status = status;
    this.code = body?.code;
    this.cta_url = body?.cta_url;
    this.body = body;
  }
}

export class SmartReinoClient {
  private apiKey: string;
  private baseUrl: string;
  private fetchImpl: typeof fetch;

  constructor(cfg: SmartReinoConfig) {
    this.apiKey = cfg.apiKey;
    this.baseUrl = cfg.baseUrl ?? "https://mfrydtrzjxscbkaiwfnw.supabase.co/functions/v1";
    this.fetchImpl = cfg.fetchImpl ?? fetch;
  }

  private async req<T>(path: string, init: RequestInit = {}): Promise<T> {
    const r = await this.fetchImpl(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "x-partner-key": this.apiKey,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
    const json = await r.json().catch(() => ({}));
    if (!r.ok) throw new SmartReinoError(json?.error || r.statusText, r.status, json);
    return json as T;
  }

  /** Treino rápido (3 perguntas). Usado na aba Train → Treino Rápido. */
  quickWorkout(p: QuickWorkoutInput) {
    return this.req<WorkoutResponse>("/fitpro-quick-workout", { method: "POST", body: JSON.stringify(p) });
  }

  /** Busca as 3 perguntas cadastradas para o botão Treino Rápido. */
  quickWorkoutQuestions() {
    return this.req<QuickWorkoutQuestionsResponse>("/fitpro-quick-workout", { method: "GET" });
  }

  /** Ajuste de treino via chat RON (NLP). Usado na aba Ajuste de Treino. */
  adjustWorkout(p: AdjustWorkoutInput) {
    return this.req<AdjustResponse>("/fitpro-adjust-workout", { method: "POST", body: JSON.stringify(p) });
  }

  /** Treino do dia baseado na periodização anual cadastrada. */
  planWorkout(p: PlanWorkoutInput) {
    return this.req<WorkoutResponse>("/fitpro-plan-workout", { method: "POST", body: JSON.stringify(p) });
  }

  /** Biblioteca 9FIT completa (exercícios + 9x9x9 + infoprodutos + aulas). */
  library(student_external_id?: string) {
    const q = student_external_id ? `?student_external_id=${encodeURIComponent(student_external_id)}` : "";
    return this.req<LibraryResponse>(`/library-full${q}`, { method: "GET" });
  }

  /** Treinos da Semana — preview D1..D7 da semana corrente. */
  weekWorkouts(p: WeekWorkoutsInput) {
    return this.req<any>("/fitpro-week-workouts", { method: "POST", body: JSON.stringify(p) });
  }

  /** Feed de Streaming/HealthFlix filtrado pela fase atual da periodização. */
  streamingFeed(p: StreamingFeedInput) {
    return this.req<any>(`/fitpro-streaming-feed?student_external_id=${encodeURIComponent(p.student_external_id)}`, { method: "GET" });
  }

  /** Conclui treino + dispara XP (50 quick / 100 plano). */
  completeWorkout(p: CompleteWorkoutInput) {
    return this.req<any>("/fitpro-complete-workout", { method: "POST", body: JSON.stringify(p) });
  }

  /** FitCopilot NLP — interpreta comando e aplica APENAS no dia atual. */
  copilotAdjust(p: CopilotAdjustInput) {
    return this.req<any>("/fitpro-copilot-adjust", { method: "POST", body: JSON.stringify(p) });
  }
}

export default SmartReinoClient;
