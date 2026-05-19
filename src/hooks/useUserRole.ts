import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = 'admin' | 'professor' | 'student' | 'user';

interface UseUserRoleReturn {
  role: AppRole | null;
  loading: boolean;
  isAdmin: boolean;
  isProfessor: boolean;
  isStudent: boolean;
  /** Admin or Professor */
  canManageStudents: boolean;
  /** Admin only */
  canAccessSettings: boolean;
  defaultRoute: string;
  refetch: () => Promise<void>;
}

export function useUserRole(userId: string | null | undefined): UseUserRoleReturn {
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = async () => {
    if (!userId) {
      setRole(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Auto-repair: ensure profile + role exist for this user (handles legacy accounts)
      const { data: ensured, error: ensureError } = await supabase.rpc(
        'ensure_current_user_profile' as any
      );

      if (!ensureError && Array.isArray(ensured) && ensured[0]?.role) {
        setRole(ensured[0].role as AppRole);
        return;
      }

      // Fallback: direct role lookup
      const { data, error } = await supabase.rpc('get_user_role', {
        _user_id: userId,
      });

      if (error) {
        console.error('Erro ao buscar role:', error);
        const { data: profileData } = await supabase
          .from('profiles' as any)
          .select('role')
          .eq('user_id', userId)
          .single();
        setRole(((profileData as any)?.role as AppRole) || 'user');
      } else {
        setRole(((data as string) || 'user') as AppRole);
      }
    } catch (err) {
      console.error('Erro inesperado ao buscar role:', err);
      setRole('user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRole();
  }, [userId]);

  const isAdmin = role === 'admin' || (role as string) === 'super_admin';
  const isProfessor = role === 'professor' || (role as string) === 'trainer' || isAdmin;
  const isStudent = !isAdmin && !isProfessor;

  const canManageStudents = isAdmin || isProfessor;
  const canAccessSettings = isAdmin;

  const defaultRoute = isStudent
    ? '/student-interface'
    : '/gerenciamento-alunos';

  return {
    role,
    loading,
    isAdmin,
    isProfessor,
    isStudent,
    canManageStudents,
    canAccessSettings,
    defaultRoute,
    refetch: fetchRole,
  };
}
