import React, { useState, useMemo } from 'react';
import { 
  Users, Sparkles, ShieldCheck, MapPin, Building2, 
  MessageSquare, Send, CheckCircle2, ArrowRight, Star
} from 'lucide-react';
import { Business, Product, Country, Category } from '../types';

interface MatchingViewProps {
  businesses: Business[];
  products: Product[];
  countries: Country[];
  categories: Category[];
  initialQuery?: string;
  onOpenBusiness: (businessId: string) => void;
  onRequestQuoteBusiness: (business: Business) => void;
  onContactBusiness: (sellerId: string, businessName: string) => void;
}

export const MatchingView: React.FC<MatchingViewProps> = ({
  businesses,
  products,
  countries,
  categories,
  initialQuery = '',
  onOpenBusiness,
  onRequestQuoteBusiness,
  onContactBusiness,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [roleFilter, setRoleFilter] = useState<'all' | 'seller' | 'buyer'>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(true);

  // Compute matches
  const matches = useMemo(() => {
    return businesses.filter((biz) => {
      if (verifiedOnly && biz.verificationStatus !== 'verified') {
        return false;
      }
      if (selectedCountry !== 'all' && biz.country.toLowerCase() !== selectedCountry.toLowerCase()) {
        return false;
      }
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesName = biz.businessName.toLowerCase().includes(q);
        const matchesDesc = biz.description.toLowerCase().includes(q);
        const matchesCat = biz.category.toLowerCase().includes(q);
        const matchesCity = biz.city.toLowerCase().includes(q);
        const matchesCountry = biz.country.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat && !matchesCity && !matchesCountry) {
          return false;
        }
      }
      return true;
    }).map((biz) => {
      // Find products belonging to this business
      const bizProducts = products.filter(p => p.businessId === biz.businessId);
      const matchScore = biz.verificationStatus === 'verified' ? 95 : 82;
      return {
        ...biz,
        products: bizProducts,
        matchScore,
        synergyReason: `Verified cross-border exporter based in ${biz.country} with established logistics in ${biz.category}. Ideal for regional wholesale supply.`
      };
    });
  }, [businesses, products, query, selectedCountry, verifiedOnly]);

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-4 space-y-4 text-zinc-100">
      {/* Header Banner */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 sm:p-6 text-zinc-100">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-emerald-400 text-xs font-mono">
            <Users className="w-3.5 h-3.5" /> B2B Partner Matchmaker
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
            AI Trade Partner Matching
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
            Connect directly with verified African producers, cooperatives, and commercial distributors. Filter by origin corridor and trade verification status.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-3 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[11px] text-zinc-400 mb-1">
              Search Partner Requirements or Commodity
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. coffee distributor, shea butter exporter, textile cooperative..."
              className="w-full p-2 rounded-lg border border-zinc-800 text-xs text-zinc-100 bg-zinc-950 focus:border-zinc-700 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">
              Partner Country
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full p-2 rounded-lg border border-zinc-800 text-xs text-zinc-200 bg-zinc-950 focus:border-zinc-700 focus:outline-hidden"
            >
              <option value="all">All African Countries</option>
              {countries.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded-xs accent-emerald-500 w-3.5 h-3.5"
            />
            <span>Show Only Verified African Enterprises</span>
          </label>

          <span className="text-zinc-500">
            {matches.length} Verified Partners Available
          </span>
        </div>
      </div>

      {/* Matches List */}
      <div className="space-y-3">
        {matches.map((biz) => (
          <div
            key={biz.businessId}
            className="p-4 sm:p-5 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <img
                  src={biz.logo}
                  alt={biz.businessName}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-lg object-cover border border-zinc-800 shrink-0 bg-zinc-950"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-zinc-100">{biz.businessName}</h3>
                    {biz.verificationStatus === 'verified' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-zinc-950 border border-zinc-800 px-1.5 py-0.5 rounded">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 font-mono flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-zinc-500" />
                    {biz.city}, {biz.country} • {biz.yearsInOperation} Yrs Operation
                  </p>
                  <p className="text-xs text-zinc-300 leading-relaxed max-w-2xl pt-0.5">
                    {biz.description}
                  </p>
                </div>
              </div>

              {/* Match Score */}
              <div className="text-right shrink-0">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-emerald-400 text-xs font-mono">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>{biz.matchScore}% Match</span>
                </div>
              </div>
            </div>

            {/* AI Synergy Reasoning */}
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 font-mono flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-400">Match Synergy: </strong>
                <span className="text-zinc-400">{biz.synergyReason}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800 font-mono text-xs">
              <div className="text-[11px] text-zinc-500">
                {biz.products.length} Active Export Catalog Items
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenBusiness(biz.businessId)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-850 text-zinc-300 text-xs transition"
                >
                  View Enterprise
                </button>
                <button
                  onClick={() => onContactBusiness(biz.ownerId, biz.businessName)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Contact Partner
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
