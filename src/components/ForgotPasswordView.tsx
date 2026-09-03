import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

interface ForgotPasswordViewProps {
  onNavigate: (view: string) => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ onNavigate }) => {
  const { resetPassword, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!email.trim()) {
      setLocalError('Please enter your account email address.');
      return;
    }

    try {
      setSubmitting(true);
      await resetPassword(email.trim());
      setSubmitting(false);
      setSent(true);
    } catch (err) {
      setSubmitting(false);
      setLocalError(err instanceof Error ? err.message : 'Could not send reset email.');
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-8 p-6 sm:p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl text-zinc-100 font-sans">
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">
          Reset Your Password
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto">
          Enter your registered email address to receive secure password recovery instructions.
        </p>
      </div>

      {(localError || error) && (
        <div className="mb-5 p-3 bg-red-950/40 border border-red-800/60 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{localError || error}</span>
        </div>
      )}

      {sent ? (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-center space-y-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <h3 className="text-sm font-bold text-emerald-200">
            Password Reset Email Sent
          </h3>
          <p className="text-xs text-emerald-300/90 leading-relaxed">
            We have dispatched password reset instructions to <strong className="font-mono text-white">{email}</strong>. Please check your inbox and spam folder.
          </p>
          <button
            onClick={() => onNavigate('login')}
            className="mt-3 w-full py-2.5 px-4 bg-zinc-100 hover:bg-white text-zinc-950 text-xs sm:text-sm font-semibold rounded-xl transition"
          >
            Return to Sign In
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Registered Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-hidden transition"
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-white text-zinc-950 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {submitting ? 'Sending instructions...' : 'Send Password Reset Link'}
          </button>
        </form>
      )}

      <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
        <button
          onClick={() => onNavigate('login')}
          className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </button>
      </div>
    </div>
  );
};
