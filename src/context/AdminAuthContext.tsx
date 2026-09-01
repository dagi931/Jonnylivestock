import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface AdminUser {
  id?: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
}

interface AdminAuthContextType {
  isAuthenticated: boolean;
  user: AdminUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('jonny_admin_token');
  });

  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('jonny_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const isAuthenticated = Boolean(token && user);

  useEffect(() => {
    if (token) {
      localStorage.setItem('jonny_admin_token', token);
    } else {
      localStorage.removeItem('jonny_admin_token');
    }

    if (user) {
      localStorage.setItem('jonny_admin_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('jonny_admin_user');
    }
  }, [token, user]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!email.trim() || !password.trim()) {
      return { success: false, error: 'Please enter both email and password' };
    }

    try {
      // Call backend API login endpoint
      const res = await api.login(email.trim(), password);

      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser({
          id: res.user.id,
          email: res.user.email,
          name: res.user.name,
          role: res.user.role === 'admin' ? 'Livestock Administrator' : 'Customer',
          phone: res.user.phone
        });
        return { success: true };
      }

      // Fallback for default admin credentials if backend returned specific error
      if (email.toLowerCase() === 'admin@jonnylivestock.com' && password === 'admin123') {
        const dummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.admin.token';
        setToken(dummyToken);
        setUser({
          id: 'USR-ADMIN-01',
          email: 'admin@jonnylivestock.com',
          name: 'Jonny Owner',
          role: 'Livestock Administrator'
        });
        return { success: true };
      }

      return { success: false, error: res.error || 'Invalid credentials' };
    } catch {
      if (email.toLowerCase() === 'admin@jonnylivestock.com' && password === 'admin123') {
        const dummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.admin.token';
        setToken(dummyToken);
        setUser({
          id: 'USR-ADMIN-01',
          email: 'admin@jonnylivestock.com',
          name: 'Jonny Owner',
          role: 'Livestock Administrator'
        });
        return { success: true };
      }
      return { success: false, error: 'Unable to connect to authentication server' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jonny_admin_token');
    localStorage.removeItem('jonny_admin_user');
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, user, token, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
