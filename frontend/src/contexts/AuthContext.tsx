// src/contexts/AuthContext.tsx
import { createContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

type Business = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  description?: string;
  category?: {
    id: number;
    name: string;
  };
  location?: {
    lat: number;
    lng: number;
  };
  createdAt?: string;
  updatedAt?: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  business: Business | null;
  logout: () => void;
  updateAuthState: (id: number, name: string) => void; // Add this function
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [business, setBusiness] = useState<Business | null>(null);

  // Add this function to update auth state immediately after login
  const updateAuthState = (id: number, name: string) => {
    setIsAuthenticated(true);
    setBusiness({
      id: id,
      name: name,
    });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<{ id: number; name: string }>(token);
        setIsAuthenticated(true);
        setBusiness({
          id: decoded.id,
          name: decoded.name,
        });
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setBusiness(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, business, logout, updateAuthState }}>
      {children}
    </AuthContext.Provider>
  );
};
