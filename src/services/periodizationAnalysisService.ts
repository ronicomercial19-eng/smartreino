
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

// Classe principal do serviço
class PeriodizationAnalysisService {
  private workoutModels: RecommendedWorkoutModel[] = [];

  constructor() {
    this.initializeWorkoutModels();
  }

  // Inicializar modelos de treino
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

  // Método que estava faltando
  analyzePeriodization(data: any) {
    // Análise básica dos dados de periodização
    const analysis = {
      currentPhase: data.phase || 'Básico',
      recommendedModels: this.analyzeUserProfile(data),
      periodizationSuggestions: this.generatePeriodizationSuggestions(data)
    };
    
    return analysis;
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
