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
    
    // Validar se usuário está autenticado e tem permissão
    const { data: estudante, error: estudanteError } = await supabaseUntyped
      .from("estudantes")
      .select("id")
      .eq("id", params.estudante_id)
      .single();

    if (estudanteError || !estudante) {
      throw new Error("Estudante não encontrado ou sem permissão");
    }

    // Chamar função do banco para gerar modelo
    const { data, error } = await supabaseUntyped.rpc(
      "gerar_modelo_treino",
      {
        p_estudante_id: params.estudante_id,
        p_objetivo: params.objetivo,
        p_nivel: params.nivel,
        p_periodizacao: params.periodizacao || {}
      }
    );

    if (error) {
      console.error("❌ Erro ao gerar modelo:", error);
      throw error;
    }

    const modeloId = data?.[0]?.modelo_id;
    if (!modeloId) {
      throw new Error("Falha ao gerar modelo de treino");
    }

    // Criar entrada em planos_de_treino_gerados
    const { error: planoError } = await supabaseUntyped
      .from("planos_de_treino_gerados")
      .insert([{
        estudante_id: params.estudante_id,
        modelo_id: modeloId,
        estudante_id_ref: params.estudante_id
      }]);

    if (planoError) {
      console.error("❌ Erro ao criar plano gerado:", planoError);
      // Continuar mesmo com erro, pois o modelo foi criado
    }

    console.log("✅ Modelo gerado com sucesso:", modeloId);
    return { modelo_id: modeloId };
  },

  async validarPermissaoGeracao(estudanteId: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseUntyped
        .from("estudantes")
        .select("id")
        .eq("id", estudanteId)
        .single();

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
        .single();

      // Se não há config ou não é produção, permite seeds
      return data?.valor !== "production";
    } catch {
      // Se erro ao consultar, permite por segurança
      return true;
    }
  },

  // Legacy methods for compatibility
  async generatePersonalizedWorkout(...args: any[]): Promise<GeneratedWorkout> {
    let params: any = {};

    if (args.length === 1) {
      // Backward compatible: single params object
      params = args[0] || {};
    } else if (args.length >= 2) {
      // New style: (userProfile, workoutGoal, recentWorkouts)
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
        // No valid user id, return a local stub so UI can preview
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
        description: 'Modelo gerado via Supabase RPC.'
      };
    } catch (e) {
      console.error('❌ Erro ao gerar treino personalizado:', e);
      // Fallback seguro
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