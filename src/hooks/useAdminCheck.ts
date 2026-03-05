import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type UserRole = 'admin' | 'moderator' | 'user';

export const useAdminCheck = () => {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole>('user');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setRole('user');
      setIsAdmin(false);
      setIsModerator(false);
      setIsStaff(false);
      setLoading(false);
      return;
    }

    const checkUserRole = async () => {
      try {
        const { data, error } = await supabase.rpc('get_user_role', { _user_id: user.id });
        if (error) throw error;
        
        const userRole = (data as UserRole) || 'user';
        setRole(userRole);
        setIsAdmin(userRole === 'admin');
        setIsModerator(userRole === 'moderator');
        setIsStaff(userRole === 'admin' || userRole === 'moderator');
      } catch (error) {
        console.error('Error checking user role:', error);
        setRole('user');
        setIsAdmin(false);
        setIsModerator(false);
        setIsStaff(false);
      }
      setLoading(false);
    };

    setLoading(true);
    checkUserRole();
  }, [user, authLoading]);

  return { user, role, isAdmin, isModerator, isStaff, loading };
};
