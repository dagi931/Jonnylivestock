import React, { useState } from 'react';
import { useUserAuth } from '../../context/UserAuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, Sparkles, LogIn, UserPlus } from 'lucide-react';

export const UserAuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, login, register } = useUserAuth();
  const { theme } = useTheme();
  const { isAmharic } = useLanguage();
  const isDark = theme === 'design7';

  const [mode, setMode] = useState<'login' | 'register'>(authModalMode || 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync mode with prop when opened
  React.useEffect(() => {
    if (authModalMode) setMode(authModalMode);
    setError(null);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Login failed');
        }
      } else {
        if (!name.trim()) {
          setError(isAmharic ? 'እባክዎ ሙሉ ስምዎን ያስገቡ' : 'Please enter your full name');
          setIsLoading(false);
          return;
        }
        const res = await register(name, email, phone, password);
        if (!res.success) {
          setError(res.error || 'Registration failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = (type: 'customer' | 'admin') => {
    if (type === 'customer') {
      setEmail('dawit@example.com');
      setPassword('password123');
    } else {
      setEmail('admin@jonnylivestock.com');
      setPassword('admin123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`relative w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 ${
          isDark
            ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#F4E8D0]'
            : 'bg-[#FDFBF7] border-[#E4D4BC] text-[#2A1A0D]'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          type="button"
          className={`absolute top-5 right-5 p-2 rounded-full transition-colors ${
            isDark ? 'hover:bg-[#1B1208] text-[#D8C5A8]' : 'hover:bg-[#EFE8DC] text-[#746556]'
          }`}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#C18A45]/20 text-[#C18A45] mb-3">
            {mode === 'login' ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-bold font-serif">
            {mode === 'login'
              ? (isAmharic ? 'ወደ መለያዎ ይግቡ' : 'Sign In to Your Account')
              : (isAmharic ? 'አዲስ መለያ ይክፈቱ' : 'Create Customer Account')}
          </h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-[#D8C5A8]/70' : 'text-[#746556]'}`}>
            {mode === 'login'
              ? (isAmharic ? 'እንስሳትን በቀላሉ ለመግዛትና ክፍያ ለመፈጸም' : 'Manage your purchases and track payment receipts')
              : (isAmharic ? 'የክፍያ ደረሰኝ በቀጥታ ለመጫንና ትዕዛዝ ለመከታተል' : 'Upload payment slips and manage livestock orders')}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-xl bg-black/10 dark:bg-white/5 mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-[#C18A45] text-white shadow-md'
                : isDark ? 'text-[#D8C5A8] hover:text-white' : 'text-[#746556] hover:text-black'
            }`}
          >
            {isAmharic ? 'ይግቡ' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-[#C18A45] text-white shadow-md'
                : isDark ? 'text-[#D8C5A8] hover:text-white' : 'text-[#746556] hover:text-black'
            }`}
          >
            {isAmharic ? 'ይመዝገቡ' : 'Register'}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                {isAmharic ? 'ሙሉ ስም' : 'Full Name'} *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Abebe Bikila"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#C18A45] ${
                    isDark
                      ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] placeholder-[#D8C5A8]/40'
                      : 'bg-white border-[#E4D4BC] text-[#2A1A0D] placeholder-[#746556]/40'
                  }`}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
              {isAmharic ? 'ኢሜይል' : 'Email Address'} *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#C18A45] ${
                  isDark
                    ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] placeholder-[#D8C5A8]/40'
                    : 'bg-white border-[#E4D4BC] text-[#2A1A0D] placeholder-[#746556]/40'
                }`}
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                {isAmharic ? 'ስልክ ቁጥር' : 'Phone Number'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+251 911 234 567"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#C18A45] ${
                    isDark
                      ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] placeholder-[#D8C5A8]/40'
                      : 'bg-white border-[#E4D4BC] text-[#2A1A0D] placeholder-[#746556]/40'
                  }`}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
              {isAmharic ? 'የይለፍ ቃል' : 'Password'} *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#C18A45] ${
                  isDark
                    ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] placeholder-[#D8C5A8]/40'
                    : 'bg-white border-[#E4D4BC] text-[#2A1A0D] placeholder-[#746556]/40'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#C18A45] to-[#A06E35] text-white font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>{isAmharic ? 'ይግቡ' : 'Sign In'}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>{isAmharic ? 'መለያ ይፍጠሩ' : 'Create Account'}</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials for Fast Testing */}
        <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10 text-center">
          <p className="text-xs opacity-60 mb-2">{isAmharic ? 'ፈጣን ሙከራ (Quick Fill)' : 'Quick Demo Test Accounts:'}</p>
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={() => handleDemoFill('customer')}
              className="text-xs px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-[#C18A45]/20 hover:text-[#C18A45] transition-colors"
            >
              Demo Customer
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="text-xs px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-[#C18A45]/20 hover:text-[#C18A45] transition-colors"
            >
              Admin (Jonny)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
