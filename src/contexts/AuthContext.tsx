'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type User = {
  id: string;
  phone: string;
  name?: string;
  isSubscribed?: boolean;
  subscriptionExpiresAt?: string | null;
};

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  activateSubscription: (expiresAt: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'merabetta-auth-token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      } catch (error) {
        console.error('Auth verification failed', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const activateSubscription = (expiresAt: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        isSubscribed: true,
        subscriptionExpiresAt: expiresAt,
      };
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      isLoading,
      login,
      logout,
      activateSubscription
    }}>
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
