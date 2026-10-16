import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { authService } from '../services/backend/AuthService';
import { isProductionDataSource } from '../config/dataSourceMode';
import {
  Shield,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  X,
  Eye,
  EyeOff,
  ShieldCheck,
  Server
} from 'lucide-react';

export const AdminAuth: React.FC = () => {
  const { login } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('golife_admin_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Please provide your registered administrator email and security password.');
      return;
    }

    if (password.length < 6) {
      setError('Administrator passwords must contain at least 6 characters.');
      return;
    }

    if (rememberEmail) {
      localStorage.setItem('golife_admin_remembered_email', cleanEmail);
    } else {
      localStorage.removeItem('golife_admin_remembered_email');
    }

    setIsLoading(true);
    try {
      const res = await login(cleanEmail, password);
      if (!res.success) {
        setError(res.error || 'Authentication failed. Please verify credentials or contact Super Admin.');
      }
    } catch (err: any) {
      setError(err?.message || 'A network error occurred during authentication. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    setResetLoading(true);
    try {
      const res = await authService.requestPasswordRecovery(resetEmail);
      setResetMessage(res.data || 'Password recovery instructions have been dispatched.');
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetMessage(null);
        setResetEmail('');
      }, 4000);
    } catch {
      setResetMessage('If this email is registered, recovery instructions have been dispatched.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center px-4 py-12 text-[#111827] relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-400 border border-amber-500/40 text-slate-950 font-black text-2xl shadow-md mb-3">
            G
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">
            Go<span className="text-amber-500">Life</span> Admin Command
          </h1>
          <p className="text-xs font-bold text-amber-600 mt-0.5">
            Move Freely. Live Fully.
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Central Administrative Control Panel • Pakistan Operations
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure Production Gateway (RBAC Enabled)</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-1">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@golife.pk"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-900">
                Security Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setShowForgotPassword(true);
                }}
                className="text-[11px] font-bold text-amber-600 hover:text-amber-700 hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                id="remember_email"
                checked={rememberEmail}
                onChange={(e) => setRememberEmail(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-400 cursor-pointer"
              />
              <span className="text-xs text-slate-600">Remember email</span>
            </label>
            <span className="text-[11px] text-slate-400 font-medium">8-Hour Active Session</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-black text-sm transition shadow-md shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Authenticate & Enter Console
              </>
            )}
          </button>
        </form>

        {/* Quick Test / Demo Credentials Section (Visible ONLY in Demo Mode) */}
        {!isProductionDataSource() ? (
          <div className="mt-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3 h-3 text-amber-700" />
                Quick Test Credentials (Demo Mode)
              </span>
              <span className="text-[10px] text-amber-700 bg-amber-200/60 font-semibold px-2 py-0.5 rounded-full">
                Click to Auto-Fill
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-left">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@golife.pk');
                  setPassword('password123');
                  setError('');
                }}
                className="p-2 rounded-xl bg-white hover:bg-amber-100/60 border border-amber-200 text-left transition cursor-pointer group"
              >
                <div className="text-[11px] font-bold text-slate-900 group-hover:text-amber-800">Super Admin</div>
                <div className="text-[10px] text-slate-500 truncate">admin@golife.pk</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('operations@golife.pk');
                  setPassword('password123');
                  setError('');
                }}
                className="p-2 rounded-xl bg-white hover:bg-amber-100/60 border border-amber-200 text-left transition cursor-pointer group"
              >
                <div className="text-[11px] font-bold text-slate-900 group-hover:text-amber-800">Operations Admin</div>
                <div className="text-[10px] text-slate-500 truncate">operations@golife.pk</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('finance@golife.pk');
                  setPassword('password123');
                  setError('');
                }}
                className="p-2 rounded-xl bg-white hover:bg-amber-100/60 border border-amber-200 text-left transition cursor-pointer group"
              >
                <div className="text-[11px] font-bold text-slate-900 group-hover:text-amber-800">Finance Admin</div>
                <div className="text-[10px] text-slate-500 truncate">finance@golife.pk</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('support@golife.pk');
                  setPassword('password123');
                  setError('');
                }}
                className="p-2 rounded-xl bg-white hover:bg-amber-100/60 border border-amber-200 text-left transition cursor-pointer group"
              >
                <div className="text-[11px] font-bold text-slate-900 group-hover:text-amber-800">Support Admin</div>
                <div className="text-[10px] text-slate-500 truncate">support@golife.pk</div>
              </button>
            </div>
            <div className="mt-2 text-[10px] text-amber-800/80 text-center font-medium">
              Password: <code className="bg-amber-200/50 px-1.5 py-0.5 rounded font-mono font-bold text-slate-900">password123</code> (ya koi bhi 6+ character password)
            </div>
          </div>
        ) : (
          <div className="mt-5 p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Production Firebase Authentication</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
              Real authentication active. Enter your registered GoLife administrative email and password. Sandbox test credentials are isolated and restricted in live mode.
            </p>
          </div>
        )}

        {/* Security Specs Footer */}
        <div className="mt-6 pt-5 border-t border-slate-200/80 space-y-2">
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span>Encrypted Tunnel • Auto-Revocation on Inactivity</span>
          </div>
          <div className="text-center text-[10px] text-slate-400">
            Authorized administrative personnel only. All access attempts are recorded to the immutable audit log.
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setResetMessage(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Administrator Recovery</h3>
                <p className="text-[11px] text-slate-500">Reset authorization link via email</p>
              </div>
            </div>

            {resetMessage ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{resetMessage}</div>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1">
                    Registered Admin Email
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@golife.pk"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 bg-slate-50 text-slate-900"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {resetLoading ? (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Dispatch Reset Instructions'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
