
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state change event:", event);
        setSession(currentSession);
        
        if (currentSession?.user) {
          setIsLoading(true); // Set loading while we fetch profile data
          try {
            // Get user profile data
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentSession.user.id)
              .single();

            if (error) {
              console.error('Error fetching user profile:', error);
              setUser(null);
              setIsLoading(false);
              return;
            }

            console.log("User profile fetched:", profile);

            // Ensure role is a valid UserRole type
            const userRole = profile.role as string;
            const validRole: UserRole = 
              userRole === 'seller' ? 'seller' :
              userRole === 'admin' ? 'admin' : 'buyer';

            // Update user state with combined auth and profile data
            setUser({
              id: currentSession.user.id,
              email: currentSession.user.email || '',
              name: profile.full_name || '',
              role: validRole,
              createdAt: currentSession.user.created_at
            });
          } catch (error) {
            console.error('Error in auth state change:', error);
            setUser(null);
          } finally {
            setIsLoading(false);
          }
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log("Initial session check:", initialSession ? "Session exists" : "No session");
        setSession(initialSession);
        
        if (initialSession?.user) {
          setIsLoading(true); // Ensure loading state is set
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', initialSession.user.id)
            .single();

          if (!error && profile) {
            console.log("Initial profile data:", profile);
            
            // Ensure role is a valid UserRole type
            const userRole = profile.role as string;
            const validRole: UserRole = 
              userRole === 'seller' ? 'seller' :
              userRole === 'admin' ? 'admin' : 'buyer';

            setUser({
              id: initialSession.user.id,
              email: initialSession.user.email || '',
              name: profile.full_name || '',
              role: validRole,
              createdAt: initialSession.user.created_at
            });
          } else {
            console.error("Error fetching initial profile:", error);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log("AuthContext: Attempting login for", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }
      
      console.log("Login successful:", data);
      
      // Auth state listener will handle setting the user and redirecting
      toast({
        title: 'Login successful',
        description: 'Welcome back to AgriConnect Mart!',
      });
      
      return;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true);
    
    try {
      // Register the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        throw error;
      }
      
      // Check if user is already registered
      if (data.user?.identities && data.user.identities.length === 0) {
        const errorMessage = "This email is already registered. Please try logging in.";
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      console.log("Registration successful:", data);
      
      // The profile will be created via the database trigger
      // Auth state listener will handle setting the user
      return;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast({
          title: 'Logout failed',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      setUser(null);
      toast({
        title: 'Logout successful',
        description: 'You have been logged out successfully.',
      });
      
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
