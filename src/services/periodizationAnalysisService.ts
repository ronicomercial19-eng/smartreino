// Interface para análise de periodização e modelos de treino
export interface RecommendedWorkoutModel {
  id: string;
  name: string;
  description: string;
  category: string;
  phase: string;
  duration: number;
  targetPSE: number;
  muscleGroups: string[];
  exercises: string[];
  recommendationScore: number;
  aiReasoning: string;
  createdAt: string;
}

import { grokAIService } from './grokAIService';
import { workoutModelsService, WorkoutModel } from './workoutModelsService';

class PeriodizationAnalysisService {
  private workoutModels: RecommendedWorkoutModel[] = [];

  constructor() {
    this.initializeWorkoutModels();
  }

  // Inicializar modelos de treino (fallback para compatibilidade)
  private initializeWorkoutModels() {
    this.workoutModels = [
      {
        id: 'hipertrofia-basico-1',
        name: 'Hipertrofia Básica - Membros Superiores',
        description: 'Treino focado em desenvolvimento muscular dos membros superiores',
        category: 'hipertrofia',
        phase: 'Básico',
        duration: 45,
        targetPSE: 7,
        muscleGroups: ['Peito', 'Tríceps', 'Ombros'],
        exercises: ['Supino', 'Tríceps Pulley', 'Desenvolvimento'],
        recommendationScore: 85,
        aiReasoning: 'Ideal para iniciantes focando em volume e técnica',
        createdAt: new Date().toISOString()
      },
      {
        id: 'forca-avancado-1',
        name: 'Força Avançada - Corpo Todo',
        description: 'Treino de força com exercícios compostos',
        category: 'forca',
        phase: 'Avançado',
        duration: 60,
        targetPSE: 9,
        muscleGroups: ['Quadríceps', 'Dorsais', 'Glúteos'],
        exercises: ['Agachamento', 'Levantamento Terra', 'Barra Fixa'],
        recommendationScore: 92,
        aiReasoning: 'Maximiza força através de movimentos compostos',
        createdAt: new Date().toISOString()
      },
      {
        id: 'condicionamento-1',
        name: 'Condicionamento Cardiovascular',
        description: 'Treino HIIT para condicionamento',
        category: 'condicionamento',
        phase: 'Intermediário',
        duration: 30,
        targetPSE: 8,
        muscleGroups: ['Cardio', 'Core'],
        exercises: ['Burpee', 'Mountain Climber', 'Jump Squat'],
        recommendationScore: 88,
        aiReasoning: 'Desenvolve resistência cardiovascular e queima calórica',
        createdAt: new Date().toISOString()
      },
      {
        id: 'perda-peso-1',
        name: 'Queima de Gordura - Circuit Training',
        description: 'Circuito para perda de peso',
        category: 'perda-peso',
        phase: 'Básico',
        duration: 35,
        targetPSE: 6,
        muscleGroups: ['Corpo Todo'],
        exercises: ['Agachamento', 'Flexão', 'Prancha'],
        recommendationScore: 80,
        aiReasoning: 'Combina resistência e cardio para queima de gordura',
        createdAt: new Date().toISOString()
      },
      {
        id: 'mobilidade-1',
        name: 'Mobilidade e Flexibilidade',
        description: 'Treino para melhora da mobilidade',
        category: 'mobilidade',
        phase: 'Básico',
        duration: 25,
        targetPSE: 4,
        muscleGroups: ['Mobilidade'],
        exercises: ['Alongamento Dinâmico', 'Yoga Flow'],
        recommendationScore: 75,
        aiReasoning: 'Essencial para manutenção da amplitude articular',
        createdAt: new Date().toISOString()
      },
      // Novos modelos de treino
      {
        id: 'corpo-inteiro-funcional',
        name: 'Corpo Inteiro - Funcional',
        description: 'Treino funcional com movimentos compostos',
        category: 'funcional',
        phase: 'Intermediário',
        duration: 40,
        targetPSE: 7,
        muscleGroups: ['Corpo Inteiro'],
        exercises: ['Burpees', 'Thruster', 'Kettlebell Swing'],
        recommendationScore: 87,
        aiReasoning: 'Desenvolve força funcional e coordenação',
        createdAt: new Date().toISOString()
      },
      {
        id: 'olimpico-avancado',
        name: 'Levantamentos Olímpicos',
        description: 'Treino de movimentos olímpicos para atletas',
        category: 'olimpico',
        phase: 'Avançado',
        duration: 70,
        targetPSE: 9,
        muscleGroups: ['Corpo Inteiro'],
        exercises: ['Clean and Press', 'Snatch', 'Clean and Jerk'],
        recommendationScore: 95,
        aiReasoning: 'Máximo desenvolvimento de potência e técnica',
        createdAt: new Date().toISOString()
      },
      {
        id: 'crosstraining-intenso',
        name: 'CrossTraining Intenso',
        description: 'WOD de alta intensidade',
        category: 'crosstraining',
        phase: 'Avançado',
        duration: 20,
        targetPSE: 9,
        muscleGroups: ['Corpo Inteiro'],
        exercises: ['Wall Ball', 'Devil Press', 'Box Over Jump'],
        recommendationScore: 93,
        aiReasoning: 'Máxima intensidade em tempo reduzido',
        createdAt: new Date().toISOString()
      },
      {
        id: 'resistencia-metabolica',
        name: 'Resistência Metabólica',
        description: 'Treino para resistência e condicionamento',
        category: 'resistencia',
        phase: 'Intermediário',
        duration: 45,
        targetPSE: 8,
        muscleGroups: ['Corpo Inteiro', 'Cardio'],
        exercises: ['Corda Naval', 'Remada no Rower', 'Farmer Carry'],
        recommendationScore: 85,
        aiReasoning: 'Desenvolve capacidade metabólica e resistência',
        createdAt: new Date().toISOString()
      }
    ];
  }

  // Enhanced method using AI analysis and Supabase models
  async analyzePeriodization(data: any) {
    try {
      console.log('Analyzing periodization with AI service...');
      
      // Get workout models from Supabase
      const supabaseModels = await workoutModelsService.getRecommendedModels({
        level: data.experience_level,
        objective: data.primary_goal
      });

      // Use Grok AI service for analysis
      const aiAnalysis = await grokAIService.analyzePeriodization(data);
      
      // Enhance analysis with Supabase models
      const enhancedRecommendations = await this.enhanceRecommendationsWithSupabaseModels(
        aiAnalysis.recommendedModels,
        supabaseModels,
        data
      );

      return {
        currentPhase: aiAnalysis.currentPhase,
        recommendedModels: enhancedRecommendations,
        periodizationSuggestions: aiAnalysis.periodizationSuggestions,
        confidence: aiAnalysis.confidence,
        supabaseModels: supabaseModels
      };
    } catch (error) {
      console.error('AI analysis failed, falling back to local analysis:', error);
      
      // Fallback to original analysis with Supabase models
      const supabaseModels = await workoutModelsService.getRecommendedModels({
        level: data.experience_level,
        objective: data.primary_goal
      }).catch(() => []);

      const analysis = {
        currentPhase: data.phase || 'Base',
        recommendedModels: this.analyzeUserProfile(data),
        periodizationSuggestions: this.generatePeriodizationSuggestions(data),
        supabaseModels: supabaseModels
      };
      
      return analysis;
    }
  }

  // Convert Supabase models to RecommendedWorkoutModel format
  private convertSupabaseToRecommended(supabaseModel: WorkoutModel): RecommendedWorkoutModel {
    return {
      id: supabaseModel.id,
      name: supabaseModel.name,
      description: supabaseModel.general_objective,
      category: supabaseModel.stimulus_type,
      phase: supabaseModel.periodization_phase,
      duration: this.estimateDuration(supabaseModel.format_type),
      targetPSE: this.estimatePSE(supabaseModel.level),
      muscleGroups: this.extractMuscleGroups(supabaseModel.structure_description),
      exercises: this.extractExercises(supabaseModel.structure_description),
      recommendationScore: this.calculateScore(supabaseModel),
      aiReasoning: `${supabaseModel.method_description}. Ideal para ${supabaseModel.level.toLowerCase()}.`,
      createdAt: supabaseModel.created_at || new Date().toISOString()
    };
  }

  // Enhance recommendations with Supabase models
  private async enhanceRecommendationsWithSupabaseModels(
    aiRecommendations: RecommendedWorkoutModel[],
    supabaseModels: WorkoutModel[],
    userProfile: any
  ): Promise<RecommendedWorkoutModel[]> {
    const convertedSupabaseModels = supabaseModels.map(model => 
      this.convertSupabaseToRecommended(model)
    );

    // Combine AI recommendations with Supabase models
    const combinedModels = [...aiRecommendations, ...convertedSupabaseModels];

    // Sort by recommendation score and return top results
    return combinedModels
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 10);
  }

  // Helper methods for conversion
  private estimateDuration(formatType: string): number {
    const durationMap: Record<string, number> = {
      'HIIT': 30,
      'Tabata': 20,
      'EMOM': 35,
      'Circuito': 40,
      'Séries diretas': 45,
      'Superset': 35,
      'Bi-set': 40
    };
    return durationMap[formatType] || 35;
  }

  private estimatePSE(level: string): number {
    const pseMap: Record<string, number> = {
      'Básico': 6,
      'Intermediário': 7,
      'Avançado': 8
    };
    return pseMap[level] || 7;
  }

  private extractMuscleGroups(description: string): string[] {
    const muscleKeywords = ['core', 'inferior', 'superior', 'quadríceps', 'dorsais', 'glúteos', 'peito', 'ombros'];
    return muscleKeywords.filter(muscle => 
      description.toLowerCase().includes(muscle)
    );
  }

  private extractExercises(description: string): string[] {
    // Basic extraction - could be enhanced with more sophisticated parsing
    if (description.includes('agachar')) return ['Agachamento'];
    if (description.includes('empurrar')) return ['Flexão'];
    if (description.includes('puxar')) return ['Puxada'];
    return ['Exercícios Funcionais'];
  }

  private calculateScore(model: WorkoutModel): number {
    let score = 70; // Base score
    
    if (model.level === 'Avançado') score += 15;
    if (model.level === 'Intermediário') score += 10;
    if (model.timer_enabled) score += 5;
    if (model.voice_cadence_enabled) score += 5;
    
    return Math.min(score, 100);
  }

  // Get workout models from Supabase
  async getWorkoutModelsFromDatabase(): Promise<WorkoutModel[]> {
    return await workoutModelsService.getAllWorkoutModels();
  }

  // Get models by phase from Supabase
  async getModelsByPhase(phase: string): Promise<WorkoutModel[]> {
    return await workoutModelsService.getModelsByPhase(phase);
  }

  // Get models by week from Supabase
  async getModelsByWeek(weekNumber: number): Promise<WorkoutModel[]> {
    return await workoutModelsService.getModelsByWeek(weekNumber);
  }

  // Search models in Supabase
  async searchWorkoutModels(searchTerm: string): Promise<WorkoutModel[]> {
    return await workoutModelsService.searchModels(searchTerm);
  }

  // Método que estava faltando
  recommendWorkoutModels(userProfile: any, limit: number = 5): RecommendedWorkoutModel[] {
    return this.generateAIRecommendations(userProfile).slice(0, limit);
  }

  // Gerar sugestões de periodização
  private generatePeriodizationSuggestions(data: any) {
    return [
      'Progressão gradual de volume e intensidade',
      'Alternância entre fases de acúmulo e intensificação',
      'Inclusão de períodos de recuperação ativa',
      'Variação de estímulos para evitar adaptação'
    ];
  }

  // Obter todos os modelos de treino
  getAllWorkoutModels(): RecommendedWorkoutModel[] {
    return this.workoutModels;
  }

  getUserWorkoutModels(userId: string): RecommendedWorkoutModel[] {
    try {
      const userModelsKey = `userWorkoutModels_${userId}`;
      const userModels = localStorage.getItem(userModelsKey);
      return userModels ? JSON.parse(userModels) : [];
    } catch {
      return [];
    }
  }

  addWorkoutModel(model: Omit<RecommendedWorkoutModel, 'id' | 'createdAt'>): RecommendedWorkoutModel {
    const newModel: RecommendedWorkoutModel = {
      ...model,
      id: `custom-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    this.workoutModels.push(newModel);
    return newModel;
  }

  analyzeUserProfile(userProfile: any): RecommendedWorkoutModel[] {
    if (!userProfile) return this.workoutModels.slice(0, 3);

    const { objetivo, nivel, tempo_disponivel } = userProfile;
    
    return this.workoutModels
      .filter(model => {
        if (objetivo && model.category !== objetivo) return false;
        if (nivel === 'iniciante' && model.phase === 'Avançado') return false;
        if (tempo_disponivel && model.duration > tempo_disponivel) return false;
        return true;
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore);
  }

  generateAIRecommendations(userProfile: any, trainingHistory: any[] = []): RecommendedWorkoutModel[] {
    const baseModels = this.analyzeUserProfile(userProfile);
    
    return baseModels.map(model => ({
      ...model,
      recommendationScore: Math.min(100, model.recommendationScore + Math.random() * 10),
      aiReasoning: this.generateAIReasoning(model, userProfile)
    }));
  }

  private generateAIReasoning(model: RecommendedWorkoutModel, userProfile: any): string {
    const reasons = [
      `Baseado no seu objetivo de ${userProfile?.objetivo || 'fitness geral'}`,
      `Adequado para o nível ${userProfile?.nivel || 'intermediário'}`,
      `Duração de ${model.duration} minutos se encaixa na sua disponibilidade`,
      `PSE ${model.targetPSE} ideal para progressão segura`
    ];
    
    return reasons.slice(0, 2).join(', ') + '.';
  }

  saveUserWorkoutModel(userId: string, model: RecommendedWorkoutModel): boolean {
    try {
      const userModelsKey = `userWorkoutModels_${userId}`;
      const existingModels = this.getUserWorkoutModels(userId);
      
      const updatedModels = [...existingModels, model];
      localStorage.setItem(userModelsKey, JSON.stringify(updatedModels));
      
      return true;
    } catch {
      return false;
    }
  }

  removeUserWorkoutModel(userId: string, modelId: string): boolean {
    try {
      const userModelsKey = `userWorkoutModels_${userId}`;
      const existingModels = this.getUserWorkoutModels(userId);
      
      const filteredModels = existingModels.filter(model => model.id !== modelId);
      localStorage.setItem(userModelsKey, JSON.stringify(filteredModels));
      
      return true;
    } catch {
      return false;
    }
  }
}

// Instância singleton do serviço
export const periodizationAnalysisService = new PeriodizationAnalysisService();
