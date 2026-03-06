import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const latestUserRef = useRef<User | null>(null);
  const manualSignOutRef = useRef(false);

  useEffect(() => {
    latestUserRef.current = user;
  }, [user]);

  useEffect(() => {
    const syncUser = (nextUser: User | null) => {
      setUser((prevUser) => {
        if (prevUser?.id === nextUser?.id) return prevUser;
        return nextUser;
      });
    };

    const verifySession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        syncUser(session?.user ?? null);
      } catch (error) {
        console.error('Error verifying session:', error);
      } finally {
        setLoading(false);
      }
    };

    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const sessionUser = session?.user ?? null;

        // Guard against transient SIGNED_OUT events during token refresh turbulence
        if (event === 'SIGNED_OUT' && !manualSignOutRef.current && latestUserRef.current) {
          void verifySession();
          return;
        }

        if (event === 'SIGNED_OUT') {
          manualSignOutRef.current = false;
        }

        syncUser(sessionUser);
        setLoading(false);
      }
    );

    // Then check existing session
    void verifySession();

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    manualSignOutRef.current = true;
    const { error } = await supabase.auth.signOut();

    if (error) {
      manualSignOutRef.current = false;
      throw error;
    }

    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

