import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Stethoscope, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  HelpCircle
} from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login, signup, loginDemoStaff, enterDemoMode, error, setError, isConfigMissing } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localMsg, setLocalMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalMsg('Please fill in both email and password.');
      return;
    }
    if (!isLogin && password.length < 6) {
      setLocalMsg('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    setLocalMsg(null);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, displayName || 'Clinic Staff');
      }
    } catch (err: any) {
      // Handled
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setSubmitting(true);
    setLocalMsg(null);
    try {
      await loginDemoStaff();
    } catch (err: any) {
      // If error occurs, enter demo mode directly
      enterDemoMode();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-sky-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-700 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl mb-3 shadow-inner">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">CarePulse Clinic</h1>
          <p className="text-teal-100 text-sm mt-1">Staff & Clinic Management Portal</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/30 text-teal-100 text-xs rounded-full mt-3 border border-teal-400/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Firebase Connected</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          
          {/* Quick Notice if Firebase Auth needs Sign-in method enabled in Console */}
          {isConfigMissing && (
            <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Firebase Authentication Setup Note:</span>
              </div>
              <p className="leading-relaxed">
                In your Firebase Console, click <strong>Authentication &gt; Sign-in method &gt; Email/Password &gt; Enable &gt; Save</strong>.
              </p>
              <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                <a
                  href="https://console.firebase.google.com/project/clinic-management-softwa-79eb4/authentication/providers"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline text-amber-900 hover:text-amber-950 inline-flex items-center gap-1"
                >
                  <span>Open Firebase Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => enterDemoMode()}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Skip & Enter App Now
                </button>
              </div>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6 text-sm font-medium">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(null); setLocalMsg(null); }}
              className={`flex-1 py-2 text-center rounded-lg transition-all ${
                isLogin ? 'bg-white text-teal-700 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Staff Login
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(null); setLocalMsg(null); }}
              className={`flex-1 py-2 text-center rounded-lg transition-all ${
                !isLogin ? 'bg-white text-teal-700 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Register Staff
            </button>
          </div>

          {(error || localMsg) && !isConfigMissing && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{error || localMsg}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required={!isLogin}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Dr. Jennifer Adams"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Staff Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@clinic.com"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In as Staff' : 'Create Staff Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-medium">Instant Access</span>
            </div>
          </div>

          {/* 1-Click Demo Login */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>1-Click Enter Clinic Software</span>
          </button>
          
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs text-slate-500 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Full Access Mode Enabled</span>
            </div>
            <span className="text-[11px] text-teal-700 font-semibold">Patient &amp; Billing DB</span>
          </div>

        </div>

      </div>
    </div>
  );
};
