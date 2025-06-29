
import { mockWorkouts, mockAISuggestions, getWorkoutStats, getRecentWorkouts } from "@/data/mockData";

export interface AISuggestion {
  id: number;
  date: string;
  suggestion: string;
  reason: string;
  type: 'recovery' | 'progression' | 'balance' | 'motivation' | 'warning';
  priority: 'low' | 'medium' | 'high';
}

export class AIService {
  // Analisa padrões de treino e gera sugestões
  static generateSuggestions(workouts: any[] = []): AISuggestion[] {
    const suggestions: AISuggestion[] = [];
    const stats = getWorkoutStats();
    const recentWorkouts = getRecentWorkouts(7);
    
    if (!stats || workouts.length === 0) {
      return [{
        id: Date.now(),
        date: new Date().toISOString(),
        suggestion: "Comece registrando seus treinos!",
        reason: "Para receber sugestões personalizadas, precisamos conhecer seu histórico de treinos.",
        type: 'motivation',
        priority: 'medium'
      }];
    }

    // Análise de carga interna alta
    const highLoadWorkouts = recentWorkouts.filter((w: any) => w.cargaInterna > 400);
    if (highLoadWorkouts.length >= 2) {
      suggestions.push({
        id: Date.now() + 1,
        date: new Date().toISOString(),
        suggestion: "Considere um dia de recuperação ativa",
        reason: `Detectei ${highLoadWorkouts.length} treinos de alta intensidade recentes. Recuperação adequada é crucial para progressão.`,
        type: 'recovery',
        priority: 'high'
      });
    }

    // Análise de consistência
    const daysWithoutTraining = this.getDaysSinceLastWorkout(recentWorkouts);
    if (daysWithoutTraining > 3) {
      suggestions.push({
        id: Date.now() + 2,
        date: new Date().toISOString(),
        suggestion: "Hora de voltar aos treinos!",
        reason: `Já fazem ${daysWithoutTraining} dias desde seu último treino. Consistência é chave para resultados.`,
        type: 'motivation',
        priority: 'medium'
      });
    }

    // Análise de progressão
    const avgPSELast5 = this.getAveragePSE(recentWorkouts.slice(0, 5));
    if (avgPSELast5 && avgPSELast5 < 6.5) {
      suggestions.push({
        id: Date.now() + 3,
        date: new Date().toISOString(),
        suggestion: "Considere aumentar a intensidade",
        reason: `Sua PSE média recente é ${avgPSELast5.toFixed(1)}. Talvez seja hora de um desafio maior!`,
        type: 'progression',
        priority: 'low'
      });
    }

    // Análise de variedade de treinos
    const workoutTypes = this.getWorkoutVariety(recentWorkouts);
    if (workoutTypes.length < 3) {
      suggestions.push({
        id: Date.now() + 4,
        date: new Date().toISOString(),
        suggestion: "Adicione variedade aos seus treinos",
        reason: "Diversificar tipos de treino ajuda no desenvolvimento completo e previne platôs.",
        type: 'balance',
        priority: 'medium'
      });
    }

    // Sugestão motivacional baseada em streak
    const currentStreak = this.calculateWorkoutStreak(workouts);
    if (currentStreak >= 5) {
      suggestions.push({
        id: Date.now() + 5,
        date: new Date().toISOString(),
        suggestion: "Parabéns pela consistência!",
        reason: `Você está numa sequência de ${currentStreak} treinos! Continue assim para maximizar resultados.`,
        type: 'motivation',
        priority: 'low'
      });
    }

    return suggestions.slice(0, 3); // Retorna até 3 sugestões mais relevantes
  }

  // Gera sugestão de treino personalizada
  static generateWorkoutSuggestion(userLevel: string, lastWorkouts: any[]): string {
    const suggestions = {
      iniciante: [
        "Comece com 10X - Membros Superiores focando na técnica",
        "Tente Corporal - Upper com movimentos básicos",
        "Experimente um treino de mobilidade para recuperação"
      ],
      intermediario: [
        "10X - Corpo Inteiro para desafio completo",
        "Misto - Força e Cardio para variedade",
        "10X - Membros Inferiores com foco em progressão"
      ],
      avancado: [
        "10X - Corpo Inteiro com exercícios avançados",
        "Combine força e pliometria",
        "Treino metabólico de alta intensidade"
      ]
    };

    const levelSuggestions = suggestions[userLevel as keyof typeof suggestions] || suggestions.intermediario;
    return levelSuggestions[Math.floor(Math.random() * levelSuggestions.length)];
  }

  // Analisa tendências de performance
  static analyzePerformanceTrends(workouts: any[]) {
    if (workouts.length < 3) return null;

    const sortedWorkouts = workouts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const recent = sortedWorkouts.slice(-5);
    const previous = sortedWorkouts.slice(-10, -5);

    const recentAvgLoad = recent.reduce((sum, w) => sum + w.cargaInterna, 0) / recent.length;
    const previousAvgLoad = previous.length > 0 ? previous.reduce((sum, w) => sum + w.cargaInterna, 0) / previous.length : recentAvgLoad;

    const recentAvgPSE = recent.reduce((sum, w) => sum + w.pse, 0) / recent.length;
    const previousAvgPSE = previous.length > 0 ? previous.reduce((sum, w) => sum + w.pse, 0) / previous.length : recentAvgPSE;

    return {
      loadTrend: recentAvgLoad > previousAvgLoad ? 'up' : recentAvgLoad < previousAvgLoad ? 'down' : 'stable',
      pseTrend: recentAvgPSE > previousAvgPSE ? 'up' : recentAvgPSE < previousAvgPSE ? 'down' : 'stable',
      loadChange: Math.round(((recentAvgLoad - previousAvgLoad) / previousAvgLoad) * 100),
      pseChange: Math.round(((recentAvgPSE - previousAvgPSE) / previousAvgPSE) * 100)
    };
  }

  // Métodos auxiliares privados
  private static getDaysSinceLastWorkout(workouts: any[]): number {
    if (workouts.length === 0) return 999;
    
    const lastWorkout = new Date(workouts[0].date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastWorkout.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private static getAveragePSE(workouts: any[]): number | null {
    if (workouts.length === 0) return null;
    return workouts.reduce((sum, w) => sum + w.pse, 0) / workouts.length;
  }

  private static getWorkoutVariety(workouts: any[]): string[] {
    const types = new Set(workouts.map(w => w.workout));
    return Array.from(types);
  }

  private static calculateWorkoutStreak(workouts: any[]): number {
    // Implementação simplificada - na prática seria mais complexa
    const sortedWorkouts = workouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let streak = 0;
    let currentDate = new Date();
    
    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.date);
      const daysDiff = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 2) { // Considera gap de até 2 dias
        streak++;
        currentDate = workoutDate;
      } else {
        break;
      }
    }
    
    return streak;
  }
}

// Hook para usar o serviço de IA
export const useAIService = () => {
  const generateSuggestions = () => {
    const workouts = JSON.parse(localStorage.getItem("workouts") || "[]");
    return AIService.generateSuggestions(workouts);
  };

  const getWorkoutSuggestion = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const workouts = JSON.parse(localStorage.getItem("workouts") || "[]");
    const recentWorkouts = workouts.slice(-5);
    
    return AIService.generateWorkoutSuggestion(user.level || 'intermediario', recentWorkouts);
  };

  const analyzePerformance = () => {
    const workouts = JSON.parse(localStorage.getItem("workouts") || "[]");
    return AIService.analyzePerformanceTrends(workouts);
  };

  return {
    generateSuggestions,
    getWorkoutSuggestion,
    analyzePerformance
  };
};
