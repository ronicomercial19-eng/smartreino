import { UserProfile } from '@/data/mockData';
import { contextualAI, UserContext, AIAnalysis } from './contextualAIService';
import { workoutGenerationService, WorkoutGoal, GeneratedWorkout } from './workoutGenerationService';
import { AIConfigService } from './aiConfigService';

interface EnhancedAIResponse {
  text: string;
  type: 'suggestion' | 'motivation' | 'analysis' | 'workout' | 'warning';
  workoutSuggestion?: GeneratedWorkout;
  quickActions?: QuickAction[];
  insights?: string[];
}

interface QuickAction {
  label: string;
  action: string;
  icon: string;
}

class EnhancedContextualAIService {
  
  // Análise avançada do usuário com geração de treinos (integrada com configurações)
  analyzeUserAndGenerateRecommendations(context: UserContext): {
    analysis: AIAnalysis;
    suggestedWorkout?: GeneratedWorkout;
    insights: string[];
    quickActions: QuickAction[];
  } {
    
    // Verificar se as funcionalidades estão habilitadas
    const isAnalysisEnabled = AIConfigService.isFeatureEnabled('contextual-analysis');
    const isWorkoutGenEnabled = AIConfigService.isFeatureEnabled('workout-generation');
    
    const analysis = isAnalysisEnabled ? contextualAI.analyzeUser(context) : this.getBasicAnalysis(context);
    
    let suggestedWorkout: GeneratedWorkout | undefined;
    
    if (isWorkoutGenEnabled) {
      // Gerar sugestão de treino personalizada baseada nas configurações
      const workoutGoal = this.buildConfiguredWorkoutGoal(context);
      suggestedWorkout = workoutGenerationService.generatePersonalizedWorkout(
        context.profile,
        workoutGoal,
        context.recentWorkouts
      );
    }
    
    // Gerar insights avançados baseados nas configurações
    const insights = this.generateConfiguredInsights(context, analysis);
    
    // Gerar ações rápidas contextuais
    const quickActions = this.generateConfiguredQuickActions(context, analysis);
    
    return {
      analysis,
      suggestedWorkout,
      insights,
      quickActions
    };
  }

  // Resposta contextual aprimorada com IA (integrada com configurações)
  generateEnhancedResponse(
    userMessage: string, 
    context: UserContext
  ): EnhancedAIResponse {
    
    // Verificar se o chatbot está habilitado
    if (!AIConfigService.isFeatureEnabled('chatbot')) {
      return {
        text: 'Chat com IA está desabilitado. Você pode habilitá-lo nas configurações.',
        type: 'warning'
      };
    }
    
    const message = userMessage.toLowerCase();
    const analysis = contextualAI.analyzeUser(context);
    
    // Aplicar configurações de estilo à resposta
    const baseResponse = this.generateBaseResponse(message, context, analysis);
    const styledResponse = this.applyResponseStyle(baseResponse, context);
    
    return styledResponse;
  }

  private buildConfiguredWorkoutGoal(context: UserContext): WorkoutGoal {
    const settings = AIConfigService.getSettings();
    
    // Usar a intensidade preferida do usuário
    let intensity: WorkoutGoal['intensity'] = 'moderada';
    if (settings.intensityPreference <= 4) intensity = 'baixa';
    else if (settings.intensityPreference >= 7) intensity = 'alta';
    
    // Determinar tipo baseado no objetivo
    let type: WorkoutGoal['type'] = 'condicionamento';
    if (context.profile.objective === 'perda-peso') type = 'perda-peso';
    else if (context.profile.objective === 'ganho-massa') type = 'ganho-massa';
    
    // Selecionar grupos musculares
    const allMuscles = ['Peitoral', 'Dorsais', 'Quadríceps', 'Isquiotibiais', 'Deltoide'];
    const recentMuscles = context.recentWorkouts
      .slice(0, 2)
      .flatMap(w => w.muscleGroups || []);
    
    const availableMuscles = allMuscles.filter(m => !recentMuscles.includes(m));
    const selectedMuscles = availableMuscles.slice(0, 2);
    
    return {
      type,
      duration: 45, // Duração padrão - pode ser configurável futuramente
      intensity,
      muscleGroups: selectedMuscles.length > 0 ? selectedMuscles : ['Peitoral', 'Dorsais']
    };
  }

  private generateConfiguredInsights(context: UserContext, analysis: AIAnalysis): string[] {
    const insights: string[] = [];
    const settings = AIConfigService.getSettings();
    
    // Insights baseados na frequência de análise configurada
    const shouldGenerateDetailed = settings.analysisFrequency === 'alta';
    
    if (shouldGenerateDetailed) {
      // Insight detalhado sobre consistência
      const consistencyScore = this.calculateConsistencyScore(context.recentWorkouts);
      if (consistencyScore > 80) {
        insights.push(`🏆 Consistência exemplar de ${consistencyScore}% - Continue assim!`);
      } else if (consistencyScore < 50) {
        insights.push(`📈 Oportunidade de melhoria: consistência atual de ${consistencyScore}%`);
      }
      
      // Insight sobre progressão PSE
      const pseGrowth = this.calculatePSETrend(context.recentWorkouts.slice(0, 5));
      if (Math.abs(pseGrowth) > 0.5) {
        const trend = pseGrowth > 0 ? 'crescimento' : 'redução';
        insights.push(`📊 Tendência PSE: ${trend} de ${Math.abs(pseGrowth).toFixed(1)} pontos`);
      }
    }
    
    // Insights baseados no objetivo e configurações
    if (context.profile.objective === 'perda-peso' && context.performanceMetrics.averagePSE < settings.intensityPreference) {
      insights.push(`💡 Para seu objetivo, considere aumentar intensidade para ${settings.intensityPreference}/10`);
    }
    
    // Insights baseados no nível de complexidade preferido
    if (settings.workoutComplexity === 'avancado' && context.performanceMetrics.totalWorkouts > 20) {
      insights.push(`🎯 Pronto para técnicas avançadas: drop sets, supersets e periodização`);
    }
    
    return insights;
  }

  private generateConfiguredQuickActions(context: UserContext, analysis: AIAnalysis): QuickAction[] {
    const actions: QuickAction[] = [];
    const settings = AIConfigService.getSettings();
    
    // Ações baseadas nas funcionalidades habilitadas
    if (settings.workoutGenerationEnabled) {
      actions.push({ label: 'Gerar Treino IA', action: 'generate_workout', icon: '🏋️‍♂️' });
    }
    
    if (settings.contextualAnalysisEnabled) {
      actions.push({ label: 'Análise Completa', action: 'full_analysis', icon: '📊' });
    }
    
    // Ações baseadas no estado do usuário
    if (analysis.userState === 'struggling') {
      actions.push({ label: 'Treino Adaptativo', action: 'easy_workout', icon: '🌱' });
    } else if (analysis.userState === 'motivated') {
      actions.push({ label: 'Desafio Extra', action: 'challenge_workout', icon: '🔥' });
    }
    
    // Ações baseadas na intensidade preferida
    if (settings.intensityPreference >= 8) {
      actions.push({ label: 'HIIT Personalizado', action: 'hiit_workout', icon: '⚡' });
    }
    
    // Ação para configurações sempre disponível
    actions.push({ label: 'Configurar IA', action: 'ai_config', icon: '⚙️' });
    
    return actions;
  }

  private generateBaseResponse(message: string, context: UserContext, analysis: AIAnalysis): EnhancedAIResponse {
    // Detectar intenção do usuário
    const intent = this.detectUserIntent(message);
    
    switch (intent) {
      case 'workout_request':
        return this.handleWorkoutRequest(message, context);
      case 'progress_analysis':
        return this.handleProgressAnalysis(context);
      case 'motivation_needed':
        return this.handleMotivationRequest(context, analysis);
      case 'technique_help':
        return this.handleTechniqueHelp(message, context);
      case 'config_help':
        return this.handleConfigurationHelp(message);
      default:
        return this.handleGeneralQuery(message, context, analysis);
    }
  }

  private applyResponseStyle(response: EnhancedAIResponse, context: UserContext): EnhancedAIResponse {
    const settings = AIConfigService.getSettings();
    
    // Aplicar estilo de resposta configurado
    let styledText = response.text;
    
    switch (settings.responseStyle) {
      case 'formal':
        styledText = this.applyFormalStyle(styledText, context.profile.name);
        break;
      case 'casual':
        styledText = this.applyCasualStyle(styledText, context.profile.name);
        break;
      case 'motivacional':
        styledText = this.applyMotivationalStyle(styledText, context.profile.name);
        break;
    }
    
    return {
      ...response,
      text: styledText
    };
  }

  private handleConfigurationHelp(message: string): EnhancedAIResponse {
    return {
      text: `🔧 **Central de Configurações IA**\n\n` +
        `Você pode personalizar como eu funciono acessando as **Configurações de IA**!\n\n` +
        `⚙️ **O que você pode ajustar:**\n` +
        `• Estilo das minhas respostas (formal, casual, motivacional)\n` +
        `• Intensidade preferida dos treinos (1-10)\n` +
        `• Complexidade das explicações\n` +
        `• Frequência das análises\n` +
        `• Ativar/desativar funcionalidades específicas\n\n` +
        `🎯 Clique em "Configurar IA" abaixo para personalizar sua experiência!`,
      type: 'suggestion',
      quickActions: [
        { label: 'Configurar IA', action: 'ai_config', icon: '⚙️' },
        { label: 'Tutorial Completo', action: 'tutorial', icon: '📚' },
        { label: 'Testar Configuração', action: 'test_config', icon: '🧪' }
      ]
    };
  }

  private applyFormalStyle(text: string, userName: string): string {
    return text
      .replace(/🔥|💪|🚀/g, '') // Remove emojis energéticos
      .replace(/!/g, '.') // Substitui exclamações
      .replace(userName, `Sr(a). ${userName}`);
  }

  private applyCasualStyle(text: string, userName: string): string {
    return text
      .replace('Olá', 'E aí')
      .replace('Vamos', 'Bora')
      .replace(userName, userName.split(' ')[0]); // Usa apenas o primeiro nome
  }

  private applyMotivationalStyle(text: string, userName: string): string {
    return text
      .replace(/\./g, '!')
      .replace(/^/, '🔥 ')
      .replace(userName, `${userName.toUpperCase()}`);
  }

  private detectUserIntent(message: string): string {
    const intents = {
      workout_request: ['treino', 'exercicio', 'fazer hoje', 'rotina', 'atividade'],
      progress_analysis: ['progresso', 'resultado', 'evolução', 'desempenho', 'melhora'],
      motivation_needed: ['desanimado', 'difícil', 'não consigo', 'motivação', 'parar'],
      technique_help: ['técnica', 'forma', 'execução', 'como fazer', 'postura'],
      config_help: ['configurar', 'configuração', 'personalizar', 'ajustar', 'settings']
    };
    
    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        return intent;
      }
    }
    
    return 'general';
  }

  private handleWorkoutRequest(message: string, context: UserContext): EnhancedAIResponse {
    const settings = AIConfigService.getSettings();
    
    if (!settings.workoutGenerationEnabled) {
      return {
        text: 'A geração de treinos por IA está desabilitada. Você pode ativá-la nas configurações.',
        type: 'warning',
        quickActions: [
          { label: 'Ativar Geração', action: 'enable_workout_gen', icon: '🔧' }
        ]
      };
    }

    // Detectar preferências específicas na mensagem
    const preferences = this.extractWorkoutPreferences(message);
    
    // Gerar treino personalizado baseado nas configurações
    const workoutGoal = this.buildConfiguredWorkoutGoal(context);
    const workout = workoutGenerationService.generatePersonalizedWorkout(
      context.profile,
      workoutGoal,
      context.recentWorkouts
    );
    
    const responseText = `🎯 **Treino Personalizado Gerado!**\n\n` +
      `**${workout.name}**\n` +
      `📅 Duração: ${workout.duration} minutos\n` +
      `🔥 PSE Alvo: ${workout.targetPSE}/10 (baseado na sua preferência: ${settings.intensityPreference}/10)\n` +
      `⚡ Calorias Estimadas: ${workout.estimatedCalories}\n\n` +
      `${workout.description}\n\n` +
      `💪 **Exercícios principais:**\n` +
      workout.exercises.slice(0, 3).map(ex => 
        `• ${ex.exercise.name} - ${ex.sets}x${ex.reps || `${ex.duration}s`}`
      ).join('\n') +
      `\n\n🔥 Pronto para começar? Clique em "Iniciar Treino" abaixo!`;
    
    return {
      text: responseText,
      type: 'workout',
      workoutSuggestion: workout,
      quickActions: [
        { label: 'Iniciar Treino', action: 'start_workout', icon: '▶️' },
        { label: 'Ver Detalhes', action: 'view_details', icon: '📋' },
        { label: 'Personalizar', action: 'customize', icon: '⚙️' }
      ]
    };
  }

  private handleProgressAnalysis(context: UserContext): EnhancedAIResponse {
    const { performanceMetrics } = context;
    const settings = AIConfigService.getSettings();
    
    if (!settings.contextualAnalysisEnabled) {
      return {
        text: 'A análise contextual está desabilitada. Você pode ativá-la nas configurações para receber insights detalhados.',
        type: 'warning',
        quickActions: [
          { label: 'Ativar Análise', action: 'enable_analysis', icon: '📊' }
        ]
      };
    }

    const recentWorkouts = context.recentWorkouts.slice(0, 5);
    
    // Análise estatística
    const totalWorkouts = performanceMetrics.totalWorkouts;
    const avgPSE = performanceMetrics.averagePSE;
    const weeklyFreq = performanceMetrics.weeklyFrequency;
    
    // Calcular tendências
    const pseGrowth = this.calculatePSETrend(recentWorkouts);
    const consistencyScore = this.calculateConsistencyScore(context.recentWorkouts);
    
    const responseText = `📊 **Análise Completa do seu Progresso**\n\n` +
      `🏆 **Estatísticas Gerais:**\n` +
      `• Total de Treinos: ${totalWorkouts}\n` +
      `• PSE Médio: ${avgPSE.toFixed(1)}/10 (Sua preferência: ${settings.intensityPreference}/10)\n` +
      `• Frequência Semanal: ${weeklyFreq}x\n` +
      `• Score de Consistência: ${consistencyScore}%\n\n` +
      `📈 **Tendências:**\n` +
      `• Evolução PSE: ${pseGrowth > 0 ? '📈' : pseGrowth < 0 ? '📉' : '➡️'} ${Math.abs(pseGrowth).toFixed(1)} pontos\n` +
      `• Status: ${performanceMetrics.progressTrend === 'improving' ? '🚀 Evoluindo' : 
                   performanceMetrics.progressTrend === 'stable' ? '⚖️ Estável' : '⚠️ Precisa atenção'}\n\n` +
      this.generateProgressInsights(context);
    
    return {
      text: responseText,
      type: 'analysis',
      insights: this.generateConfiguredInsights(context, contextualAI.analyzeUser(context)),
      quickActions: [
        { label: 'Ver Gráficos', action: 'view_charts', icon: '📊' },
        { label: 'Ajustar Meta', action: 'adjust_goals', icon: '🎯' },
        { label: 'Novo Desafio', action: 'new_challenge', icon: '🏃‍♂️' }
      ]
    };
  }

  private handleMotivationRequest(context: UserContext, analysis: AIAnalysis): EnhancedAIResponse {
    const settings = AIConfigService.getSettings();
    
    if (!settings.motivationalMessagesEnabled) {
      return {
        text: 'Mensagens motivacionais estão desabilitadas. Você pode ativá-las nas configurações.',
        type: 'warning',
        quickActions: [
          { label: 'Ativar Motivação', action: 'enable_motivation', icon: '💪' }
        ]
      };
    }

    const motivationalMessages = {
      struggling: [
        `${context.profile.name}, lembre-se: cada campeão já foi um iniciante que nunca desistiu! 💪`,
        `Você já treinou ${context.performanceMetrics.totalWorkouts} vezes - isso já é uma vitória! 🏆`,
        `Hoje pode ser difícil, mas amanhã você será mais forte. Vamos juntos! 🌟`
      ],
      plateaued: [
        `Platôs são normais e temporários. Seu corpo está se preparando para o próximo salto! 🚀`,
        `Hora de quebrar a rotina! Vou sugerir algo novo para reacender sua motivação! 🔥`,
        `${context.profile.name}, você chegou longe. Agora vamos ainda mais longe! ⭐`
      ],
      motivated: [
        `Sua energia está contagiante! Continue sendo essa inspiração! ✨`,
        `Com essa dedicação, você vai surpreender até você mesmo! 🎯`,
        `Que momentum incrível! Vamos canalizar isso no próximo treino! 💫`
      ]
    };
    
    const messages = motivationalMessages[analysis.userState as keyof typeof motivationalMessages] || motivationalMessages.motivated;
    const selectedMessage = messages[Math.floor(Math.random() * messages.length)];
    
    const responseText = `💝 **Mensagem Especial para Você**\n\n${selectedMessage}\n\n` +
      `🎯 **Suas Conquistas Recentes:**\n` +
      `• ${context.performanceMetrics.weeklyFrequency} treinos esta semana\n` +
      `• PSE médio de ${context.performanceMetrics.averagePSE.toFixed(1)} - ${context.performanceMetrics.averagePSE >= settings.intensityPreference ? 'meta atingida!' : 'continue evoluindo!'}\n` +
      `• ${context.performanceMetrics.totalWorkouts} treinos no total - que consistência!\n\n` +
      `💡 **Lembrete:** ${analysis.recommendations[0]}`;
    
    return {
      text: responseText,
      type: 'motivation',
      quickActions: [
        { label: 'Treino Motivacional', action: 'motivational_workout', icon: '🔥' },
        { label: 'Definir Meta', action: 'set_goal', icon: '🎯' },
        { label: 'Celebrar Conquista', action: 'celebrate', icon: '🎉' }
      ]
    };
  }

  private handleTechniqueHelp(message: string, context: UserContext): EnhancedAIResponse {
    const settings = AIConfigService.getSettings();
    
    // Detectar exercício específico na mensagem
    const exerciseKeywords = ['agachamento', 'flexão', 'prancha', 'burpee', 'abdomen'];
    const detectedExercise = exerciseKeywords.find(keyword => message.includes(keyword));
    
    const techniqueAdvice = detectedExercise ? 
      this.getSpecificTechniqueAdvice(detectedExercise) :
      this.getGeneralTechniqueAdvice(context.profile.level);
    
    // Ajustar nível de detalhamento baseado na complexidade configurada
    const complexityNote = settings.workoutComplexity === 'simples' 
      ? '\n\n🌟 **Dica:** Foque apenas no básico inicialmente.' 
      : settings.workoutComplexity === 'avancado'
      ? '\n\n🎯 **Dica Avançada:** Experimente variações e diferentes tempos de execução.'
      : '\n\n💡 **Dica:** Qualidade sempre antes da quantidade.';
    
    const responseText = `🎯 **Dicas de Técnica Personalizadas**\n\n${techniqueAdvice}\n\n` +
      `📌 **Para seu nível (${context.profile.level}):**\n` +
      this.getLevelSpecificTips(context.profile.level) +
      complexityNote;
    
    return {
      text: responseText,
      type: 'suggestion',
      quickActions: [
        { label: 'Vídeo Tutorial', action: 'watch_tutorial', icon: '📺' },
        { label: 'Treino Técnico', action: 'technique_workout', icon: '🎯' },
        { label: 'Avaliar Form', action: 'form_check', icon: '✅' }
      ]
    };
  }

  private handleGeneralQuery(message: string, context: UserContext, analysis: AIAnalysis): EnhancedAIResponse {
    const contextualResponse = contextualAI.generateContextualResponse(message, context);
    
    return {
      text: contextualResponse,
      type: 'suggestion',
      insights: this.generateConfiguredInsights(context, analysis),
      quickActions: this.generateConfiguredQuickActions(context, analysis)
    };
  }

  private getBasicAnalysis(context: UserContext): AIAnalysis {
    return {
      userState: 'progressing',
      recommendations: ['Continue mantendo a consistência nos treinos'],
      nextWorkoutSuggestion: 'Treino equilibrado focando nos seus objetivos',
      motivationalMessage: `Continue assim, ${context.profile.name}!`,
      warnings: []
    };
  }

  private extractWorkoutPreferences(message: string): any {
    const preferences: any = {};
    
    const durationMatch = message.match(/(\d+)\s*min/);
    if (durationMatch) preferences.duration = parseInt(durationMatch[1]);
    
    if (message.includes('leve') || message.includes('suave')) preferences.intensity = 'baixa';
    if (message.includes('intenso') || message.includes('forte')) preferences.intensity = 'alta';
    
    if (message.includes('cardio')) preferences.type = 'perda-peso';
    if (message.includes('força') || message.includes('musculação')) preferences.type = 'forca';
    
    return preferences;
  }

  private calculatePSETrend(workouts: any[]): number {
    if (workouts.length < 2) return 0;
    
    const recent = workouts.slice(0, Math.ceil(workouts.length / 2));
    const older = workouts.slice(Math.ceil(workouts.length / 2));
    
    const recentAvg = recent.reduce((sum, w) => sum + (w.pse || 6), 0) / recent.length;
    const olderAvg = older.reduce((sum, w) => sum + (w.pse || 6), 0) / older.length;
    
    return recentAvg - olderAvg;
  }

  private calculateConsistencyScore(workouts: any[]): number {
    if (workouts.length === 0) return 0;
    
    const dates = workouts.map(w => new Date(w.date)).sort((a, b) => b.getTime() - a.getTime());
    const gaps = dates.slice(0, -1).map((date, i) => {
      const nextDate = dates[i + 1];
      return Math.abs(date.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24);
    });
    
    const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    const idealGap = 2;
    
    return Math.max(0, Math.min(100, 100 - (avgGap - idealGap) * 10));
  }

  private generateProgressInsights(context: UserContext): string {
    const insights: string[] = [];
    
    if (context.performanceMetrics.progressTrend === 'improving') {
      insights.push('🎯 Continue no ritmo atual - está funcionando perfeitamente!');
    } else if (context.performanceMetrics.progressTrend === 'declining') {
      insights.push('💡 Hora de revisar estratégia - vamos ajustar juntos!');
    } else {
      insights.push('⚖️ Progresso estável - considere novos desafios!');
    }
    
    return insights.join('\n');
  }

  private getSpecificTechniqueAdvice(exercise: string): string {
    const adviceMap: Record<string, string> = {
      'agachamento': '🏋️‍♂️ **Agachamento Perfeito:**\n• Pés na largura dos ombros\n• Descida controlada até 90°\n• Joelhos alinhados com os pés\n• Peso nos calcanhares',
      'flexão': '💪 **Flexão Correta:**\n• Corpo alinhado como prancha\n• Mãos na largura dos ombros\n• Descida até o peito quase tocar o chão\n• Subida controlada',
      'prancha': '🧱 **Prancha Efetiva:**\n• Cotovelos sob os ombros\n• Corpo reto da cabeça aos pés\n• Respiração constante\n• Contraía core o tempo todo'
    };
    
    return adviceMap[exercise] || '🎯 Foque sempre na qualidade do movimento!';
  }

  private getGeneralTechniqueAdvice(level: string): string {
    const adviceMap: Record<string, string> = {
      'iniciante': '🌱 **Para Iniciantes:**\n• Movimentos lentos e controlados\n• Amplitude completa quando possível\n• Pare se sentir dor\n• Qualidade > Quantidade',
      'intermediario': '📈 **Para Intermediários:**\n• Foque na conexão músculo-mente\n• Varie velocidades de execução\n• Mantenha tensão constante\n• Progrida gradualmente',
      'avancado': '🏆 **Para Avançados:**\n• Técnica impecável mesmo com fadiga\n• Explore variações avançadas\n• Use tempo sob tensão\n• Periodize intensidade'
    };
    
    return adviceMap[level] || adviceMap.intermediario;
  }

  private getLevelSpecificTips(level: string): string {
    const tipsMap: Record<string, string> = {
      'iniciante': '• Priorize aprender os movimentos básicos\n• Use espelho para auto-correção\n• Não tenha pressa para aumentar carga',
      'intermediario': '• Grave-se executando para análise\n• Varie ângulos e pegadas\n• Trabalhe pontos fracos especificamente',
      'avancado': '• Busque micro-progressões\n• Aplique técnicas avançadas (drop sets, etc)\n• Mentorize outros praticantes'
    };
    
    return tipsMap[level] || tipsMap.intermediario;
  }
}

export const enhancedContextualAI = new EnhancedContextualAIService();
export type { EnhancedAIResponse, QuickAction };
