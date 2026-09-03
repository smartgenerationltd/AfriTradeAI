import React from 'react';
import { Globe, ShieldCheck, Cpu, ArrowUpRight, CheckCircle2, TrendingUp } from 'lucide-react';

interface AboutViewProps {
  onNavigate: (view: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 font-sans text-zinc-100">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-mono text-zinc-400">
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>Pan-African Trade Matrix & AfCFTA Corridor</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
          About AfriTrade AI
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Empowering cross-border African commerce through artificial intelligence, AfCFTA tariff compliance, and verified enterprise trust.
        </p>
      </div>

      {/* Mission cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            01
          </div>
          <h3 className="text-base font-bold text-zinc-100">AfCFTA Integration</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Real-time tariff liberalization calculations across 54 African Union signatories, enabling duty reductions on eligible goods.
          </p>
        </div>

        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            02
          </div>
          <h3 className="text-base font-bold text-zinc-100">Verified MSMEs</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Strict enterprise verification audits eliminate counterparty fraud, ensuring genuine agricultural cooperatives and manufacturers.
          </p>
        </div>

        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            03
          </div>
          <h3 className="text-base font-bold text-zinc-100">Intelligent Logistics</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Corridor routing through Northern and Central corridors, Mombasa, Dar es Salaam, and Walvis Bay with automatic trade documents.
          </p>
        </div>
      </div>

      {/* Narrative Section */}
      <div className="p-6 sm:p-8 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
        <h2 className="text-lg font-bold text-white">Our Vision for African Trade</h2>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          Intra-African trade currently accounts for less than 18% of the continent&apos;s total commerce, compared to over 60% in Europe and 50% in Asia. The African Continental Free Trade Area (AfCFTA) creates the largest free trade area in the world by number of countries. AfriTrade AI provides the digital infrastructure needed to turn this historic treaty into daily commercial transactions.
        </p>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Whether you are a Kenyan supermarket chain seeking Rwandan specialty Arabica coffee, or a Nigerian textile brand sourcing Ghanaian shea butter, AfriTrade AI automates customs compliance, tariff comparison, and secure B2B tendering.
        </p>

        <div className="pt-4 flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('register')}
            className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold rounded-lg transition"
          >
            Create Your Account
          </button>
          <button
            onClick={() => onNavigate('how-it-works')}
            className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg transition"
          >
            See How It Works
          </button>
        </div>
      </div>
    </div>
  );
};
