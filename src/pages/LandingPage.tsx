import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, UserIcon, Mail, Lock, Eye, EyeOff, LogIn, UserPlus, Sparkles } from 'lucide-react';
import { supabase } from '../supabase';

interface LandingPageProps {
  onGuestLogin: () => void;
  onAuthSuccess: (user: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGuestLogin, onAuthSuccess }) => {
  const [mode, setMode] = useState<'landing' | 'login' | 'signup'>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAuth = async (type: 'login' | 'signup') => {
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (type === 'signup') {
        const { data, error: signupError } = await supabase.auth.signUp({ email, password });
        if (signupError) throw signupError;
        if (data.user?.identities?.length === 0) {
          setError('An account with this email already exists. Please log in.');
        } else {
          setSuccess('Account created! You can now log in.');
          setMode('login');
        }
      } else {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;
        onAuthSuccess(data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full relative overflow-hidden bg-glass-gradient">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-400/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-400/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card p-12 max-w-md w-full relative z-10 border-white/60 shadow-[0_32px_120px_-20px_rgba(139,92,246,0.15)]"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-fuchsia-500 rounded-[2rem] shadow-xl shadow-violet-200 flex items-center justify-center text-white mx-auto mb-8 rotate-3 hover:rotate-0 transition-transform duration-500">
          <TrendingUp size={36} />
        </div>
        
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black mb-1 text-slate-900 tracking-tighter flex items-center justify-center gap-2">
            WealthMind <Sparkles size={20} className="text-violet-500" />
          </h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">Your Personal AI Wealth Advisor</p>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'landing' && (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3.5">
              <button onClick={() => setMode('login')} className="w-full flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-black text-sm shadow-lg hover:shadow-violet-300/40 transition-all duration-300 active:scale-95">
                <LogIn size={18} strokeWidth={2.5} /> Sign In
              </button>
              <button onClick={() => setMode('signup')} className="w-full flex items-center justify-center gap-2.5 px-8 py-4 bg-white/80 border border-slate-200 text-slate-900 rounded-2xl font-black text-sm shadow-sm hover:border-violet-300 transition-all duration-300 active:scale-95">
                <UserPlus size={18} strokeWidth={2.5} /> Create Account
              </button>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                <div className="relative flex justify-center"><span className="bg-white/80 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">or experience first</span></div>
              </div>
              
              <button onClick={onGuestLogin} className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-slate-50 text-slate-500 rounded-2xl font-bold text-[11px] hover:text-violet-600 hover:bg-violet-50 transition-all">
                <UserIcon size={13} /> Continue as Guest
              </button>
            </motion.div>
          )}

          {(mode === 'login' || mode === 'signup') && (
            <motion.div key="auth" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 text-left">
              <h2 className="text-lg font-black text-slate-900 text-center mb-6">{mode === 'login' ? 'Welcome Back' : 'Join WealthMind'}</h2>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl">
                  <span className="w-1 h-8 bg-rose-500 rounded-full shrink-0" />
                  <p className="text-[11px] font-bold text-rose-600">{error}</p>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <span className="w-1 h-8 bg-emerald-500 rounded-full shrink-0" />
                  <p className="text-[11px] font-bold text-emerald-600">{success}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/50 border border-slate-200 font-bold text-[13px] text-slate-700 outline-none focus:border-violet-400 transition-colors" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Security Key</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-white/50 border border-slate-200 font-bold text-[13px] text-slate-700 outline-none focus:border-violet-400 transition-colors" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500 transition-colors">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button onClick={() => handleAuth(mode)} disabled={loading} className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-violet-200/50 hover:shadow-violet-300/60 transition-all active:scale-[0.98] disabled:opacity-50 mt-4">
                {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>

              <div className="flex justify-between items-center pt-4">
                <button onClick={() => { setMode('landing'); setError(''); }} className="text-[10px] font-bold text-slate-400 hover:text-slate-700 transition-colors">← Back</button>
                <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} className="text-[10px] font-black text-violet-600 hover:text-fuchsia-600 transition-colors">
                  {mode === 'login' ? "Register New Account" : "Access Existing Account"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
