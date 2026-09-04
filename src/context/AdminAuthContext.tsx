import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface AdminUser {
  id: string;
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
    return localStorage.getItem('jonny_admin_token') || localStorage.getItem('jonny_user_token');
  });

  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('jonny_admin_user') || localStorage.getItem('jonny_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'admin' || parsed.role === 'Livestock Administrator') {
          return {
            id: parsed.id,
            email: parsed.email,
            name: parsed.name,
            role: 'Livestock Administrator',
            phone: parsed.phone
          };
        }
      } catch {}
    }
    return null;
  });

  const isAuthenticated = Boolean(token && user);

  useEffect(() => {
    const syncAdminAuth = () => {
      const savedToken = localStorage.getItem('jonny_admin_token') || localStorage.getItem('jonny_user_token');
      const savedUser = localStorage.getItem('jonny_admin_user') || localStorage.getItem('jonny_user_profile');
      if (savedToken && savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed.role === 'admin' || parsed.role === 'Livestock Administrator') {
            setToken(savedToken);
            setUser({
              id: parsed.id,
              email: parsed.email,
              name: parsed.name,
              role: 'Livestock Administrator',
              phone: parsed.phone
            });
            return;
          }
        } catch {}
      }
    };

    window.addEventListener('storage', syncAdminAuth);
    window.addEventListener('auth_change', syncAdminAuth);

    const handleAuthExpired = () => {
      setToken(null);
      setUser(null);
      localStorage.removeItem('jonny_admin_token');
      localStorage.removeItem('jonny_admin_user');
    };
    window.addEventListener('auth_expired', handleAuthExpired);

    // Validate saved token on initialization
    const validateExistingSession = async () => {
      const active = localStorage.getItem('jonny_admin_token');
      if (active) {
        try {
          const res = await api.getMe(active);
          // Only reset session if the server definitively confirmed an auth failure (invalid token or wrong role)
          const isExplicitAuthFailure =
            (res.user && res.user.role !== 'admin') ||
            (res.error && (
              res.error.toLowerCase().includes('expired') ||
              res.error.toLowerCase().includes('invalid') ||
              res.error.toLowerCase().includes('unauthorized') ||
              res.error.toLowerCase().includes('token required')
            ));

          if (isExplicitAuthFailure) {
            console.warn('[AdminAuth] Saved admin token is invalid or expired. Prompting for fresh login.');
            setToken(null);
            setUser(null);
            localStorage.removeItem('jonny_admin_token');
            localStorage.removeItem('jonny_admin_user');
          }
        } catch {
          // Ignore network errors or temporary glitches - keep existing session
        }
      }
    };
    validateExistingSession();

    return () => {
      window.removeEventListener('storage', syncAdminAuth);
      window.removeEventListener('auth_change', syncAdminAuth);
      window.removeEventListener('auth_expired', handleAuthExpired);
    };
  }, []);

  useEffect(() => {
    if (token && user) {
      localStorage.setItem('jonny_admin_token', token);
      localStorage.setItem('jonny_admin_user', JSON.stringify(user));
    }
  }, [token, user]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!email.trim() || !password.trim()) {
      return { success: false, error: 'Please enter both email and password' };
    }

    try {
      // Call backend API login endpoint for genuine cryptographically signed JWT token
      const res = await api.login(email.trim(), password);

      if (res.success && res.token && res.user) {
        if (res.user.role !== 'admin') {
          return {
            success: false,
            error: 'Access denied: The provided account does not have administrator privileges.'
          };
        }

        const adminData: AdminUser = {
          id: res.user.id,
          email: res.user.email,
          name: res.user.name,
          role: 'Livestock Administrator',
          phone: res.user.phone
        };

        // Synchronously save admin & user storage tokens immediately
        localStorage.setItem('jonny_admin_token', res.token);
        localStorage.setItem('jonny_admin_user', JSON.stringify(adminData));
        localStorage.setItem('jonny_user_token', res.token);
        localStorage.setItem('jonny_user_profile', JSON.stringify(res.user));

        setToken(res.token);
        setUser(adminData);

        return { success: true };
      }

      return { success: false, error: res.error || 'Invalid administrator email or password' };
    } catch (err: any) {
      console.error('Admin login error:', err);
      return { success: false, error: 'Unable to connect to authentication server. Please verify backend is running.' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jonny_admin_token');
    localStorage.removeItem('jonny_admin_user');
    localStorage.removeItem('jonny_user_token');
    localStorage.removeItem('jonny_user_profile');
    sessionStorage.clear();
    // Redirect to home and reload a brand new clean page
    window.location.href = '/';
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
