
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types';
import { Session } from '@supabase/supabase-js';

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log("useSupabaseAuth: Attempting login for", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }
      
      console.log("Login successful:", data);
      // Auth state change listener will handle the session and user update
      return data;
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
      console.log("useSupabaseAuth: Registering new user:", { email, name, role });
      
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
      
      // Manually trigger session update for faster redirection
      if (data.session) {
        setSession(data.session);
        // Set user data directly from registration data to avoid delays
        const newUser: User = {
          id: data.user.id,
          email: email,
          name: name,
          role: role,
          createdAt: data.user.created_at
        };
        setUser(newUser);
      }
      
      return data;
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
        throw error;
      }
      
      setUser(null);
      setSession(null);
      return;
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    setUser,
    session,
    setSession,
    isLoading,
    setIsLoading,
    login,
    register,
    logout
  };
}
