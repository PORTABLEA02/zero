import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: User['role']) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Utilisateurs de démonstration
const demoUsers: User[] = [
  { id: '1', name: 'Jean Dupont', email: 'membre@demo.com', role: 'membre' },
  { id: '2', name: 'Marie Martin', email: 'controleur@demo.com', role: 'controleur' },
  { id: '3', name: 'Administrateur de MuSAIB', email: 'admin@musaib.com', role: 'administrateur' },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: User['role']): Promise<boolean> => {
    // Simulation d'une authentification
    const foundUser = demoUsers.find(u => u.email === email && u.role === role);
    if (foundUser && password === 'demo123') {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
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