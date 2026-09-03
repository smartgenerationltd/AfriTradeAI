import React, { useState } from 'react';
import { 
  Package, FileText, Heart, MessageSquare, CheckCircle, 
  Clock, Truck, ChevronRight, ArrowRight, ShieldCheck, 
  ShoppingBag, Star, AlertCircle 
} from 'lucide-react';
import { Order, Quotation, Product, Business, UserProfile } from '../types';
import { formatMoney } from '../services/currency';

interface BuyerDashboardViewProps {
  currentUser: UserProfile;
  orders: Order[];
  quotations: Quotation[];
  products: Product[];
  businesses: Business[];
  currentCurrency: string;
  onOpenProduct: (productId: string) => void;
  onOpenBusiness: (businessId: string) => void;
  onAcceptQuotation: (quotationId: string) => void;
  onOpenMessages: () => void;
  onExploreMarketplace: () => void;
}

export const BuyerDashboardView: React.FC<BuyerDashboardViewProps> = ({
  currentUser,
  orders,
  quotations,
  products,
  businesses,
  currentCurrency,
  onOpenProduct,
  onOpenBusiness,
  onAcceptQuotation,
  onOpenMessages,
  onExploreMarketplace,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'quotations' | 'favorites'>('orders');

  const buyerOrders = orders.filter(o => o.buyerId === currentUser.id);
  const buyerQuotes = quotations.filter(q => q.buyerId === currentUser.id);

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 space-y-4 text-zinc-100">
      {/* Profile Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 text-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'}
            alt={currentUser.fullName}
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-lg object-cover border border-zinc-800 bg-zinc-900 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-zinc-100 font-display">{currentUser.fullName}</h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400">
                Active Buyer
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-400 mt-0.5">
              📍 {currentUser.city}, {currentUser.country} • Commercial Trade Account
            </p>
          </div>
        </div>

        {/* Quick stats pill */}
        <div className="flex items-center gap-2 font-mono">
          <div className="bg-zinc-900 px-3 py-1.5 rounded-lg text-center border border-zinc-800 min-w-[70px]">
            <span className="text-sm font-bold text-zinc-100 block">{buyerOrders.length}</span>
            <span className="text-[10px] text-zinc-500 uppercase">Orders</span>
          </div>
          <div className="bg-zinc-900 px-3 py-1.5 rounded-lg text-center border border-zinc-800 min-w-[70px]">
            <span className="text-sm font-bold text-emerald-400 block">{buyerQuotes.length}</span>
            <span className="text-[10px] text-zinc-500 uppercase">Quotes</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-800 flex gap-4 text-xs font-mono">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'orders'
              ? 'border-zinc-100 text-zinc-100 font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          My Orders ({buyerOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('quotations')}
          className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'quotations'
              ? 'border-zinc-100 text-zinc-100 font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Tenders & Quotations ({buyerQuotes.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'orders' && (
        <div className="space-y-3 font-mono">
          {buyerOrders.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900 rounded-xl border border-zinc-800 space-y-2.5">
              <ShoppingBag className="w-8 h-8 text-zinc-600 mx-auto" />
              <h3 className="font-semibold text-xs text-zinc-200">No active orders yet</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto font-sans">
                Discover origin-certified African commodities in the marketplace to place your first trade order.
              </p>
              <button
                onClick={onExploreMarketplace}
                className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-950 font-semibold text-xs hover:bg-white transition"
              >
                Explore Marketplace
              </button>
            </div>
          ) : (
            buyerOrders.map((order) => (
              <div
                key={order.orderId}
                className="p-4 sm:p-5 rounded-xl border border-zinc-800 bg-zinc-900 space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-100">
                        Order #{order.orderId}
                      </span>
                      <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${
                        order.status === 'delivered'
                          ? 'bg-zinc-950 border-emerald-900/60 text-emerald-400'
                          : order.status === 'shipped'
                          ? 'bg-zinc-950 border-blue-900/60 text-blue-400'
                          : 'bg-zinc-950 border-amber-900/60 text-amber-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-500">
                      Placed on {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} item(s)
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 block">Total Value</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {formatMoney(order.total, currentCurrency)}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-1.5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                      <span className="text-zinc-300">
                        {item.quantity}x {item.productName}
                      </span>
                      <span className="font-semibold text-zinc-200">
                        {formatMoney(item.unitPrice * item.quantity, currentCurrency)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Shipping info */}
                <div className="pt-2 border-t border-zinc-800 flex flex-wrap items-center justify-between text-[11px] text-zinc-400 gap-2">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Destination: {order.shippingCity}, {order.shippingCountry}</span>
                  </div>
                  {order.trackingNumber && (
                    <div className="text-zinc-400">
                      Waybill / Tracking: <span className="text-emerald-400">{order.trackingNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'quotations' && (
        <div className="space-y-3 font-mono">
          {buyerQuotes.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900 rounded-xl border border-zinc-800 space-y-2.5">
              <FileText className="w-8 h-8 text-zinc-600 mx-auto" />
              <h3 className="font-semibold text-xs text-zinc-200">No quotation requests yet</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto font-sans">
                Request custom bulk volume pricing directly from verified producers in the marketplace.
              </p>
            </div>
          ) : (
            buyerQuotes.map((quote) => (
              <div
                key={quote.quotationId}
                className="p-4 sm:p-5 rounded-xl border border-zinc-800 bg-zinc-900 space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-zinc-100">
                        {quote.productName}
                      </h3>
                      <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${
                        quote.status === 'responded'
                          ? 'bg-zinc-950 border-teal-900/60 text-teal-400'
                          : quote.status === 'accepted'
                          ? 'bg-zinc-950 border-emerald-900/60 text-emerald-400'
                          : 'bg-zinc-950 border-amber-900/60 text-amber-400'
                      }`}>
                        {quote.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-500">
                      To: {quote.sellerName} • Requested: {quote.requestedQuantity} Units
                    </span>
                  </div>

                  <span className="text-[11px] text-zinc-500">
                    {new Date(quote.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300">
                  <span className="block text-zinc-500 text-[11px] mb-0.5">Your Tender Inquiries:</span>
                  {quote.message}
                </div>

                {/* Seller Response */}
                {quote.response && (
                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-emerald-400">
                        Formal Exporter Pro-Forma Response:
                      </strong>
                      <span className="text-emerald-400 font-bold">
                        Offered: ${quote.response.unitPrice} USD / unit
                      </span>
                    </div>
                    <p className="leading-relaxed text-zinc-300">{quote.response.notes}</p>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800">
                      <span>Shipping Quote: ${quote.response.shippingQuote}</span>
                      <span>Lead Time: {quote.response.leadTimeDays}</span>
                    </div>

                    {quote.status === 'responded' && (
                      <div className="pt-2">
                        <button
                          onClick={() => onAcceptQuotation(quote.quotationId)}
                          className="w-full py-1.5 px-3 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition text-center"
                        >
                          Accept Quotation & Convert to Official Order
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
