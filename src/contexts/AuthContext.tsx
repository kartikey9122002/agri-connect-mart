
import React, { createContext, useContext } from 'react';
import { User, UserRole } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useAuthSetup } from '@/hooks/useAuthSetup';

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
  const { toast } = useToast();
  const {
    user, 
    setUser,
    session,
    setSession,
    isLoading,
    setIsLoading,
    login: supabaseLogin,
    register: supabaseRegister,
    logout: supabaseLogout
  } = useSupabaseAuth();

  // Set up authentication listeners and initialization
  useAuthSetup(setUser, setSession, setIsLoading);

  const login = async (email: string, password: string) => {
    try {
      await supabaseLogin(email, password);
      toast({
        title: 'Login successful',
        description: 'Welcome back to AgriConnect Mart!',
      });
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error?.message || 'An error occurred during login. Please check your credentials and try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      await supabaseRegister(email, password, name, role);
      toast({
        title: 'Registration successful',
        description: 'Your account has been created. You will be redirected to your dashboard.',
      });
    } catch (error: any) {
      if (error?.message?.includes('already registered')) {
        toast({
          title: 'Registration failed',
          description: 'This email is already registered. Please try logging in instead.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Registration failed',
          description: error?.message || 'An error occurred during registration. Please try again.',
          variant: 'destructive',
        });
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabaseLogout();
      toast({
        title: 'Logout successful',
        description: 'You have been logged out successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Logout failed',
        description: error?.message || 'An error occurred during logout.',
        variant: 'destructive',
      });
      throw error;
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
