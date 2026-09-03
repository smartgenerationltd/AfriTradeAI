import React, { useState } from 'react';
import { 
  ShieldCheck, Users, Store, Package, ShoppingBag, 
  AlertTriangle, CheckCircle2, XCircle, Check, Ban, 
  TrendingUp, Globe, Layers, Eye
} from 'lucide-react';
import { Business, Product, Order, UserProfile } from '../types';
import { formatMoney } from '../services/currency';

interface AdminDashboardViewProps {
  currentUser: UserProfile;
  businesses: Business[];
  products: Product[];
  orders: Order[];
  currentCurrency: string;
  onVerifyBusiness: (businessId: string) => void;
  onSuspendBusiness: (businessId: string) => void;
  onToggleProductStatus: (productId: string) => void;
  onDeleteProduct: (productId: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentUser,
  businesses,
  products,
  orders,
  currentCurrency,
  onVerifyBusiness,
  onSuspendBusiness,
  onToggleProductStatus,
  onDeleteProduct,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'businesses' | 'products' | 'orders'>('overview');

  const pendingBusinesses = businesses.filter(b => b.verificationStatus === 'pending');
  const verifiedBusinesses = businesses.filter(b => b.verificationStatus === 'verified');
  const totalGMV = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 space-y-4 text-zinc-100">
      {/* Header Banner */}
      <div className="bg-zinc-950 rounded-xl p-5 sm:p-6 text-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-zinc-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-amber-400 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" /> Platform Governance Console
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display">
            AfriTrade AI Administration
          </h1>
          <p className="text-xs text-zinc-400">
            Supervise continental MSME verifications, trade compliance, catalog moderation, and pan-African order flows.
          </p>
        </div>

        <span className="text-xs font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg self-start md:self-auto">
          Logged in as: Super Admin
        </span>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase block">Total GMV Settled</span>
          <p className="text-lg sm:text-xl font-bold text-emerald-400">
            {formatMoney(totalGMV, currentCurrency)}
          </p>
          <span className="text-[10px] text-zinc-400">Continental trade volume</span>
        </div>

        <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase block">African MSMEs</span>
          <p className="text-lg sm:text-xl font-bold text-zinc-100">{businesses.length}</p>
          <span className="text-[10px] text-emerald-400">{verifiedBusinesses.length} Verified</span>
        </div>

        <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase block">Active Listings</span>
          <p className="text-lg sm:text-xl font-bold text-zinc-100">{products.length}</p>
          <span className="text-[10px] text-zinc-400">Commodity catalog</span>
        </div>

        <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase block">Orders Processed</span>
          <p className="text-lg sm:text-xl font-bold text-zinc-100">{orders.length}</p>
          <span className="text-[10px] text-emerald-400">100% On Corridor Schedule</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-zinc-800 flex gap-4 text-xs font-mono">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'overview'
              ? 'border-zinc-100 text-zinc-100 font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Verification Queue ({pendingBusinesses.length})
        </button>

        <button
          onClick={() => setActiveTab('businesses')}
          className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'businesses'
              ? 'border-zinc-100 text-zinc-100 font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          Registered Businesses ({businesses.length})
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'products'
              ? 'border-zinc-100 text-zinc-100 font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          Catalog Moderation ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'orders'
              ? 'border-zinc-100 text-zinc-100 font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Pan-African Orders ({orders.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="space-y-3 font-mono">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-zinc-200">
              MSME Verification Requests Queue
            </h3>
            <span className="text-[11px] text-zinc-500">
              Review registration certificates, tax IDs, and export readiness
            </span>
          </div>

          {pendingBusinesses.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900 rounded-xl border border-zinc-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs text-zinc-300">All pending business verification applications have been reviewed.</p>
            </div>
          ) : (
            pendingBusinesses.map((biz) => (
              <div
                key={biz.businessId}
                className="p-4 rounded-xl border border-zinc-800 bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={biz.logo}
                    alt={biz.businessName}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-lg object-cover border border-zinc-800 bg-zinc-950 shrink-0"
                  />
                  <div>
                    <h4 className="font-semibold text-zinc-100">{biz.businessName}</h4>
                    <p className="text-[11px] text-zinc-400">
                      📍 {biz.city}, {biz.country} • Category: {biz.category}
                    </p>
                    <p className="text-xs text-zinc-300 mt-1 font-sans">{biz.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => onVerifyBusiness(biz.businessId)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve Badge
                  </button>

                  <button
                    onClick={() => onSuspendBusiness(biz.businessId)}
                    className="px-3 py-1.5 rounded-lg border border-red-900/60 text-red-400 hover:bg-red-950/40 text-xs transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'businesses' && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden font-mono text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-950 border-b border-zinc-800 uppercase text-[10px] text-zinc-400">
                <tr>
                  <th className="p-3">Business Name</th>
                  <th className="p-3">Country</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Verification</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {businesses.map((biz) => (
                  <tr key={biz.businessId} className="hover:bg-zinc-850/50">
                    <td className="p-3 font-semibold text-zinc-100">{biz.businessName}</td>
                    <td className="p-3 text-zinc-400">{biz.country}</td>
                    <td className="p-3 text-zinc-400">{biz.category}</td>
                    <td className="p-3">
                      <span className={`px-1.5 py-0.5 rounded uppercase text-[10px] border ${
                        biz.verificationStatus === 'verified'
                          ? 'bg-zinc-950 border-emerald-900/60 text-emerald-400'
                          : 'bg-zinc-950 border-amber-900/60 text-amber-400'
                      }`}>
                        {biz.verificationStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {biz.verificationStatus === 'verified' ? (
                        <button
                          onClick={() => onSuspendBusiness(biz.businessId)}
                          className="text-red-400 hover:underline"
                        >
                          Revoke Badge
                        </button>
                      ) : (
                        <button
                          onClick={() => onVerifyBusiness(biz.businessId)}
                          className="text-emerald-400 hover:underline"
                        >
                          Verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-2 font-mono">
          {products.map((p) => (
            <div
              key={p.id}
              className="p-3 rounded-xl border border-zinc-800 bg-zinc-900 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src={p.images[0]}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-lg object-cover border border-zinc-800 bg-zinc-950 shrink-0"
                />
                <div>
                  <h4 className="font-semibold text-zinc-100">{p.name}</h4>
                  <p className="text-[11px] text-zinc-400">
                    {p.businessName} • 📍 {p.country} • {formatMoney(p.price, currentCurrency)} / {p.unit}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onToggleProductStatus(p.id)}
                  className={`px-2 py-0.5 rounded text-[10px] uppercase border ${
                    p.status === 'published'
                      ? 'bg-zinc-950 border-emerald-900/60 text-emerald-400'
                      : 'bg-zinc-950 border-zinc-700 text-zinc-400'
                  }`}
                >
                  {p.status}
                </button>

                <button
                  onClick={() => onDeleteProduct(p.id)}
                  className="p-1 text-zinc-500 hover:text-red-400 transition"
                  title="Remove from platform"
                >
                  <Ban className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-2 font-mono">
          {orders.map((o) => (
            <div
              key={o.orderId}
              className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div>
                <span className="font-semibold text-zinc-100 block">Order #{o.orderId}</span>
                <span className="text-[11px] text-zinc-400">
                  Destination: {o.shippingCity}, {o.shippingCountry} • Status: {o.status.toUpperCase()}
                </span>
              </div>

              <div className="text-right">
                <span className="font-bold text-emerald-400 block">
                  {formatMoney(o.total, currentCurrency)}
                </span>
                <span className="text-[10px] text-zinc-500">
                  {new Date(o.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
