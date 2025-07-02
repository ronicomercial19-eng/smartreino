
import { useState, useEffect } from 'react';
import { useUserProfile } from './useUserProfile';
import { getRecentWorkouts, getWorkoutStats } from '@/data/mockData';
import { UserContext } from '@/services/contextualAIService';

export const useUserContext = () => {
  const { userProfile } = useUserProfile();
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) {
      setLoading(false);
      return;
    }

    const buildUserContext = () => {
      try {
        // Buscar dados recentes do usuário
        const recentWorkouts = getRecentWorkouts(10, userProfile.id);
        const stats = getWorkoutStats(userProfile.id);
        
        // Calcular métricas de performance
        const totalWorkouts = recentWorkouts.length;
        const averagePSE = totalWorkouts > 0 
          ? recentWorkouts.reduce((sum, w) => sum + w.pse, 0) / totalWorkouts 
          : 0;
        
        // Calcular frequência semanal
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weeklyWorkouts = recentWorkouts.filter(w => 
          new Date(w.date) >= oneWeekAgo
        ).length;

        // Determinar tendência de progresso
        const recent5 = recentWorkouts.slice(0, 5);
        const previous5 = recentWorkouts.slice(5, 10);
        
        let progressTrend: 'improving' | 'stable' | 'declining' = 'stable';
        
        if (recent5.length > 0 && previous5.length > 0) {
          const recentAvgPSE = recent5.reduce((sum, w) => sum + w.pse, 0) / recent5.length;
          const previousAvgPSE = previous5.reduce((sum, w) => sum + w.pse, 0) / previous5.length;
          
          if (recentAvgPSE > previousAvgPSE + 0.5) {
            progressTrend = 'improving';
          } else if (recentAvgPSE < previousAvgPSE - 0.5) {
            progressTrend = 'declining';
          }
        }

        // Definir objetivos atuais baseados no perfil
        const currentGoals = [
          userProfile.objective === 'perda-peso' ? 'Reduzir peso corporal' : 
          userProfile.objective === 'ganho-massa' ? 'Aumentar massa muscular' : 
          'Melhorar condicionamento geral',
          'Manter consistência nos treinos',
          'Aumentar força progressivamente'
        ];

        // Identificar desafios com base nos dados
        const challenges: string[] = [];
        if (weeklyWorkouts < 3) challenges.push('Baixa frequência de treinos');
        if (averagePSE < 5) challenges.push('Intensidade baixa');
        if (averagePSE > 8.5) challenges.push('Intensidade muito alta');
        if (progressTrend === 'declining') challenges.push('Queda na performance');

        const context: UserContext = {
          profile: userProfile,
          recentWorkouts,
          performanceMetrics: {
            averagePSE,
            totalWorkouts,
            weeklyFrequency: weeklyWorkouts,
            progressTrend
          },
          currentGoals,
          challenges
        };

        setUserContext(context);
      } catch (error) {
        console.error('Erro ao construir contexto do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    buildUserContext();
  }, [userProfile]);

  const refreshContext = () => {
    if (userProfile) {
      setLoading(true);
      // Força reconstrução do contexto
      setTimeout(() => {
        const buildUserContext = () => {
          // ... mesmo código do useEffect
        };
        buildUserContext();
      }, 100);
    }
  };

  return {
    userContext,
    loading,
    refreshContext
  };
};
