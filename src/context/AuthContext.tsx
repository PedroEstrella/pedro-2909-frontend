import { createContext, useContext } from 'react';
import type { ReactNode } from 'react'; // <-- Importación estricta de tipo
import { useLocalStorage } from '../hooks/useLocalStorage';

interface UserSession {
  id: string;
  fullName: string;
  email: string;
  balance: number;
  token?: string;
}

interface AuthContextType {
  user: UserSession | null;
  login: (userData: UserSession) => void;
  register: (userData: UserSession) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useLocalStorage<UserSession | null>('snail_bet_session', null);

  const login = (userData: UserSession) => setUser(userData);
  const register = (userData: UserSession) => setUser(userData);
  const logout = () => window.localStorage.removeItem('snail_bet_session');

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};