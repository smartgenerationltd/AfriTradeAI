import React from 'react';
import { 
  Search, FileCheck, Calculator, Truck, 
  ShieldCheck, ArrowRight, CheckCircle2, Store, ShoppingBag 
} from 'lucide-react';

interface HowItWorksViewProps {
  onNavigate: (view: string) => void;
}

export const HowItWorksView: React.FC<HowItWorksViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 font-sans text-zinc-100">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
          How AfriTrade AI Works
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          From sourcing to customs clearance: a step-by-step guide to cross-border trading across Africa.
        </p>
      </div>

      {/* 4-Step Process */}
      <div className="space-y-4">
        <div className="p-5 sm:p-6 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
            Step 1
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-zinc-100">
              Create an Account & Set Your Role
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Register as a <strong>Buyer</strong> to procure goods or as an <strong>African Seller</strong> to list export catalogue commodities. Sellers undergo verification vetting before receiving enterprise badges.
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
            Step 2
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-zinc-100">
              Discover Products & Ask AI Trade Assistant
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Explore verified commodities across 54 nations. Consult the Gemini AI trade consultant to analyze customs clearance requirements, regional economic community rules (EAC, ECOWAS, SADC), and certificates of origin.
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
            Step 3
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-zinc-100">
              Calculate Tariffs & Request B2B Quotations
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Use the AfCFTA Tariff Matrix Calculator to view baseline MFN duties vs preferential AfCFTA tariffs and calculate exact savings. Tender formal requests for quotation (RFQ) directly with producers.
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
            Step 4
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-zinc-100">
              Generate Export Documentation & Track Settlement
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Automatically draft compliant Pro-Forma Invoices, Packing Lists, Phytosanitary declarations, and AfCFTA Certificates of Origin. Track order fulfillment from port to destination.
            </p>
          </div>
        </div>
      </div>

      {/* Dual persona callouts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <ShoppingBag className="w-4 h-4" />
            <span>For Commercial Buyers</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Gain direct access to vetted African agricultural, mineral, and manufactured suppliers without costly intermediaries.
          </p>
          <button
            onClick={() => onNavigate('register')}
            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition"
          >
            Register as Buyer
          </button>
        </div>

        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Store className="w-4 h-4" />
            <span>For African Exporters</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Showcase your products to buyers across the continent, leverage AfCFTA preferential tariffs, and expand into new markets.
          </p>
          <button
            onClick={() => onNavigate('register')}
            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition"
          >
            Register as Seller
          </button>
        </div>
      </div>
    </div>
  );
};
