import React, { useState } from 'react';
import { 
  Compass, Sparkles, TrendingUp, MapPin, Truck, 
  ShieldCheck, AlertCircle, ArrowRight, RefreshCw, CheckCircle2 
} from 'lucide-react';
import { Country, Category } from '../types';

interface MarketDiscoveryViewProps {
  countries: Country[];
  categories: Category[];
  onLaunchAssistantWithMarket: (product: string, origin: string, destination: string) => void;
}

export const MarketDiscoveryView: React.FC<MarketDiscoveryViewProps> = ({
  countries,
  categories,
  onLaunchAssistantWithMarket,
}) => {
  const [productName, setProductName] = useState('Organic Bourbon Arabica Coffee');
  const [originCountry, setOriginCountry] = useState('Rwanda');
  const [selectedCategory, setSelectedCategory] = useState('cat-1');
  const [quantity, setQuantity] = useState('5,000 kg container load');
  const [priceTarget, setPriceTarget] = useState('$6.50 / kg FOB');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any | null>(null);

  const handleDiscover = async () => {
    if (!productName.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/ai/market-discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          originCountry,
          category: selectedCategory,
          quantity,
          priceTarget
        })
      });

      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-4 space-y-4 text-zinc-100">
      {/* Header Banner */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 sm:p-6 text-zinc-100">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-emerald-400 text-xs font-mono">
            <Compass className="w-3.5 h-3.5" /> Market Expansion Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
            AI Market Discovery
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
            Uncover which African markets hold the strongest demand, lowest tariff barriers, and highest commercial viability for your specific commodity or manufactured product.
          </p>
        </div>
      </div>

      {/* Discovery Form Card */}
      <div className="bg-zinc-900 rounded-xl p-4 sm:p-5 border border-zinc-800 space-y-4 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2">
            <label className="block text-[11px] text-zinc-400 mb-1">
              Your Product or Export Commodity
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Pure Shea Butter, Agaseke Baskets, Kilimanjaro Coffee"
              className="w-full p-2 rounded-lg border border-zinc-800 text-xs text-zinc-100 bg-zinc-950 focus:border-zinc-700 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">
              Country of Origin
            </label>
            <select
              value={originCountry}
              onChange={(e) => setOriginCountry(e.target.value)}
              className="w-full p-2 rounded-lg border border-zinc-800 text-xs text-zinc-200 bg-zinc-950 focus:border-zinc-700 focus:outline-hidden"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">
              Product Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 rounded-lg border border-zinc-800 text-xs text-zinc-200 bg-zinc-950 focus:border-zinc-700 focus:outline-hidden"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">
              Estimated Shipment Volume
            </label>
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 1,000 kg, 500 units"
              className="w-full p-2 rounded-lg border border-zinc-800 text-xs text-zinc-100 bg-zinc-950 focus:border-zinc-700 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">
              Target Price / Unit
            </label>
            <input
              type="text"
              value={priceTarget}
              onChange={(e) => setPriceTarget(e.target.value)}
              placeholder="e.g. $5.00 / kg, $20 / piece"
              className="w-full p-2 rounded-lg border border-zinc-800 text-xs text-zinc-100 bg-zinc-950 focus:border-zinc-700 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleDiscover}
            disabled={loading || !productName.trim()}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-semibold text-xs transition flex items-center gap-1.5"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Scanning African Trade Markets...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Discover Top Regional Markets
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Display */}
      {results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-100">
              Top Destination Markets for {results.productName}
            </h2>
            <span className="text-xs font-mono text-zinc-400">Origin: {results.originCountry}</span>
          </div>

          {/* Strategic Advice Callout */}
          {results.strategicAdvice && (
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs leading-relaxed font-mono">
              <strong className="text-emerald-400 block mb-1">Export Strategy Recommendation:</strong>
              {results.strategicAdvice}
            </div>
          )}

          {/* Market Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {results.targetMarkets?.map((market: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-zinc-800 bg-zinc-900 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5 font-mono">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                      <span>📍 {market.country}</span>
                    </h3>

                    {/* Opportunity Score Pill */}
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-emerald-400 text-xs">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      <span>{market.opportunityScore}/100 Match</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    {market.demandOverview}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-zinc-800 text-xs">
                    <div>
                      <span className="text-zinc-500 block text-[11px]">Buyers & Channels:</span>
                      <p className="text-zinc-300">{market.potentialBuyers}</p>
                    </div>

                    <div>
                      <span className="text-zinc-500 block text-[11px]">Logistics & Corridors:</span>
                      <p className="text-zinc-300">{market.logisticsConsiderations}</p>
                    </div>

                    <div>
                      <span className="text-zinc-500 block text-[11px]">AfCFTA & Regional Tariffs:</span>
                      <p className="text-emerald-400">{market.tariffNotes}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800 space-y-2 font-mono">
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300">
                    <span className="text-zinc-500 block mb-0.5">Recommended First Step:</span>
                    {market.recommendedFirstStep}
                  </div>

                  <button
                    onClick={() => onLaunchAssistantWithMarket(results.productName, results.originCountry, market.country)}
                    className="w-full py-1.5 px-3 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <span>Consult AI on {market.country} Route</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Strategic Questions to Investigate */}
          {results.keyQuestionsToInvestigate && results.keyQuestionsToInvestigate.length > 0 && (
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
              <h4 className="font-mono text-xs uppercase tracking-wider text-zinc-400">
                Key Strategic Questions to Investigate
              </h4>
              <ul className="space-y-1 text-xs text-zinc-300 font-mono">
                {results.keyQuestionsToInvestigate.map((q: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-[11px] font-mono text-zinc-500 italic text-center">
            {results.disclaimer || 'AI-generated trade insights are for market exploration and strategic planning. Verify current tariffs and customs procedures with national trade ministries.'}
          </p>
        </div>
      )}
    </div>
  );
};
