import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
    return localStorage.getItem('jonny_admin_token');
  });

  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('jonny_admin_user');
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

  // Track user interaction to detect if admin is actively working
  const lastActiveRef = useRef<number>(Date.now());

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    const recordActivity = () => {
      const now = Date.now();
      if (now - lastActiveRef.current > 15000) { // Throttle updates to once every 15s
        lastActiveRef.current = now;
        localStorage.setItem('jonny_admin_last_active', String(now));
      }
    };

    events.forEach(ev => window.addEventListener(ev, recordActivity, { passive: true }));
    return () => {
      events.forEach(ev => window.removeEventListener(ev, recordActivity));
    };
  }, []);

  // Proactive Background Silent Refresh: Renew access token every ~10 mins if admin is actively working
  useEffect(() => {
    if (!isAuthenticated) return;

    const intervalId = setInterval(async () => {
      const now = Date.now();
      const timeSinceActive = now - lastActiveRef.current;
      const ACTIVE_THRESHOLD_MS = 15 * 60 * 1000; // Active within the last 15 minutes
      const REFRESH_AGE_THRESHOLD_MS = 10 * 60 * 1000; // Access token is >= 10 mins old (5 mins or less remaining)

      const issuedAtStr = localStorage.getItem('jonny_admin_token_issued_at');
      const issuedAt = issuedAtStr ? Number(issuedAtStr) : 0;
      const tokenAge = issuedAt > 0 ? (now - issuedAt) : REFRESH_AGE_THRESHOLD_MS;

      // If the admin has been active recently and the 15-minute access token is getting close to expiry
      if (timeSinceActive < ACTIVE_THRESHOLD_MS && tokenAge >= REFRESH_AGE_THRESHOLD_MS) {
        try {
          const refreshRes = await api.refreshToken();
          if (refreshRes.success && refreshRes.token) {
            setToken(refreshRes.token);
          }
        } catch (err) {
          console.warn('[AdminAuth] Proactive silent refresh error:', err);
        }
      }
    }, 2 * 60 * 1000); // Check every 2 minutes

    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  useEffect(() => {
    const syncAdminAuth = () => {
      const savedToken = localStorage.getItem('jonny_admin_token');
      const savedUser = localStorage.getItem('jonny_admin_user');
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

    const handleTokenRefreshed = (e: any) => {
      const newToken = e.detail?.accessToken;
      if (newToken) {
        setToken(newToken);
      }
      if (e.detail?.user && (e.detail.user.role === 'admin' || e.detail.user.role === 'Livestock Administrator')) {
        setUser({
          id: e.detail.user.id,
          email: e.detail.user.email,
          name: e.detail.user.name,
          role: 'Livestock Administrator',
          phone: e.detail.user.phone
        });
      }
    };

    window.addEventListener('storage', syncAdminAuth);
    window.addEventListener('auth_change', syncAdminAuth);
    window.addEventListener('auth_token_refreshed', handleTokenRefreshed);

    const handleAuthExpired = () => {
      setToken(null);
      setUser(null);
      localStorage.removeItem('jonny_admin_token');
      localStorage.removeItem('jonny_admin_refresh_token');
      localStorage.removeItem('jonny_admin_token_issued_at');
      localStorage.removeItem('jonny_admin_last_active');
      localStorage.removeItem('jonny_admin_user');
    };
    window.addEventListener('auth_expired', handleAuthExpired);

    // Validate saved token on initialization
    const validateExistingSession = async () => {
      const active = localStorage.getItem('jonny_admin_token');
      if (active) {
        try {
          const res = await api.getMe(active);
          const isExplicitAuthFailure =
            (res.user && res.user.role !== 'admin') ||
            (res.error && (
              res.error.toLowerCase().includes('expired') ||
              res.error.toLowerCase().includes('invalid') ||
              res.error.toLowerCase().includes('unauthorized') ||
              res.error.toLowerCase().includes('token required')
            ));

          if (isExplicitAuthFailure) {
            // Attempt silent refresh before dropping session
            const refreshRes = await api.refreshToken();
            if (refreshRes.success && refreshRes.token) {
              setToken(refreshRes.token);
              return;
            }

            console.warn('[AdminAuth] Saved admin token is invalid or expired. Prompting for fresh login.');
            setToken(null);
            setUser(null);
            localStorage.removeItem('jonny_admin_token');
            localStorage.removeItem('jonny_admin_refresh_token');
            localStorage.removeItem('jonny_admin_token_issued_at');
            localStorage.removeItem('jonny_admin_last_active');
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
      window.removeEventListener('auth_token_refreshed', handleTokenRefreshed);
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
      // Call backend API login endpoint for genuine cryptographically signed JWT tokens
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

        const nowStr = String(Date.now());
        // Strictly save admin storage tokens (admin portal only)
        localStorage.setItem('jonny_admin_token', res.token);
        if (res.refreshToken) {
          localStorage.setItem('jonny_admin_refresh_token', res.refreshToken);
        }
        localStorage.setItem('jonny_admin_token_issued_at', nowStr);
        localStorage.setItem('jonny_admin_last_active', nowStr);
        localStorage.setItem('jonny_admin_user', JSON.stringify(adminData));

        // Ensure customer user session is completely clear
        localStorage.removeItem('jonny_user_token');
        localStorage.removeItem('jonny_user_refresh_token');
        localStorage.removeItem('jonny_user_token_issued_at');
        localStorage.removeItem('jonny_user_profile');

        setToken(res.token);
        setUser(adminData);
        lastActiveRef.current = Date.now();

        return { success: true };
      }

      return { success: false, error: res.error || 'Invalid administrator email or password' };
    } catch (err: any) {
      console.error('Admin login error:', err);
      return { success: false, error: 'Unable to connect to authentication server. Please verify backend is running.' };
    }
  };

  const logout = () => {
    sessionStorage.setItem('jonny_admin_logging_out', '1');
    localStorage.removeItem('jonny_admin_token');
    localStorage.removeItem('jonny_admin_refresh_token');
    localStorage.removeItem('jonny_admin_token_issued_at');
    localStorage.removeItem('jonny_admin_last_active');
    localStorage.removeItem('jonny_admin_user');
    localStorage.removeItem('jonny_user_token');
    localStorage.removeItem('jonny_user_refresh_token');
    localStorage.removeItem('jonny_user_token_issued_at');
    localStorage.removeItem('jonny_user_profile');
    // Direct redirect to home and replace URL in history
    window.location.replace('/');
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
