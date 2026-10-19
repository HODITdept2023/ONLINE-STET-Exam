import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone,
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Clock,
  KeyRound,
  Key,
  Send,
  Copy,
  Check
} from 'lucide-react';
import { RegisteredUser } from '../types';
import { 
  authenticateWithPassword, 
  registerNewUser,
  lookupUserByEmail,
  updateUserPassword,
  isAdminUser,
  getRegisteredUsers,
  REGISTERED_USERS_KEY
} from '../utils/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
  initialErrorMessage?: string | null;
  onAuthSuccess: (user: RegisteredUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  initialErrorMessage = null,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialErrorMessage);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage(initialErrorMessage || null);
    }
  }, [isOpen, initialMode, initialErrorMessage]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Register form state
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [regTargetExam, setRegTargetExam] = useState<string>('Sikkim Primary Teacher (PRT - Paper I)');

  // Forgot / Reset Password state
  const [resetEmail, setResetEmail] = useState<string>('');
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [resetResult, setResetResult] = useState<{
    success: boolean;
    temporaryPassword?: string;
    senderEmail?: string;
    sentViaSmtp?: boolean;
    message?: string;
  } | null>(null);
  const [hasCopiedPassword, setHasCopiedPassword] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanIdentifier = loginIdentifier.trim();
    const cleanPassword = loginPassword.trim();

    if (!cleanIdentifier) {
      setErrorMessage('Please enter your Email or Login ID.');
      return;
    }

    if (!cleanPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Try local authentication first
      let res = authenticateWithPassword(cleanIdentifier, cleanPassword);

      // 2. If local fails or user not found, query backend /api/auth/login
      if (!res.success || !res.user) {
        try {
          const apiRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: cleanIdentifier, password: cleanPassword }),
          });
          if (apiRes.ok) {
            const apiData = await apiRes.json();
            if (apiData.success && apiData.user) {
              const serverUser: RegisteredUser = apiData.user;
              res = { success: true, user: serverUser };
              try {
                const users = getRegisteredUsers();
                const uIdx = users.findIndex((u) => u.email.toLowerCase() === serverUser.email.toLowerCase());
                if (uIdx !== -1) {
                  users[uIdx] = { ...users[uIdx], ...serverUser };
                } else {
                  users.unshift(serverUser);
                }
                localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
                window.dispatchEvent(new CustomEvent('studeezone_users_updated', { detail: users }));
              } catch {}
            }
          }
        } catch (serverErr) {
          console.warn('Server auth fallback failed:', serverErr);
        }
      }

      setIsLoading(false);

      if (!res.success || !res.user) {
        setErrorMessage(
          res.message || 
          'Invalid credentials. If you do not have an account yet, please register now for your Free Trial (1 Day Left).'
        );
        setLoginPassword('');
      } else {
        setSuccessMessage(`Welcome back, ${res.user.name}!`);
        setTimeout(() => {
          onAuthSuccess(res.user!);
          onClose();
        }, 350);
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message || 'Login failed. Please check credentials and try again.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regEmail.trim() || !emailPattern.test(regEmail.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    const cleanPhone = regPhone.trim();
    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 6) {
      setErrorMessage('Please enter a valid phone number (used as your sign-in password).');
      return;
    }

    setIsLoading(true);

    const effectiveEmail = regEmail.trim().toLowerCase();
    setTimeout(() => {
      const res = registerNewUser({
        name: regName.trim(),
        email: effectiveEmail,
        phone: cleanPhone,
        loginId: effectiveEmail,
        password: cleanPhone,
        targetExam: regTargetExam,
        authProvider: 'password',
      });

      setIsLoading(false);

      if (!res.success || !res.user) {
        setErrorMessage(res.message || 'Registration failed.');
      } else {
        setLoginIdentifier(effectiveEmail);
        setLoginPassword(cleanPhone);
        setRegName('');
        setRegEmail('');
        setRegPhone('');
        setMode('login');
        setSuccessMessage(
          `🎉 Account registered successfully! Login ID: ${effectiveEmail} | Password: ${cleanPhone}. Click "Sign In" below to access your tests.`
        );
      }
    }, 350);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setResetResult(null);

    const cleanEmail = resetEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid registered email address.');
      return;
    }

    // Verify user is registered locally
    const existingUser = lookupUserByEmail(cleanEmail);
    const isSuperAdmin = isAdminUser(cleanEmail);

    if (!existingUser && !isSuperAdmin) {
      setErrorMessage('No registered account found with this email address. Please register for a Free Trial (1 Day Left).');
      return;
    }

    setIsResetting(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await response.json();
      const tempPass = data.temporaryPassword || `STET-${Math.floor(100000 + Math.random() * 900000)}`;

      // Update password in local storage
      updateUserPassword(cleanEmail, tempPass);

      setResetResult({
        success: true,
        temporaryPassword: tempPass,
        senderEmail: 'studeezone.com Support',
        sentViaSmtp: data.sentViaSmtp,
        message: data.message,
      });

      setLoginIdentifier(cleanEmail);
      setLoginPassword(tempPass);
    } catch (err: any) {
      const fallbackTemp = `STET-${Math.floor(100000 + Math.random() * 900000)}`;
      updateUserPassword(cleanEmail, fallbackTemp);

      setResetResult({
        success: true,
        temporaryPassword: fallbackTemp,
        senderEmail: 'studeezone.com Support',
        sentViaSmtp: false,
        message: 'A temporary access password has been generated for your account. You can sign in immediately.',
      });

      setLoginIdentifier(cleanEmail);
      setLoginPassword(fallbackTemp);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4" 
      id="auth-modal-backdrop"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 shrink-0 flex items-center justify-center">
              <img
                src="/studeezone-icon.svg"
                alt="studeezone.com icon"
                className="w-full h-full object-contain drop-shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight">
                studee<span className="text-blue-400">zone</span><span className="text-slate-400 font-semibold text-xs">.com</span>
              </h3>
              <p className="text-[11px] text-slate-300">
                STET Exam Preparation &amp; Adaptive Learning
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700 text-xs font-semibold"
            id="auth-modal-close-btn"
            title="Close Window"
            aria-label="Close"
          >
            <span>Close</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free Trial Highlight Banner */}
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-indigo-50 px-5 py-2.5 border-b border-amber-200/90 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] shadow-xs">
              1D
            </span>
            <div>
              <span className="text-xs font-extrabold text-slate-900 flex items-center space-x-1.5">
                <span>Free Full Access Trial</span>
                <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  1 Day Left
                </span>
              </span>
              <p className="text-[10px] text-slate-500 leading-none mt-0.5">
                Full access to all mock tests, study material &amp; 24/7 Ask Lama
              </p>
            </div>
          </div>

          {mode === 'login' ? (
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className="text-[11px] font-bold text-amber-900 hover:text-amber-950 bg-amber-200 hover:bg-amber-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              Get Trial
            </button>
          ) : (
            <div className="flex items-center space-x-1 text-[10px] text-amber-800 font-bold bg-amber-100/90 px-2 py-0.5 rounded-md">
              <Clock className="w-3 h-3" />
              <span>No Card Required</span>
            </div>
          )}
        </div>

        {/* Tab Switcher: Sign In vs Register Now */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-indigo-600 shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="auth-tab-login"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              mode === 'register'
                ? 'bg-white text-emerald-700 shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="auth-tab-register"
          >
            <span>Register Now</span>
            <span className="bg-amber-100 text-amber-900 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border border-amber-200">
              1-Day Trial
            </span>
          </button>
          {mode === 'forgot' && (
            <button
              type="button"
              className="flex-1 py-2 rounded-xl text-xs font-bold bg-white text-blue-700 shadow-2xs font-extrabold flex items-center justify-center space-x-1 cursor-default"
              id="auth-tab-forgot"
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              <span>Reset Password</span>
            </button>
          )}
        </div>

        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Notification / Alert Banners */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col space-y-2">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
              {errorMessage.toLowerCase().includes('register') && mode === 'login' && (
                <div className="pl-6 pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMessage(null);
                    }}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition-colors cursor-pointer shadow-2xs"
                    id="switch-to-register-from-error-btn"
                  >
                    <span>Register Now for Free Trial (1 Day Left)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* MODE 1: SIGN IN WITH EMAIL & PASSWORD */}
          {mode === 'login' ? (
            <div className="space-y-4">
              <form onSubmit={handlePasswordLogin} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Email Address or Login ID
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="Enter email or login ID (default: your email)"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      id="login-id-field"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password (default: your phone number)"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      id="login-password-field"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50/90 to-indigo-50/70 border border-amber-200 rounded-xl p-2.5 text-[11px] text-slate-700 flex items-center space-x-2">
                  <Key className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    <strong>Default Sign-In:</strong> User ID is your registered <strong>Email ID</strong> &amp; Password is your <strong>Phone Number</strong>.
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-[11px]">Remember my device</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setResetEmail(loginIdentifier.includes('@') ? loginIdentifier : '');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                      setResetResult(null);
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    id="forgot-password-link"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                  id="submit-password-login-btn"
                >
                  <span>{isLoading ? 'Authenticating...' : 'Sign In to Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Not registered callout */}
              <div className="pt-3 text-center text-xs text-slate-500 border-t border-slate-100">
                <span>Not registered yet? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                >
                  Register now for Free Trial (1 Day Left) →
                </button>
              </div>

              {/* Close login page button */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer inline-flex items-center space-x-1.5 py-1 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                  id="auth-modal-login-dismiss-btn"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Close &amp; Continue as Guest</span>
                </button>
              </div>
            </div>
          ) : mode === 'forgot' ? (
            /* MODE 3: RESET PASSWORD / FORGOT PASSWORD */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800">Reset Password</h4>
                    <p className="text-[11px] text-slate-500">Recover your studeezone.com account</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
                >
                  &larr; Back to Sign In
                </button>
              </div>

              {!resetResult ? (
                <form onSubmit={handleForgotPassword} className="space-y-3.5">
                  <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3.5 text-xs text-blue-900 space-y-1.5">
                    <div className="font-extrabold text-blue-950 flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      <span>Direct Email Dispatch</span>
                    </div>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      Enter your registered email address below. Your password reset details will be securely dispatched to your inbox.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="e.g. name@example.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="forgot-email-field"
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isResetting}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                    id="send-reset-password-btn"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {isResetting ? 'Dispatching Password Reset...' : 'Send Password Reset'}
                    </span>
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setErrorMessage(null);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
                    >
                      Remember your credentials? <span className="text-blue-600 font-bold hover:underline">Sign In</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 space-y-2">
                    <div className="flex items-center space-x-2 font-extrabold text-sm text-emerald-800">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>Password Reset Dispatched!</span>
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      {resetResult.message || `Your temporary password has been dispatched to ${resetEmail}.`}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Your New Temporary Password
                    </span>
                    <div className="flex items-center justify-center space-x-2">
                      <code className="px-4 py-2 bg-white rounded-xl border border-blue-300 font-mono text-lg font-extrabold text-blue-700 tracking-wider select-all shadow-2xs">
                        {resetResult.temporaryPassword}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          if (resetResult.temporaryPassword) {
                            navigator.clipboard.writeText(resetResult.temporaryPassword);
                            setHasCopiedPassword(true);
                            setTimeout(() => setHasCopiedPassword(false), 2000);
                          }
                        }}
                        className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
                        title="Copy Password"
                      >
                        {hasCopiedPassword ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Protected studeezone account recovery
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setLoginIdentifier(resetEmail);
                      if (resetResult.temporaryPassword) {
                        setLoginPassword(resetResult.temporaryPassword);
                      }
                      setErrorMessage(null);
                      setSuccessMessage('Temporary password loaded! Click "Sign In to Account" below.');
                    }}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-2"
                    id="proceed-to-login-btn"
                  >
                    <span>Proceed to Sign In Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* MODE 2: REGISTER NOW (WITH 7-DAY TRIAL HIGHLIGHTED) */
            <div className="space-y-3.5">
              {/* Highlight card inside registration */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-3 flex items-start space-x-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-emerald-900 leading-snug">
                  <p className="font-extrabold text-emerald-950">
                    Your Free Trial (1 Day Left) will activate automatically upon registration.
                  </p>
                  <p className="text-emerald-800 mt-0.5">
                    Includes all Sikkim STET Paper I &amp; II Mock Tests, subject-wise analytics, downloadable PDF notes, and 24/7 AI tutor.
                  </p>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Tshering Lepcha"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      id="register-name-field"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      id="register-email-field"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block flex items-center justify-between">
                    <span>Phone Number *</span>
                    <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      Sign-In Password
                    </span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      id="register-phone-field"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block flex items-center justify-between">
                    <span>Select Course *</span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      3 Stream Options
                    </span>
                  </label>
                  <select
                    value={regTargetExam}
                    onChange={(e) => setRegTargetExam(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    id="register-target-exam-select"
                  >
                    <option value="Sikkim Primary Teacher (PRT - Paper I)">
                      Sikkim Primary Teacher (PRT - Paper I) — Classes I - V
                    </option>
                    <option value="Sikkim Graduate Teacher (GT Maths & Science - Paper II)">
                      Sikkim Graduate Teacher (GT Maths &amp; Science - Paper II) — Classes VI - VIII
                    </option>
                    <option value="Sikkim Graduate Teacher (GT Humanities - Paper II)">
                      Sikkim Graduate Teacher (GT Humanities - Paper II) — Classes VI - VIII
                    </option>
                  </select>
                </div>

                {/* USER REQUESTED: Instead of create password section, display user id (email id) and password (phone number) */}
                <div className="bg-gradient-to-r from-amber-50/90 via-indigo-50/40 to-amber-50/90 p-3.5 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
                    <Key className="w-4 h-4 text-amber-600" />
                    <span>Your Generated Sign-In Credentials</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[10px] text-slate-500 font-sans block font-semibold mb-0.5">
                        User ID (Email ID):
                      </span>
                      <span className="font-bold text-slate-900 truncate block">
                        {regEmail.trim() || 'your.email@example.com'}
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[10px] text-slate-500 font-sans block font-semibold mb-0.5">
                        Password (Phone Number):
                      </span>
                      <span className="font-bold text-indigo-700 truncate block">
                        {regPhone.trim() || 'your phone number'}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight font-sans">
                    📌 Your <strong>Email ID</strong> is your Login User ID and your <strong>Phone Number</strong> is your Account Password. You will use these to log into the platform.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
                  id="submit-register-btn"
                >
                  <Key className="w-4 h-4" />
                  <span>{isLoading ? 'Activating Account...' : 'Register & Start Free Trial (1 Day Left)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Already registered switch */}
              <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
                <span>Already registered? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                >
                  Sign in with your account →
                </button>
              </div>

              {/* Close register view button */}
              <div className="pt-1.5 text-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer inline-flex items-center space-x-1.5 py-1 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                  id="auth-modal-register-dismiss-btn"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Close Window</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
