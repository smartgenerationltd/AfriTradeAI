import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowRight, CheckCircle2, Globe, Sparkles } from 'lucide-react';

interface LoginViewProps {
  redirectTarget?: string | null;
  onNavigate: (view: string) => void;
  onSuccess: (targetView?: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  redirectTarget,
  onNavigate,
  onSuccess
}) => {
  const { signIn, signInWithGoogle, error, clearError, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please enter both your email and password.');
      return;
    }

    try {
      setSubmitting(true);
      await signIn(email, password);
      setSubmitting(false);
      onSuccess(redirectTarget || undefined);
    } catch (err) {
      setSubmitting(false);
      setLocalError(err instanceof Error ? err.message : 'Unable to sign in.');
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    setLocalError(null);
    try {
      setSubmitting(true);
      await signInWithGoogle('buyer');
      setSubmitting(false);
      onSuccess(redirectTarget || undefined);
    } catch (err) {
      setSubmitting(false);
      setLocalError(err instanceof Error ? err.message : 'Google sign-in could not be completed.');
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-6 p-6 sm:p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl text-zinc-100 font-sans">
      {/* Friendly gate banner if redirected from protected route */}
      {redirectTarget && (
        <div className="mb-6 p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-start gap-3 text-xs text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Authentication Required</span>
            Sign in or create an account to continue to your requested destination ({redirectTarget.replace('-', ' ')}).
          </div>
        </div>
      )}

      {/* Brand header */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 border border-zinc-700/80 rounded-full text-[11px] text-zinc-300 font-mono">
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>Trade Africa. Grow Africa.</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
          Welcome to AfriTrade AI
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
          Sign in to discover markets, connect with African businesses and trade across Africa.
        </p>
      </div>

      {/* Error notification */}
      {(localError || error) && (
        <div className="mb-5 p-3 bg-red-950/40 border border-red-800/60 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{localError || error}</span>
        </div>
      )}

      {/* Google Sign In Button */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={submitting || loading}
          className="w-full py-2.5 px-4 bg-zinc-950 hover:bg-zinc-800/90 border border-zinc-700 text-zinc-100 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-3 transition shadow-xs hover:border-zinc-500 disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-[11px] font-mono uppercase text-zinc-500 tracking-wider">or email</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@business.com"
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-hidden transition"
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 transition"
              >
                Forgot your password?
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-hidden transition"
              />
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-white text-zinc-950 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2"
          >
            {submitting ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Continue with Email</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Account switch link */}
      <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
        Don&apos;t have an account?{' '}
        <button
          onClick={() => onNavigate('register')}
          className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 transition"
        >
          Create one
        </button>
      </div>
    </div>
  );
};
