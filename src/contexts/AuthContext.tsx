
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
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
  const [isLoading, setIsLoading] = useState(true);

  // For demo purposes, we're using localStorage to persist user
  useEffect(() => {
    const storedUser = localStorage.getItem('agri-connect-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Mock authentication functions
  // In a real app, these would connect to Supabase or another backend
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Mock login - in a real app, this would be an API call
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Hardcoded users for demo
      let mockUser;
      
      if (email === 'admin@agri.com') {
        mockUser = {
          id: 'admin-1',
          email: 'admin@agri.com',
          name: 'Admin User',
          role: 'admin' as UserRole,
          createdAt: new Date().toISOString()
        };
      } else if (email === 'seller@agri.com') {
        mockUser = {
          id: 'seller-1',
          email: 'seller@agri.com',
          name: 'Farmer John',
          role: 'seller' as UserRole,
          createdAt: new Date().toISOString()
        };
      } else if (email === 'buyer@agri.com') {
        mockUser = {
          id: 'buyer-1',
          email: 'buyer@agri.com',
          name: 'Consumer Jane',
          role: 'buyer' as UserRole,
          createdAt: new Date().toISOString()
        };
      } else {
        throw new Error('Invalid credentials');
      }
      
      // Save to state and localStorage
      setUser(mockUser);
      localStorage.setItem('agri-connect-user', JSON.stringify(mockUser));
      
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock user
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        name,
        role,
        createdAt: new Date().toISOString()
      };
      
      setUser(newUser);
      localStorage.setItem('agri-connect-user', JSON.stringify(newUser));
      
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('agri-connect-user');
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
