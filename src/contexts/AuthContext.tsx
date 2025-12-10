import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  department: string | null;
}

interface UserRole {
  role: 'admin' | 'employee' | 'assistant_manager';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  isDataLoaded: boolean;
  signIn: (username: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasAccess: (path: string) => boolean;
  getDefaultRoute: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
          setIsDataLoaded(false);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (roleError) throw roleError;
      setRole(roleData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsDataLoaded(true);
      setLoading(false);
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      // Call edge function to get email from username
      const { data: lookupData, error: lookupError } = await supabase.functions.invoke(
        'login-by-username',
        {
          body: { username },
        }
      );

      if (lookupError) throw lookupError;
      if (!lookupData || !lookupData.email) {
        return { error: new Error('Incorrect username or password') };
      }

      // Sign in with email
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: lookupData.email,
        password,
      });

      if (signInError) {
        return { error: new Error('Incorrect username or password') };
      }

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Incorrect username or password') };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const hasAccess = (path: string): boolean => {
    if (!role) return false;
    if (role.role === 'admin' || role.role === 'assistant_manager') return true;

    // Map paths to departments
    const pathDepartmentMap: { [key: string]: string } = {
      '/media': 'Media',
      '/sales': 'Sales',
      '/call-center': 'Call Center',
      '/contracts': 'Contract Registration',
      '/analytics': 'Growth Analytics',
    };

    // My Dashboard is accessible to all authenticated employees
    if (path === '/my-dashboard') return true;

    // Main dashboard is only for admins and assistant managers
    if (path === '/') return false;

    // Check if employee has access to this department
    const requiredDepartment = pathDepartmentMap[path];
    if (!requiredDepartment) return false;

    return profile?.department === requiredDepartment;
  };

  const getDefaultRoute = (): string => {
    if (!role) return '/login';
    if (role.role === 'admin' || role.role === 'assistant_manager') return '/';
    return '/my-dashboard';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        loading,
        isDataLoaded,
        signIn,
        signOut,
        hasAccess,
        getDefaultRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}