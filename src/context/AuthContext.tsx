import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../lib/api-client';
import { SafeUser } from '../types/api';

interface AuthContextType {
  currentUser: SafeUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  quickSwitchUser: (email: string, password?: string) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEFAULT_CREDENTIALS = [
  {
    name: 'Amadou Diallo',
    role: 'ADMIN',
    jobTitle: 'Directeur Technique (CTO)',
    email: 'admin@taskflow.dev',
    password: 'Admin123!',
  },
  {
    name: 'Fatou Bintou Sow',
    role: 'USER',
    jobTitle: 'Lead Frontend Engineer',
    email: 'fatou.sow@taskflow.dev',
    password: 'User123!',
  },
  {
    name: 'Cheikh Tidiane Ndiaye',
    role: 'USER',
    jobTitle: 'Backend & Cloud DevOps',
    email: 'cheikh.ndiaye@taskflow.dev',
    password: 'User123!',
  },
  {
    name: 'Aïssatou Diop',
    role: 'USER',
    jobTitle: 'Lead Product Designer',
    email: 'aissatou.diop@taskflow.dev',
    password: 'User123!',
  },
  {
    name: 'Moussa Fall',
    role: 'USER',
    jobTitle: 'Ingénieur QA & Sécurité',
    email: 'moussa.fall@taskflow.dev',
    password: 'User123!',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<SafeUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('taskflow_jwt'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    const currentToken = localStorage.getItem('taskflow_jwt');
    if (!currentToken) {
      setCurrentUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiClient.get<{ user: SafeUser }>('/users/me');
      if (res.status === 200 && res.data?.user) {
        setCurrentUser(res.data.user);
      } else {
        // Token expiré ou invalide
        logout();
      }
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshProfile();
    } else {
      // Auto login as default admin for instant backoffice testing experience
      quickSwitchUser('admin@taskflow.dev', 'Admin123!');
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const res = await apiClient.post<{ message: string; token: string; user: SafeUser }>(
      '/auth/login',
      { email, password }
    );

    if (res.status === 200 && res.data?.token) {
      apiClient.setToken(res.data.token);
      setToken(res.data.token);
      setCurrentUser(res.data.user);
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return {
      success: false,
      message: res.message || 'Identifiants invalides',
    };
  };

  const register = async (data: any) => {
    setIsLoading(true);
    const res = await apiClient.post<{ message: string; token: string; user: SafeUser }>(
      '/auth/register',
      data
    );

    if (res.status === 201 && res.data?.token) {
      apiClient.setToken(res.data.token);
      setToken(res.data.token);
      setCurrentUser(res.data.user);
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return {
      success: false,
      message: res.message || 'Échec de la création du compte',
    };
  };

  const logout = () => {
    apiClient.setToken(null);
    setToken(null);
    setCurrentUser(null);
    setIsLoading(false);
  };

  const quickSwitchUser = async (email: string, password = 'User123!') => {
    const pwd = email === 'admin@taskflow.dev' ? 'Admin123!' : password;
    const result = await login(email, pwd);
    return result.success;
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated: !!currentUser,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        quickSwitchUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
