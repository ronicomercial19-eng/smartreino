
import { supabase } from "@/integrations/supabase/client";

export interface WorkoutModel {
  id: string;
  name: string;
  general_objective: string;
  method_description: string;
  level: "Básico" | "Intermediário" | "Avançado";
  initial_activation: string;
  format_type: string;
  structure_description: string;
  sequence_description?: string;
  timer_enabled: boolean;
  timer_type?: string;
  voice_cadence_enabled: boolean;
  voice_cadence_pattern?: string;
  additional_observations?: string;
  periodization_phase: "Base" | "Intensificação" | "Realização" | "Deload";
  week_number: number;
  stimulus_type: string;
  exercise_fields: any[];
  model_order: number;
  created_at: string;
  updated_at: string;
}

export interface WorkoutModelsFilters {
  level?: string;
  periodization_phase?: string;
  week_number?: number;
  stimulus_type?: string;
  search?: string;
}

export class WorkoutModelsService {
  static async getAllModels(): Promise<WorkoutModel[]> {
    const { data, error } = await supabase
      .from('workout_models')
      .select('*')
      .order('model_order', { ascending: true });

    if (error) {
      throw error;
    }

    return (data || []) as WorkoutModel[];
  }

  static async getModelsByLevel(level: string): Promise<WorkoutModel[]> {
    console.log(`🎯 Buscando modelos do nível: ${level}`);
    
    const { data, error } = await supabase
      .from('workout_models')
      .select('*')
      .eq('level', level)
      .order('model_order', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar modelos por nível:', error);
      throw error;
    }

    console.log(`✅ ${data?.length || 0} modelos encontrados para o nível ${level}`);
    return (data || []) as WorkoutModel[];
  }

  static async getModelsByPhase(phase: string): Promise<WorkoutModel[]> {
    console.log(`🏃 Buscando modelos da fase: ${phase}`);
    
    const { data, error } = await supabase
      .from('workout_models')
      .select('*')
      .eq('periodization_phase', phase)
      .order('week_number', { ascending: true })
      .order('model_order', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar modelos por fase:', error);
      throw error;
    }

    console.log(`✅ ${data?.length || 0} modelos encontrados para a fase ${phase}`);
    return (data || []) as WorkoutModel[];
  }

  static async getModelsByWeek(weekNumber: number): Promise<WorkoutModel[]> {
    console.log(`📅 Buscando modelos da semana: ${weekNumber}`);
    
    const { data, error } = await supabase
      .from('workout_models')
      .select('*')
      .eq('week_number', weekNumber)
      .order('model_order', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar modelos por semana:', error);
      throw error;
    }

    console.log(`✅ ${data?.length || 0} modelos encontrados para a semana ${weekNumber}`);
    return (data || []) as WorkoutModel[];
  }

  static async getModelsByStimulusType(stimulusType: string): Promise<WorkoutModel[]> {
    console.log(`⚡ Buscando modelos do tipo de estímulo: ${stimulusType}`);
    
    const { data, error } = await supabase
      .from('workout_models')
      .select('*')
      .eq('stimulus_type', stimulusType)
      .order('model_order', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar modelos por tipo de estímulo:', error);
      throw error;
    }

    console.log(`✅ ${data?.length || 0} modelos encontrados para o estímulo ${stimulusType}`);
    return (data || []) as WorkoutModel[];
  }

  static async getModelById(id: string): Promise<WorkoutModel | null> {
    console.log(`🆔 Buscando modelo por ID: ${id}`);
    
    const { data, error } = await supabase
      .from('workout_models')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar modelo por ID:', error);
      throw error;
    }

    console.log('✅ Modelo encontrado:', data?.name);
    return data as WorkoutModel;
  }

  static async searchModels(searchTerm: string): Promise<WorkoutModel[]> {
    console.log(`🔍 Buscando modelos com termo: "${searchTerm}"`);
    
    const { data, error } = await supabase
      .from('workout_models')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,general_objective.ilike.%${searchTerm}%,method_description.ilike.%${searchTerm}%`)
      .order('model_order', { ascending: true });

    if (error) {
      console.error('❌ Erro na busca de modelos:', error);
      throw error;
    }

    console.log(`✅ ${data?.length || 0} modelos encontrados na busca`);
    return (data || []) as WorkoutModel[];
  }

  static async getFilteredModels(filters: WorkoutModelsFilters): Promise<WorkoutModel[]> {
    console.log('🎛️ Aplicando filtros:', filters);
    
    let query = supabase
      .from('workout_models')
      .select('*');

    if (filters.level) {
      query = query.eq('level', filters.level);
    }

    if (filters.periodization_phase) {
      query = query.eq('periodization_phase', filters.periodization_phase);
    }

    if (filters.week_number) {
      query = query.eq('week_number', filters.week_number);
    }

    if (filters.stimulus_type) {
      query = query.eq('stimulus_type', filters.stimulus_type);
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,general_objective.ilike.%${filters.search}%,method_description.ilike.%${filters.search}%`);
    }

    query = query.order('model_order', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('❌ Erro ao aplicar filtros:', error);
      throw error;
    }

    console.log(`✅ ${data?.length || 0} modelos encontrados com filtros aplicados`);
    return (data || []) as WorkoutModel[];
  }

  static async getModelsStats() {
    console.log('📊 Calculando estatísticas dos modelos...');
    
    const { data, error } = await supabase
      .from('workout_models')
      .select('level, periodization_phase, stimulus_type');

    if (error) {
      console.error('❌ Erro ao calcular estatísticas:', error);
      throw error;
    }

    const stats = {
      total: data?.length || 0,
      byLevel: {} as Record<string, number>,
      byPhase: {} as Record<string, number>,
      byStimulusType: {} as Record<string, number>
    };

    data?.forEach(model => {
      stats.byLevel[model.level] = (stats.byLevel[model.level] || 0) + 1;
      stats.byPhase[model.periodization_phase] = (stats.byPhase[model.periodization_phase] || 0) + 1;
      stats.byStimulusType[model.stimulus_type] = (stats.byStimulusType[model.stimulus_type] || 0) + 1;
    });

    console.log('✅ Estatísticas calculadas:', stats);
    return stats;
  }

  static async getDistinctValues() {
    console.log('🏷️ Buscando valores únicos para filtros...');
    
    const { data, error } = await supabase
      .from('workout_models')
      .select('level, periodization_phase, stimulus_type');

    if (error) {
      console.error('❌ Erro ao buscar valores únicos:', error);
      throw error;
    }

    const distinctValues = {
      levels: [...new Set(data?.map(m => m.level))],
      phases: [...new Set(data?.map(m => m.periodization_phase))],
      stimulusTypes: [...new Set(data?.map(m => m.stimulus_type))]
    };

    console.log('✅ Valores únicos encontrados:', distinctValues);
    return distinctValues;
  }
}

// Adapter de compatibilidade: exporta o objeto esperado pelos consumidores atuais.
// Mapeia nomes usados em outros arquivos para os métodos da classe acima.
export const workoutModelsService = {
  // Usado em páginas/serviços
  getAllWorkoutModels: () => WorkoutModelsService.getAllModels(),
  getModelsByLevel: (level: string) => WorkoutModelsService.getModelsByLevel(level),
  getModelsByPhase: (phase: string) => WorkoutModelsService.getModelsByPhase(phase),
  getModelsByWeek: (weekNumber: number) => WorkoutModelsService.getModelsByWeek(weekNumber),
  getModelsByStimulusType: (stimulusType: string) => WorkoutModelsService.getModelsByStimulusType(stimulusType),
  getModelById: (id: string) => WorkoutModelsService.getModelById(id),
  searchModels: (term: string) => WorkoutModelsService.searchModels(term),
  getFilteredModels: (filters: WorkoutModelsFilters) => WorkoutModelsService.getFilteredModels(filters),
  // Alias para estatísticas com o nome esperado
  getWorkoutStatistics: () => WorkoutModelsService.getModelsStats(),
  getDistinctValues: () => WorkoutModelsService.getDistinctValues(),
  // Compatibilidade com chamadas de recomendação usadas pelo serviço de periodização
  getRecommendedModels: (params: { level?: string; objective?: string }) => {
    const filters: WorkoutModelsFilters = {};
    if (params?.level) filters.level = params.level;
    // Usamos 'objective' como termo de busca amplo para casar com nome/objetivo/metodologia
    if (params?.objective) filters.search = params.objective;
    return WorkoutModelsService.getFilteredModels(filters);
  },
};

