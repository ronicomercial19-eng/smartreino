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
}

export interface TrainingSession {
  session_label: string;
  session_name: string;
  focus_muscles: string[];
  volume_percentage?: number;
  slots: SessionSlot[];
}

export interface GeneratedStructure {
  sessions: TrainingSession[];
  progression_notes?: string;
  safety_notes?: string;
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
  // Archive old active rules for this aluno
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
  // Delete existing
  await db.from("smart_treino_muscle_volume").delete().eq("macro_rules_id", macroRulesId);
  // Insert new
  const rows = volumes.map(v => ({ ...v, macro_rules_id: macroRulesId }));
  const { error } = await db.from("smart_treino_muscle_volume").insert(rows);
  if (error) throw error;
}

// Generate
export async function generateSmartTreino(alunoId: string, macroRulesId: string): Promise<GeneratedStructure> {
  const { data, error } = await supabase.functions.invoke("generate-smart-treino", {
    body: { aluno_id: alunoId, macro_rules_id: macroRulesId },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data.data as GeneratedStructure;
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
