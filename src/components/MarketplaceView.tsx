import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, ShieldCheck, Heart, Sparkles, 
  ArrowUpDown, SlidersHorizontal, CheckCircle2, Globe, 
  ChevronRight, X, Layers, MapPin
} from 'lucide-react';
import { Product, Country, Category } from '../types';
import { formatMoney } from '../services/currency';

interface MarketplaceViewProps {
  products: Product[];
  categories: Category[];
  countries: Country[];
  currentCurrency: string;
  initialSearch?: string;
  initialCategory?: string;
  initialCountry?: string;
  onOpenProduct: (productId: string) => void;
  onRequestQuotation: (product: Product) => void;
  onAskAiProduct: (product: Product) => void;
  onToggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  products,
  categories,
  countries,
  currentCurrency,
  initialSearch = '',
  initialCategory,
  initialCountry,
  onOpenProduct,
  onRequestQuotation,
  onAskAiProduct,
  onToggleFavorite,
  isFavorite,
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedCountry, setSelectedCountry] = useState<string>(initialCountry || 'all');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(100);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Must be published
      if (p.status !== 'published') return false;

      // Search match (name, description, businessName, country, origin)
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesDesc = p.description.toLowerCase().includes(query);
        const matchesBiz = p.businessName.toLowerCase().includes(query);
        const matchesCountry = p.country.toLowerCase().includes(query);
        const matchesCat = p.categoryName.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesBiz && !matchesCountry && !matchesCat) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
        return false;
      }

      // Country filter
      if (selectedCountry !== 'all' && p.country.toLowerCase() !== selectedCountry.toLowerCase()) {
        return false;
      }

      // Price filter (price in USD)
      if (p.price > maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'moq-asc') return a.minimumOrderQuantity - b.minimumOrderQuantity;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [products, search, selectedCategory, selectedCountry, maxPrice, sortBy]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedCountry('all');
    setMaxPrice(100);
    setVerifiedOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-4">
      {/* Header Banner */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 sm:p-6 text-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-emerald-400 text-[10px] font-mono font-semibold uppercase tracking-wider">Pan-African B2B & Wholesale Catalog</span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display mt-0.5 text-zinc-100">
            African Trade Marketplace
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-xl">
            Direct access to origin-certified African specialty goods, raw commodities, textiles, and natural cosmetics under AfCFTA.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <div className="bg-zinc-900 px-3.5 py-1.5 rounded-lg text-center border border-zinc-800">
            <span className="text-base font-bold text-zinc-100">{filteredProducts.length}</span>
            <span className="block text-[9px] text-zinc-500 uppercase">Listings</span>
          </div>
          <div className="bg-zinc-900 px-3.5 py-1.5 rounded-lg text-center border border-zinc-800">
            <span className="text-base font-bold text-emerald-400">35+</span>
            <span className="block text-[9px] text-zinc-500 uppercase">Origins</span>
          </div>
        </div>
      </div>

      {/* Main Filter & Search Bar */}
      <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product, origin, or seller..."
              className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-hidden focus:border-zinc-700"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-800 text-xs text-zinc-200 focus:outline-hidden focus:border-zinc-700 bg-zinc-950"
            >
              <option value="all">All Product Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.productCount})
                </option>
              ))}
            </select>
          </div>

          {/* Country of Origin Dropdown */}
          <div>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-800 text-xs text-zinc-200 focus:outline-hidden focus:border-zinc-700 bg-zinc-950"
            >
              <option value="all">All Origin Countries</option>
              {countries.slice(0, 15).map((c) => (
                <option key={c.code} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-800 text-xs text-zinc-200 focus:outline-hidden focus:border-zinc-700 bg-zinc-950"
            >
              <option value="featured">Featured / Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated (Stars)</option>
              <option value="moq-asc">Smallest MOQ (Low Minimum)</option>
            </select>
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-3">
            {/* Max Price Slider */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-[11px]">Max Price:</span>
              <input
                type="range"
                min="2"
                max="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-20 sm:w-28 accent-emerald-500"
              />
              <span className="font-bold text-zinc-200 text-[11px]">${maxPrice} USD</span>
            </div>

            {/* Clear Filters Button */}
            {(search || selectedCategory !== 'all' || selectedCountry !== 'all' || maxPrice < 100) && (
              <button
                onClick={clearFilters}
                className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 text-[11px]"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="text-zinc-500 text-[11px]">
            Filtered: <span className="font-bold text-zinc-300">{filteredProducts.length}</span> items
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl p-10 text-center border border-zinc-800 space-y-3 max-w-md mx-auto">
          <div className="w-10 h-10 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-sm text-zinc-200">No matching African products found</h3>
          <p className="text-xs text-zinc-400">
            Try adjusting your search terms, raising the price ceiling, or resetting category filters.
          </p>
          <button
            onClick={clearFilters}
            className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-950 font-semibold text-xs hover:bg-white transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const favorited = isFavorite(product.id);
            return (
              <div
                key={product.id}
                className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition flex flex-col justify-between group"
              >
                {/* Top Image Box */}
                <div className="relative h-44 bg-zinc-950 overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer opacity-90 group-hover:opacity-100"
                    onClick={() => onOpenProduct(product.id)}
                  />

                  {/* Badges */}
                  <div className="absolute top-2 left-2 bg-zinc-950/80 backdrop-blur-xs text-zinc-200 text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-800 flex items-center gap-1">
                    <span>📍 {product.country}</span>
                  </div>

                  <button
                    onClick={() => onToggleFavorite(product.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-zinc-900/80 backdrop-blur-xs border border-zinc-700 text-zinc-400 hover:text-red-400 transition"
                    title={favorited ? 'Remove from favorites' : 'Save to favorites'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>

                  <div className="absolute bottom-2 left-2 bg-zinc-950/90 text-emerald-400 border border-emerald-900/80 text-[10px] font-mono px-2 py-0.5 rounded">
                    {product.categoryName}
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                      <span className="font-medium text-zinc-300 truncate max-w-[190px]">
                        {product.businessName}
                      </span>
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-mono">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    </div>

                    <h2
                      onClick={() => onOpenProduct(product.id)}
                      className="font-semibold text-zinc-100 text-sm leading-snug line-clamp-2 hover:text-emerald-400 cursor-pointer transition"
                    >
                      {product.name}
                    </h2>

                    <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  </div>

                  {/* Pricing & MOQ */}
                  <div className="pt-2.5 border-t border-zinc-800">
                    <div className="flex items-end justify-between font-mono">
                      <div>
                        <span className="text-[9px] uppercase text-zinc-500">Unit Price</span>
                        <p className="text-sm font-bold text-zinc-100 leading-tight">
                          {formatMoney(product.price, currentCurrency)}
                          <span className="text-[11px] font-normal text-zinc-400"> / {product.unit}</span>
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          MOQ: <span className="text-zinc-300">{product.minimumOrderQuantity} {product.unit}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-semibold text-amber-400 flex items-center gap-1 justify-end">
                          <span>★ {product.rating.toFixed(1)}</span>
                          <span className="text-zinc-500 font-normal">({product.reviewCount})</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 block mt-0.5">
                          AfCFTA Eligible
                        </span>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-zinc-800">
                      <button
                        onClick={() => onOpenProduct(product.id)}
                        className="w-full py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-medium border border-zinc-700/80 transition text-center"
                      >
                        Inspect
                      </button>

                      <button
                        onClick={() => onRequestQuotation(product)}
                        className="w-full py-1.5 px-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold transition text-center"
                      >
                        Quote RFQ
                      </button>
                    </div>

                    {/* Ask AI 1-click */}
                    <button
                      onClick={() => onAskAiProduct(product)}
                      className="w-full mt-1.5 py-1 px-2 rounded-lg bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-emerald-400 text-[11px] font-mono transition flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      Ask AI: Rules of Origin & Corridor Tariffs
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
