
import { workoutGenerationService, WorkoutGoal, GeneratedWorkout } from './workoutGenerationService';
import { AIConfigService } from './aiConfigService';
import { UserProfile } from '@/data/mockData';

interface EnhancedWorkoutRequest {
  userProfile: UserProfile;
  preferences?: {
    focusAreas?: string[];
    avoidExercises?: string[];
    timeConstraints?: number;
    equipmentAvailable?: string[];
    energyLevel?: number; // 1-10
    recoveryStatus?: 'full' | 'partial' | 'low';
  };
  contextualData?: {
    recentWorkouts: any[];
    currentStreak: number;
    avgPSE: number;
    progressTrend: 'improving' | 'stable' | 'declining';
  };
}

interface SmartWorkoutSuggestion {
  workout: GeneratedWorkout;
  aiRecommendations: string[];
  adaptations: string[];
  motivationalMessage: string;
  nextWorkoutPreview: string;
}

class EnhancedWorkoutService {
  
  // Gerar treino com IA aprimorada baseada nas configurações do usuário
  generateSmartWorkout(request: EnhancedWorkoutRequest): SmartWorkoutSuggestion {
    // Verificar se a geração de treinos está habilitada
    if (!AIConfigService.isFeatureEnabled('workout-generation')) {
      throw new Error('Geração de treinos por IA está desabilitada');
    }

    const settings = AIConfigService.getSettings();
    
    // Ajustar objetivo baseado nas preferências e configurações
    const enhancedGoal = this.buildEnhancedGoal(request, settings);
    
    // Gerar treino base
    const baseWorkout = workoutGenerationService.generatePersonalizedWorkout(
      request.userProfile,
      enhancedGoal,
      request.contextualData?.recentWorkouts || []
    );

    // Aplicar adaptações inteligentes
    const adaptedWorkout = this.applyIntelligentAdaptations(baseWorkout, request, settings);
    
    // Gerar recomendações contextuais
    const aiRecommendations = this.generateContextualRecommendations(request, settings);
    
    // Gerar mensagem motivacional personalizada
    const motivationalMessage = this.generateMotivationalMessage(request, settings);
    
    // Preview do próximo treino
    const nextWorkoutPreview = this.generateNextWorkoutPreview(request);

    return {
      workout: adaptedWorkout,
      aiRecommendations,
      adaptations: this.getAppliedAdaptations(baseWorkout, adaptedWorkout),
      motivationalMessage,
      nextWorkoutPreview
    };
  }

  private buildEnhancedGoal(request: EnhancedWorkoutRequest, settings: any): WorkoutGoal {
    const { userProfile, preferences } = request;
    
    // Determinar tipo baseado no objetivo principal e preferências
    let type: WorkoutGoal['type'] = 'condicionamento';
    if (userProfile.objective === 'perda-peso') type = 'perda-peso';
    else if (userProfile.objective === 'ganho-massa') type = 'ganho-massa';
    
    // Ajustar intensidade baseada nas configurações e contexto
    let intensity: WorkoutGoal['intensity'] = 'moderada';
    const preferredIntensity = settings.intensityPreference;
    
    if (preferredIntensity <= 4) intensity = 'baixa';
    else if (preferredIntensity >= 7) intensity = 'alta';
    
    // Considerar nível de energia atual
    if (preferences?.energyLevel && preferences.energyLevel <= 4) {
      intensity = 'baixa';
    }
    
    // Considerar status de recuperação
    if (preferences?.recoveryStatus === 'low') {
      intensity = 'baixa';
    }

    // Selecionar grupos musculares
    const muscleGroups = preferences?.focusAreas || 
      this.selectOptimalMuscleGroups(userProfile, request.contextualData);

    return {
      type,
      duration: preferences?.timeConstraints || 45,
      intensity,
      muscleGroups
    };
  }

  private applyIntelligentAdaptations(
    workout: GeneratedWorkout, 
    request: EnhancedWorkoutRequest,
    settings: any
  ): GeneratedWorkout {
    
    let adaptedWorkout = { ...workout };

    // Adaptação baseada na complexidade preferida
    if (settings.workoutComplexity === 'simples') {
      adaptedWorkout = this.simplifyWorkout(adaptedWorkout);
    } else if (settings.workoutComplexity === 'avancado') {
      adaptedWorkout = this.enhanceWorkoutComplexity(adaptedWorkout);
    }

    // Adaptação baseada no equipamento disponível
    if (request.preferences?.equipmentAvailable) {
      adaptedWorkout = this.filterByEquipment(adaptedWorkout, request.preferences.equipmentAvailable);
    }

    // Adaptação baseada em exercícios a evitar
    if (request.preferences?.avoidExercises) {
      adaptedWorkout = this.removeAvoidedExercises(adaptedWorkout, request.preferences.avoidExercises);
    }

    return adaptedWorkout;
  }

  private generateContextualRecommendations(request: EnhancedWorkoutRequest, settings: any): string[] {
    const recommendations: string[] = [];
    const { contextualData, preferences, userProfile } = request;

    // Recomendações baseadas no progresso
    if (contextualData?.progressTrend === 'declining') {
      recommendations.push('💡 Considere reduzir a intensidade hoje para permitir melhor recuperação');
    } else if (contextualData?.progressTrend === 'improving') {
      recommendations.push('🚀 Seu progresso está excelente! Hora de desafiar-se um pouco mais');
    }

    // Recomendações baseadas no PSE médio
    if (contextualData?.avgPSE && contextualData.avgPSE > 8) {
      recommendations.push('⚖️ Seu PSE médio está alto. Inclua mais exercícios de mobilidade');
    }

    // Recomendações baseadas no nível de energia
    if (preferences?.energyLevel && preferences.energyLevel <= 3) {
      recommendations.push('🌱 Energia baixa hoje? Foque na qualidade dos movimentos, não na quantidade');
    }

    // Recomendações baseadas na sequência de treinos
    if (contextualData?.currentStreak && contextualData.currentStreak > 5) {
      recommendations.push('🏆 Sequência incrível! Lembre-se da importância do descanso ativo');
    }

    // Recomendações nutricionais contextuais
    if (userProfile.objective === 'perda-peso') {
      recommendations.push('🥗 Dica nutricional: Hidrate-se bem antes e depois do treino');
    }

    return recommendations;
  }

  private generateMotivationalMessage(request: EnhancedWorkoutRequest, settings: any): string {
    if (!AIConfigService.isFeatureEnabled('motivational')) {
      return '';
    }

    const messages = {
      formal: [
        `${request.userProfile.name}, este treino foi cientificamente desenvolvido para seus objetivos específicos.`,
        'A consistência é a chave para resultados duradouros. Execute com foco e técnica adequada.',
        'Seu progresso é mensurável. Cada repetição contribui para sua evolução física.'
      ],
      casual: [
        `E aí, ${request.userProfile.name}! Preparado(a) para mais um treino incrível?`,
        'Bora quebrar alguns limites hoje! Seu corpo vai agradecer depois 💪',
        'Hoje é dia de se superar. Você tem tudo que precisa para arrasar!'
      ],
      motivacional: [
        `🔥 ${request.userProfile.name}, HOJE É SEU DIA DE BRILHAR! Cada gota de suor vale a pena!`,
        '💪 FORÇA, DETERMINAÇÃO E FOCO! Você é mais forte do que imagina!',
        '🚀 SUPERE SEUS LIMITES! Cada treino é um passo em direção à sua melhor versão!'
      ]
    };

    const styleMessages = messages[settings.responseStyle] || messages.motivacional;
    return styleMessages[Math.floor(Math.random() * styleMessages.length)];
  }

  private generateNextWorkoutPreview(request: EnhancedWorkoutRequest): string {
    const { userProfile, contextualData } = request;
    
    // Sugerir próximo treino baseado no padrão atual
    const lastWorkouts = contextualData?.recentWorkouts?.slice(0, 3) || [];
    const suggestion = workoutGenerationService.suggestNextWorkout(userProfile, lastWorkouts);
    
    return `Próximo treino sugerido: ${suggestion.type === 'forca' ? 'Treino de Força' : 
      suggestion.type === 'perda-peso' ? 'Treino Queima Calorias' : 
      'Treino de Condicionamento'} - ${suggestion.duration}min`;
  }

  // Métodos auxiliares privados
  private selectOptimalMuscleGroups(userProfile: UserProfile, contextualData?: any): string[] {
    const allGroups = ['Peitoral', 'Dorsais', 'Quadríceps', 'Isquiotibiais', 'Deltoide', 'Bíceps', 'Tríceps'];
    
    // Evitar grupos trabalhados recentemente
    const recentGroups = contextualData?.recentWorkouts
      ?.slice(0, 2)
      ?.flatMap((w: any) => w.muscleGroups || []) || [];
    
    const availableGroups = allGroups.filter(group => !recentGroups.includes(group));
    
    // Retornar 2-3 grupos musculares
    return availableGroups.slice(0, Math.max(2, Math.min(3, availableGroups.length)));
  }

  private simplifyWorkout(workout: GeneratedWorkout): GeneratedWorkout {
    return {
      ...workout,
      exercises: workout.exercises.map(ex => ({
        ...ex,
        sets: Math.max(2, ex.sets - 1),
        notes: 'Foque na técnica. Qualidade > Quantidade'
      }))
    };
  }

  private enhanceWorkoutComplexity(workout: GeneratedWorkout): GeneratedWorkout {
    return {
      ...workout,
      exercises: workout.exercises.map(ex => ({
        ...ex,
        sets: ex.sets + 1,
        notes: ex.notes + ' | Variação avançada: experimente diferentes tempos de execução'
      }))
    };
  }

  private filterByEquipment(workout: GeneratedWorkout, availableEquipment: string[]): GeneratedWorkout {
    // Simplificação - na implementação real, filtraria por equipamento específico
    return workout;
  }

  private removeAvoidedExercises(workout: GeneratedWorkout, avoidList: string[]): GeneratedWorkout {
    return {
      ...workout,
      exercises: workout.exercises.filter(ex => 
        !avoidList.some(avoid => ex.exercise.name.toLowerCase().includes(avoid.toLowerCase()))
      )
    };
  }

  private getAppliedAdaptations(original: GeneratedWorkout, adapted: GeneratedWorkout): string[] {
    const adaptations: string[] = [];
    
    if (original.exercises.length !== adapted.exercises.length) {
      adaptations.push('Exercícios filtrados baseado em suas preferências');
    }
    
    const originalSets = original.exercises.reduce((sum, ex) => sum + ex.sets, 0);
    const adaptedSets = adapted.exercises.reduce((sum, ex) => sum + ex.sets, 0);
    
    if (originalSets !== adaptedSets) {
      adaptations.push(`Séries ajustadas: ${originalSets} → ${adaptedSets}`);
    }
    
    return adaptations;
  }
}

export const enhancedWorkoutService = new EnhancedWorkoutService();
export type { EnhancedWorkoutRequest, SmartWorkoutSuggestion };
