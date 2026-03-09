import { supabaseUntyped } from "@/integrations/supabase/untypedClient";

export interface WorkoutGenerationParams {
  estudante_id: string;
  objetivo: string;
  nivel: string;
  periodizacao?: object;
}

// Legacy exports for compatibility
export interface WorkoutGoal {
  type: string;
  duration: number;
  intensity: string;
  muscleGroups: string[];
}
export interface GeneratedWorkout {
  id: string;
  name: string;
  exercises: any[];
  duration?: number;
  difficulty?: string;
  description?: string;
  targetPSE?: number;
  estimatedCalories?: number;
  type?: string;
}

export const workoutGenerationService = {
  async gerarModelo(params: WorkoutGenerationParams): Promise<{ modelo_id: string }> {
    console.log("🏗️ Gerando modelo de treino:", params);
    
    // Validate student exists in alunos table
    const { data: estudante, error: estudanteError } = await supabaseUntyped
      .from("alunos")
      .select("id, nome")
      .eq("id", params.estudante_id)
      .maybeSingle();

    if (estudanteError || !estudante) {
      throw new Error("Estudante não encontrado ou sem permissão");
    }

    // Insert directly into modelos_de_treino (bypassing broken RPC that uses estudantes table)
    const { data: modelo, error: modeloError } = await supabaseUntyped
      .from("modelos_de_treino")
      .insert({
        estudante_id: params.estudante_id,
        objetivo: params.objetivo,
        nivel: params.nivel,
        periodizacao: params.periodizacao || {},
        tag: 'gerado_programa',
        nome: `Modelo ${params.objetivo} - ${params.nivel}`,
        descricao: `Modelo gerado para ${params.objetivo} nível ${params.nivel}`,
      })
      .select("id")
      .single();

    if (modeloError || !modelo) {
      console.error("❌ Erro ao gerar modelo:", modeloError);
      throw new Error(modeloError?.message || "Falha ao gerar modelo de treino");
    }

    const modeloId = modelo.id;

    console.log("✅ Modelo gerado com sucesso:", modeloId);
    return { modelo_id: modeloId };
  },

  async validarPermissaoGeracao(estudanteId: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseUntyped
        .from("alunos")
        .select("id")
        .eq("id", estudanteId)
        .maybeSingle();

      return !error && !!data;
    } catch {
      return false;
    }
  },

  async verificarAmbiente(): Promise<boolean> {
    try {
      const { data } = await supabaseUntyped
        .from("ambiente_config")
        .select("valor")
        .eq("chave", "env")
        .maybeSingle();

      return data?.valor !== "production";
    } catch {
      return true;
    }
  },

  // Legacy methods for compatibility
  async generatePersonalizedWorkout(...args: any[]): Promise<GeneratedWorkout> {
    let params: any = {};

    if (args.length === 1) {
      params = args[0] || {};
    } else if (args.length >= 2) {
      const [profile, goal, recentWorkouts] = args;
      params = {
        userId: profile?.id || profile?.userId || profile?.estudante_id,
        goal: goal?.type || profile?.objective || 'hipertrofia',
        level: profile?.level || 'intermediario',
        periodizacao: {
          duration: goal?.duration,
          intensity: goal?.intensity,
          muscleGroups: goal?.muscleGroups,
          recentWorkouts: recentWorkouts || []
        }
      };
    }

    try {
      if (!params.userId && !params.estudante_id) {
        return {
          id: `temp_${Date.now()}`,
          name: `Treino ${params.goal || 'personalizado'}`,
          exercises: [],
          duration: params.periodizacao?.duration || 60,
          difficulty: params.level || 'intermediario',
          type: params.goal || 'personalizado',
          targetPSE: params.periodizacao?.intensity === 'alta' ? 8 : params.periodizacao?.intensity === 'moderada' ? 7 : 6,
          estimatedCalories: 350,
          description: 'Pré-visualização local do treino.'
        };
      }

      const result = await this.gerarModelo({
        estudante_id: params.userId || params.estudante_id,
        objetivo: params.goal || params.objetivo || 'hipertrofia',
        nivel: params.level || params.nivel || 'intermediario',
        periodizacao: params.periodizacao || {}
      });

      return {
        id: result.modelo_id,
        name: `Treino ${params.goal || 'personalizado'}`,
        exercises: [],
        duration: params.periodizacao?.duration || 60,
        difficulty: params.level || 'intermediario',
        type: params.goal || 'personalizado',
        targetPSE: params.periodizacao?.intensity === 'alta' ? 8 : params.periodizacao?.intensity === 'moderada' ? 7 : 6,
        estimatedCalories: 350,
        description: 'Modelo gerado via banco de dados.'
      };
    } catch (e) {
      console.error('❌ Erro ao gerar treino personalizado:', e);
      return {
        id: `temp_${Date.now()}`,
        name: `Treino ${params.goal || 'personalizado'}`,
        exercises: [],
        duration: params.periodizacao?.duration || 60,
        difficulty: params.level || 'intermediario',
        type: params.goal || 'personalizado',
        targetPSE: params.periodizacao?.intensity === 'alta' ? 8 : params.periodizacao?.intensity === 'moderada' ? 7 : 6,
        estimatedCalories: 320,
        description: 'Fallback local devido a erro na geração.'
      };
    }
  },

  async suggestNextWorkout(userId: string, ..._rest: any[]): Promise<GeneratedWorkout> {
    return this.generatePersonalizedWorkout({
      userId,
      goal: 'progression',
      level: 'intermediario'
    });
  }
};
