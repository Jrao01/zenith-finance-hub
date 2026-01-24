import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Usuario } from '@/types/finance';

// URL base del backend
const API_URL = 'http://localhost:3000';

// Keys para localStorage
const CURRENT_USER_KEY = 'zenith_current_user';
const TOKEN_KEY = 'zenith_token';

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (nombre: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Recuperar usuario y token del localStorage al iniciar
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Error al iniciar sesión' };
      }

      // Guardar usuario y token
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
      localStorage.setItem(TOKEN_KEY, data.token);

      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  };

  const register = async (nombre: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Error al registrar usuario' };
      }

      // Después del registro exitoso, hacer login automáticamente
      const loginResult = await login(email, password);
      return loginResult;
    } catch (error) {
      console.error('Error en register:', error);
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user && !!token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
