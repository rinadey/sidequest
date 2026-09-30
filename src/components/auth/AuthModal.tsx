import React, { useState } from 'react';
import { sendEmailVerificationCode, verifyEmailAndLogin } from '../../services/authService';
import { UserProfile } from '../../types';
import { Mail, KeyRound, ShieldCheck, User, ArrowRight, RefreshCw, X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [isSignUp, setIsSignUp] = useState<boolean>(true);
  const [step, setStep] = useState<'EMAIL' | 'CODE'>('EMAIL');
  const [email, setEmail] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [generatedCodeHint, setGeneratedCodeHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (isSignUp && !displayName.trim()) {
      setError('Please provide your name or explorer moniker.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = sendEmailVerificationCode(email);
      setLoading(false);
      if (result.success) {
        setGeneratedCodeHint(result.code);
        setStep('CODE');
      } else {
        setError('Failed to dispatch verification code. Please retry.');
      }
    }, 400);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code || code.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = verifyEmailAndLogin(email, code, displayName);
      setLoading(false);

      if (result.success && result.user) {
        onAuthSuccess(result.user);
        onClose();
      } else {
        setError(result.error || 'Verification failed. Please check your code.');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🧭</span>
            <div>
              <div className="text-[11px] font-bold tracking-wider text-amber-400 uppercase">
                Jeddah Side Quest Account
              </div>
              <h2 className="text-base font-extrabold text-white">
                {step === 'EMAIL'
                  ? isSignUp
                    ? 'Create Explorer Profile'
                    : 'Sign In to Your Journey'
                  : 'Enter Verification Code'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 'EMAIL' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Permanent progress, real XP, AI-verified location badges, and streaks require an active authenticated account.
              </p>

              {isSignUp && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Your Name / Explorer Title
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Rina or Tariq"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/25 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Send Verification Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                  }}
                  className="text-xs text-slate-400 hover:text-amber-300 transition cursor-pointer"
                >
                  {isSignUp
                    ? 'Already have an account? Sign in with code'
                    : "Don't have an account yet? Create one"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Code Sent to {email}</span>
                </div>
                {generatedCodeHint && (
                  <div className="pt-1 text-[11px] text-slate-300">
                    Your verification code is:{' '}
                    <span className="font-mono font-bold text-amber-300 text-sm bg-slate-900 px-2 py-0.5 rounded border border-amber-400/40">
                      {generatedCodeHint}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Enter 6-Digit Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-center text-sm font-mono tracking-widest text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/25 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Verify & Sign In</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep('EMAIL')}
                  className="text-slate-400 hover:text-white transition cursor-pointer"
                >
                  ← Change Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const result = sendEmailVerificationCode(email);
                    setGeneratedCodeHint(result.code);
                  }}
                  className="text-amber-400 hover:text-amber-300 font-semibold transition cursor-pointer"
                >
                  Resend Code
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
