
import { useState, useEffect } from 'react';
import { getCurrentUserProfile, updateUserProfile, UserProfile } from '@/data/mockData';

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = () => {
      try {
        const profile = getCurrentUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error('Erro ao carregar perfil do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!userProfile) return;

    const updatedProfile = { ...userProfile, ...updates };
    setUserProfile(updatedProfile);
    updateUserProfile(updatedProfile);
  };

  const refreshProfile = () => {
    const profile = getCurrentUserProfile();
    setUserProfile(profile);
  };

  return {
    userProfile,
    loading,
    updateProfile,
    refreshProfile
  };
};
