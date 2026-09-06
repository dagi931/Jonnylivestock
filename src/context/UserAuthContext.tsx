import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, UserProfile } from '../services/api';

interface UserAuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  register: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  sendRegistrationOtp: (name: string, email: string, phone: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  verifyAndRegister: (data: { name: string; email: string; phone: string; password: string; otp: string }) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  sendForgotPasswordOtp: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  resetPasswordWithOtp: (data: { email: string; otp: string; newPassword: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  openAuthModal: (mode?: 'login' | 'register' | 'forgot_password', message?: string) => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'forgot_password';
  authPromptMessage: string | null;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export const UserAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('jonny_user_token');
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('jonny_user_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [authPromptMessage, setAuthPromptMessage] = useState<string | null>(null);

  const isAuthenticated = Boolean(token && user);

  useEffect(() => {
    if (token && !user) {
      api.getMe(token).then((res) => {
        if (res.success && res.user) {
          setUser(res.user);
          localStorage.setItem('jonny_user_profile', JSON.stringify(res.user));
        } else {
          // Token expired or invalid
          logout();
        }
      });
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    if (res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('jonny_user_token', res.token);
      localStorage.setItem('jonny_user_profile', JSON.stringify(res.user));

      if (res.user.role === 'admin') {
        localStorage.setItem('jonny_admin_token', res.token);
        localStorage.setItem('jonny_admin_user', JSON.stringify({
          id: res.user.id,
          email: res.user.email,
          name: res.user.name,
          role: 'Livestock Administrator',
          phone: res.user.phone
        }));
      }

      window.dispatchEvent(new Event('auth_change'));
      setIsAuthModalOpen(false);
      setAuthPromptMessage(null);
      return { success: true, user: res.user };
    }
    return { success: false, error: res.error || 'Invalid credentials' };
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    const res = await api.register(name, email, phone, password);
    if (res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('jonny_user_token', res.token);
      localStorage.setItem('jonny_user_profile', JSON.stringify(res.user));
      window.dispatchEvent(new Event('auth_change'));
      setIsAuthModalOpen(false);
      setAuthPromptMessage(null);
      return { success: true };
    }
    return { success: false, error: res.error || 'Registration failed' };
  };

  const sendRegistrationOtp = async (name: string, email: string, phone: string) => {
    return await api.sendRegistrationOtp(name, email, phone);
  };

  const verifyAndRegister = async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    otp: string;
  }) => {
    const res = await api.verifyRegistrationOtp(data);
    if (res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('jonny_user_token', res.token);
      localStorage.setItem('jonny_user_profile', JSON.stringify(res.user));
      window.dispatchEvent(new Event('auth_change'));
      setAuthPromptMessage(null);
      return { success: true, user: res.user };
    }
    return { success: false, error: res.error || 'Verification failed' };
  };

  const sendForgotPasswordOtp = async (email: string) => {
    return await api.sendForgotPasswordOtp(email);
  };

  const resetPasswordWithOtp = async (data: { email: string; otp: string; newPassword: string }) => {
    const res = await api.resetPasswordWithOtp(data);
    if (res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('jonny_user_token', res.token);
      localStorage.setItem('jonny_user_profile', JSON.stringify(res.user));

      if (res.user.role === 'admin') {
        localStorage.setItem('jonny_admin_token', res.token);
        localStorage.setItem('jonny_admin_user', JSON.stringify({
          id: res.user.id,
          email: res.user.email,
          name: res.user.name,
          role: 'Livestock Administrator',
          phone: res.user.phone
        }));
      }

      window.dispatchEvent(new Event('auth_change'));
      setIsAuthModalOpen(false);
      setAuthPromptMessage(null);
      return { success: true };
    }
    return { success: false, error: res.error || 'Password reset failed' };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jonny_user_token');
    localStorage.removeItem('jonny_user_profile');
    localStorage.removeItem('jonny_admin_token');
    localStorage.removeItem('jonny_admin_user');
    sessionStorage.clear();
    window.dispatchEvent(new Event('auth_change'));
    window.location.replace('/');
  };

  const openAuthModal = (mode: 'login' | 'register' | 'forgot_password' = 'login', message?: string) => {
    setAuthModalMode(mode);
    setAuthPromptMessage(message || null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthPromptMessage(null);
  };

  return (
    <UserAuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        login,
        register,
        sendRegistrationOtp,
        verifyAndRegister,
        sendForgotPasswordOtp,
        resetPasswordWithOtp,
        logout,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        authModalMode,
        authPromptMessage
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = (): UserAuthContextType => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
};
