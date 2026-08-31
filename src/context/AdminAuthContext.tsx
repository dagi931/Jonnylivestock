import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminUser {
  email: string;
  name: string;
  role: string;
}

interface AdminAuthContextType {
  isAuthenticated: boolean;
  user: AdminUser | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('jonny_admin_auth') === 'true';
  });

  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('jonny_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('jonny_admin_auth', String(isAuthenticated));
    if (user) {
      localStorage.setItem('jonny_admin_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('jonny_admin_user');
    }
  }, [isAuthenticated, user]);

  const login = (email: string, password: string) => {
    // Simple client authentication simulation
    // Accept valid format with demo password or default admin credentials
    if (!email.trim() || !password.trim()) {
      return { success: false, error: 'Please enter both email and password' };
    }

    if (email.toLowerCase() === 'admin@jonnylivestock.com' && password === 'admin123') {
      const adminUser: AdminUser = {
        email: 'admin@jonnylivestock.com',
        name: 'Jonny Owner',
        role: 'Livestock Administrator'
      };
      setIsAuthenticated(true);
      setUser(adminUser);
      return { success: true };
    }

    // Also accept any valid demo email with password length >= 6 for convenient evaluation
    if (email.includes('@') && password.length >= 6) {
      const adminUser: AdminUser = {
        email: email.trim(),
        name: email.split('@')[0],
        role: 'Livestock Administrator'
      };
      setIsAuthenticated(true);
      setUser(adminUser);
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid credentials. Use admin@jonnylivestock.com / admin123 or any valid email & 6+ char password.'
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('jonny_admin_auth');
    localStorage.removeItem('jonny_admin_user');
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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
