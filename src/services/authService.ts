import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export interface AuthUserProfile {
  id: string;
  name: string;
  email: string;
  age?: number;
  primaryGoal?: string;
  experienceLevel?: string;
  userType?: 'admin' | 'student';
}

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getCurrentUserProfile(): Promise<AuthUserProfile | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_profiles_extended')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }

    return {
      id: user.id,
      name: data.name,
      email: data.email,
      age: data.age,
      primaryGoal: data.primary_goal,
      experienceLevel: data.experience_level,
      userType: (data.user_type as 'admin' | 'student') || 'student'
    };
  },

  async updateUserProfile(updates: Partial<AuthUserProfile>): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_profiles_extended')
      .update({
        name: updates.name,
        age: updates.age,
        primary_goal: updates.primaryGoal,
        experience_level: updates.experienceLevel,
        user_type: updates.userType
      })
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Erro ao atualizar perfil: ${error.message}`);
    }
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(`Erro ao fazer logout: ${error.message}`);
    }
  }
};