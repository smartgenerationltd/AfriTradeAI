import React, { useState } from 'react';
import { 
  Search, Sparkles, ArrowRight, ShieldCheck, TrendingUp, 
  Globe2, Building2, Package, CheckCircle, Award, 
  MapPin, ChevronRight, Zap, Coffee, Sprout, 
  Shirt, Sparkle, HeartHandshake, Compass
} from 'lucide-react';
import { Product, Business, Country, Category } from '../types';
import { formatMoney } from '../services/currency';

interface HomeViewProps {
  products: Product[];
  businesses: Business[];
  countries: Country[];
  categories: Category[];
  currentCurrency: string;
  onExploreMarketplace: (search?: string, categoryId?: string, countryName?: string) => void;
  onOpenProduct: (productId: string) => void;
  onOpenBusiness: (businessId: string) => void;
  onLaunchAiTrade: (samplePrompt?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  businesses,
  countries,
  categories,
  currentCurrency,
  onExploreMarketplace,
  onOpenProduct,
  onOpenBusiness,
  onLaunchAiTrade,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedRegionCountry, setSelectedRegionCountry] = useState<string>('All');

  const featuredProducts = products.filter(p => p.status === 'published').slice(0, 6);
  const verifiedBusinesses = businesses.filter(b => b.verificationStatus === 'verified').slice(0, 4);

  const keyMarkets = [
    { name: 'Rwanda', flag: '🇷🇼', specialty: 'Bourbon Arabica Coffee, Mountain Tea, Agaseke Baskets, Chili Oil' },
    { name: 'Kenya', flag: '🇰🇪', specialty: 'Macadamia Nuts, Purple Tea, Avocado, Coastal Spices' },
    { name: 'Uganda', flag: '🇺🇬', specialty: 'Nilotica Shea Butter, Dried Mango, Robusta Coffee' },
    { name: 'Tanzania', flag: '🇹🇿', specialty: 'Kilimanjaro Peaberry, Zanzibar Cloves, Raw Cashew' },
    { name: 'Nigeria', flag: '🇳🇬', specialty: 'Main Crop Cocoa, Zobo Hibiscus, Aso-Oke Handwovens' },
    { name: 'Ghana', flag: '🇬🇭', specialty: 'Artisanal Chocolate, Cocoa Butter, Handwoven Kente' },
    { name: 'South Africa', flag: '🇿🇦', specialty: 'Organic Rooibos, Marula Kernel Oil, Citrus' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExploreMarketplace(searchInput.trim());
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-100 p-6 sm:p-10 my-2">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>AfCFTA Cross-Border Trade Terminal • 54 Nations Protocol</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-100 font-display">
            Trade Africa. <span className="text-emerald-400">Grow Africa.</span>
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
            High-density cross-border trading platform linking verified African producers, wholesale buyers, and AfCFTA trade corridor intelligence.
          </p>

          {/* Search Input Box */}
          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto pt-1">
            <div className="bg-zinc-900 rounded-xl p-1 shadow-inner border border-zinc-800 flex items-center gap-2 text-zinc-100 focus-within:border-zinc-700 transition">
              <Search className="w-4 h-4 text-zinc-500 ml-2.5 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search commodities, origins, HS codes, verified sellers..."
                className="w-full bg-transparent border-0 py-2 px-1 text-xs sm:text-sm font-normal text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden"
              />
              <button
                type="submit"
                className="bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs px-4 py-2 rounded-lg transition shrink-0"
              >
                Search
              </button>
            </div>
          </form>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <button
              onClick={() => onExploreMarketplace()}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition flex items-center gap-1.5"
            >
              Explore Catalog ({products.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onLaunchAiTrade('I want to export coffee from Rwanda to Kenya.')}
              className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-xs transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              AI Trade Consultant
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-6 border-t border-zinc-800/80 text-left font-mono">
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
              <p className="text-xl font-bold text-emerald-400">35+</p>
              <p className="text-[11px] text-zinc-400">Nations Active</p>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
              <p className="text-xl font-bold text-zinc-200">100%</p>
              <p className="text-[11px] text-zinc-400">Verified Origin</p>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
              <p className="text-xl font-bold text-amber-400">0–5%</p>
              <p className="text-[11px] text-zinc-400">AfCFTA Tariffs</p>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
              <p className="text-xl font-bold text-teal-400">24/7</p>
              <p className="text-[11px] text-zinc-400">Logistics Copilot</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EXPLORE AFRICAN MARKETS (Requirement 8 & 30) */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1">
          <div>
            <span className="text-emerald-400 font-mono text-[11px] uppercase tracking-wider">Regional Trade Corridors</span>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Explore African Markets
            </h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-md">
            Tap trading hubs to view origin-certified producers and transit routes under AfCFTA.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
          {keyMarkets.map((market) => (
            <button
              key={market.name}
              onClick={() => onExploreMarketplace('', undefined, market.name)}
              className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-850 hover:border-zinc-700 transition text-left group flex flex-col justify-between"
            >
              <div>
                <div className="text-2xl mb-1.5">{market.flag}</div>
                <h3 className="font-semibold text-xs text-zinc-100 group-hover:text-emerald-400 transition">
                  {market.name}
                </h3>
                <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
                  {market.specialty}
                </p>
              </div>
              <div className="mt-2.5 pt-1.5 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-emerald-400">
                <span>View Products</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. POPULAR CATEGORIES */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-emerald-400 font-mono text-[11px] uppercase tracking-wider">Commodities & Goods</span>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Popular Categories
            </h2>
          </div>
          <button
            onClick={() => onExploreMarketplace()}
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono"
          >
            All Categories <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {categories.slice(0, 12).map((cat) => (
            <button
              key={cat.id}
              onClick={() => onExploreMarketplace('', cat.id)}
              className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-850 hover:border-zinc-700 transition text-left group"
            >
              <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center font-bold text-xs mb-2 group-hover:text-emerald-400 transition">
                {cat.name.charAt(0)}
              </div>
              <h3 className="font-semibold text-xs text-zinc-100 leading-tight">
                {cat.name}
              </h3>
              <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                {cat.productCount}+ Listings
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS GRID */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1">
          <div>
            <span className="text-emerald-400 font-mono text-[11px] uppercase tracking-wider">Direct From African MSMEs</span>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Featured Verified Products
            </h2>
          </div>
          <button
            onClick={() => onExploreMarketplace()}
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono"
          >
            Explore All ({products.length}) <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition group flex flex-col"
            >
              {/* Product Image */}
              <div 
                onClick={() => onOpenProduct(product.id)}
                className="relative h-44 bg-zinc-950 overflow-hidden cursor-pointer"
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute top-2 left-2 bg-zinc-950/80 backdrop-blur-xs text-zinc-200 text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-800 flex items-center gap-1">
                  <span>📍 {product.country}</span>
                </div>
                <div className="absolute top-2 right-2 bg-zinc-900/90 text-emerald-400 border border-emerald-900/80 text-[10px] font-mono font-medium px-2 py-0.5 rounded">
                  {product.categoryName}
                </div>
              </div>

              {/* Product Content */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1">
                    <span className="font-medium text-zinc-300 truncate">{product.businessName}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </div>

                  <h3 
                    onClick={() => onOpenProduct(product.id)}
                    className="font-semibold text-zinc-100 text-sm leading-snug line-clamp-2 hover:text-emerald-400 cursor-pointer"
                  >
                    {product.name}
                  </h3>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-end justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-mono text-zinc-500">Indicative Price</span>
                    <p className="text-sm font-bold text-zinc-100 font-mono">
                      {formatMoney(product.price, currentCurrency)} <span className="text-xs font-normal text-zinc-400">/ {product.unit}</span>
                    </p>
                    <p className="text-[10px] font-mono text-zinc-500">
                      MOQ: {product.minimumOrderQuantity} {product.unit}
                    </p>
                  </div>

                  <button
                    onClick={() => onOpenProduct(product.id)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-medium border border-zinc-700/80 transition"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. AI TRADE ASSISTANT TEASER */}
      <section>
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-8 text-zinc-100 relative overflow-hidden">
          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-emerald-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" /> High Density Trade Matrix
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100 font-display">
              Navigate African Cross-Border Trade with AI
            </h2>

            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Exporting coffee from Rwanda to Kenya? Sending shea butter from Uganda to Ghana? Simulate corridor logistics, required phytosanitary & origin certificates, and indicative AfCFTA duty schedules.
            </p>

            {/* Quick Interactive Prompt Chips */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Quick Inquiries:</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => onLaunchAiTrade('I want to export Bourbon coffee from Rwanda to Kenya. What are the steps, documents, and transit corridors?')}
                  className="text-left bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-md font-mono text-[11px] transition"
                >
                  "Export Bourbon coffee Rwanda → Kenya"
                </button>
                <button
                  onClick={() => onLaunchAiTrade('What are the packaging standards and phyto requirements for dried mangoes from Uganda to Ghana?')}
                  className="text-left bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-md font-mono text-[11px] transition"
                >
                  "Ugandan dried mangoes standards for Ghana"
                </button>
                <button
                  onClick={() => onLaunchAiTrade('How do Rules of Origin work under AfCFTA for handwoven textile goods?')}
                  className="text-left bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-md font-mono text-[11px] transition"
                >
                  "AfCFTA Rules of Origin for textiles"
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onLaunchAiTrade()}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
              >
                Launch Trade Copilot
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. VERIFIED AFRICAN BUSINESSES */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-emerald-400 font-mono text-[11px] uppercase tracking-wider">Trust & Verification</span>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Verified African Enterprises
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {verifiedBusinesses.map((biz) => (
            <div
              key={biz.businessId}
              className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/90 hover:border-zinc-700 transition flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start gap-3">
                <img
                  src={biz.logo}
                  alt={biz.businessName}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-lg object-cover border border-zinc-800 shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-semibold text-xs text-zinc-100 truncate">{biz.businessName}</h3>
                  <p className="text-[11px] text-zinc-400 font-mono">📍 {biz.city}, {biz.country}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono mt-1 bg-emerald-950/60 border border-emerald-900/60 px-1.5 py-0.5 rounded">
                    <ShieldCheck className="w-3 h-3" /> Verified Origin
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                {biz.description}
              </p>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500 text-[11px]">{biz.yearsInOperation} yrs in trade</span>
                <button
                  onClick={() => onOpenBusiness(biz.businessId)}
                  className="font-medium text-emerald-400 hover:text-emerald-300"
                >
                  View Profile →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. HOW IT WORKS (Requirement 30) */}
      <section className="space-y-3">
        <div className="text-center max-w-xl mx-auto mb-6">
          <span className="text-emerald-400 font-mono text-[11px] uppercase tracking-wider">Protocol Pipeline</span>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
            How AfriTrade Works
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Built for African MSMEs to transition from local domestic selling to cross-border export.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
            <span className="w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">1</span>
            <h3 className="font-semibold text-xs text-zinc-100">Enterprise Registry</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">Register enterprise, verify tax IDs and origin credentials.</p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
            <span className="w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">2</span>
            <h3 className="font-semibold text-xs text-zinc-100">Publish Catalog</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">Showcase origin-certified coffee, textiles, tea, and cosmetics.</p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
            <span className="w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">3</span>
            <h3 className="font-semibold text-xs text-zinc-100">B2B Matchmaking</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">Connect directly with vetted cross-border wholesale buyers.</p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
            <span className="w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">4</span>
            <h3 className="font-semibold text-xs text-zinc-100">AfCFTA Copilot</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">Audit customs papers, HS codes, and preferential tariff schedules.</p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
            <span className="w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">5</span>
            <h3 className="font-semibold text-xs text-zinc-100">Escrow & Settlement</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">Milestone-based trade settlement and multi-currency payouts.</p>
          </div>
        </div>
      </section>

      {/* 8. AFCFTA POSITIONING & MISSION */}
      <section>
        <div className="bg-zinc-950 text-zinc-100 rounded-2xl p-6 sm:p-8 border border-zinc-800">
          <div className="max-w-3xl space-y-2.5">
            <span className="text-emerald-400 font-mono text-[11px] uppercase tracking-wider">AfCFTA Alignment Matrix</span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-display">
              More Markets. More Customers. More African Trade.
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              AfriTrade AI accelerates intra-African commerce under the African Continental Free Trade Area framework by removing non-tariff information hurdles and linking cross-border MSMEs across 54 signatory states.
            </p>
            <p className="text-[11px] text-zinc-500 font-mono pt-1">
              Independent trade enablement technology matrix supporting intra-African commerce.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
