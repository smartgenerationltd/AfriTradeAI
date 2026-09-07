import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AFRICAN_COUNTRIES } from '../data/seedData';
import { 
  User, Mail, Phone, MapPin, Globe, ShieldCheck, 
  ArrowRight, ShoppingCart, Store, AlertCircle, CheckCircle2, RefreshCw 
} from 'lucide-react';

interface CompleteProfileViewProps {
  onSuccess: (role: 'buyer' | 'seller') => void;
}

export const CompleteProfileView: React.FC<CompleteProfileViewProps> = ({ onSuccess }) => {
  const { 
    user, 
    userProfile, 
    completeUserProfile, 
    resendVerificationEmail, 
    checkEmailVerificationStatus, 
    verifyEmailNow, 
    error: authError, 
    clearError 
  } = useAuth();

  const [fullName, setFullName] = useState(userProfile?.fullName || user?.displayName || '');
  const [email, setEmail] = useState(userProfile?.email || user?.email || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [country, setCountry] = useState(userProfile?.country || 'Rwanda');
  const [city, setCity] = useState(userProfile?.city || '');
  const [role, setRole] = useState<'buyer' | 'seller'>((userProfile?.role === 'seller' ? 'seller' : 'buyer'));
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const [verificationFeedback, setVerificationFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [verifyingAction, setVerifyingAction] = useState(false);

  const isEmailVerified = Boolean(user?.emailVerified || userProfile?.emailVerified);

  useEffect(() => {
    if (userProfile?.fullName && !fullName) {
      setFullName(userProfile.fullName);
    }
    if ((userProfile?.email || user?.email) && !email) {
      setEmail(userProfile?.email || user?.email || '');
    }
    if (userProfile?.country && !country) {
      setCountry(userProfile.country);
    }
  }, [userProfile, user]);

  const handleResendVerification = async () => {
    setVerifyingAction(true);
    setVerificationFeedback(null);
    try {
      await resendVerificationEmail();
      setVerificationFeedback({
        type: 'info',
        message: `Verification link sent to ${email || 'your email'}! Please check your inbox or spam folder.`
      });
    } catch (err) {
      setVerificationFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Unable to send verification email.'
      });
    } finally {
      setVerifyingAction(false);
    }
  };

  const handleCheckVerification = async () => {
    setVerifyingAction(true);
    setVerificationFeedback(null);
    try {
      const verified = await checkEmailVerificationStatus();
      if (verified) {
        setVerificationFeedback({
          type: 'success',
          message: 'Your email address is verified!'
        });
      } else {
        setVerificationFeedback({
          type: 'info',
          message: 'Verification check pending. If you just clicked the link in your email, please try again or click "Verify Now".'
        });
      }
    } catch (err) {
      setVerificationFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Unable to check verification status.'
      });
    } finally {
      setVerifyingAction(false);
    }
  };

  const handleVerifyNow = async () => {
    setVerifyingAction(true);
    setVerificationFeedback(null);
    try {
      await verifyEmailNow();
      setVerificationFeedback({
        type: 'success',
        message: 'Email verified successfully! Your trader credentials are active.'
      });
    } catch (err) {
      setVerificationFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to verify email.'
      });
    } finally {
      setVerifyingAction(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!fullName.trim()) {
      setLocalError('Please provide your legal full name.');
      return;
    }
    if (!email.trim()) {
      setLocalError('Please provide a valid email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setLocalError('Please enter a valid email format (e.g. name@domain.com).');
      return;
    }
    if (!phone.trim()) {
      setLocalError('Please provide your active telephone number for cross-border verification.');
      return;
    }
    if (!country.trim()) {
      setLocalError('Please select your primary country of operation.');
      return;
    }
    if (!city.trim()) {
      setLocalError('Please specify your commercial operating city.');
      return;
    }

    try {
      setSubmitting(true);
      await completeUserProfile({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        country: country.trim(),
        city: city.trim(),
        role
      });
      setSubmitting(false);
      onSuccess(role);
    } catch (err) {
      setSubmitting(false);
      setLocalError(err instanceof Error ? err.message : 'Failed to save trader profile.');
    }
  };

  return (
    <div className="max-w-2xl w-full mx-auto my-6 p-6 sm:p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl text-zinc-100 font-sans">
      <div className="space-y-2 mb-6 text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[11px] text-emerald-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Mandatory Identification (AfCFTA Compliance)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
          Complete Your Trader Identity
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
          Please complete your profile before continuing. To maintain fraud-free Pan-African cross-border commerce, verified contact and jurisdiction details are required for all platform participants.
        </p>
      </div>

      {(localError || authError) && (
        <div className="mb-5 p-3.5 bg-red-950/40 border border-red-800/60 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{localError || authError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label htmlFor="trader-identity-fullname" className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Full Legal Name *
          </label>
          <div className="relative">
            <input
              id="trader-identity-fullname"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Amina Kimani or Jean-Paul Ngarambe"
              className="w-full pl-9 pr-3 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-hidden transition"
            />
            <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
          </div>
        </div>

        {/* Email Address (Active, editable, with real-time verification controls) */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
            <label htmlFor="trader-identity-email" className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <span>Email Address *</span>
              {isEmailVerified ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[10px] text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-[10px] text-amber-400 font-mono">
                  <AlertCircle className="w-3 h-3" />
                  Unverified
                </span>
              )}
            </label>

            <div className="flex items-center gap-2">
              {!isEmailVerified && (
                <>
                  <button
                    type="button"
                    id="resend-verification-btn"
                    onClick={handleResendVerification}
                    disabled={verifyingAction}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-medium transition cursor-pointer disabled:opacity-50"
                  >
                    Send Link
                  </button>
                  <span className="text-zinc-600 text-xs">|</span>
                  <button
                    type="button"
                    id="check-verification-btn"
                    onClick={handleCheckVerification}
                    disabled={verifyingAction}
                    className="text-[11px] text-zinc-400 hover:text-zinc-200 transition cursor-pointer disabled:opacity-50 flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${verifyingAction ? 'animate-spin' : ''}`} />
                    <span>Check</span>
                  </button>
                  <span className="text-zinc-600 text-xs">|</span>
                  <button
                    type="button"
                    id="instant-verify-btn"
                    onClick={handleVerifyNow}
                    disabled={verifyingAction}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verify Now</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="relative">
            <input
              id="trader-identity-email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (verificationFeedback) setVerificationFeedback(null);
              }}
              placeholder="e.g. name@domain.com"
              className="w-full pl-9 pr-24 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-hidden transition"
            />
            <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
            {isEmailVerified && (
              <div className="absolute right-3 top-2.5 flex items-center gap-1 text-emerald-400 text-xs font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified</span>
              </div>
            )}
          </div>

          {verificationFeedback && (
            <p className={`mt-1.5 text-[11px] font-medium flex items-center gap-1.5 ${
              verificationFeedback.type === 'success' ? 'text-emerald-400' :
              verificationFeedback.type === 'error' ? 'text-red-400' : 'text-amber-400'
            }`}>
              {verificationFeedback.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
              <span>{verificationFeedback.message}</span>
            </p>
          )}

          <p className="mt-1 text-[11px] text-zinc-500">
            Official trade notices, digital invoices, and AfCFTA customs documents will be dispatched to this email.
          </p>
        </div>

        {/* Phone Number */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="trader-identity-phone" className="text-xs font-semibold text-zinc-300">
              Phone Number (with Country Dial Code) *
            </label>
            <span className="text-[11px] text-amber-400 font-mono">
              Phone verification pending
            </span>
          </div>
          <div className="relative">
            <input
              id="trader-identity-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+250 788 123 456 or +254 722 888 777"
              className="w-full pl-9 pr-3 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-hidden transition"
            />
            <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">
            Used for delivery tracking, customs dispatch SMS alerts, and secure trade communications.
          </p>
        </div>

        {/* Country & City Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="trader-identity-country" className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Country of Residence / Operation *
            </label>
            <div className="relative">
              <select
                id="trader-identity-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl text-xs sm:text-sm text-zinc-100 outline-hidden transition appearance-none"
              >
                {AFRICAN_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name} className="bg-zinc-900 text-zinc-100">
                    {c.flag} {c.name} ({c.region})
                  </option>
                ))}
              </select>
              <Globe className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label htmlFor="trader-identity-city" className="block text-xs font-semibold text-zinc-300 mb-1.5">
              City / Commercial Hub *
            </label>
            <div className="relative">
              <input
                id="trader-identity-city"
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Kigali, Nairobi, Lagos, Accra"
                className="w-full pl-9 pr-3 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-hidden transition"
              />
              <MapPin className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            </div>
          </div>
        </div>

        {/* Account Type Selection (Buyer vs Seller) */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-2">
            Select Your Primary Account Role *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              id="role-select-buyer"
              onClick={() => setRole('buyer')}
              className={`p-4 rounded-xl border text-left flex items-start gap-3.5 transition cursor-pointer ${
                role === 'buyer'
                  ? 'bg-emerald-950/40 border-emerald-500/80 text-white shadow-xs'
                  : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-400'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${role === 'buyer' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs sm:text-sm text-zinc-200">I want to Buy</span>
                  {role === 'buyer' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Source African agricultural commodities, manufactured goods, and raw materials with AfCFTA duty relief.
                </p>
              </div>
            </button>

            <button
              type="button"
              id="role-select-seller"
              onClick={() => setRole('seller')}
              className={`p-4 rounded-xl border text-left flex items-start gap-3.5 transition cursor-pointer ${
                role === 'seller'
                  ? 'bg-amber-950/40 border-amber-500/80 text-white shadow-xs'
                  : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-400'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${role === 'seller' ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-500'}`}>
                <Store className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs sm:text-sm text-zinc-200">I want to Sell</span>
                  {role === 'seller' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Export African products continent-wide, list wholesale inventory, and tender for cross-border contracts.
                </p>
              </div>
            </button>
          </div>
          <p className="mt-2 text-[11px] text-zinc-500">
            {role === 'seller' 
              ? 'Selecting "I want to Sell" will next guide you through registering your business legal entity.' 
              : 'Selecting "I want to Buy" grants immediate access to the verified Pan-African marketplace.'}
          </p>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          id="complete-profile-submit-btn"
          disabled={submitting}
          className="w-full py-3 px-4 bg-zinc-100 hover:bg-white text-zinc-950 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50 cursor-pointer"
        >
          <span>{submitting ? 'Saving Trader Profile...' : 'Save & Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

