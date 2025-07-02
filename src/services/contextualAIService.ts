
import { UserProfile } from '@/data/mockData';

interface UserContext {
  profile: UserProfile;
  recentWorkouts: any[];
  performanceMetrics: {
    averagePSE: number;
    totalWorkouts: number;
    weeklyFrequency: number;
    progressTrend: 'improving' | 'stable' | 'declining';
  };
  currentGoals: string[];
  challenges: string[];
}

interface AIAnalysis {
  userState: 'motivated' | 'struggling' | 'progressing' | 'plateaued';
  recommendations: string[];
  nextWorkoutSuggestion: string;
  motivationalMessage: string;
  warnings: string[];
}

class ContextualAIService {
  private analyzeUserState(context: UserContext): 'motivated' | 'struggling' | 'progressing' | 'plateaued' {
    const { performanceMetrics } = context;
    
    if (performanceMetrics.weeklyFrequency < 2) {
      return 'struggling';
    }
    
    if (performanceMetrics.progressTrend === 'improving' && performanceMetrics.averagePSE > 6) {
      return 'motivated';
    }
    
    if (performanceMetrics.progressTrend === 'stable' && performanceMetrics.averagePSE < 5) {
      return 'plateaued';
    }
    
    return 'progressing';
  }

  private generateRecommendations(context: UserContext, userState: string): string[] {
    const recommendations: string[] = [];
    const { profile, performanceMetrics } = context;

    // Recomendações baseadas no estado do usuário
    switch (userState) {
      case 'struggling':
        recommendations.push('Considere reduzir a intensidade e focar na consistência');
        recommendations.push('Tente treinos mais curtos (15-20min) para criar o hábito');
        if (profile.level === 'avancado') {
          recommendations.push('Talvez seja hora de um deload - reduza 40% da carga');
        }
        break;
        
      case 'plateaued':
        recommendations.push('Hora de variar! Experimente novos exercícios');
        recommendations.push('Aumente gradualmente a intensidade (PSE +1)');
        recommendations.push('Considere mudar o tipo de treino principal');
        break;
        
      case 'motivated':
        recommendations.push('Excelente momento para progressões avançadas!');
        recommendations.push('Mantenha o equilíbrio - não exagere na intensidade');
        recommendations.push('Considere adicionar exercícios de mobilidade');
        break;
        
      case 'progressing':
        recommendations.push('Continue no caminho atual - está funcionando!');
        recommendations.push('Pequenos ajustes podem otimizar ainda mais');
        break;
    }

    // Recomendações baseadas no objetivo
    if (profile.objective === 'perda-peso' && performanceMetrics.averagePSE < 6) {
      recommendations.push('Para perda de peso, tente aumentar a intensidade ligeiramente');
    }
    
    if (profile.objective === 'ganho-massa' && performanceMetrics.weeklyFrequency > 5) {
      recommendations.push('Para ganho de massa, garanta dias de descanso adequados');
    }

    return recommendations;
  }

  private generateWorkoutSuggestion(context: UserContext): string {
    const { profile, performanceMetrics } = context;
    
    const suggestions = {
      iniciante: {
        'peso-corporal': 'Treino básico: 3 séries de agachamentos, flexões (joelhos se necessário) e prancha',
        'forca': 'Treino com pesos leves: foque na técnica antes da carga',
        'cardio': 'Caminhada de 20-30min em ritmo confortável'
      },
      intermediario: {
        'peso-corporal': 'Circuito 10X: 10 exercícios, 45s work/15s rest',
        'forca': 'Treino A/B: alterne entre superiores e inferiores',
        'cardio': 'HIIT moderado: 30s intenso, 90s recuperação'
      },
      avancado: {
        'peso-corporal': 'Treino 10X avançado com progressões complexas',
        'forca': 'Treino periodizado com foco em 1RM',
        'cardio': 'HIIT avançado ou treino metabólico'
      }
    };

    // Ajustar baseado na carga recente
    if (performanceMetrics.averagePSE > 8) {
      return 'Treino de recuperação ativa: mobilidade e alongamento (PSE 4-5)';
    }

    const levelSuggestions = suggestions[profile.level as keyof typeof suggestions];
    const workoutType = performanceMetrics.weeklyFrequency > 4 ? 'cardio' : 'peso-corporal';
    
    return levelSuggestions[workoutType as keyof typeof levelSuggestions] || 
           'Treino balanceado combinando força e cardio';
  }

  private generateMotivationalMessage(context: UserContext, userState: string): string {
    const messages = {
      motivated: [
        `${context.profile.name}, você está em ótima forma! 💪`,
        'Sua dedicação está dando resultados incríveis!',
        'Continue assim - você é um exemplo de consistência!'
      ],
      progressing: [
        'Cada treino te deixa mais forte! 🚀',
        'Progresso constante é a chave do sucesso!',
        'Você está no caminho certo, continue firme!'
      ],
      plateaued: [
        'Todo atleta passa por platôs - é hora de quebrar o seu! ⚡',
        'Desafios são oportunidades de crescimento!',
        'Vamos mudar a estratégia e acelerar seus resultados!'
      ],
      struggling: [
        `${context.profile.name}, todo começo é difícil, mas você consegue! 🌟`,
        'Pequenos passos levam a grandes conquistas!',
        'Lembre-se: consistência > perfeição!'
      ]
    };

    const stateMessages = messages[userState as keyof typeof messages];
    return stateMessages[Math.floor(Math.random() * stateMessages.length)];
  }

  private generateWarnings(context: UserContext): string[] {
    const warnings: string[] = [];
    const { performanceMetrics } = context;

    if (performanceMetrics.averagePSE > 8.5) {
      warnings.push('⚠️ Intensidade muito alta consistentemente - risco de overtraining');
    }

    if (performanceMetrics.weeklyFrequency > 6) {
      warnings.push('⚠️ Muitos treinos por semana - considere dias de descanso');
    }

    if (performanceMetrics.weeklyFrequency < 2) {
      warnings.push('💡 Frequência baixa pode limitar os resultados');
    }

    return warnings;
  }

  public analyzeUser(context: UserContext): AIAnalysis {
    const userState = this.analyzeUserState(context);
    const recommendations = this.generateRecommendations(context, userState);
    const nextWorkoutSuggestion = this.generateWorkoutSuggestion(context);
    const motivationalMessage = this.generateMotivationalMessage(context, userState);
    const warnings = this.generateWarnings(context);

    return {
      userState,
      recommendations,
      nextWorkoutSuggestion,
      motivationalMessage,
      warnings
    };
  }

  public generateContextualResponse(userMessage: string, context: UserContext): string {
    const analysis = this.analyzeUser(context);
    const message = userMessage.toLowerCase();

    // Respostas contextuais baseadas na análise do usuário
    if (message.includes('treino') && message.includes('hoje')) {
      return `${analysis.nextWorkoutSuggestion}\n\n${analysis.motivationalMessage}`;
    }

    if (message.includes('não consigo') || message.includes('difícil')) {
      if (analysis.userState === 'struggling') {
        return `Entendo sua dificuldade, ${context.profile.name}. Baseado no seu perfil, sugiro começar mais devagar. ${analysis.recommendations[0]}. Lembre-se: ${analysis.motivationalMessage}`;
      }
    }

    if (message.includes('resultado') || message.includes('progresso')) {
      const trend = context.performanceMetrics.progressTrend === 'improving' ? 
        'Seus resultados mostram evolução positiva!' : 
        'Vamos ajustar sua estratégia para acelerar os resultados.';
      
      return `${trend} Você treinou ${context.performanceMetrics.totalWorkouts} vezes com PSE médio de ${context.performanceMetrics.averagePSE}. ${analysis.recommendations[0]}`;
    }

    if (message.includes('intensidade') || message.includes('pse')) {
      if (context.performanceMetrics.averagePSE > 8) {
        return `Seu PSE médio está em ${context.performanceMetrics.averagePSE} - bem alto! ${analysis.warnings[0] || 'Considere alternar dias de alta e baixa intensidade.'}`;
      } else if (context.performanceMetrics.averagePSE < 5) {
        return `Seu PSE médio está em ${context.performanceMetrics.averagePSE}. Há espaço para aumentar a intensidade gradualmente para melhores resultados.`;
      }
    }

    // Resposta padrão contextualizada
    return `${analysis.motivationalMessage}\n\nBaseado no seu perfil (${context.profile.level}, ${context.profile.objective}), sugiro: ${analysis.recommendations[0]}`;
  }
}

export const contextualAI = new ContextualAIService();
export type { UserContext, AIAnalysis };
