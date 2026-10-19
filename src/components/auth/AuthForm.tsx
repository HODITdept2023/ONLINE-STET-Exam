import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Eye, EyeOff, Sparkles, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export interface AuthFormData {
  mode: 'login' | 'register' | 'forgot';
  name?: string;
  email?: string;
  loginId?: string;
  password?: string;
  phone?: string;
  targetExam?: string;
}

export interface AuthFormProps {
  initialMode?: 'login' | 'register' | 'forgot';
  onSubmit: (data: AuthFormData) => Promise<{ success: boolean; message?: string } | void> | void;
  onModeChange?: (mode: 'login' | 'register' | 'forgot') => void;
  isLoading?: boolean;
  externalError?: string | null;
  externalSuccess?: string | null;
}

/**
 * AuthForm Component
 * Fully isolated, modular authentication form component.
 * Decoupled from database, API calls, and main page layout.
 */
export const AuthForm: React.FC<AuthFormProps> = ({
  initialMode = 'login',
  onSubmit,
  onModeChange,
  isLoading = false,
  externalError = null,
  externalSuccess = null,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(externalError);
  const [success, setSuccess] = useState<string | null>(externalSuccess);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loginId, setLoginId] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [targetExam, setTargetExam] = useState('Sikkim Primary Teacher (PRT - Paper I)');

  const switchMode = (newMode: 'login' | 'register' | 'forgot') => {
    setMode(newMode);
    setError(null);
    setSuccess(null);
    if (onModeChange) onModeChange(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (mode === 'login') {
      if (!email.trim() && !loginId.trim()) {
        setError('Please enter your Email or Login ID / Phone number.');
        return;
      }
      if (!password.trim()) {
        setError('Please enter your password.');
        return;
      }
    } else if (mode === 'register') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
        setError('Please enter a valid 10-digit phone number.');
        return;
      }
    } else if (mode === 'forgot') {
      if (!email.trim() && !phone.trim()) {
        setError('Please enter your registered email address or phone.');
        return;
      }
    }

    try {
      const res = await onSubmit({
        mode,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        loginId: (loginId.trim() || email.trim()).toLowerCase(),
        password: password.trim(),
        phone: phone.trim(),
        targetExam,
      });

      if (res && typeof res === 'object') {
        if (res.success && res.message) {
          setSuccess(res.message);
        } else if (!res.success && res.message) {
          setError(res.message);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication operation failed. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-2xl shadow-xl border border-slate-100">
      {/* Header Tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
        <button
          type="button"
          onClick={() => switchMode('login')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            mode === 'login'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => switchMode('register')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            mode === 'register'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Register Free
        </button>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-extrabold text-slate-900">
          {mode === 'login' && 'Candidate & Admin Login'}
          {mode === 'register' && 'Create Candidate Account'}
          {mode === 'forgot' && 'Reset Password'}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {mode === 'login' && 'Enter your credentials to access study materials and mock tests'}
          {mode === 'register' && 'Start your 7-day free trial across all Sikkim TET streams'}
          {mode === 'forgot' && 'Enter your registered email to receive access credentials'}
        </p>
      </div>

      {/* Notifications */}
      {(error || externalError) && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error || externalError}</span>
        </div>
      )}

      {(success || externalSuccess) && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success || externalSuccess}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sabu Tamang"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {mode === 'login' ? 'Login ID, Email, or Phone' : 'Email Address'}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type={mode === 'login' ? 'text' : 'email'}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={mode === 'login' ? 'Email, Login ID, or Phone' : 'candidate@example.com'}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        {mode === 'register' && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (WhatsApp)</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
            </div>
          </div>
        )}

        {mode === 'register' && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Exam Stream</label>
            <select
              value={targetExam}
              onChange={(e) => setTargetExam(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            >
              <option value="Sikkim Primary Teacher (PRT - Paper I)">Primary Teacher (PRT - Paper I)</option>
              <option value="Sikkim Graduate Teacher (GT Maths & Science - Paper II)">Graduate Teacher: Maths & Science (Paper II)</option>
              <option value="Sikkim Graduate Teacher (GT Humanities - Paper II)">Graduate Teacher: Humanities (Paper II)</option>
            </select>
          </div>
        )}

        {mode !== 'forgot' && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">Password</label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>
                {mode === 'login' && 'Sign In to Portal'}
                {mode === 'register' && 'Start Free Trial'}
                {mode === 'forgot' && 'Send Recovery Credentials'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer Switch */}
      <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
        {mode === 'login' ? (
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => switchMode('register')}
              className="text-indigo-600 font-bold hover:underline cursor-pointer"
            >
              Register here
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="text-indigo-600 font-bold hover:underline cursor-pointer"
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
};
