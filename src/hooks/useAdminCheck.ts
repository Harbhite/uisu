import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type UserRole = 'admin' | 'moderator' | 'user';

export const useAdminCheck = () => {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id;
  const [role, setRole] = useState<UserRole>('user');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!userId) {
      setRole('user');
      setIsAdmin(false);
      setIsModerator(false);
      setIsStaff(false);
      setLoading(false);
      return;
    }

    const checkUserRole = async () => {
      let lastError: unknown = null;

      for (let attempt = 0; attempt < 2; attempt += 1) {
        const { data, error } = await supabase.rpc('get_user_role', { _user_id: userId });

        if (!error) {
          const userRole = (data as UserRole) || 'user';
          setRole(userRole);
          setIsAdmin(userRole === 'admin');
          setIsModerator(userRole === 'moderator');
          setIsStaff(userRole === 'admin' || userRole === 'moderator');
          setLoading(false);
          return;
        }

        lastError = error;

        if (attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      console.error('Error checking user role:', lastError);
      setLoading(false);
    };

    setLoading(true);
    void checkUserRole();
  }, [userId, authLoading]);

  return { user, role, isAdmin, isModerator, isStaff, loading };
};

