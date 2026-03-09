/**
 * 9FIT Domain Service: Users
 * 
 * Unified service for authentication, profiles, and roles.
 * Consolidates: authService, userProfileService, useUserRole
 */
import { supabase } from "@/lib/api/client";
import type { User } from "@supabase/supabase-js";

// ── Types ──────────────────────────────────────────────
export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'professor' | 'student' | 'user';
  age?: number;
  height?: number;
  weight?: number;
  primaryGoal?: string;
  experienceLevel?: string;
  trainingEnvironment?: string;
  weeklyFrequency?: number;
  status: 'active' | 'inactive' | 'pending';
}

// ── Service ────────────────────────────────────────────
export const usersService = {
  /** Get the current authenticated user */
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  /** Get the current user's profile from user_profiles_extended */
  async getCurrentProfile(): Promise<UserProfile | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_profiles_extended')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      userId: user.id,
      name: data.name,
      email: data.email,
      role: 'professor', // Will be resolved by role lookup
      age: data.age,
      primaryGoal: data.primary_goal,
      experienceLevel: data.experience_level,
      status: 'active',
    } as UserProfile;
  },

  /** Get user role from user_roles table via RPC */
  async getUserRole(userId: string): Promise<string | null> {
    const { data, error } = await supabase.rpc('get_user_role', { _user_id: userId });
    if (error) {
      console.error('[usersService] Error fetching role:', error);
      return null;
    }
    return data as string | null;
  },

  /** Check if user has a specific role */
  async hasRole(userId: string, role: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('has_role', { 
      _user_id: userId, 
      _role: role 
    });
    if (error) return false;
    return !!data;
  },

  /** Update user profile */
  async updateProfile(updates: Partial<Pick<UserProfile, 'name' | 'age' | 'primaryGoal' | 'experienceLevel'>>): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Não autenticado');

    const { error } = await supabase
      .from('user_profiles_extended')
      .update({
        name: updates.name,
        age: updates.age,
        primary_goal: updates.primaryGoal,
        experience_level: updates.experienceLevel,
      })
      .eq('user_id', user.id);

    if (error) throw new Error(`Erro ao atualizar perfil: ${error.message}`);
  },

  /** Sign out */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(`Erro ao fazer logout: ${error.message}`);
  },
};
