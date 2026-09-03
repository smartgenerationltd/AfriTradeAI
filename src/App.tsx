import React, { useState } from 'react';
import { useAppStore } from './services/store';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { MarketplaceView } from './components/MarketplaceView';
import { ProductDetailView } from './components/ProductDetailView';
import { BusinessProfileView } from './components/BusinessProfileView';
import { TradeCalculatorView } from './components/TradeCalculatorView';
import { AITradeAssistantView } from './components/AITradeAssistantView';
import { MarketDiscoveryView } from './components/MarketDiscoveryView';
import { MatchingView } from './components/MatchingView';
import { TradeDocumentsView } from './components/TradeDocumentsView';
import { BuyerDashboardView } from './components/BuyerDashboardView';
import { SellerDashboardView } from './components/SellerDashboardView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { MessagesView } from './components/MessagesView';
import { CartDrawer } from './components/CartDrawer';
import { QuotationModal } from './components/QuotationModal';
import { AuthModal } from './components/AuthModal';
import { Product, UserRole } from './types';
import { LanguageCode } from './i18n';
import { 
  Sparkles, TrendingUp, ShieldCheck, Globe, 
  Activity, ArrowUpRight, Cpu, Layers 
} from 'lucide-react';

export default function App() {
  const store = useAppStore();

  const [activeView, setActiveView] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  // Marketplace filter params
  const [marketSearch, setMarketSearch] = useState<string>('');
  const [marketCategory, setMarketCategory] = useState<string>('all');
  const [marketCountry, setMarketCountry] = useState<string>('all');

  // Assistant & Calculator params
  const [assistantPrompt, setAssistantPrompt] = useState<string>('');
  const [tradeOrigin, setTradeOrigin] = useState<string>('Rwanda');
  const [tradeDest, setTradeDest] = useState<string>('Kenya');
  const [tradeProduct, setTradeProduct] = useState<string>('Bourbon Arabica Coffee');
  const [tradePrice, setTradePrice] = useState<number>(6.5);
  const [tradeQty, setTradeQty] = useState<number>(100);

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quoteProduct, setQuoteProduct] = useState<Product | null>(null);

  // Handlers
  const handleOpenProduct = (productId: string) => {
    setSelectedProductId(productId);
    setActiveView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBusiness = (businessId: string) => {
    setSelectedBusinessId(businessId);
    setActiveView('business-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreMarketplace = (search?: string, categoryId?: string, countryName?: string) => {
    if (search !== undefined) setMarketSearch(search);
    if (categoryId !== undefined) setMarketCategory(categoryId);
    if (countryName !== undefined) setMarketCountry(countryName);
    setActiveView('marketplace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchAiTrade = (prompt?: string, origin?: string, dest?: string, prod?: string) => {
    if (prompt) setAssistantPrompt(prompt);
    if (origin) setTradeOrigin(origin);
    if (dest) setTradeDest(dest);
    if (prod) setTradeProduct(prod);
    setActiveView('ai-trade-assistant');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCalculator = (origin?: string, dest?: string, price?: number, qty?: number) => {
    if (origin) setTradeOrigin(origin);
    if (dest) setTradeDest(dest);
    if (price) setTradePrice(price);
    if (qty) setTradeQty(qty);
    setActiveView('trade-calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDocuments = (origin?: string, dest?: string, product?: string) => {
    if (origin) setTradeOrigin(origin);
    if (dest) setTradeDest(dest);
    if (product) setTradeProduct(product);
    setActiveView('trade-documents');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRequestQuote = (product: Product) => {
    setQuoteProduct(product);
    setIsQuoteOpen(true);
  };

  const handleContactSeller = (sellerId: string, sellerName: string, productId?: string, productName?: string) => {
    const initialText = productName 
      ? `Greetings! I am interested in sourcing ${productName} through AfriTrade. Can you provide wholesale delivery terms?`
      : `Hello! I would like to inquire regarding your cross-border export inventory.`;
    store.sendMessage(sellerId, sellerName, initialText);
    setActiveView('messages');
  };

  // Currently selected product or business for details
  const selectedProduct = store.products.find(p => p.id === selectedProductId) || store.products[0];
  const selectedBusiness = store.businesses.find(b => b.businessId === selectedBusinessId) || 
    store.businesses.find(b => b.businessId === selectedProduct?.businessId) || store.businesses[0];

  // Derive unread count for current user
  const unreadNotifs = store.notifications.filter(n => store.currentUser ? n.userId === store.currentUser.id && !n.read : false).length;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-zinc-100">
      {/* High Density Live Market Status Ticker */}
      <div className="bg-zinc-950 border-b border-zinc-800/80 px-3 py-1.5 text-[11px] text-zinc-400 font-mono tracking-tight flex items-center justify-between overflow-x-auto gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold uppercase text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AfCFTA Protocol Live
          </span>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-300">Active Lanes: 54 Signatories</span>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-400 hidden sm:inline">Tariff Liberalization: 90% Non-Sensitive Goods</span>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-zinc-400">
          <span className="text-zinc-500 hidden md:inline">Indicative Forex:</span>
          <span className="text-zinc-300">1 USD = 130.5 KES</span>
          <span className="text-zinc-300">1,350 RWF</span>
          <span className="text-zinc-300">1,580 NGN</span>
          <span className="text-zinc-300">15.6 GHS</span>
          <span className="text-emerald-400 font-medium">Auto-Escrow: Ready</span>
        </div>
      </div>

      {/* Main Navbar */}
      <Navbar
        currentUser={store.currentUser}
        currentCurrency={store.currentCurrency}
        currentLang={store.currentLang as LanguageCode}
        cartCount={store.cart.reduce((acc, it) => acc + it.quantity, 0)}
        unreadNotifsCount={unreadNotifs}
        activeView={activeView}
        onSelectView={(v) => {
          setActiveView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectCurrency={store.setCurrentCurrency}
        onSelectLanguage={store.setCurrentLang}
        onSwitchRole={store.switchUserRole}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={store.logoutUser}
      />

      {/* Main Application Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-4 py-4 sm:py-6">
        {activeView === 'home' && (
          <HomeView
            products={store.products}
            businesses={store.businesses}
            countries={store.countries}
            categories={store.categories}
            currentCurrency={store.currentCurrency}
            onExploreMarketplace={handleExploreMarketplace}
            onOpenProduct={handleOpenProduct}
            onOpenBusiness={handleOpenBusiness}
            onLaunchAiTrade={handleLaunchAiTrade}
          />
        )}

        {activeView === 'marketplace' && (
          <MarketplaceView
            products={store.products}
            categories={store.categories}
            countries={store.countries}
            currentCurrency={store.currentCurrency}
            initialSearch={marketSearch}
            initialCategory={marketCategory}
            initialCountry={marketCountry}
            onOpenProduct={handleOpenProduct}
            onRequestQuotation={handleRequestQuote}
            onAskAiProduct={(prod) => handleLaunchAiTrade(`What are the customs duties, required certs, and shipping corridors to import ${prod.name} from ${prod.country}?`, prod.country, 'Kenya', prod.name)}
            onToggleFavorite={(id) => store.toggleFavorite('product', id)}
            isFavorite={(id) => store.isFavorite('product', id)}
          />
        )}

        {activeView === 'product-detail' && selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            business={selectedBusiness}
            reviews={store.reviews.filter(r => r.productId === selectedProduct.id)}
            currentUser={store.currentUser}
            currentCurrency={store.currentCurrency}
            onBack={() => setActiveView('marketplace')}
            onAddToCart={(prod, qty) => store.addToCart(prod, qty)}
            onRequestQuotation={handleRequestQuote}
            onContactSeller={(sellerId, sellerName, prodId, prodName) => handleContactSeller(sellerId, sellerName, prodId, prodName)}
            onAskAi={(prompt, orig, dest, prod) => handleLaunchAiTrade(prompt, orig, dest, prod)}
            onToggleFavorite={(id) => store.toggleFavorite('product', id)}
            isFavorite={store.isFavorite('product', selectedProduct.id)}
            onAddReview={(rating, comment) => {
              if (store.currentUser) {
                store.addReview({
                  buyerId: store.currentUser.id,
                  buyerName: store.currentUser.fullName,
                  sellerId: selectedProduct.sellerId,
                  productId: selectedProduct.id,
                  orderId: 'ord-verified',
                  rating,
                  comment
                });
              }
            }}
          />
        )}

        {activeView === 'business-detail' && selectedBusiness && (
          <BusinessProfileView
            business={selectedBusiness}
            products={store.products}
            currentCurrency={store.currentCurrency}
            onBack={() => setActiveView('marketplace')}
            onOpenProduct={handleOpenProduct}
            onContactSeller={(sellerId, sellerName) => handleContactSeller(sellerId, sellerName)}
            onRequestQuoteProduct={handleRequestQuote}
          />
        )}

        {activeView === 'ai-trade-assistant' && (
          <AITradeAssistantView
            countries={store.countries}
            initialPrompt={assistantPrompt}
            initialOrigin={tradeOrigin}
            initialDestination={tradeDest}
            initialProduct={tradeProduct}
            onOpenCalculator={(orig, dest) => handleOpenCalculator(orig, dest)}
            onOpenDocuments={(orig, dest, prod) => handleOpenDocuments(orig, dest, prod)}
            onOpenMatching={(q) => {
              setActiveView('matching');
            }}
          />
        )}

        {activeView === 'market-discovery' && (
          <MarketDiscoveryView
            countries={store.countries}
            categories={store.categories}
            onLaunchAssistantWithMarket={(prod, orig, dest) => handleLaunchAiTrade(`Analyze market entry strategy for exporting ${prod} from ${orig} to ${dest} under AfCFTA`, orig, dest, prod)}
          />
        )}

        {activeView === 'matching' && (
          <MatchingView
            businesses={store.businesses}
            products={store.products}
            countries={store.countries}
            categories={store.categories}
            onOpenBusiness={handleOpenBusiness}
            onRequestQuoteBusiness={(biz) => {
              const firstBizProd = store.products.find(p => p.businessId === biz.businessId);
              if (firstBizProd) handleRequestQuote(firstBizProd);
            }}
            onContactBusiness={(sellerId, bizName) => handleContactSeller(sellerId, bizName)}
          />
        )}

        {activeView === 'trade-calculator' && (
          <TradeCalculatorView
            countries={store.countries}
            currentCurrency={store.currentCurrency}
            initialOrigin={tradeOrigin}
            initialDestination={tradeDest}
            initialPrice={tradePrice}
            initialQuantity={tradeQty}
            onOpenDocuments={(orig, dest) => handleOpenDocuments(orig, dest)}
          />
        )}

        {activeView === 'trade-documents' && (
          <TradeDocumentsView
            countries={store.countries}
            categories={store.categories}
            initialOrigin={tradeOrigin}
            initialDestination={tradeDest}
            initialProduct={tradeProduct}
          />
        )}

        {activeView === 'buyer' && store.currentUser && (
          <BuyerDashboardView
            currentUser={store.currentUser}
            orders={store.orders}
            quotations={store.quotations}
            products={store.products}
            businesses={store.businesses}
            currentCurrency={store.currentCurrency}
            onOpenProduct={handleOpenProduct}
            onOpenBusiness={handleOpenBusiness}
            onAcceptQuotation={(qId) => store.acceptQuotation(qId)}
            onOpenMessages={() => setActiveView('messages')}
            onExploreMarketplace={() => setActiveView('marketplace')}
          />
        )}

        {activeView === 'seller' && store.currentUser && (
          <SellerDashboardView
            currentUser={store.currentUser}
            sellerBusiness={store.businesses.find(b => b.businessId === store.currentUser?.businessId)}
            products={store.products}
            orders={store.orders}
            quotations={store.quotations}
            categories={store.categories}
            countries={store.countries}
            currentCurrency={store.currentCurrency}
            onAddProduct={(prodData) => store.addProduct(prodData)}
            onUpdateProduct={(pId, updates) => store.updateProduct(pId, updates)}
            onDeleteProduct={(pId) => store.deleteProduct(pId)}
            onUpdateOrderStatus={(oId, stat, trk) => store.updateOrderStatus(oId, stat, trk)}
            onRespondQuotation={(qId, res) => store.respondToQuotation(qId, {
              offeredUnitPrice: res.unitPrice,
              shippingEstimate: res.shippingQuote,
              estimatedDeliveryTime: res.leadTimeDays,
              sellerNotes: res.notes
            })}
          />
        )}

        {activeView === 'admin' && store.currentUser && (
          <AdminDashboardView
            currentUser={store.currentUser}
            businesses={store.businesses}
            products={store.products}
            orders={store.orders}
            currentCurrency={store.currentCurrency}
            onVerifyBusiness={(bId) => store.setBusinessVerification(bId, 'verified')}
            onSuspendBusiness={(bId) => store.setBusinessVerification(bId, 'suspended')}
            onToggleProductStatus={(pId) => {
              const p = store.products.find(x => x.id === pId);
              if (p) store.updateProduct(pId, { status: p.status === 'published' ? 'suspended' : 'published' });
            }}
            onDeleteProduct={(pId) => store.deleteProduct(pId)}
          />
        )}

        {activeView === 'messages' && store.currentUser && (
          <MessagesView
            currentUser={store.currentUser}
            conversations={[
              {
                id: 'conv-ke-rw',
                participants: ['user-buyer-ke', 'user-seller-rw'],
                participantNames: {
                  'user-buyer-ke': 'Amina Kimani (Kenya)',
                  'user-seller-rw': 'Jean-Paul Ngarambe (Rwanda)'
                },
                lastMessage: 'Greetings Amina! Fantastic news...',
                lastMessageAt: '2025-08-27T16:10:00Z',
                unreadCount: 0,
                relatedProductName: 'Bourbon Arabica Specialty Grade A'
              }
            ]}
            messages={store.messages}
            onSendMessage={(cId, receiverId, txt) => {
              store.sendMessage(receiverId, 'Trade Counterpart', txt, cId);
            }}
          />
        )}
      </main>

      {/* High Density Terminal Status Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800 text-zinc-400 py-4 px-4 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="font-semibold text-zinc-200">AfriTrade AI</span>
            <span className="text-zinc-700">•</span>
            <span>High Density Pan-African Logistics Terminal</span>
            <span className="text-zinc-700">•</span>
            <span className="text-emerald-400">AfCFTA Trade Matrix Compliant</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-500 text-[11px]">
            <span>Latency: 28ms</span>
            <span className="text-zinc-700">|</span>
            <span>Escrow Engine: Active</span>
            <span className="text-zinc-700">|</span>
            <button 
              onClick={store.resetToSeedData}
              className="hover:text-zinc-300 underline underline-offset-2 transition"
            >
              Reset Seed Data
            </button>
          </div>
        </div>
      </footer>

      {/* Drawers & Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={store.cart}
        currentCurrency={store.currentCurrency}
        currentUser={store.currentUser}
        onUpdateQuantity={store.updateCartQuantity}
        onRemoveItem={store.removeFromCart}
        onCheckout={(orderData) => {
          store.createOrderFromCart({
            recipientName: store.currentUser?.fullName || 'Consignee',
            street: orderData.shippingAddress,
            city: orderData.shippingCity,
            country: orderData.shippingCountry,
            phone: orderData.contactPhone
          });
          setIsCartOpen(false);
          setActiveView('buyer');
        }}
      />

      <QuotationModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        product={quoteProduct}
        countries={store.countries}
        currentCurrency={store.currentCurrency}
        onSubmitQuotation={(data) => {
          if (!store.currentUser) {
            setIsAuthOpen(true);
            return;
          }
          store.createQuotationRequest({
            productId: data.productId,
            productName: quoteProduct?.name || 'African Product',
            productImage: quoteProduct?.images[0],
            buyerId: store.currentUser.id,
            buyerName: store.currentUser.fullName,
            buyerEmail: store.currentUser.email,
            buyerCountry: store.currentUser.country,
            destinationCountry: data.destinationCountry,
            sellerId: data.sellerId,
            sellerBusinessName: quoteProduct?.businessName || 'African Exporter',
            requestedQuantity: data.requestedQuantity,
            unit: quoteProduct?.unit || 'units',
            message: data.message,
            offeredUnitPrice: data.targetPrice
          });
          setIsQuoteOpen(false);
          setActiveView('buyer');
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        countries={store.countries}
        onSignIn={(userData) => {
          store.loginUser({
            id: `user-${Date.now()}`,
            fullName: userData.fullName,
            email: userData.email,
            phone: userData.phone,
            country: userData.country,
            city: userData.city,
            role: userData.role,
            businessName: userData.businessName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'active'
          });
          setIsAuthOpen(false);
        }}
        onSelectPresetRole={(role: UserRole) => {
          store.switchUserRole(role);
          setIsAuthOpen(false);
        }}
      />
    </div>
  );
}
