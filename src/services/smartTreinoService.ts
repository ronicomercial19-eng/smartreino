import { supabase } from "@/integrations/supabase/client";

// Types
export interface SmartTreinoProfile {
  id?: string;
  aluno_id: string;
  professor_id: string;
  dominant_profile: string;
  secondary_profile?: string;
  score_global: number;
  gargalos_tecnicos: string[];
  riscos_estruturais: string[];
  modalidade_principal: string;
}

export interface SmartTreinoMacroRules {
  id?: string;
  aluno_id: string;
  professor_id: string;
  macro_number: number;
  macro_objetivo: string;
  reps_range: string;
  rpe_target: number;
  progression_type: string;
  density_control: boolean;
  volume_locked: boolean;
  deload_planned: boolean;
  descanso_compostos: string;
  descanso_acessorios: string;
  descanso_core: string;
  carga_inicial_percent: number;
  weekly_frequency: number;
  status: string;
  // Protocol fields
  protocol_code?: string;
  pillar?: string;
  protocol_name?: string;
  variation_name?: string;
  model_name?: string;
}

export interface SmartTreinoMuscleVolume {
  id?: string;
  macro_rules_id: string;
  muscle_group: string;
  weekly_sets: number;
  is_emphasis: boolean;
  distribution_json: Record<string, number>;
}

export interface SessionSlot {
  order: number;
  movement_pattern: string;
  target_muscle: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  intensity?: string;
  notes?: string;
  cadence?: string;
  duration?: string;
}

export interface SessionBlock {
  neural: SessionSlot[];
  integration: SessionSlot[];
  block_9: SessionSlot[];
  reset: SessionSlot[];
}

export interface TrainingSession {
  session_label: string;
  session_name: string;
  focus_muscles: string[];
  volume_percentage?: number;
  slots?: SessionSlot[];
  blocks?: SessionBlock;
}

export interface GeneratedStructure {
  sessions: TrainingSession[];
  progression_notes?: string;
  safety_notes?: string;
}

// Protocol types (9x9x9 matrix)
export interface SmartTreinoProtocol {
  id: string; // "P.V.M"
  pillar: string;
  pillar_label: string;
  protocol_id: number;
  protocol_name: string;
  protocol_axis: string;
  variation_id: number;
  variation_name: string;
  variation_focus: string;
  model_id: number;
  model_description: string;
  block_neural: string;
  block_integration: string;
  block_9_template: Record<string, any>;
  block_reset: string;
  rpe_range: string;
  recommended_for: string[];
}

// Use untypedClient for custom tables not in generated types
const db = supabase as any;

// Profile CRUD
export async function getProfile(alunoId: string): Promise<SmartTreinoProfile | null> {
  const { data, error } = await db.from("smart_treino_profiles").select("*").eq("aluno_id", alunoId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertProfile(profile: SmartTreinoProfile): Promise<SmartTreinoProfile> {
  const { data, error } = await db.from("smart_treino_profiles").upsert(profile, { onConflict: "aluno_id" }).select().single();
  if (error) throw error;
  return data;
}

// Macro Rules CRUD
export async function getMacroRules(alunoId: string): Promise<SmartTreinoMacroRules | null> {
  const { data, error } = await db.from("smart_treino_macro_rules").select("*").eq("aluno_id", alunoId).eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertMacroRules(rules: SmartTreinoMacroRules): Promise<SmartTreinoMacroRules> {
  if (!rules.id) {
    await db.from("smart_treino_macro_rules").update({ status: "archived" }).eq("aluno_id", rules.aluno_id).eq("status", "active");
  }
  const { data, error } = await db.from("smart_treino_macro_rules").upsert(rules).select().single();
  if (error) throw error;
  return data;
}

// Muscle Volume CRUD
export async function getMuscleVolumes(macroRulesId: string): Promise<SmartTreinoMuscleVolume[]> {
  const { data, error } = await db.from("smart_treino_muscle_volume").select("*").eq("macro_rules_id", macroRulesId);
  if (error) throw error;
  return data || [];
}

export async function saveMuscleVolumes(macroRulesId: string, volumes: Omit<SmartTreinoMuscleVolume, "macro_rules_id">[]): Promise<void> {
  await db.from("smart_treino_muscle_volume").delete().eq("macro_rules_id", macroRulesId);
  const rows = volumes.map(v => ({ ...v, macro_rules_id: macroRulesId }));
  const { error } = await db.from("smart_treino_muscle_volume").insert(rows);
  if (error) throw error;
}

// Protocol queries (9x9x9)
export async function getProtocols(): Promise<SmartTreinoProtocol[]> {
  const { data, error } = await db.from("smart_treino_protocols").select("*").order("id");
  if (error) throw error;
  return data || [];
}

export async function getProtocolsByPillar(pillar: string): Promise<SmartTreinoProtocol[]> {
  const { data, error } = await db.from("smart_treino_protocols").select("*").eq("pillar", pillar).order("id");
  if (error) throw error;
  return data || [];
}

export async function getProtocol(code: string): Promise<SmartTreinoProtocol | null> {
  const { data, error } = await db.from("smart_treino_protocols").select("*").eq("id", code).maybeSingle();
  if (error) throw error;
  return data;
}

// Generate — via edge function generate-smart-treino (usa protocolo real de smart_treino_protocols
// quando macro_rules.protocol_code está preenchido; persiste em daily_workouts/workout_exercises)
export async function generateSmartTreino(
  athleteId: string,
  macroRulesId: string,
  _opts?: { categoria?: string; diasSemana?: number }
): Promise<GeneratedStructure & { success?: boolean; dias_gravados?: number }> {
  const { data, error } = await supabase.functions.invoke("generate-smart-treino", {
    body: { aluno_id: athleteId, macro_rules_id: macroRulesId },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return { ...data.data, success: data.success, dias_gravados: data.dias_gravados };
}

export interface WeekWorkoutRow {
  id: string;
  workout_date: string;
  workout_type: string | null;
  exercise_count: number;
}

/** Lê daily_workouts + workout_exercises da semana atual (Seg-Dom). */
export async function verifyWeekWorkouts(athleteId: string): Promise<WeekWorkoutRow[]> {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  const { data, error } = await (supabase as any)
    .from("daily_workouts")
    .select("id, workout_date, workout_type, workout_exercises(id)")
    .eq("athlete_id", athleteId)
    .gte("workout_date", iso(monday))
    .lte("workout_date", iso(sunday))
    .order("workout_date");
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.id,
    workout_date: r.workout_date,
    workout_type: r.workout_type,
    exercise_count: Array.isArray(r.workout_exercises) ? r.workout_exercises.length : 0,
  }));
}

// Constants
export const MUSCLE_GROUPS = [
  "Glúteos", "Quadríceps", "Posterior de Coxa", "Panturrilhas",
  "Peito", "Dorsais", "Ombros", "Bíceps", "Tríceps", "Core",
];

export const PROFILE_TYPES = [
  { value: "forca_mmss", label: "Força MMSS" },
  { value: "forca_mmii", label: "Força MMII" },
  { value: "resistencia_mmss", label: "Resistência MMSS" },
  { value: "resistencia_mmii", label: "Resistência MMII" },
  { value: "core_estabilidade", label: "Core / Estabilidade" },
  { value: "mobilidade", label: "Mobilidade" },
  { value: "potencia", label: "Potência" },
  { value: "cardio", label: "Cardio" },
  { value: "equilibrado", label: "Equilibrado" },
];

export const PILLARS = [
  { value: "performance", label: "Performance Aeróbica", icon: "🟢" },
  { value: "estrutural", label: "Estrutural & Morfológico", icon: "🔵" },
  { value: "longevidade", label: "Funcional & Longevidade", icon: "🟡" },
];

export const PROTOCOLS_META: Record<number, { name: string; pillar: string; axis: string }> = {
  1: { name: "VMAX", pillar: "performance", axis: "Velocidade pura e economia de movimento" },
  2: { name: "Threshold", pillar: "performance", axis: "Sustentação de alta intensidade" },
  3: { name: "Endurance", pillar: "performance", axis: "Resistência periférica" },
  4: { name: "Tensão Mecânica", pillar: "estrutural", axis: "Recrutamento de fibras brancas" },
  5: { name: "Estresse Metabólico", pillar: "estrutural", axis: "Inchaço celular e resposta hormonal" },
  6: { name: "Simetria & Fluxo", pillar: "estrutural", axis: "Correção de desvios e estética" },
  7: { name: "Reativo", pillar: "longevidade", axis: "Reação rápida e proteção articular" },
  8: { name: "Mobilidade Carregada", pillar: "longevidade", axis: "Força em grandes amplitudes" },
  9: { name: "Resiliência", pillar: "longevidade", axis: "Redução de estresse e manutenção" },
};

export const MACRO_DEFAULTS: Record<number, Partial<SmartTreinoMacroRules>> = {
  1: { macro_objetivo: "Base técnica / estrutural", reps_range: "8-12", rpe_target: 5.5, progression_type: "technique_first", carga_inicial_percent: 60 },
  2: { macro_objetivo: "Hipertrofia funcional", reps_range: "8-12", rpe_target: 6.5, progression_type: "load", carga_inicial_percent: 65 },
  3: { macro_objetivo: "Força máxima", reps_range: "3-6", rpe_target: 7.5, progression_type: "intensity", carga_inicial_percent: 75, descanso_compostos: "120-180s" },
  4: { macro_objetivo: "Manutenção / performance", reps_range: "5-8", rpe_target: 6.0, progression_type: "frequency", carga_inicial_percent: 70 },
};

export const GARGALOS_OPTIONS = [
  "Força de MMSS", "Força de MMII", "Core fraco", "Mobilidade de ombro",
  "Mobilidade de quadril", "Mobilidade de tornozelo", "Compensação por fadiga",
  "Técnica de agachamento", "Técnica de supino", "Estabilidade escapular",
];

export const RISCOS_OPTIONS = [
  "Lombalgia", "Dor no ombro", "Dor no joelho", "Tendinopatia",
  "Compensação postural", "Hiperlordose", "Cifose", "Escoliose",
  "Histórico de lesão MMII", "Histórico de lesão MMSS",
];
