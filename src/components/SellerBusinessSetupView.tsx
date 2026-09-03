import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AFRICAN_COUNTRIES, CATEGORIES } from '../data/seedData';
import { 
  Store, Building2, Globe, MapPin, Phone, Mail, 
  Upload, ShieldAlert, ArrowRight, CheckCircle2 
} from 'lucide-react';

interface SellerBusinessSetupViewProps {
  onSuccess: () => void;
}

export const SellerBusinessSetupView: React.FC<SellerBusinessSetupViewProps> = ({ onSuccess }) => {
  const { userProfile, completeSellerBusinessSetup } = useAuth();

  const [businessName, setBusinessName] = useState(userProfile?.businessName || '');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]?.name || 'Agriculture & Agro-Processing');
  const [country, setCountry] = useState(userProfile?.country || 'Rwanda');
  const [city, setCity] = useState(userProfile?.city || 'Kigali');
  const [phone, setPhone] = useState(userProfile?.phone || '+250 788 123 456');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [website, setWebsite] = useState('');
  const [logo, setLogo] = useState('https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=400&h=400&q=80');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!businessName.trim() || !description.trim() || !city.trim() || !phone.trim() || !email.trim()) {
      setError('Please fill in all mandatory business fields.');
      return;
    }

    try {
      setSubmitting(true);
      await completeSellerBusinessSetup({
        businessName: businessName.trim(),
        description: description.trim(),
        category,
        country,
        city: city.trim(),
        phone: phone.trim(),
        email: email.trim(),
        website: website.trim(),
        logo
      });
      setSubmitting(false);
      onSuccess();
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : 'Failed to register business entity.');
    }
  };

  return (
    <div className="max-w-2xl w-full mx-auto my-6 p-6 sm:p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl text-zinc-100 font-sans">
      <div className="space-y-2 mb-6 text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-[11px] text-amber-400 font-mono">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Stage 2: Pan-African Enterprise Verification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
          Seller Business Setup
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
          Establish your commercial profile under the AfCFTA framework. Upon submission, your enterprise verification status will be set to <strong className="text-amber-400 font-mono font-semibold">pending</strong> while operations verify your documents.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Registered Enterprise / Company Name *
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Kigali Specialty Agro Exporters Ltd"
              className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-hidden transition"
            />
            <Building2 className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Business Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl text-xs sm:text-sm text-zinc-100 outline-hidden transition"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Business Description & Value Proposition *
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your production capacity, export experience, and commodity standards..."
            className="w-full p-3 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-hidden transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              African Country *
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

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Operating City / Headquarters *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Kigali or Nairobi"
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-hidden transition"
              />
              <MapPin className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Commercial Telephone *
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
              Trade Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trade@company.rw"
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-hidden transition"
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Corporate Website (Optional)
            </label>
            <div className="relative">
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://company.rw"
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-hidden transition"
              />
              <Globe className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Business Logo Image URL
            </label>
            <div className="relative">
              <input
                type="text"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="https://... logo image"
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-hidden transition"
              />
              <Upload className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        {/* Verification Status Notice */}
        <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-300/90 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block text-amber-300">Mandatory Verification Notice:</span>
            Your business will be saved with <span className="font-mono font-bold text-amber-200">verificationStatus: &quot;pending&quot;</span>. It will not display a verified badge until vetted by an administrator.
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-white text-zinc-950 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 mt-4"
        >
          {submitting ? (
            <span>Saving business profile...</span>
          ) : (
            <>
              <span>Complete Setup & Go to Seller Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
