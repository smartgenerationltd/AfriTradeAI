import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AFRICAN_COUNTRIES } from '../data/seedData';
import { 
  User, Mail, Phone, MapPin, ShieldCheck, 
  Store, ShoppingBag, ShieldAlert, CheckCircle2, 
  LogOut, AlertCircle, Save 
} from 'lucide-react';

interface ProfileViewProps {
  onNavigate: (view: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigate }) => {
  const { 
    userProfile, 
    updateUserProfile, 
    signOut, 
    resendVerificationEmail, 
    checkEmailVerificationStatus, 
    verifyEmailNow, 
    emailVerificationSent 
  } = useAuth();

  const [fullName, setFullName] = useState(userProfile?.fullName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [country, setCountry] = useState(userProfile?.country || 'Rwanda');
  const [city, setCity] = useState(userProfile?.city || '');
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!userProfile) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-zinc-900 border border-zinc-800 rounded-xl text-center space-y-4">
        <p className="text-sm text-zinc-400">Please sign in to view your profile.</p>
        <button
          onClick={() => onNavigate('login')}
          className="px-4 py-2 bg-zinc-100 text-zinc-950 text-xs font-semibold rounded-lg"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavedSuccess(false);

    try {
      setSaving(true);
      await updateUserProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        country,
        city: city.trim(),
        photoURL: photoURL.trim() || undefined
      });
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : 'Could not update profile.');
    }
  };

  return (
    <div className="max-w-3xl w-full mx-auto my-6 p-6 sm:p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl text-zinc-100 font-sans space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
            {userProfile.photoURL ? (
              <img 
                src={userProfile.photoURL} 
                alt={userProfile.fullName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-7 h-7 text-zinc-400" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {userProfile.fullName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase font-semibold ${
                userProfile.role === 'admin' 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : userProfile.role === 'seller'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}>
                {userProfile.role === 'admin' ? '🛡️ Administrator' : userProfile.role === 'seller' ? '🏪 African Exporter' : '🛍️ Commercial Buyer'}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-xs text-zinc-400">{userProfile.email}</span>
            </div>
          </div>
        </div>

        <button
          onClick={async () => {
            await signOut();
            onNavigate('login');
          }}
          className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-red-400 hover:text-red-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Email Verification Banner */}
      {!userProfile.emailVerified && (
        <div className="p-4 bg-zinc-950 border border-amber-900/40 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-300">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold block text-amber-200">Email Verification Recommended</span>
              Verify your email address for secure AfCFTA customs declarations.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resendVerificationEmail}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold rounded-lg transition shrink-0 cursor-pointer"
            >
              {emailVerificationSent ? 'Verification Email Sent!' : 'Resend Verification'}
            </button>
            <button
              type="button"
              onClick={async () => {
                await checkEmailVerificationStatus();
              }}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-lg transition shrink-0 cursor-pointer"
            >
              Check Status
            </button>
            <button
              type="button"
              onClick={async () => {
                await verifyEmailNow();
              }}
              className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold rounded-lg transition shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verify Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Seller Verification Notice */}
      {userProfile.role === 'seller' && (
        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Store className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-zinc-200 block">
                {userProfile.businessName || 'Business Profile'}
              </span>
              <span className="text-zinc-400">
                Enterprise status:{' '}
                <strong className="text-amber-400 font-mono">Pending Operations Audit</strong>
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('seller-business-setup')}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-lg transition"
          >
            Edit Business Info
          </button>
        </div>
      )}

      {/* Feedback alerts */}
      {savedSuccess && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Profile changes saved successfully.</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Edit Form */}
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Full Legal / Trade Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl text-xs sm:text-sm text-zinc-100 outline-hidden transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Email Address (Account ID)
              </label>
              {userProfile.emailVerified ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => verifyEmailNow()}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-mono transition cursor-pointer flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verify Now</span>
                </button>
              )}
            </div>
            <input
              type="email"
              disabled
              value={userProfile.email}
              className="w-full px-3 py-2 bg-zinc-950/60 border border-zinc-800/60 rounded-xl text-xs sm:text-sm text-zinc-400 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Telephone Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl text-xs sm:text-sm text-zinc-100 outline-hidden transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              African Domicile Country
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl text-xs sm:text-sm text-zinc-100 outline-hidden transition"
            >
              {AFRICAN_COUNTRIES.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              City / Municipality
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Kigali, Nairobi, Accra"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl text-xs sm:text-sm text-zinc-100 outline-hidden transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Profile Photo URL
            </label>
            <input
              type="url"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl text-xs sm:text-sm text-zinc-100 outline-hidden transition"
            />
          </div>
        </div>

        {/* Security Rule Guard Reminder: User cannot modify role */}
        <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-[11px] text-zinc-400 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-zinc-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Role-Based Access Control Protected</span>
          </div>
          <p>
            Your account role is currently assigned as <strong className="text-zinc-200">{userProfile.role}</strong>. In accordance with platform security protocols, users cannot elevate their own role privileges.
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
