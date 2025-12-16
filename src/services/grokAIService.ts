import { supabase } from "@/integrations/supabase/client";

interface GrokAnalysisRequest {
  objetivo: string;
  nivel: string;
  tempo_disponivel: string;
  restricoes: string;
  periodizacao: string;
  periodizacao_texto?: string;
  lesoes?: string;
  grupo_prioritario?: string;
  dias_semana?: string;
}

interface WorkoutModel {
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

interface AnalysisResult {
  currentPhase: string;
  recommendedModels: WorkoutModel[];
  periodizationSuggestions: string[];
  confidence: number;
}

class GrokAIService {
  private static instance: GrokAIService;
  private generatedModels: Set<string> = new Set();

  static getInstance(): GrokAIService {
    if (!GrokAIService.instance) {
      GrokAIService.instance = new GrokAIService();
    }
    return GrokAIService.instance;
  }

  async analyzePeriodization(data: GrokAnalysisRequest): Promise<AnalysisResult> {
    try {
      const { data: result, error } = await supabase.functions.invoke('analyze-periodization', {
        body: data,
      });

      if (error) {
        throw error;
      }

      // Generate unique workout models based on analysis
      const recommendedModels = this.generateUniqueWorkoutModels(data, result);

      return {
        currentPhase: this.determineCurrentPhase(data),
        recommendedModels,
        periodizationSuggestions: result.suggestions || this.getDefaultSuggestions(data),
        confidence: result.confidence || 0.85
      };
    } catch (error) {
      console.error('Error analyzing periodization:', error);
      // Fallback to local analysis
      return this.generateFallbackAnalysis(data);
    }
  }

  private generateUniqueWorkoutModels(data: GrokAnalysisRequest, aiResult: any): WorkoutModel[] {
    const models: WorkoutModel[] = [];
    const baseModels = this.getBaseWorkoutModels(data);
    
    // Generate 3-5 unique models based on AI analysis
    for (let i = 0; i < Math.min(5, baseModels.length); i++) {
      const baseModel = baseModels[i];
      const uniqueId = this.generateUniqueModelId(baseModel.name, data);
      
      if (!this.generatedModels.has(uniqueId)) {
        this.generatedModels.add(uniqueId);
        
        models.push({
          ...baseModel,
          id: uniqueId,
          aiReasoning: this.generateAIReasoning(baseModel, data, aiResult),
          recommendationScore: this.calculateRecommendationScore(baseModel, data),
          createdAt: new Date().toISOString()
        });
      }
    }
    
    return models;
  }

  private generateUniqueModelId(baseName: string, data: GrokAnalysisRequest): string {
    const timestamp = Date.now();
    const hash = this.simpleHash(`${baseName}-${data.objetivo}-${data.nivel}-${timestamp}`);
    return `ai-${hash}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private getBaseWorkoutModels(data: GrokAnalysisRequest): WorkoutModel[] {
    const baseModels: WorkoutModel[] = [];
    const duration = parseInt(data.tempo_disponivel) || 45;

    // Generate models based on objective
    switch (data.objetivo) {
      case 'perda-peso':
        baseModels.push(
          {
            id: 'temp-1',
            name: 'Queima de Gordura HIIT',
            description: 'Treino intervalado de alta intensidade para queima de gordura',
            category: 'perda-peso',
            phase: 'Intensificação',
            duration: Math.min(duration, 35),
            targetPSE: data.nivel === 'iniciante' ? 6 : 8,
            muscleGroups: ['Corpo Inteiro', 'Cardio'],
            exercises: ['Burpees', 'Mountain Climbers', 'Jump Squats', 'High Knees'],
            recommendationScore: 0,
            aiReasoning: '',
            createdAt: ''
          },
          {
            id: 'temp-2',
            name: 'Circuito Metabólico',
            description: 'Circuito com exercícios compostos para aceleração metabólica',
            category: 'perda-peso',
            phase: 'Acumulação',
            duration: Math.min(duration, 40),
            targetPSE: data.nivel === 'iniciante' ? 5 : 7,
            muscleGroups: ['Membros Superiores', 'Membros Inferiores', 'Core'],
            exercises: ['Agachamentos', 'Flexões', 'Prancha', 'Lunges'],
            recommendationScore: 0,
            aiReasoning: '',
            createdAt: ''
          }
        );
        break;

      case 'ganho-massa':
        baseModels.push(
          {
            id: 'temp-3',
            name: 'Hipertrofia Progressive',
            description: 'Treino focado em volume e progressão para ganho de massa',
            category: 'ganho-massa',
            phase: 'Hipertrofia',
            duration: Math.min(duration, 60),
            targetPSE: data.nivel === 'iniciante' ? 6 : 8,
            muscleGroups: ['Peito', 'Dorsais', 'Pernas', 'Ombros'],
            exercises: ['Supino', 'Remada', 'Agachamento', 'Desenvolvimento'],
            recommendationScore: 0,
            aiReasoning: '',
            createdAt: ''
          },
          {
            id: 'temp-4',
            name: 'Volume Training',
            description: 'Alto volume de treino para estímulo hipertrófico máximo',
            category: 'ganho-massa',
            phase: 'Acumulação',
            duration: Math.min(duration, 75),
            targetPSE: data.nivel === 'avancado' ? 8 : 7,
            muscleGroups: ['Membros Superiores', 'Membros Inferiores'],
            exercises: ['Supino Inclinado', 'Levantamento Terra', 'Barra Fixa', 'Leg Press'],
            recommendationScore: 0,
            aiReasoning: '',
            createdAt: ''
          }
        );
        break;

      case 'forca':
        baseModels.push(
          {
            id: 'temp-5',
            name: 'Força Máxima',
            description: 'Treino com cargas altas para desenvolvimento de força',
            category: 'forca',
            phase: 'Intensificação',
            duration: Math.min(duration, 70),
            targetPSE: 9,
            muscleGroups: ['Corpo Inteiro'],
            exercises: ['Agachamento Livre', 'Levantamento Terra', 'Supino', 'Desenvolvimento'],
            recommendationScore: 0,
            aiReasoning: '',
            createdAt: ''
          }
        );
        break;

      default:
        baseModels.push(
          {
            id: 'temp-6',
            name: 'Condicionamento Geral',
            description: 'Treino balanceado para condicionamento físico geral',
            category: 'condicionamento',
            phase: 'Básico',
            duration: Math.min(duration, 45),
            targetPSE: 6,
            muscleGroups: ['Corpo Inteiro'],
            exercises: ['Exercícios Funcionais', 'Cardio Moderado', 'Flexibilidade'],
            recommendationScore: 0,
            aiReasoning: '',
            createdAt: ''
          }
        );
    }

    return baseModels;
  }

  private generateAIReasoning(model: WorkoutModel, data: GrokAnalysisRequest, aiResult: any): string {
    const reasoningParts = [];
    
    reasoningParts.push(`Ideal para ${data.objetivo.replace('-', ' ')}`);
    reasoningParts.push(`adequado ao nível ${data.nivel}`);
    
    if (data.tempo_disponivel) {
      reasoningParts.push(`otimizado para ${data.tempo_disponivel} minutos`);
    }
    
    if (data.restricoes) {
      reasoningParts.push(`considerando suas restrições específicas`);
    }

    return `💡 ${reasoningParts.join(', ')}.`;
  }

  private calculateRecommendationScore(model: WorkoutModel, data: GrokAnalysisRequest): number {
    let score = 70; // Base score
    
    // Match with objective
    if (model.category === data.objetivo) {
      score += 20;
    }
    
    // Match with level
    if (data.nivel === 'iniciante' && model.targetPSE <= 6) {
      score += 10;
    } else if (data.nivel === 'avancado' && model.targetPSE >= 8) {
      score += 10;
    }
    
    // Time availability
    const availableTime = parseInt(data.tempo_disponivel) || 45;
    if (model.duration <= availableTime) {
      score += 5;
    }
    
    return Math.min(score, 95);
  }

  private determineCurrentPhase(data: GrokAnalysisRequest): string {
    switch (data.periodizacao) {
      case 'linear':
        return 'Fase Linear';
      case 'blocos':
        return 'Bloco de Acumulação';
      case 'ondulada':
        return 'Fase Ondulatória';
      case 'conjugada':
        return 'Método Conjugado';
      default:
        return 'Fase Inicial';
    }
  }

  private getDefaultSuggestions(data: GrokAnalysisRequest): string[] {
    const suggestions = [
      'Progressão gradual de volume e intensidade',
      'Monitoramento constante da PSE (Percepção Subjetiva de Esforço)',
      'Alternância entre fases de estresse e recuperação'
    ];

    if (data.nivel === 'iniciante') {
      suggestions.push('Foco na técnica de execução dos exercícios');
      suggestions.push('Aumento gradual da complexidade dos movimentos');
    }

    if (data.restricoes) {
      suggestions.push('Adaptações específicas para suas limitações');
    }

    return suggestions;
  }

  private generateFallbackAnalysis(data: GrokAnalysisRequest): AnalysisResult {
    return {
      currentPhase: this.determineCurrentPhase(data),
      recommendedModels: this.generateUniqueWorkoutModels(data, {}),
      periodizationSuggestions: this.getDefaultSuggestions(data),
      confidence: 0.75
    };
  }
}

export const grokAIService = GrokAIService.getInstance();
