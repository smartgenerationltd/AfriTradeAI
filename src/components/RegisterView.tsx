import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AFRICAN_COUNTRIES } from '../data/seedData';
import { 
  ShieldCheck, Mail, Lock, User, Phone, MapPin, 
  ShoppingBag, Store, AlertCircle, ArrowRight, CheckCircle2, Globe 
} from 'lucide-react';

interface RegisterViewProps {
  onNavigate: (view: string) => void;
  onRegisteredBuyer: () => void;
  onRegisteredSeller: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onNavigate,
  onRegisteredBuyer,
  onRegisteredSeller
}) => {
  const { signUp, signInWithGoogle, error, clearError, loading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Rwanda');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!fullName.trim() || !email.trim() || !password || !phone.trim()) {
      setLocalError('Please complete all required fields.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    try {
      setSubmitting(true);
      const userProfile = await signUp({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        country,
        role // 'buyer' or 'seller' only
      });
      setSubmitting(false);

      if (userProfile.role === 'seller') {
        onRegisteredSeller();
      } else {
        onRegisteredBuyer();
      }
    } catch (err) {
      setSubmitting(false);
      setLocalError(err instanceof Error ? err.message : 'Registration could not be completed.');
    }
  };

  const handleGoogleSignUp = async (chosenRole: 'buyer' | 'seller') => {
    clearError();
    setLocalError(null);
    try {
      setSubmitting(true);
      const profile = await signInWithGoogle(chosenRole);
      setSubmitting(false);
      if (profile.role === 'seller') {
        onRegisteredSeller();
      } else {
        onRegisteredBuyer();
      }
    } catch (err) {
      setSubmitting(false);
      setLocalError(err instanceof Error ? err.message : 'Google registration could not be completed.');
    }
  };

  return (
    <div className="max-w-xl w-full mx-auto my-6 p-6 sm:p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl text-zinc-100 font-sans">
      {/* Brand header */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 border border-zinc-700/80 rounded-full text-[11px] text-zinc-300 font-mono">
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>Trade Africa. Grow Africa.</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
          Join AfriTrade AI
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
          Create your account and start trading across Africa.
        </p>
      </div>

      {/* Error notification */}
      {(localError || error) && (
        <div className="mb-5 p-3 bg-red-950/40 border border-red-800/60 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{localError || error}</span>
        </div>
      )}

      {/* Role Selection Question: What do you want to do? */}
      <div className="mb-6 space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
          What do you want to do?
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole('buyer')}
            className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
              role === 'buyer'
                ? 'bg-zinc-850 border-emerald-500/80 text-zinc-100 ring-1 ring-emerald-500/40'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className={`p-2 rounded-lg ${role === 'buyer' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-900 text-zinc-500'}`}>
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs sm:text-sm font-bold text-zinc-100">
                I want to Buy
              </span>
              <span className="text-[11px] text-zinc-400 leading-tight block mt-0.5">
                Source commodities & goods across Africa
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRole('seller')}
            className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
              role === 'seller'
                ? 'bg-zinc-850 border-emerald-500/80 text-zinc-100 ring-1 ring-emerald-500/40'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className={`p-2 rounded-lg ${role === 'seller' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-900 text-zinc-500'}`}>
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs sm:text-sm font-bold text-zinc-100">
                I want to Sell
              </span>
              <span className="text-[11px] text-zinc-400 leading-tight block mt-0.5">
                Export African products to continental markets
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Google Sign In option */}
      <button
        type="button"
        onClick={() => handleGoogleSignUp(role)}
        disabled={submitting || loading}
        className="w-full py-2.5 px-4 bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-3 transition shadow-xs hover:border-zinc-500 disabled:opacity-50"
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
        Sign up with Google as {role === 'buyer' ? 'Buyer' : 'Seller'}
      </button>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-zinc-800" />
        <span className="text-[11px] font-mono uppercase text-zinc-500 tracking-wider">or register with email</span>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Amina Kimani"
              className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-hidden transition"
            />
            <User className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                placeholder="name@company.com"
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-hidden transition"
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-hidden transition"
              />
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+250 788 123 456"
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-hidden transition"
              />
              <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              African Domicile Country
            </label>
            <div className="relative">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl text-xs sm:text-sm text-zinc-100 outline-hidden transition"
              >
                {AFRICAN_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
              <MapPin className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        {/* Security Disclosure */}
        <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-[11px] text-zinc-400 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-zinc-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>AfCFTA Data Privacy & Security</span>
          </div>
          <p>
            By registering, you agree to our Terms of Service and Privacy Policy. Password credentials are encrypted securely with Firebase Authentication.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting || loading}
          className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-white text-zinc-950 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2"
        >
          {submitting ? (
            <span>Creating account...</span>
          ) : (
            <>
              <span>
                {role === 'seller' ? 'Continue to Business Setup' : 'Complete Buyer Registration'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Login redirect link */}
      <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
        Already have an AfriTrade account?{' '}
        <button
          onClick={() => onNavigate('login')}
          className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 transition"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};
