/**
 * SmartPeriodizer API Service
 * 
 * Bridges the Smart Treino 9x9x9 protocol system with the 
 * periodization generation flow (macro/meso/micro).
 */
import { supabase } from "@/integrations/supabase/client";
import {
  SmartTreinoProfile,
  SmartTreinoMacroRules,
  SmartTreinoProtocol,
  getProfile,
  getMacroRules,
  getMuscleVolumes,
  getProtocol,
} from "./smartTreinoService";

// ── Types ──────────────────────────────────────────────

export interface SmartPeriodizationContext {
  athlete: {
    id: string;
    name: string;
    objective: string;
    level: string;
    frequency: number;
    injuries?: string;
    environment?: string;
  };
  profile: SmartTreinoProfile | null;
  rules: SmartTreinoMacroRules | null;
  protocol: SmartTreinoProtocol | null;
  volumes: Array<{
    muscle_group: string;
    weekly_sets: number;
    is_emphasis: boolean;
    distribution_json: Record<string, number>;
  }>;
}

export interface PeriodizationPlan {
  macrociclo: {
    nome: string;
    duracao_semanas: number;
    protocolo_9fit?: string;
    pilar?: string;
  };
  mesociclos: Array<{
    nome: string;
    semana_inicio: number;
    semana_fim: number;
    foco: string;
    volume: string;
    intensidade: string;
    descricao: string;
    blocos_9fit?: {
      neural: string;
      integration: string;
      block_9: Record<string, any>;
      reset: string;
    };
  }>;
  semanas: Array<{
    numero: number;
    mesociclo: string;
    foco_semana: string;
    dias: Array<{
      dia: string;
      nome: string;
      tipo: string;
      blocos?: {
        neural: any[];
        integration: any[];
        block_9: any[];
        reset: any[];
      };
      exercicios: Array<{
        nome: string;
        series: string;
        repeticoes: string;
        descanso: string;
        observacao: string;
        bloco?: string;
      }>;
    }>;
  }>;
}

// ── Service ────────────────────────────────────────────

export const smartPeriodizationService = {
  /**
   * Build the complete context for an athlete from Smart Treino data
   */
  async buildContext(alunoId: string): Promise<SmartPeriodizationContext> {
    // Fetch athlete basic data
    const { data: athlete } = await (supabase as any)
      .from("athletes")
      .select("id, name, objetivo, nivel, sessions_per_week, injuries_limitations, training_environment")
      .eq("id", alunoId)
      .single();

    // Also check alunos table
    let alunoData = null;
    if (!athlete) {
      const { data } = await supabase
        .from("alunos")
        .select("id, nome, objetivo, nivel_experiencia, frequencia_semanal, historico_lesoes, ambiente_treino")
        .eq("id", alunoId)
        .single();
      alunoData = data;
    }

    const name = athlete?.name || alunoData?.nome || "Atleta";
    const objective = athlete?.objetivo || alunoData?.objetivo || "hipertrofia";
    const level = athlete?.nivel || alunoData?.nivel_experiencia || "intermediario";
    const frequency = athlete?.sessions_per_week || alunoData?.frequencia_semanal || 4;
    const injuries = athlete?.injuries_limitations || alunoData?.historico_lesoes || "";
    const environment = athlete?.training_environment || alunoData?.ambiente_treino || "academia";

    // Fetch Smart Treino data in parallel
    const [profile, rules] = await Promise.all([
      getProfile(alunoId).catch(() => null),
      getMacroRules(alunoId).catch(() => null),
    ]);

    let protocol: SmartTreinoProtocol | null = null;
    let volumes: any[] = [];

    if (rules?.protocol_code) {
      protocol = await getProtocol(rules.protocol_code).catch(() => null);
    }
    if (rules?.id) {
      volumes = await getMuscleVolumes(rules.id).catch(() => []);
    }

    return {
      athlete: { id: alunoId, name, objective, level, frequency, injuries, environment },
      profile,
      rules,
      protocol,
      volumes,
    };
  },

  /**
   * Generate a full periodized plan using SmartPeriodizer + 9FIT protocols
   */
  async generatePlan(
    alunoId: string,
    options?: {
      periodizationModelId?: string;
      periodizationText?: string;
      formData?: { objetivo?: string; nivel?: string; frequencia_semanal?: number };
    }
  ): Promise<{ plan: any; summary: any }> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    // Build Smart Treino context
    const context = await this.buildContext(alunoId);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-full-plan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            studentId: alunoId,
            periodizationModelId: options?.periodizationModelId,
            periodizationText: options?.periodizationText,
            formData: options?.formData,
            // Inject Smart Treino context
            smartTreinoContext: context.protocol ? {
              protocol_code: context.protocol.id,
              pillar: context.protocol.pillar_label,
              protocol_name: context.protocol.protocol_name,
              protocol_axis: context.protocol.protocol_axis,
              variation_name: context.protocol.variation_name,
              variation_focus: context.protocol.variation_focus,
              model_description: context.protocol.model_description,
              block_neural: context.protocol.block_neural,
              block_integration: context.protocol.block_integration,
              block_9_template: context.protocol.block_9_template,
              block_reset: context.protocol.block_reset,
              rpe_range: context.protocol.rpe_range,
              profile: context.profile ? {
                dominant_profile: context.profile.dominant_profile,
                score_global: context.profile.score_global,
                gargalos: context.profile.gargalos_tecnicos,
                riscos: context.profile.riscos_estruturais,
              } : null,
              rules: context.rules ? {
                reps_range: context.rules.reps_range,
                rpe_target: context.rules.rpe_target,
                progression_type: context.rules.progression_type,
                density_control: context.rules.density_control,
                volume_locked: context.rules.volume_locked,
              } : null,
              volumes: context.volumes.map(v => ({
                muscle: v.muscle_group,
                sets: v.weekly_sets,
                emphasis: v.is_emphasis,
              })),
            } : undefined,
          }),
          signal: controller.signal,
        }
      );

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return { plan: data.plan, summary: data.summary };
    } finally {
      clearTimeout(timeout);
    }
  },

  /**
   * Adjust an existing plan by modifying specific parameters
   */
  async adjustPlan(
    planId: string,
    adjustments: {
      rpe_target?: number;
      volume_change?: number; // percentage
      swap_exercises?: Array<{ from: string; to: string }>;
      notes?: string;
    }
  ): Promise<any> {
    const { data: plan, error } = await (supabase as any)
      .from("planos_treino_aluno")
      .select("*")
      .eq("id", planId)
      .single();

    if (error) throw error;
    if (!plan) throw new Error("Plano não encontrado");

    const estrutura = plan.estrutura_treino;

    // Apply RPE adjustment
    if (adjustments.rpe_target && estrutura.semanas) {
      for (const semana of estrutura.semanas) {
        for (const dia of semana.dias || []) {
          for (const ex of dia.exercicios || []) {
            if (ex.observacao) {
              ex.observacao = ex.observacao.replace(
                /RPE\s*\d+/gi,
                `RPE ${adjustments.rpe_target}`
              );
            }
          }
        }
      }
    }

    // Apply volume change
    if (adjustments.volume_change && estrutura.semanas) {
      const factor = 1 + adjustments.volume_change / 100;
      for (const semana of estrutura.semanas) {
        for (const dia of semana.dias || []) {
          for (const ex of dia.exercicios || []) {
            if (ex.series) {
              const newSeries = Math.round(parseInt(ex.series) * factor);
              ex.series = String(Math.max(1, newSeries));
            }
          }
        }
      }
    }

    // Save adjusted plan
    const { data: updated, error: updateError } = await (supabase as any)
      .from("planos_treino_aluno")
      .update({
        estrutura_treino: estrutura,
        observacoes: adjustments.notes || plan.observacoes,
      })
      .eq("id", planId)
      .select()
      .single();

    if (updateError) throw updateError;
    return updated;
  },
};
