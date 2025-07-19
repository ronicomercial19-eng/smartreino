
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
    console.log('🔍 Buscando todos os modelos de treino...');
    
    const { data, error } = await supabase
      .from('workout_models')
      .select('*')
      .order('model_order', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar modelos:', error);
      throw error;
    }

    console.log(`✅ ${data?.length || 0} modelos encontrados`);
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

    // Aplicar filtros condicionalmente
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

    // Ordenação
    query = query.order('model_order', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('❌ Erro ao aplicar filtros:', error);
      throw error;
    }

    console.log(`✅ ${data?.length || 0} modelos encontrados com filtros aplicados`);
    return (data || []) as WorkoutModel[];
  }

  // Métodos para estatísticas e análises
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
      // Contagem por nível
      stats.byLevel[model.level] = (stats.byLevel[model.level] || 0) + 1;
      
      // Contagem por fase
      stats.byPhase[model.periodization_phase] = (stats.byPhase[model.periodization_phase] || 0) + 1;
      
      // Contagem por tipo de estímulo
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
