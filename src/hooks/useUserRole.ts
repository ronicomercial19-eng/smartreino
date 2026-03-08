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

    try {
      const { data, error } = await supabase.rpc('get_user_role', {
        _user_id: userId,
      });

      if (error) {
        console.error('Erro ao buscar role:', error);
        // Fallback: check profiles table
        const { data: profileData } = await supabase
          .from('profiles' as any)
          .select('role')
          .eq('user_id', userId)
          .single();

        if (profileData) {
          setRole((profileData as any).role as AppRole);
        } else {
          setRole('user');
        }
      } else {
        // Map 'user' role to 'student' for simplicity (regular users = students)
        const mappedRole = (data as string) || 'user';
        setRole(mappedRole as AppRole);
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

  const isAdmin = role === 'admin' || role === 'super_admin' as any;
  const isProfessor = role === 'professor' || role === 'trainer' as any || isAdmin;
  const isStudent = role === 'student' || role === 'user';

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
    isStudent: !isAdmin && !isProfessor,
    canManageStudents,
    canAccessSettings,
    defaultRoute,
    refetch: fetchRole,
  };
}
