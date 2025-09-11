
import { useState, useEffect } from 'react';
import { authService, AuthUserProfile } from '@/services/authService';
import { UserProfile } from '@/data/mockData';

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const loadUserProfile = async () => {
      try {
        const authProfile = await authService.getCurrentUserProfile();
        if (authProfile) {
          // Convert AuthUserProfile to UserProfile for compatibility
          const profile: UserProfile = {
            id: authProfile.id,
            name: authProfile.name,
            email: authProfile.email,
            age: authProfile.age || 25,
            objective: authProfile.primaryGoal || 'ganho-massa',
            level: (authProfile.experienceLevel as 'iniciante' | 'intermediario' | 'avancado') || 'intermediario',
            joinDate: new Date().toISOString().split('T')[0],
            totalWorkouts: 0,
            averagePSE: 7,
            weeklyGoal: 3,
            currentStreak: 0,
            weight: 70,
            height: 175,
            averageLoad: 280,
            favoriteWorkout: 'Corpo Inteiro'
          };
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;

    try {
      // Convert UserProfile updates to AuthUserProfile
      const authUpdates: Partial<AuthUserProfile> = {
        name: updates.name,
        age: updates.age,
        primaryGoal: updates.objective,
        experienceLevel: updates.level
      };
      
      await authService.updateUserProfile(authUpdates);
      const updatedProfile = { ...userProfile, ...updates };
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    try {
      const authProfile = await authService.getCurrentUserProfile();
      if (authProfile) {
        const profile: UserProfile = {
          id: authProfile.id,
          name: authProfile.name,
          email: authProfile.email,
          age: authProfile.age || 25,
          objective: authProfile.primaryGoal || 'ganho-massa',
          level: (authProfile.experienceLevel as 'iniciante' | 'intermediario' | 'avancado') || 'intermediario',
          joinDate: new Date().toISOString().split('T')[0],
          totalWorkouts: 0,
          averagePSE: 7,
          weeklyGoal: 3,
          currentStreak: 0,
          weight: 70,
          height: 175,
          averageLoad: 280,
          favoriteWorkout: 'Corpo Inteiro'
        };
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Erro ao recarregar perfil:', error);
    }
  };

  return {
    userProfile,
    loading,
    updateProfile,
    refreshProfile
  };
};
