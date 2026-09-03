import React, { useState } from 'react';
import { X, Globe, ShieldCheck, UserCheck, Sparkles, Building2 } from 'lucide-react';
import { Country, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  countries: Country[];
  onSignIn: (userData: {
    fullName: string;
    email: string;
    country: string;
    city: string;
    role: UserRole;
    phone: string;
    businessName?: string;
  }) => void;
  onSelectPresetRole: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  countries,
  onSignIn,
  onSelectPresetRole,
}) => {
  if (!isOpen) return null;

  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<UserRole>('buyer');
  const [fullName, setFullName] = useState('Amina Mwangi');
  const [email, setEmail] = useState('amina@nairobidistributors.co.ke');
  const [country, setCountry] = useState('Kenya');
  const [city, setCity] = useState('Nairobi');
  const [phone, setPhone] = useState('+254 712 345 678');
  const [businessName, setBusinessName] = useState('Nairobi Regional Distribution Hub');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignIn({
      fullName,
      email,
      country,
      city,
      role,
      phone,
      businessName: role === 'seller' ? businessName : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-zinc-900 rounded-xl max-w-md w-full p-5 sm:p-6 border border-zinc-800 relative space-y-4 text-zinc-100 font-mono text-xs shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            Continental Access
          </span>
          <h2 className="text-base sm:text-lg font-bold text-zinc-100">
            {isRegister ? 'Join AfriTrade AI' : 'Sign In to AfriTrade AI'}
          </h2>
          <p className="text-[11px] text-zinc-400">
            Access pan-African trading corridors, verified MSME partners, and the AI trade consultant.
          </p>
        </div>

        {/* 1-Click Demo Personas */}
        <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
          <span className="text-[10px] uppercase font-semibold text-zinc-400 block">
            1-Click Evaluation Personas:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                onSelectPresetRole('buyer');
                onClose();
              }}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-center transition"
            >
              <span className="text-xs font-semibold text-zinc-200 block">🇰🇪 Buyer</span>
              <span className="text-[10px] text-zinc-500">Amina (NBO)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectPresetRole('seller');
                onClose();
              }}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-center transition"
            >
              <span className="text-xs font-semibold text-zinc-200 block">🇷🇼 Seller</span>
              <span className="text-[10px] text-zinc-500">Jean-Paul</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectPresetRole('admin');
                onClose();
              }}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 text-center transition"
            >
              <span className="text-xs font-semibold text-amber-400 block">🛡️ Admin</span>
              <span className="text-[10px] text-zinc-500">David (Ops)</span>
            </button>
          </div>
        </div>

        {/* Manual Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 pb-1">
            <button
              type="button"
              onClick={() => { setRole('buyer'); setFullName('Amina Mwangi'); }}
              className={`p-2 rounded-lg border text-center transition font-semibold ${
                role === 'buyer' ? 'border-zinc-100 bg-zinc-850 text-zinc-100' : 'border-zinc-800 bg-zinc-950 text-zinc-400'
              }`}
            >
              Buyer / Distributor
            </button>

            <button
              type="button"
              onClick={() => { setRole('seller'); setFullName('Jean-Paul Habimana'); }}
              className={`p-2 rounded-lg border text-center transition font-semibold ${
                role === 'seller' ? 'border-zinc-100 bg-zinc-850 text-zinc-100' : 'border-zinc-800 bg-zinc-950 text-zinc-400'
              }`}
            >
              African Producer / Seller
            </button>
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100"
            />
          </div>

          {role === 'seller' && (
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">African Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-3 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition mt-2"
          >
            Continue as {role === 'buyer' ? 'Commercial Buyer' : 'African Exporter'}
          </button>
        </form>
      </div>
    </div>
  );
};
