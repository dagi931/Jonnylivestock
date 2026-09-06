import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../context/UserAuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  LogIn,
  UserPlus,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  KeyRound,
  Clock
} from 'lucide-react';

export const UserAuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    authPromptMessage,
    login,
    sendRegistrationOtp,
    verifyAndRegister,
    sendForgotPasswordOtp,
    resetPasswordWithOtp
  } = useUserAuth();

  const navigate = useNavigate();
  const { theme } = useTheme();
  const { isAmharic } = useLanguage();
  const isDark = theme === 'design7';

  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>(authModalMode || 'login');
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [createdUserName, setCreatedUserName] = useState('');
  const [forgotStep, setForgotStep] = useState<'email' | 'otp'>('email');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password Fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // OTP State
  const [otp, setOtp] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  // Status & Feedback
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync mode with prop when opened
  useEffect(() => {
    if (authModalMode) setMode(authModalMode);
    setStep('form');
    setForgotStep('email');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setInfoMessage(null);
  }, [authModalMode, isAuthModalOpen]);

  // Resend Countdown Timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Auto-redirect on successful registration
  useEffect(() => {
    if (step === 'success') {
      const timer = setTimeout(() => {
        closeAuthModal();
        navigate('/', { replace: true, state: { accountCreated: true, userName: createdUserName || name } });
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [step, closeAuthModal, navigate, createdUserName, name]);

  if (!isAuthModalOpen) return null;

  // Handle Initial Form Submission (Login or Register Step 1)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          closeAuthModal();
          if (res.user?.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        } else {
          setError(res.error || (isAmharic ? 'መግባት አልተሳካም' : 'Login failed'));
        }
      } else {
        // Register Mode: Validate Phone & Details
        if (!name.trim()) {
          setError(isAmharic ? 'እባክዎ ሙሉ ስምዎን ያስገቡ' : 'Please enter your full name');
          setIsLoading(false);
          return;
        }

        if (!phone.trim() || phone.trim().length < 8) {
          setError(
            isAmharic
              ? 'እባክዎ ትክክለኛ ስልክ ቁጥር ያስገቡ (ቢያንስ 8 አሃዞች)'
              : 'Please enter a valid phone number (at least 8 digits)'
          );
          setIsLoading(false);
          return;
        }

        if (password.length < 6) {
          setError(
            isAmharic
              ? 'የይለፍ ቃል ቢያንስ 6 ፊደላት መሆን አለበት'
              : 'Password must be at least 6 characters'
          );
          setIsLoading(false);
          return;
        }

        // Send OTP via Brevo
        const otpRes = await sendRegistrationOtp(name.trim(), email.trim(), phone.trim());
        if (otpRes.success) {
          setStep('otp');
          setResendCountdown(60);
          setInfoMessage(
            isAmharic
              ? `የማረጋገጫ ኮድ ወደ ${email} ተልኳል`
              : `A 6-digit verification code has been sent to ${email}`
          );
        } else {
          setError(otpRes.error || (isAmharic ? 'የማረጋገጫ ኮድ መላክ አልተቻለም' : 'Failed to send verification code'));
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Registration OTP Verification
  const handleVerifyRegistrationOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      setError(isAmharic ? 'እባክዎ 6 አሃዝ የማረጋገጫ ኮድ ያስገቡ' : 'Please enter the 6-digit verification code');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await verifyAndRegister({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        otp: otp.trim()
      });

      if (res.success) {
        setCreatedUserName(res.user?.name || name.trim());
        setStep('success');
      } else {
        setError(res.error || (isAmharic ? 'ትክክለኛ ያልሆነ ኮድ' : 'Invalid verification code'));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify code');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Resending Registration OTP
  const handleResendRegistrationOtp = async () => {
    if (resendCountdown > 0 || isLoading) return;
    setError(null);
    setIsLoading(true);

    try {
      const otpRes = await sendRegistrationOtp(name.trim(), email.trim(), phone.trim());
      if (otpRes.success) {
        setResendCountdown(60);
        setInfoMessage(
          isAmharic
            ? `አዲስ የማረጋገጫ ኮድ ወደ ${email} ተልኳል`
            : `A new verification code was dispatched to ${email}`
        );
      } else {
        setError(otpRes.error || 'Failed to resend code');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password - Step 1: Request OTP
  const handleSendForgotPasswordOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError(isAmharic ? 'እባክዎ የተመዘገቡበትን ኢሜይል ያስገቡ' : 'Please enter your registered email address');
      return;
    }

    setError(null);
    setInfoMessage(null);
    setIsLoading(true);

    try {
      const res = await sendForgotPasswordOtp(email.trim());
      if (res.success) {
        setForgotStep('otp');
        setResendCountdown(60);
        setOtp('');
        setInfoMessage(
          isAmharic
            ? `የይለፍ ቃል መቀየሪያ ኮድ ወደ ${email} ተልኳል`
            : `A 6-digit password reset code has been sent to ${email}`
        );
      } else {
        setError(res.error || (isAmharic ? 'የማረጋገጫ ኮድ መላክ አልተቻለም' : 'Failed to send reset code'));
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password - Step 2: Verify OTP & Reset Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      setError(isAmharic ? 'እባክዎ 6 አሃዝ የማረጋገጫ ኮድ ያስገቡ' : 'Please enter the 6-digit verification code');
      return;
    }
    if (newPassword.length < 6) {
      setError(isAmharic ? 'የይለፍ ቃል ቢያንስ 6 ፊደላት መሆን አለበት' : 'New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(isAmharic ? 'የይለፍ ቃሎቹ አይመሳሰሉም' : 'Passwords do not match');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await resetPasswordWithOtp({
        email: email.trim(),
        otp: otp.trim(),
        newPassword
      });

      if (res.success) {
        closeAuthModal();
        navigate('/');
      } else {
        setError(res.error || (isAmharic ? 'የይለፍ ቃል መቀየር አልተሳካም' : 'Failed to reset password'));
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Resending Forgot Password OTP
  const handleResendForgotPasswordOtp = async () => {
    if (resendCountdown > 0 || isLoading) return;
    setError(null);
    setIsLoading(true);

    try {
      const res = await sendForgotPasswordOtp(email.trim());
      if (res.success) {
        setResendCountdown(60);
        setInfoMessage(
          isAmharic
            ? `አዲስ የማረጋገጫ ኮድ ወደ ${email} ተልኳል`
            : `A new reset code was dispatched to ${email}`
        );
      } else {
        setError(res.error || 'Failed to resend reset code');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend reset code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 backdrop-blur-md p-3 sm:p-4 md:p-6">
      <div className="min-h-full flex items-center justify-center py-4 sm:py-6">
        <div className="fixed inset-0" onClick={closeAuthModal} aria-hidden="true" />
        <div
          className={`relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95 duration-200 ${
            isDark
              ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#F4E8D0]'
              : 'bg-[#FDFBF7] border-[#E4D4BC] text-[#2A1A0D]'
          }`}
        >
          {/* Close Button */}
          {step !== 'success' && (
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
          )}

          {/* Prompt Message Banner (e.g. Account Required for Ordering) */}
          {authPromptMessage && step !== 'success' && (
            <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-500 flex items-start gap-3 shadow-md animate-in fade-in slide-in-from-top-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-xs uppercase tracking-wide text-amber-500">
                  {isAmharic ? 'ትዕዛዝ ለማስገባት መለያ ያስፈልጋል' : 'Account Required to Order'}
                </h4>
                <p className={`text-xs mt-0.5 font-medium leading-relaxed ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
                  {authPromptMessage}
                </p>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* VIEW: REGISTRATION SUCCESS (NO EMOJIS, CLEAN REDIRECT) */}
          {/* ========================================================== */}
          {step === 'success' ? (
            <div className="text-center py-6 px-3 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-400">
                  {isAmharic ? 'መለያዎ በተሳካ ሁኔታ ተፈጥሯል' : 'Account Created Successfully'}
                </h2>
                <p className="text-xs sm:text-sm opacity-80 mt-1.5 max-w-sm mx-auto leading-relaxed">
                  {isAmharic
                    ? `እንኳን ደህና መጡ ${createdUserName || name}! ወደ ዋናው ገጽ በመሄድ ላይ ነው...`
                    : `Welcome, ${createdUserName || name}! Redirecting you to the home page...`}
                </p>
              </div>

              {/* Account Quick Summary Pill */}
              <div className={`p-3 rounded-xl border text-xs text-left max-w-xs mx-auto ${
                isDark ? 'bg-[#1B1208] border-[#3D2513]' : 'bg-[#FAF6EE] border-[#E8DCCB]'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="opacity-70">{isAmharic ? 'ስም:' : 'Name:'}</span>
                  <span className="font-bold truncate">{createdUserName || name}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <span className="opacity-70">{isAmharic ? 'ኢሜይል:' : 'Email:'}</span>
                  <span className="font-mono text-[11px] truncate">{email}</span>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="w-full max-w-xs mx-auto pt-1">
                <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full animate-pulse transition-all duration-700 w-full" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    closeAuthModal();
                    navigate('/', { replace: true, state: { accountCreated: true, userName: createdUserName || name } });
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C18A45] to-[#A06E35] text-white font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isAmharic ? 'ወደ ዋናው ገጽ ሂድ' : 'Continue to Home Page'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : mode === 'forgot_password' ? (
            <div>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setForgotStep('email');
                  setError(null);
                  setInfoMessage(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C18A45] hover:underline mb-4 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isAmharic ? 'ወደ መግቢያ ተመለስ' : 'Back to Sign In'}</span>
              </button>

              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#C18A45]/15 border border-[#C18A45]/30 text-[#C18A45] flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <KeyRound className="w-7 h-7" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif">
                  {isAmharic ? 'የይለፍ ቃል ዳግም ማስጀመሪያ' : 'Reset Your Password'}
                </h2>
                <p className="text-xs opacity-75 mt-1.5 max-w-xs mx-auto leading-relaxed">
                  {forgotStep === 'email'
                    ? isAmharic
                      ? 'የተመዘገቡበትን ኢሜይል ያስገቡ፣ የ 6 አሃዝ የማረጋገጫ ኮድ እንልክልዎታለን።'
                      : 'Enter your registered email address and we will send a 6-digit verification code to reset your password.'
                    : isAmharic
                    ? `የ 6 አሃዝ የማረጋገጫ ኮድ ወደ ${email} ልከናል።`
                    : `Enter the 6-digit code sent to ${email} and choose a new password.`}
                </p>
              </div>

              {/* Status alerts */}
              {infoMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{infoMessage}</span>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Forgot Password Step 1: Request Code */}
              {forgotStep === 'email' ? (
                <form onSubmit={handleSendForgotPasswordOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                      {isAmharic ? 'የተመዘገቡበት ኢሜይል' : 'Registered Email Address'} *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoFocus
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#C18A45] ${
                          isDark
                            ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] placeholder-[#D8C5A8]/40'
                            : 'bg-white border-[#E4D4BC] text-[#2A1A0D] placeholder-[#746556]/40'
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C18A45] to-[#A06E35] text-white font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>{isAmharic ? 'የማረጋገጫ ኮድ ላክ' : 'Send Verification Code'}</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Forgot Password Step 2: Verify Code & Set New Password */
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-center opacity-80">
                      {isAmharic ? 'የ 6 አሃዝ ኮድ ያስገቡ' : 'Enter 6-Digit Code'} *
                    </label>
                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      autoFocus
                      className={`w-full py-3 px-4 text-center font-mono text-2xl font-extrabold tracking-[0.35em] rounded-2xl border shadow-inner transition-all focus:outline-none focus:ring-2 focus:ring-[#C18A45] ${
                        isDark
                          ? 'bg-[#1B1208] border-[#4A2C16] text-[#E0B15A] placeholder-[#D8C5A8]/20'
                          : 'bg-white border-[#E4D4BC] text-[#8F6026] placeholder-[#746556]/20'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                      {isAmharic ? 'አዲስ የይለፍ ቃል' : 'New Password'} *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#C18A45] ${
                          isDark
                            ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] placeholder-[#D8C5A8]/40'
                            : 'bg-white border-[#E4D4BC] text-[#2A1A0D] placeholder-[#746556]/40'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                      {isAmharic ? 'አዲሱን የይለፍ ቃል ያረጋግጡ' : 'Confirm New Password'} *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#C18A45] ${
                          isDark
                            ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] placeholder-[#D8C5A8]/40'
                            : 'bg-white border-[#E4D4BC] text-[#2A1A0D] placeholder-[#746556]/40'
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.trim().length !== 6 || newPassword.length < 6}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C18A45] to-[#A06E35] text-white font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isAmharic ? 'የይለፍ ቃል ቀይር እና ግባ' : 'Reset Password & Sign In'}</span>
                      </>
                    )}
                  </button>

                  {/* Resend Section */}
                  <div className="pt-2 border-t border-black/5 dark:border-white/5 text-center">
                    {resendCountdown > 0 ? (
                      <p className="text-xs opacity-60">
                        {isAmharic ? 'እንደገና ለመላክ ይጠብቁ፡' : 'Resend code available in:'}{' '}
                        <span className="font-mono font-bold text-[#C18A45]">{resendCountdown}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendForgotPasswordOtp}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C18A45] hover:underline disabled:opacity-50 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{isAmharic ? 'ኮድ አልደረሰዎትም? በድጋሚ ይላኩ' : "Didn't receive code? Resend Email"}</span>
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          ) : mode === 'register' && step === 'otp' ? (
            /* ========================================================== */
            /* VIEW: STEP 2 (REGISTRATION OTP VERIFICATION) */
            /* ========================================================== */
            <div>
              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setError(null);
                  setInfoMessage(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C18A45] hover:underline mb-4 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isAmharic ? 'ወደ ኋላ ተመለስ' : 'Edit details'}</span>
              </button>

              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#C18A45]/15 border border-[#C18A45]/30 text-[#C18A45] flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif">
                  {isAmharic ? 'ኢሜይልዎን ያረጋግጡ' : 'Verify Your Email'}
                </h2>
                <p className="text-xs opacity-75 mt-1.5 max-w-xs mx-auto leading-relaxed">
                  {isAmharic
                    ? `የ 6 አሃዝ የማረጋገጫ ኮድ ወደ ${email} ልከናል።`
                    : `We sent a 6-digit verification code via Brevo to:`}
                </p>
                <div className="mt-1 font-semibold text-xs text-[#C18A45] break-all">{email}</div>

                {phone && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[11px] font-mono">
                    <Phone className="w-3 h-3 text-[#C18A45]" />
                    <span>Attached Phone: <strong>{phone}</strong></span>
                  </div>
                )}
              </div>

              {/* Status alerts */}
              {infoMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{infoMessage}</span>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleVerifyRegistrationOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-center opacity-80">
                    {isAmharic ? 'የ 6 አሃዝ ኮድ ያስገቡ' : 'Enter 6-Digit Code'}
                  </label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    autoFocus
                    className={`w-full py-3.5 px-4 text-center font-mono text-3xl font-extrabold tracking-[0.4em] rounded-2xl border shadow-inner transition-all focus:outline-none focus:ring-2 focus:ring-[#C18A45] ${
                      isDark
                        ? 'bg-[#1B1208] border-[#4A2C16] text-[#E0B15A] placeholder-[#D8C5A8]/20'
                        : 'bg-white border-[#E4D4BC] text-[#8F6026] placeholder-[#746556]/20'
                    }`}
                  />
                  <p className="text-[11px] opacity-60 text-center mt-1.5 flex items-center justify-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 opacity-70" />
                    <span>{isAmharic ? 'ኮዱ ለ 10 ደቂቃዎች ያገለግላል' : 'Code expires in 10 minutes'}</span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.trim().length !== 6}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C18A45] to-[#A06E35] text-white font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isAmharic ? 'አረጋግጥና መለያ ፍጠር' : 'Verify & Complete Registration'}</span>
                    </>
                  )}
                </button>

                {/* Resend Section */}
                <div className="pt-3 border-t border-black/5 dark:border-white/5 text-center">
                  {resendCountdown > 0 ? (
                    <p className="text-xs opacity-60">
                      {isAmharic ? 'እንደገና ለመላክ ይጠብቁ፡' : 'Resend code available in:'}{' '}
                      <span className="font-mono font-bold text-[#C18A45]">{resendCountdown}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendRegistrationOtp}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C18A45] hover:underline disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{isAmharic ? 'ኮድ አልደረሰዎትም? በድጋሚ ይላኩ' : "Didn't receive code? Resend Email"}</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          ) : (
            /* ========================================================== */
            /* VIEW: STEP 1 (LOGIN / REGISTRATION FORM) */
            /* ========================================================== */
            <div>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#C18A45]/15 border border-[#C18A45]/30 text-[#C18A45] flex items-center justify-center mx-auto mb-3 shadow-inner">
                  {mode === 'login' ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif">
                  {mode === 'login'
                    ? isAmharic
                      ? 'ወደ መለያዎ ይግቡ'
                      : 'Welcome Back'
                    : isAmharic
                    ? 'አዲስ መለያ ይፍጠሩ'
                    : 'Create Your Account'}
                </h2>
                <p className="text-xs opacity-75 mt-1">
                  {mode === 'login'
                    ? isAmharic
                      ? 'የእርስዎን ትዕዛዞች እና የተያዙ ከብቶች ለማየት'
                      : 'Sign in to access your livestock orders & reservations'
                    : isAmharic
                    ? 'በቀላሉ ከብቶችን ይዘዙ እና ያስይዙ'
                    : 'Sign up to reserve livestock and manage celebration packages'}
                </p>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="flex rounded-xl p-1 bg-black/5 dark:bg-white/5 mb-6 border border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setInfoMessage(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-[#C18A45] text-white shadow-md'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
                  }`}
                >
                  {isAmharic ? 'ይግቡ' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                    setInfoMessage(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === 'register'
                      ? 'bg-[#C18A45] text-white shadow-md'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
                  }`}
                >
                  {isAmharic ? 'ይመዝገቡ' : 'Register'}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
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
                        placeholder="e.g. Dawit Bekele"
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
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider opacity-80">
                        {isAmharic ? 'ስልክ ቁጥር' : 'Phone Number'} *
                      </label>
                      <span className="text-[10.5px] text-[#C18A45] font-semibold">
                        {isAmharic ? 'ለክፍያ ማረጋገጫ ያስፈልጋል' : 'Required for payment'}
                      </span>
                    </div>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+251 910 194 903"
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
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Forgot Password Link on Login Mode */}
                  {mode === 'login' && (
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot_password');
                          setForgotStep('email');
                          setError(null);
                          setInfoMessage(null);
                        }}
                        className="text-xs font-semibold text-[#C18A45] hover:underline cursor-pointer transition-colors"
                      >
                        {isAmharic ? 'የይለፍ ቃል ረሱ?' : 'Forgot Password?'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#C18A45] to-[#A06E35] text-white font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
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
                      <span>{isAmharic ? 'ይቀጥሉ (ኢሜይል ያረጋግጡ)' : 'Continue to Email Verification'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
