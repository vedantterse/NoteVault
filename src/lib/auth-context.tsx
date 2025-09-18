'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Tenant } from '@/types';
import { apiClient } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => void;
  updateTenant: (newTenant: Tenant) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = useCallback(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      const tenantData = localStorage.getItem('tenant_data');

      if (token && userData && tenantData) {
        try {
          setUser(JSON.parse(userData));
          setTenant(JSON.parse(tenantData));
          apiClient.setToken(token);
        } catch (error) {
          console.error('Error parsing stored auth data:', error);
          logout();
        }
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login({ email, password });
      
      if (response.success && response.data) {
        const { token, user: userData, tenant: tenantData } = response.data;
        
        setUser(userData);
        setTenant(tenantData);
        apiClient.setToken(token);
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_data', JSON.stringify(userData));
          localStorage.setItem('tenant_data', JSON.stringify(tenantData));
        }
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setTenant(null);
    apiClient.clearToken();
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_data');
      localStorage.removeItem('tenant_data');
    }
  };

  const updateTenant = (newTenant: Tenant) => {
    setTenant(newTenant);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tenant_data', JSON.stringify(newTenant));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      tenant,
      isLoading,
      login,
      logout,
      refreshAuth,
      updateTenant
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