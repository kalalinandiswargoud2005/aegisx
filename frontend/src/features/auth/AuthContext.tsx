import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SOC_ANALYST' | 'VIEWER' | 'DEVELOPER';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const defaultUser: User = { id: '00000000-0000-0000-0000-000000000001', email: 'admin@aegisx.com', name: 'System Admin', role: 'ADMIN' };
  const [user, setUser] = useState<User | null>(defaultUser);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for existing token and user on mount
    const token = localStorage.getItem('aegisx-token');
    const storedUser = localStorage.getItem('aegisx-user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user', e);
        // Do not logout, keep defaultUser
      }
    } else {
        localStorage.setItem('aegisx-token', 'mock-token');
        localStorage.setItem('aegisx-user', JSON.stringify(defaultUser));
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('aegisx-token', token);
    localStorage.setItem('aegisx-user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('aegisx-token');
    localStorage.removeItem('aegisx-user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: true,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
