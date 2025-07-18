
import { supabase } from '@/integrations/supabase/client';

export interface WorkoutModel {
  id: string;
  name: string;
  general_objective: string;
  method_description: string;
  level: 'Básico' | 'Intermediário' | 'Avançado';
  initial_activation: string;
  format_type: string;
  structure_description: string;
  sequence_description?: string;
  timer_enabled: boolean;
  timer_type?: string;
  voice_cadence_enabled: boolean;
  voice_cadence_pattern?: string;
  additional_observations?: string;
  periodization_phase: 'Base' | 'Intensificação' | 'Realização' | 'Deload';
  week_number: number;
  stimulus_type: string;
  exercise_fields?: any[];
  model_order: number;
  created_at?: string;
  updated_at?: string;
}

class WorkoutModelsService {
  // Fetch all workout models from Supabase
  async getAllWorkoutModels(): Promise<WorkoutModel[]> {
    try {
      const { data, error } = await supabase
        .from('workout_models')
        .select('*')
        .order('model_order', { ascending: true });

      if (error) {
        console.error('Error fetching workout models:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch workout models:', error);
      return [];
    }
  }

  // Fetch models by periodization phase
  async getModelsByPhase(phase: string): Promise<WorkoutModel[]> {
    try {
      const { data, error } = await supabase
        .from('workout_models')
        .select('*')
        .eq('periodization_phase', phase)
        .order('week_number', { ascending: true })
        .order('model_order', { ascending: true });

      if (error) {
        console.error('Error fetching models by phase:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch models by phase:', error);
      return [];
    }
  }

  // Fetch models by week
  async getModelsByWeek(weekNumber: number): Promise<WorkoutModel[]> {
    try {
      const { data, error } = await supabase
        .from('workout_models')
        .select('*')
        .eq('week_number', weekNumber)
        .order('model_order', { ascending: true });

      if (error) {
        console.error('Error fetching models by week:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch models by week:', error);
      return [];
    }
  }

  // Fetch models by level
  async getModelsByLevel(level: string): Promise<WorkoutModel[]> {
    try {
      const { data, error } = await supabase
        .from('workout_models')
        .select('*')
        .eq('level', level)
        .order('model_order', { ascending: true });

      if (error) {
        console.error('Error fetching models by level:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch models by level:', error);
      return [];
    }
  }

  // Search models by name or objective
  async searchModels(searchTerm: string): Promise<WorkoutModel[]> {
    try {
      const { data, error } = await supabase
        .from('workout_models')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,general_objective.ilike.%${searchTerm}%,stimulus_type.ilike.%${searchTerm}%`)
        .order('model_order', { ascending: true });

      if (error) {
        console.error('Error searching models:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to search models:', error);
      return [];
    }
  }

  // Add a new workout model
  async addWorkoutModel(model: Omit<WorkoutModel, 'id' | 'created_at' | 'updated_at'>): Promise<WorkoutModel | null> {
    try {
      const { data, error } = await supabase
        .from('workout_models')
        .insert([model])
        .select()
        .single();

      if (error) {
        console.error('Error adding workout model:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to add workout model:', error);
      return null;
    }
  }

  // Update a workout model
  async updateWorkoutModel(id: string, updates: Partial<WorkoutModel>): Promise<WorkoutModel | null> {
    try {
      const { data, error } = await supabase
        .from('workout_models')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating workout model:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to update workout model:', error);
      return null;
    }
  }

  // Get models filtered by user profile
  async getRecommendedModels(userProfile: {
    level?: string;
    objective?: string;
    experience_level?: string;
    session_duration?: string;
  }): Promise<WorkoutModel[]> {
    try {
      let query = supabase.from('workout_models').select('*');

      // Filter by level if provided
      if (userProfile.level) {
        query = query.eq('level', userProfile.level);
      }

      // Filter by objective if provided (match with general_objective)
      if (userProfile.objective) {
        query = query.ilike('general_objective', `%${userProfile.objective}%`);
      }

      const { data, error } = await query
        .order('model_order', { ascending: true })
        .limit(10);

      if (error) {
        console.error('Error fetching recommended models:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch recommended models:', error);
      return [];
    }
  }

  // Get workout statistics
  async getWorkoutStatistics() {
    try {
      const { data, error } = await supabase
        .from('workout_models')
        .select('periodization_phase, level, stimulus_type');

      if (error) {
        console.error('Error fetching workout statistics:', error);
        return null;
      }

      const stats = {
        totalModels: data.length,
        byPhase: {} as Record<string, number>,
        byLevel: {} as Record<string, number>,
        byStimulusType: {} as Record<string, number>
      };

      data.forEach(model => {
        // Count by phase
        stats.byPhase[model.periodization_phase] = (stats.byPhase[model.periodization_phase] || 0) + 1;
        
        // Count by level
        stats.byLevel[model.level] = (stats.byLevel[model.level] || 0) + 1;
        
        // Count by stimulus type
        stats.byStimulusType[model.stimulus_type] = (stats.byStimulusType[model.stimulus_type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Failed to fetch workout statistics:', error);
      return null;
    }
  }
}

export const workoutModelsService = new WorkoutModelsService();
