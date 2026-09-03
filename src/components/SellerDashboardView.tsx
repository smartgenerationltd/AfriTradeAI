import React, { useState } from 'react';
import { 
  Store, Plus, Package, FileText, TrendingUp, 
  ShieldCheck, CheckCircle2, Truck, Edit3, Trash2, 
  X, Eye, DollarSign, Clock, AlertCircle, Sparkles
} from 'lucide-react';
import { Product, Business, Order, Quotation, Category, Country, UserProfile } from '../types';
import { formatMoney } from '../services/currency';

interface SellerDashboardViewProps {
  currentUser: UserProfile;
  sellerBusiness?: Business;
  products: Product[];
  orders: Order[];
  quotations: Quotation[];
  categories: Category[];
  countries: Country[];
  currentCurrency: string;
  onAddProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount'>) => void;
  onUpdateProduct: (productId: string, updates: Partial<Product>) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status'], tracking?: string) => void;
  onRespondQuotation: (quotationId: string, response: { unitPrice: number; shippingQuote: number; leadTimeDays: string; notes: string }) => void;
}

export const SellerDashboardView: React.FC<SellerDashboardViewProps> = ({
  currentUser,
  sellerBusiness,
  products,
  orders,
  quotations,
  categories,
  countries,
  currentCurrency,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onRespondQuotation,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'quotations' | 'analytics'>('inventory');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [respondingQuoteId, setRespondingQuoteId] = useState<string | null>(null);

  // New product form
  const [newProductName, setNewProductName] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductCat, setNewProductCat] = useState(categories[0]?.id || 'cat-1');
  const [newProductPrice, setNewProductPrice] = useState(7.5);
  const [newProductUnit, setNewProductUnit] = useState('kg');
  const [newProductStock, setNewProductStock] = useState(1000);
  const [newProductMOQ, setNewProductMOQ] = useState(50);
  const [newProductImage, setNewProductImage] = useState('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80');
  const [newProductOriginDetails, setNewProductOriginDetails] = useState('');

  // Quote response form
  const [quoteUnitPrice, setQuoteUnitPrice] = useState(6.0);
  const [quoteShipping, setQuoteShipping] = useState(45.0);
  const [quoteLeadTime, setQuoteLeadTime] = useState('4-6 business days via Northern Corridor');
  const [quoteNotes, setQuoteNotes] = useState('Bulk discount applied. All customs documentation and EAC Certificate of Origin included.');

  const sellerProducts = products.filter(p => p.sellerId === currentUser.id);
  const sellerOrders = orders.filter(o => o.sellerId === currentUser.id);
  const sellerQuotes = quotations.filter(q => q.sellerId === currentUser.id);

  const totalSalesUSD = sellerOrders.reduce((sum, o) => sum + o.total, 0);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const catObj = categories.find(c => c.id === newProductCat);
    onAddProduct({
      sellerId: currentUser.id,
      businessId: sellerBusiness?.businessId || 'biz-1',
      businessName: sellerBusiness?.businessName || 'Kigali Highland Coffee Cooperative',
      name: newProductName,
      description: newProductDesc,
      categoryId: newProductCat,
      categoryName: catObj?.name || 'Coffee & Tea',
      price: Number(newProductPrice),
      currency: 'USD',
      quantity: Number(newProductStock),
      minimumOrderQuantity: Number(newProductMOQ),
      unit: newProductUnit,
      images: [newProductImage],
      status: 'published',
      country: sellerBusiness?.country || currentUser.country,
      city: sellerBusiness?.city || currentUser.city,
      shippingCountries: ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Ghana', 'Nigeria'],
      originDetails: newProductOriginDetails,
      certifications: ['AfCFTA Rules of Origin', 'RSB Certified', 'Fair Trade'],
      shelfLife: '24 Months'
    });

    setIsAddProductOpen(false);
    setNewProductName('');
    setNewProductDesc('');
  };

  const handleSendQuoteResponse = (quotationId: string) => {
    onRespondQuotation(quotationId, {
      unitPrice: Number(quoteUnitPrice),
      shippingQuote: Number(quoteShipping),
      leadTimeDays: quoteLeadTime,
      notes: quoteNotes,
    });
    setRespondingQuoteId(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 space-y-4 text-zinc-100">
      {/* Enterprise Header Banner */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 text-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={sellerBusiness?.logo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&h=150&q=80'}
            alt=""
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-lg object-cover border border-zinc-800 bg-zinc-900 shrink-0"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold font-display">
                {sellerBusiness?.businessName || 'Highland Cooperative Storefront'}
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400">
                <ShieldCheck className="w-3 h-3" />
                Verified African Exporter
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-400">
              📍 {sellerBusiness?.city || currentUser.city}, {sellerBusiness?.country || currentUser.country} • Export Ready Status: Active
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddProductOpen(true)}
          className="px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs font-mono transition flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          List New Product
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase block">Gross Sales</span>
          <p className="text-lg sm:text-xl font-bold text-emerald-400">
            {formatMoney(totalSalesUSD, currentCurrency)}
          </p>
          <span className="text-[10px] text-zinc-400">+18% this month</span>
        </div>

        <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase block">Orders Handled</span>
          <p className="text-lg sm:text-xl font-bold text-zinc-100">{sellerOrders.length}</p>
          <span className="text-[10px] text-zinc-400">Cross-border freight</span>
        </div>

        <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase block">Active Listings</span>
          <p className="text-lg sm:text-xl font-bold text-zinc-100">{sellerProducts.length}</p>
          <span className="text-[10px] text-emerald-400">100% Published</span>
        </div>

        <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase block">B2B Tenders</span>
          <p className="text-lg sm:text-xl font-bold text-zinc-100">{sellerQuotes.length}</p>
          <span className="text-[10px] text-amber-400">
            {sellerQuotes.filter(q => q.status === 'pending').length} Pending
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-800 flex gap-4 text-xs font-mono">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'inventory'
              ? 'border-zinc-100 text-zinc-100 font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          Product Catalog ({sellerProducts.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'orders'
              ? 'border-zinc-100 text-zinc-100 font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          Incoming Orders ({sellerOrders.length})
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
          Quotation Tenders ({sellerQuotes.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'inventory' && (
        <div className="space-y-3 font-mono">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-semibold text-zinc-200">Your Export Inventory</h3>
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add Product
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sellerProducts.map((prod) => (
              <div
                key={prod.id}
                className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900 space-y-2.5 flex flex-col justify-between"
              >
                <div className="flex gap-2.5">
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-lg object-cover border border-zinc-800 bg-zinc-950 shrink-0"
                  />
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-emerald-400 uppercase">
                      {prod.categoryName}
                    </span>
                    <h4 className="font-semibold text-xs text-zinc-100 line-clamp-1">{prod.name}</h4>
                    <p className="text-xs font-bold text-emerald-400">
                      {formatMoney(prod.price, currentCurrency)} / {prod.unit}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      Stock: {prod.quantity} {prod.unit} • MOQ: {prod.minimumOrderQuantity}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      const newStatus = prod.status === 'published' ? 'draft' : 'published';
                      onUpdateProduct(prod.id, { status: newStatus });
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] uppercase border ${
                      prod.status === 'published'
                        ? 'bg-zinc-950 border-emerald-900/60 text-emerald-400'
                        : 'bg-zinc-950 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    {prod.status}
                  </button>

                  <button
                    onClick={() => onDeleteProduct(prod.id)}
                    className="text-zinc-500 hover:text-red-400 p-1 transition"
                    title="Delete product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-3 font-mono">
          {sellerOrders.length === 0 ? (
            <p className="text-xs text-zinc-500 italic">No incoming orders yet.</p>
          ) : (
            sellerOrders.map((order) => (
              <div
                key={order.orderId}
                className="p-4 sm:p-5 rounded-xl border border-zinc-800 bg-zinc-900 space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-zinc-800">
                  <div>
                    <h4 className="font-semibold text-zinc-100">
                      Order #{order.orderId}
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Destination: {order.shippingCity}, {order.shippingCountry} • Phone: {order.contactPhone}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-emerald-400">
                      {formatMoney(order.total, currentCurrency)}
                    </span>
                    <select
                      value={order.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as Order['status'];
                        const tracking = newStatus === 'shipped' ? `NC-TRANSIT-${Math.floor(100000 + Math.random() * 900000)}` : order.trackingNumber;
                        onUpdateOrderStatus(order.orderId, newStatus, tracking);
                      }}
                      className="text-xs px-2 py-1 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-200 focus:outline-hidden"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped (Dispatched)</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-zinc-300">
                      <span>{item.quantity}x {item.productName}</span>
                      <span className="font-semibold text-zinc-200">{formatMoney(item.unitPrice * item.quantity, currentCurrency)}</span>
                    </div>
                  ))}
                </div>

                {order.trackingNumber && (
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400">
                    Tracking / Waybill ID: <span className="text-emerald-400 font-bold">{order.trackingNumber}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'quotations' && (
        <div className="space-y-3 font-mono">
          {sellerQuotes.length === 0 ? (
            <p className="text-xs text-zinc-500 italic">No quotation inquiries received yet.</p>
          ) : (
            sellerQuotes.map((quote) => (
              <div
                key={quote.quotationId}
                className="p-4 sm:p-5 rounded-xl border border-zinc-800 bg-zinc-900 space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-zinc-800">
                  <div>
                    <h4 className="font-semibold text-zinc-100">
                      Tender for {quote.productName}
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      From: {quote.buyerName} • Destination: {quote.destinationCountry} • Requested: {quote.requestedQuantity} Units
                    </p>
                  </div>

                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${
                    quote.status === 'responded'
                      ? 'bg-zinc-950 border-teal-900/60 text-teal-400'
                      : 'bg-zinc-950 border-amber-900/60 text-amber-400'
                  }`}>
                    {quote.status}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300">
                  <span className="block text-zinc-500 text-[11px] mb-0.5">Buyer Inquiries:</span>
                  {quote.message}
                </div>

                {/* Respond action or view response */}
                {quote.response ? (
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 space-y-1">
                    <strong className="block text-emerald-400">Your Pro-Forma Quote:</strong>
                    <p>Unit Price Offer: ${quote.response.unitPrice} USD | Shipping: ${quote.response.shippingQuote} USD</p>
                    <p className="text-zinc-400">Lead Time: {quote.response.leadTimeDays}</p>
                    <p className="italic text-zinc-500">"{quote.response.notes}"</p>
                  </div>
                ) : (
                  <div>
                    {respondingQuoteId === quote.quotationId ? (
                      <div className="p-3.5 rounded-xl border border-zinc-700 bg-zinc-950 space-y-3">
                        <h5 className="font-semibold text-xs text-zinc-200">Prepare Formal Pro-Forma Response</h5>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-[11px] text-zinc-400 mb-1">Offered Unit Price (USD)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={quoteUnitPrice}
                              onChange={(e) => setQuoteUnitPrice(Number(e.target.value))}
                              className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-zinc-400 mb-1">Freight / Shipping Quote (USD)</label>
                            <input
                              type="number"
                              step="1"
                              value={quoteShipping}
                              onChange={(e) => setQuoteShipping(Number(e.target.value))}
                              className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100"
                            />
                          </div>
                        </div>

                        <div className="text-xs">
                          <label className="block text-[11px] text-zinc-400 mb-1">Estimated Lead Time</label>
                          <input
                            type="text"
                            value={quoteLeadTime}
                            onChange={(e) => setQuoteLeadTime(e.target.value)}
                            className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100"
                          />
                        </div>

                        <div className="text-xs">
                          <label className="block text-[11px] text-zinc-400 mb-1">Export Terms & Regulatory Notes</label>
                          <textarea
                            rows={2}
                            value={quoteNotes}
                            onChange={(e) => setQuoteNotes(e.target.value)}
                            className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSendQuoteResponse(quote.quotationId)}
                            className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-950 font-semibold text-xs hover:bg-white transition"
                          >
                            Send Pro-Forma to Buyer
                          </button>
                          <button
                            onClick={() => setRespondingQuoteId(null)}
                            className="px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-300 text-xs hover:bg-zinc-850 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRespondingQuoteId(quote.quotationId)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-950 font-semibold text-xs hover:bg-white transition"
                      >
                        Respond with Formal Quote
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-zinc-900 rounded-xl max-w-lg w-full p-5 sm:p-6 border border-zinc-800 relative space-y-4 max-h-[90vh] overflow-y-auto text-zinc-100 font-mono">
            <button
              onClick={() => setIsAddProductOpen(false)}
              className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-zinc-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-zinc-100">
              List African Export Product
            </h3>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Product Title</label>
                <input
                  type="text"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="e.g. Rwandan Mountain Organic Honey"
                  required
                  className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Category</label>
                  <select
                    value={newProductCat}
                    onChange={(e) => setNewProductCat(e.target.value)}
                    className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Wholesale Unit Price (USD)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(Number(e.target.value))}
                    required
                    className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Packaging Unit</label>
                  <input
                    type="text"
                    value={newProductUnit}
                    onChange={(e) => setNewProductUnit(e.target.value)}
                    placeholder="kg, box, ton"
                    required
                    className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">MOQ</label>
                  <input
                    type="number"
                    value={newProductMOQ}
                    onChange={(e) => setNewProductMOQ(Number(e.target.value))}
                    required
                    className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(Number(e.target.value))}
                    required
                    className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Image URL</label>
                <input
                  type="url"
                  value={newProductImage}
                  onChange={(e) => setNewProductImage(e.target.value)}
                  className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Origin Details</label>
                <input
                  type="text"
                  value={newProductOriginDetails}
                  onChange={(e) => setNewProductOriginDetails(e.target.value)}
                  placeholder="e.g. Single origin, grown at 1,800m altitude in Gicumbi district."
                  className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  placeholder="Describe your quality metrics, harvest season, moisture levels, and export packaging..."
                  required
                  className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-3 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition"
              >
                Publish to Pan-African Marketplace
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
