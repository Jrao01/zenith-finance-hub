import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Usuario } from '@/types/finance';

interface AuthUser extends Usuario {
  password: string;
}

interface AuthContextType {
  user: Usuario | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (nombre: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = 'zenith_users';
const CURRENT_USER_KEY = 'zenith_current_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const getUsers = (): AuthUser[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  };

  const saveUsers = (users: AuthUser[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const login = (email: string, password: string) => {
    const users = getUsers();
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!foundUser) {
      return { success: false, error: 'Usuario no encontrado' };
    }
    
    if (foundUser.password !== password) {
      return { success: false, error: 'Contraseña incorrecta' };
    }

    const { password: _, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    return { success: true };
  };

  const register = (nombre: string, email: string, password: string) => {
    const users = getUsers();
    
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'Este correo ya está registrado' };
    }

    const newUser: AuthUser = {
      id_usuario: users.length > 0 ? Math.max(...users.map(u => u.id_usuario)) + 1 : 1,
      nombre,
      email,
      moneda_preferida: 'USD',
      password
    };

    users.push(newUser);
    saveUsers(users);

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
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
