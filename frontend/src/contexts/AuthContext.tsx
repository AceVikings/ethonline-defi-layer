import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiClient } from '../lib/apiClient';
import { getStoredJWT, clearAuth } from '../lib/vincentAuth';

interface User {
  id: string;
  ethAddress: string;
  authMethod?: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (jwt: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const jwt = getStoredJWT();
      if (jwt) {
        apiClient.setToken(jwt);
        try {
          const response = await apiClient.getProfile();
          setUser(response.user);
        } catch (error) {
          console.error('Failed to get profile:', error);
          clearAuth();
          apiClient.clearToken();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (jwt: string) => {
    apiClient.setToken(jwt);
    const response = await apiClient.login();
    setUser(response.user);
  };

  const logout = () => {
    clearAuth();
    apiClient.clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
