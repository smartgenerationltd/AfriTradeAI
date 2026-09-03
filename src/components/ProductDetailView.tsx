import React, { useState } from 'react';
import { 
  ArrowLeft, ShieldCheck, Heart, Share2, Sparkles, 
  Truck, CheckCircle, Award, Package, Clock, 
  MapPin, MessageSquare, Send, Star, AlertCircle, ShoppingCart
} from 'lucide-react';
import { Product, Business, Review, UserProfile } from '../types';
import { formatMoney } from '../services/currency';

interface ProductDetailViewProps {
  product: Product;
  business?: Business;
  reviews: Review[];
  currentUser: UserProfile | null;
  currentCurrency: string;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onRequestQuotation: (product: Product) => void;
  onContactSeller: (sellerId: string, sellerName: string, productId: string, productName: string) => void;
  onAskAi: (prompt: string, origin: string, destination: string, product: string) => void;
  onToggleFavorite: (productId: string) => void;
  isFavorite: boolean;
  onAddReview: (rating: number, comment: string) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  business,
  reviews,
  currentUser,
  currentCurrency,
  onBack,
  onAddToCart,
  onRequestQuotation,
  onContactSeller,
  onAskAi,
  onToggleFavorite,
  isFavorite,
  onAddReview,
}) => {
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [orderQuantity, setOrderQuantity] = useState<number>(product.minimumOrderQuantity);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'shipping' | 'reviews'>('details');

  // Review form state
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);

  const productReviews = reviews.filter((r) => r.productId === product.id);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    onAddReview(reviewRating, reviewComment.trim());
    setReviewComment('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  const handleAddToCart = () => {
    onAddToCart(product, orderQuantity);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-6 text-zinc-100">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-400 hover:text-emerald-400 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Marketplace
      </button>

      {/* Main Grid: Gallery & Purchase Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative h-72 sm:h-[400px] rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800">
            <img
              src={product.images[selectedImage] || product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />

            <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-xs text-zinc-200 text-[11px] font-mono px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-zinc-800">
              <span>📍 Origin: {product.country}</span>
            </div>

            <button
              onClick={() => onToggleFavorite(product.id)}
              className="absolute top-3 right-3 p-2 rounded-lg bg-zinc-900/80 backdrop-blur-xs text-zinc-400 hover:text-red-400 border border-zinc-700 transition"
              title="Save to favorites"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border transition ${
                    selectedImage === idx ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Origin & Certification Pills */}
          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-zinc-200">Verified African Origin</span>
            </div>
            {product.certifications?.map((cert) => (
              <span key={cert} className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-emerald-400 text-[10px]">
                ✓ {cert}
              </span>
            ))}
          </div>
        </div>

        {/* Right Column: Pricing, Seller & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider">
                {product.categoryName}
              </span>
              <div className="flex items-center gap-1 text-amber-400 text-xs font-mono">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-zinc-500 font-normal">({product.reviewCount})</span>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight font-display leading-tight">
              {product.name}
            </h1>

            <p className="text-xs text-zinc-400 font-mono">
              Producer: <strong className="text-zinc-200">{product.businessName}</strong> ({product.city}, {product.country})
            </p>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2.5 font-mono">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[9px] uppercase text-zinc-500 block">Indicative FOB Price</span>
                <p className="text-2xl font-bold text-zinc-100">
                  {formatMoney(product.price, currentCurrency)}
                </p>
              </div>
              <span className="text-xs text-zinc-400">per {product.unit}</span>
            </div>

            <div className="pt-2.5 border-t border-zinc-800 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-zinc-500 block text-[10px]">MOQ (Minimum)</span>
                <strong className="text-zinc-200">{product.minimumOrderQuantity} {product.unit}</strong>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Available Supply</span>
                <strong className="text-emerald-400">{product.quantity.toLocaleString()} {product.unit}</strong>
              </div>
            </div>
          </div>

          {/* Quantity Selector & Add to Cart / Quote */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <label className="text-zinc-400">Order Quantity ({product.unit}):</label>
              <span className="text-zinc-500 text-[11px]">Min: {product.minimumOrderQuantity}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-950 font-mono text-xs">
                <button
                  onClick={() => setOrderQuantity(Math.max(product.minimumOrderQuantity, orderQuantity - 5))}
                  className="px-3 py-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-l-lg"
                >
                  -
                </button>
                <input
                  type="number"
                  min={product.minimumOrderQuantity}
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Math.max(product.minimumOrderQuantity, Number(e.target.value)))}
                  className="w-16 text-center text-xs text-zinc-100 py-1.5 border-0 bg-transparent focus:outline-hidden"
                />
                <button
                  onClick={() => setOrderQuantity(orderQuantity + 5)}
                  className="px-3 py-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-r-lg"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition flex items-center justify-center gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Add to Cart ({formatMoney(product.price * orderQuantity, currentCurrency)})
              </button>
            </div>

            <button
              onClick={() => onRequestQuotation(product)}
              className="w-full py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-medium text-xs transition text-center border border-zinc-700/80"
            >
              Request Custom B2B Quotation (RFQ)
            </button>
          </div>

          {/* 1-Click Ask AI Cross-Border Trade Assistant */}
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AfCFTA Trade Copilot</span>
            </div>
            <p className="text-xs text-zinc-400">
              Simulate tariffs, phyto/sanitary inspection protocols, and transit corridors from {product.country}.
            </p>
            <button
              onClick={() => onAskAi(
                `Can I trade ${product.name} from ${product.country} to Kenya or Nigeria? What are the AfCFTA rules of origin, transit corridors, and required documents?`,
                product.country,
                currentUser?.country || 'Kenya',
                product.name
              )}
              className="w-full py-1.5 px-2.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-emerald-400 font-mono text-[11px] transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Ask AI: Can I import this to my market?
            </button>
          </div>

          {/* Seller Profile Card */}
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase font-mono text-zinc-500">Verified Seller</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                <ShieldCheck className="w-3 h-3" />
                Origin Verified
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <img
                src={business?.logo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&h=150&q=80'}
                alt={product.businessName}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-lg object-cover border border-zinc-800"
              />
              <div className="min-w-0">
                <h2 className="font-semibold text-xs text-zinc-200 truncate">{product.businessName}</h2>
                <p className="text-[11px] text-zinc-400 font-mono">📍 {product.city}, {product.country}</p>
                <p className="text-[10px] text-emerald-400 font-mono">Response: &lt; 2 hours</p>
              </div>
            </div>

            <button
              onClick={() => onContactSeller(product.sellerId, product.businessName, product.id, product.name)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
              Contact Seller Directly
            </button>
          </div>
        </div>
      </div>

      {/* Tabs: Details, Specs, Shipping, Reviews */}
      <div className="border-t border-zinc-800 pt-6">
        <div className="flex border-b border-zinc-800 gap-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-2.5 border-b-2 transition ${
              activeTab === 'details' ? 'border-emerald-400 text-emerald-400 font-semibold' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-2.5 border-b-2 transition ${
              activeTab === 'specs' ? 'border-emerald-400 text-emerald-400 font-semibold' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Trade Specs
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-2.5 border-b-2 transition ${
              activeTab === 'shipping' ? 'border-emerald-400 text-emerald-400 font-semibold' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            AfCFTA Shipping
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-2.5 border-b-2 transition ${
              activeTab === 'reviews' ? 'border-emerald-400 text-emerald-400 font-semibold' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Buyer Reviews ({productReviews.length})
          </button>
        </div>

        <div className="py-4">
          {activeTab === 'details' && (
            <div className="max-w-3xl space-y-3 text-zinc-300 text-xs leading-relaxed">
              <p>{product.description}</p>
              {product.originDetails && (
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <h4 className="font-mono text-[10px] uppercase text-zinc-500 mb-1">Origin Details</h4>
                  <p className="text-zinc-300 text-xs">{product.originDetails}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-xl">
              <dl className="divide-y divide-zinc-800 text-xs font-mono">
                <div className="py-2 flex justify-between">
                  <dt className="text-zinc-500">Category</dt>
                  <dd className="text-zinc-200">{product.categoryName}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-zinc-500">Country of Origin</dt>
                  <dd className="text-zinc-200">{product.country}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-zinc-500">Packaging Unit</dt>
                  <dd className="text-zinc-200">{product.unit}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-zinc-500">Minimum Order Quantity (MOQ)</dt>
                  <dd className="text-zinc-200">{product.minimumOrderQuantity} {product.unit}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-zinc-500">Shelf Life</dt>
                  <dd className="text-zinc-200">{product.shelfLife || '18-24 Months'}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-zinc-500">Export Availability</dt>
                  <dd className="text-emerald-400">✓ Ready for Cross-Border Transit</dd>
                </div>
              </dl>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="max-w-3xl space-y-3">
              <p className="text-xs text-zinc-400">
                Direct export to the following African markets under regional and AfCFTA trade corridors:
              </p>
              <div className="flex flex-wrap gap-2">
                {product.shippingCountries.map((country) => (
                  <span key={country} className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-400" />
                    {country}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-zinc-500 font-mono pt-1">
                Notice: Transit freight and clearance duties depend on route corridors. Use the Trade Calculator for simulation.
              </p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="max-w-3xl space-y-4">
              {/* Existing Reviews */}
              {productReviews.length === 0 ? (
                <p className="text-xs text-zinc-500 font-mono italic">No buyer reviews yet for this listing.</p>
              ) : (
                <div className="space-y-3">
                  {productReviews.map((rev) => (
                    <div key={rev.reviewId} className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-zinc-200">{rev.buyerName}</span>
                        <div className="flex items-center text-amber-400 text-xs">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">{rev.comment}</p>
                      <span className="text-[10px] text-zinc-500 font-mono block">
                        Verified Order • {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Review Form */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2.5">
                <h4 className="font-mono text-xs uppercase tracking-wider text-zinc-300">
                  Leave a Buyer Review
                </h4>

                {reviewSubmitted && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-900 text-emerald-400 text-xs font-mono">
                    ✓ Review submitted successfully!
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 font-mono">Rating:</span>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="text-xs px-2 py-1 rounded-md border border-zinc-800 bg-zinc-950 text-zinc-200 font-mono"
                    >
                      <option value={5}>★★★★★ (5 Stars)</option>
                      <option value={4}>★★★★☆ (4 Stars)</option>
                      <option value={3}>★★★☆☆ (3 Stars)</option>
                      <option value={2}>★★☆☆☆ (2 Stars)</option>
                      <option value={1}>★☆☆☆☆ (1 Star)</option>
                    </select>
                  </div>

                  <textarea
                    rows={2}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share experience regarding product quality, packaging, and delivery..."
                    className="w-full p-2.5 rounded-lg border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-hidden focus:border-zinc-700 bg-zinc-950"
                  />

                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-950 font-semibold text-xs hover:bg-white transition"
                  >
                    Post Review
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
