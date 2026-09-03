import React from 'react';
import { 
  ArrowLeft, ShieldCheck, MapPin, Calendar, 
  MessageSquare, Star, Package, Globe 
} from 'lucide-react';
import { Business, Product } from '../types';
import { formatMoney } from '../services/currency';

interface BusinessProfileViewProps {
  business: Business;
  products: Product[];
  currentCurrency: string;
  onBack: () => void;
  onOpenProduct: (productId: string) => void;
  onContactSeller: (sellerId: string, sellerName: string) => void;
  onRequestQuoteProduct: (product: Product) => void;
}

export const BusinessProfileView: React.FC<BusinessProfileViewProps> = ({
  business,
  products,
  currentCurrency,
  onBack,
  onOpenProduct,
  onContactSeller,
  onRequestQuoteProduct,
}) => {
  const bizProducts = products.filter(p => p.businessId === business.businessId && p.status === 'published');

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 space-y-4 text-zinc-100">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Marketplace
      </button>

      {/* Business Header Card */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        {/* Banner image */}
        <div className="h-28 sm:h-36 bg-zinc-950 border-b border-zinc-800 relative">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>

        {/* Profile Details Container */}
        <div className="px-4 sm:px-6 pb-5 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 -mt-12 sm:-mt-14 mb-4">
            <div className="flex items-end gap-3">
              <img
                src={business.logo}
                alt={business.businessName}
                referrerPolicy="no-referrer"
                className="w-20 sm:w-24 h-20 sm:h-24 rounded-xl object-cover border-2 border-zinc-800 bg-zinc-950 shrink-0"
              />
              <div className="pb-0.5 space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-2xl font-bold text-zinc-100 font-display">
                    {business.businessName}
                  </h1>
                  {business.verificationStatus === 'verified' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-zinc-950 border border-zinc-800 px-1.5 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Verified African Business
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 font-mono flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  {business.city}, {business.country} • {business.category}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onContactSeller(business.ownerId, business.businessName)}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs font-mono transition flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Contact Enterprise
              </button>
            </div>
          </div>

          {/* Description & Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-3 border-t border-zinc-800">
            <div className="md:col-span-8 space-y-2">
              <h2 className="font-mono text-xs uppercase tracking-wider text-zinc-400">
                Enterprise Profile & Export Capacity
              </h2>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {business.description}
              </p>
            </div>

            <div className="md:col-span-4 p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Years in Operation</span>
                <span className="text-zinc-200 font-semibold">{business.yearsInOperation} Years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Export Readiness</span>
                <span className="text-emerald-400 font-semibold">✓ Verified Ready</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">AfCFTA Corridor</span>
                <span className="text-zinc-200">Northern & Central</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Active Listings</span>
                <span className="text-zinc-200 font-semibold">{bizProducts.length} Items</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog of Products */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-zinc-100">
          Export Catalog from {business.businessName} ({bizProducts.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {bizProducts.map((product) => (
            <div
              key={product.id}
              className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition flex flex-col justify-between"
            >
              <div
                onClick={() => onOpenProduct(product.id)}
                className="relative h-40 bg-zinc-950 overflow-hidden cursor-pointer"
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                <div>
                  <h3
                    onClick={() => onOpenProduct(product.id)}
                    className="font-semibold text-zinc-200 text-xs hover:text-emerald-400 cursor-pointer"
                  >
                    {product.name}
                  </h3>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">
                    {product.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-end justify-between font-mono">
                  <div>
                    <span className="text-[10px] uppercase text-zinc-500 block">Unit Price</span>
                    <p className="text-sm font-bold text-emerald-400">
                      {formatMoney(product.price, currentCurrency)} / {product.unit}
                    </p>
                    <span className="text-[10px] text-zinc-500">MOQ: {product.minimumOrderQuantity}</span>
                  </div>

                  <button
                    onClick={() => onRequestQuoteProduct(product)}
                    className="px-2.5 py-1 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition"
                  >
                    Request Quote
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
