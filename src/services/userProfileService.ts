import { supabase } from "@/integrations/supabase/client";

export interface UserProfileData {
  id?: string;
  user_id: string;
  name: string;
  email?: string;
  age?: number;
  height?: number;
  weight?: number;
  primary_goal?: string;
  experience_level?: string;
  training_environment?: string;
  weekly_frequency?: number;
  experience_months?: number;
  injuries_limitations?: string;
  created_at?: string;
  updated_at?: string;
}

export const userProfileService = {
  async getCurrentUserProfile(): Promise<UserProfileData | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("user_profiles_extended")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data as UserProfileData;
  },

  async createOrUpdateProfile(profileData: Partial<UserProfileData>): Promise<UserProfileData | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const dataToUpsert = {
      ...profileData,
      user_id: user.id,
      name: profileData.name || 'Usuário',
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("user_profiles_extended")
      .upsert(dataToUpsert, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error("Error upserting user profile:", error);
      return null;
    }

    return data as UserProfileData;
  }
};