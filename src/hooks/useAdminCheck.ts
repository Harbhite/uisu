import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'moderator' | 'user';

export const useAdminCheck = () => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('user');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [isStaff, setIsStaff] = useState(false); // admin or moderator
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async (userId: string) => {
      try {
        const { data, error } = await supabase.rpc('get_user_role', { _user_id: userId });
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
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);

        if (session?.user) {
          setLoading(true);
          setTimeout(async () => {
            await checkUserRole(session.user.id);
            setLoading(false);
          }, 0);
        } else {
          setRole('user');
          setIsAdmin(false);
          setIsModerator(false);
          setIsStaff(false);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setLoading(true);
        await checkUserRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, role, isAdmin, isModerator, isStaff, loading };
};
