import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
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
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import { SellerBusinessSetupView } from './components/SellerBusinessSetupView';
import { ForgotPasswordView } from './components/ForgotPasswordView';
import { AboutView } from './components/AboutView';
import { HowItWorksView } from './components/HowItWorksView';
import { PrivacyPolicyView, TermsOfServiceView } from './components/LegalViews';
import { ProfileView } from './components/ProfileView';
import { CompleteProfileView } from './components/CompleteProfileView';
import { AuthGateModal } from './components/AuthGateModal';
import { Product, UserRole } from './types';
import { LanguageCode } from './i18n';
import { 
  Globe, ShieldAlert, ArrowLeft, 
  Lock, AlertTriangle, CheckCircle2, ShieldCheck
} from 'lucide-react';

const PUBLIC_VIEWS = new Set([
  'home',
  'about',
  'how-it-works',
  'login',
  'register',
  'forgot-password',
  'privacy-policy',
  'terms-of-service',
  'complete-profile',
]);

export default function App() {
  const authState = useAuth();
  const store = useAppStore();

  const [activeView, setActiveView] = useState<string>('home');
  const [redirectTarget, setRedirectTarget] = useState<string | null>(null);

  // Selected item states
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-dismiss toast notification
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

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
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quoteProduct, setQuoteProduct] = useState<Product | null>(null);

  // Reusable Auth Gate Modal
  const [authGateModal, setAuthGateModal] = useState<{
    isOpen: boolean;
    featureTitle: string;
    featureDescription: string;
    targetView: string;
  }>({
    isOpen: false,
    featureTitle: '',
    featureDescription: '',
    targetView: 'marketplace'
  });

  // Keep store's currentUser in sync with AuthContext's userProfile
  useEffect(() => {
    if (authState.userProfile) {
      store.loginUser(authState.userProfile);
    } else {
      store.logoutUser();
    }
  }, [authState.userProfile]);

  // Navigate with view change and smooth scroll
  const navigateTo = (view: string, targetParam?: string) => {
    // Check if view is protected and user is unauthenticated
    if (!authState.isAuthenticated && !PUBLIC_VIEWS.has(view)) {
      setRedirectTarget(view);
      setActiveView('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Check if view is protected and user has incomplete profile
    if (authState.isAuthenticated && !authState.isProfileComplete && !PUBLIC_VIEWS.has(view)) {
      setRedirectTarget(view);
      setActiveView('complete-profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Profile completion callback
  const handleCompleteProfileSuccess = (chosenRole: 'buyer' | 'seller') => {
    setToastMessage('Trader identity saved successfully. Welcome to AfriTrade AI.');
    if (chosenRole === 'seller') {
      setActiveView('seller-business-setup');
    } else {
      const destination = redirectTarget;
      setRedirectTarget(null);
      if (destination && !PUBLIC_VIEWS.has(destination)) {
        setActiveView(destination);
      } else {
        setActiveView('buyer');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth success callback
  const handleAuthSuccess = (target?: string) => {
    setToastMessage('Welcome back to AfriTrade AI.');
    const destination = target || redirectTarget;
    setRedirectTarget(destination);

    // If profile is not complete, enforce complete-profile
    if (!authState.isProfileComplete) {
      setActiveView('complete-profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setRedirectTarget(null);

    if (destination && !PUBLIC_VIEWS.has(destination)) {
      setActiveView(destination);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Role-based default destination
    if (authState.role === 'seller') {
      if (authState.userProfile?.businessId) {
        setActiveView('seller');
      } else {
        setActiveView('seller-business-setup');
      }
    } else if (authState.role === 'admin') {
      setActiveView('admin');
    } else {
      setActiveView('buyer');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigation handlers with auth gates
  const handleOpenProduct = (productId: string) => {
    setSelectedProductId(productId);
    if (!authState.isAuthenticated) {
      setRedirectTarget('product-detail');
      setActiveView('login');
    } else if (!authState.isProfileComplete) {
      setRedirectTarget('product-detail');
      setActiveView('complete-profile');
    } else {
      setActiveView('product-detail');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBusiness = (businessId: string) => {
    setSelectedBusinessId(businessId);
    if (!authState.isAuthenticated) {
      setRedirectTarget('business-detail');
      setActiveView('login');
    } else if (!authState.isProfileComplete) {
      setRedirectTarget('business-detail');
      setActiveView('complete-profile');
    } else {
      setActiveView('business-detail');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreMarketplace = (search?: string, categoryId?: string, countryName?: string) => {
    if (search !== undefined) setMarketSearch(search);
    if (categoryId !== undefined) setMarketCategory(categoryId);
    if (countryName !== undefined) setMarketCountry(countryName);

    if (!authState.isAuthenticated) {
      setRedirectTarget('marketplace');
      setActiveView('login');
    } else if (!authState.isProfileComplete) {
      setRedirectTarget('marketplace');
      setActiveView('complete-profile');
    } else {
      setActiveView('marketplace');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchAiTrade = (prompt?: string, origin?: string, dest?: string, prod?: string) => {
    if (prompt) setAssistantPrompt(prompt);
    if (origin) setTradeOrigin(origin);
    if (dest) setTradeDest(dest);
    if (prod) setTradeProduct(prod);

    if (!authState.isAuthenticated) {
      // Requirement 16: Show gate with specific text
      setAuthGateModal({
        isOpen: true,
        featureTitle: 'AI Trade Assistant',
        featureDescription: 'Create your free AfriTrade AI account to use the AI Trade Assistant.',
        targetView: 'ai-trade-assistant'
      });
    } else if (!authState.isProfileComplete) {
      setRedirectTarget('ai-trade-assistant');
      setActiveView('complete-profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveView('ai-trade-assistant');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenCalculator = (origin?: string, dest?: string, price?: number, qty?: number) => {
    if (origin) setTradeOrigin(origin);
    if (dest) setTradeDest(dest);
    if (price) setTradePrice(price);
    if (qty) setTradeQty(qty);

    if (!authState.isAuthenticated) {
      setRedirectTarget('trade-calculator');
      setActiveView('login');
    } else if (!authState.isProfileComplete) {
      setRedirectTarget('trade-calculator');
      setActiveView('complete-profile');
    } else {
      setActiveView('trade-calculator');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDocuments = (origin?: string, dest?: string, product?: string) => {
    if (origin) setTradeOrigin(origin);
    if (dest) setTradeDest(dest);
    if (product) setTradeProduct(product);

    if (!authState.isAuthenticated) {
      setRedirectTarget('trade-documents');
      setActiveView('login');
    } else if (!authState.isProfileComplete) {
      setRedirectTarget('trade-documents');
      setActiveView('complete-profile');
    } else {
      setActiveView('trade-documents');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // E-commerce action gates (Add to Cart, RFQ, Messages, Favorites)
  const handleAddToCart = (product: Product, quantity: number) => {
    if (!authState.isAuthenticated) {
      setAuthGateModal({
        isOpen: true,
        featureTitle: 'Add to Wholesale Cart',
        featureDescription: 'Create your free AfriTrade AI account or sign in to build your commodity shipment order.',
        targetView: 'marketplace'
      });
      return;
    }
    if (!authState.isProfileComplete) {
      setRedirectTarget('marketplace');
      setActiveView('complete-profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    store.addToCart(product, quantity);
    setIsCartOpen(true);
  };

  const handleRequestQuote = (product: Product) => {
    if (!authState.isAuthenticated) {
      setAuthGateModal({
        isOpen: true,
        featureTitle: 'Request Commercial Quotation',
        featureDescription: 'Create your free account or sign in to tender wholesale requests for quotation to African producers.',
        targetView: selectedProductId ? 'product-detail' : 'marketplace'
      });
      return;
    }
    if (!authState.isProfileComplete) {
      setRedirectTarget(selectedProductId ? 'product-detail' : 'marketplace');
      setActiveView('complete-profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setQuoteProduct(product);
    setIsQuoteOpen(true);
  };

  const handleContactSeller = (sellerId: string, sellerName: string, productId?: string, productName?: string) => {
    if (!authState.isAuthenticated) {
      setAuthGateModal({
        isOpen: true,
        featureTitle: 'Contact African Seller',
        featureDescription: 'Sign in or create an account to initiate direct commercial negotiations.',
        targetView: 'messages'
      });
      return;
    }
    const initialText = productName 
      ? `Greetings! I am interested in sourcing ${productName} through AfriTrade. Can you provide wholesale delivery terms?`
      : `Hello! I would like to inquire regarding your cross-border export inventory.`;
    store.sendMessage(sellerId, sellerName, initialText);
    setActiveView('messages');
  };

  const handleToggleFavorite = (productId: string) => {
    if (!authState.isAuthenticated) {
      setAuthGateModal({
        isOpen: true,
        featureTitle: 'Save to Favorites',
        featureDescription: 'Create your free account or sign in to bookmark verified commodities and producers.',
        targetView: activeView
      });
      return;
    }
    store.toggleFavorite('product', productId);
  };

  // Currently selected product or business for details
  const selectedProduct = store.products.find(p => p.id === selectedProductId) || store.products[0];
  const selectedBusiness = store.businesses.find(b => b.businessId === selectedBusinessId) || 
    store.businesses.find(b => b.businessId === selectedProduct?.businessId) || store.businesses[0];

  // Derive unread count for current user
  const unreadNotifs = store.notifications.filter(n => store.currentUser ? n.userId === store.currentUser.id && !n.read : false).length;

  // Requirement 20: Loading States - prevent authentication flicker
  if (authState.loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-zinc-100 font-sans p-4">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 mb-4 shadow-xl">
          <Globe className="w-6 h-6 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-sm font-bold tracking-tight text-white font-display">
            AfriTrade AI
          </h2>
          <p className="text-xs font-mono text-zinc-400">
            Verifying AfCFTA Authentication Credentials...
          </p>
        </div>
      </div>
    );
  }

  // Active view rendering check
  const isCurrentViewProtected = !PUBLIC_VIEWS.has(activeView);
  const showLoginGate = isCurrentViewProtected && !authState.isAuthenticated;
  const showCompleteProfileGate = isCurrentViewProtected && authState.isAuthenticated && !authState.isProfileComplete;

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

      {/* Prominent warning banner for authenticated users with incomplete identification */}
      {authState.isAuthenticated && !authState.isProfileComplete && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-200 flex flex-wrap items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Please complete your profile before continuing.</strong> To unlock Pan-African trading, customs compliance tools, and market discovery, full user identification is required.
            </span>
          </div>
          <button
            onClick={() => {
              setActiveView('complete-profile');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold transition shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Complete Profile</span>
          </button>
        </div>
      )}

      {/* Email verification notice banner if logged in without verified email */}
      {authState.isAuthenticated && authState.userProfile && !authState.userProfile.emailVerified && (
        <div className="bg-amber-950/70 border-b border-amber-800/80 px-4 py-2 text-xs text-amber-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Email Verification Recommended:</strong> Verify your email address for secure AfCFTA customs clearance and full features.
            </span>
          </div>
          <button
            onClick={authState.resendVerificationEmail}
            className="px-2.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-semibold transition shrink-0"
          >
            {authState.emailVerificationSent ? 'Verification Sent!' : 'Resend Email'}
          </button>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentUser={authState.userProfile}
        isProfileComplete={authState.isProfileComplete}
        currentCurrency={store.currentCurrency}
        currentLang={store.currentLang as LanguageCode}
        cartCount={store.cart.reduce((acc, it) => acc + it.quantity, 0)}
        unreadNotifsCount={unreadNotifs}
        activeView={activeView}
        onSelectView={navigateTo}
        onSelectCurrency={store.setCurrentCurrency}
        onSelectLanguage={store.setCurrentLang}
        onOpenCart={() => {
          if (!authState.isAuthenticated) {
            setAuthGateModal({
              isOpen: true,
              featureTitle: 'Wholesale Trade Cart',
              featureDescription: 'Sign in or create an account to view and manage your cart.',
              targetView: 'cart'
            });
            return;
          }
          if (!authState.isProfileComplete) {
            setRedirectTarget('cart');
            setActiveView('complete-profile');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
          setIsCartOpen(true);
        }}
        onOpenLogin={() => {
          setRedirectTarget(activeView);
          setActiveView('login');
        }}
        onOpenRegister={() => {
          setRedirectTarget(activeView);
          setActiveView('register');
        }}
        onLogout={async () => {
          await authState.signOut();
          setActiveView('login');
        }}
      />

      {/* Main Application Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-4 py-4 sm:py-6">
        {/* If the current requested view is protected and the user is NOT authenticated, display LoginView with Gate banner */}
        {showLoginGate ? (
          <LoginView
            redirectTarget={activeView}
            onNavigate={setActiveView}
            onSuccess={handleAuthSuccess}
          />
        ) : showCompleteProfileGate ? (
          <div className="space-y-4">
            <div className="max-w-2xl mx-auto p-4 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-center gap-3 text-xs text-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="font-semibold text-amber-100">Please complete your profile before continuing.</p>
                <p className="text-zinc-400 mt-0.5">The requested page ({activeView.replace(/-/g, ' ')}) requires a verified trader profile under AfCFTA compliance regulations.</p>
              </div>
            </div>
            <CompleteProfileView onSuccess={handleCompleteProfileSuccess} />
          </div>
        ) : (
          <>
            {/* 1. PUBLIC VIEWS */}
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

            {activeView === 'about' && (
              <AboutView onNavigate={navigateTo} />
            )}

            {activeView === 'how-it-works' && (
              <HowItWorksView onNavigate={navigateTo} />
            )}

            {activeView === 'privacy-policy' && (
              <PrivacyPolicyView onNavigate={navigateTo} />
            )}

            {activeView === 'terms-of-service' && (
              <TermsOfServiceView onNavigate={navigateTo} />
            )}

            {activeView === 'login' && (
              <LoginView
                redirectTarget={redirectTarget}
                onNavigate={setActiveView}
                onSuccess={handleAuthSuccess}
              />
            )}

            {activeView === 'register' && (
              <RegisterView
                onNavigate={setActiveView}
                onRegisteredBuyer={() => {
                  handleAuthSuccess(redirectTarget || 'buyer');
                }}
                onRegisteredSeller={() => {
                  setActiveView('seller-business-setup');
                }}
              />
            )}

            {activeView === 'forgot-password' && (
              <ForgotPasswordView onNavigate={setActiveView} />
            )}

            {activeView === 'seller-business-setup' && (
              <SellerBusinessSetupView
                onSuccess={() => {
                  setActiveView('seller');
                }}
              />
            )}

            {activeView === 'complete-profile' && (
              <CompleteProfileView
                onSuccess={handleCompleteProfileSuccess}
              />
            )}

            {/* 2. PROTECTED VIEWS */}
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
                onAskAiProduct={(prod) => handleLaunchAiTrade(
                  `What are the customs duties, required certs, and shipping corridors to import ${prod.name} from ${prod.country}?`,
                  prod.country,
                  'Kenya',
                  prod.name
                )}
                onToggleFavorite={handleToggleFavorite}
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
                onAddToCart={handleAddToCart}
                onRequestQuotation={handleRequestQuote}
                onContactSeller={handleContactSeller}
                onAskAi={(prompt, orig, dest, prod) => handleLaunchAiTrade(prompt, orig, dest, prod)}
                onToggleFavorite={handleToggleFavorite}
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
                onOpenMatching={() => setActiveView('matching')}
              />
            )}

            {activeView === 'market-discovery' && (
              <MarketDiscoveryView
                countries={store.countries}
                categories={store.categories}
                onLaunchAssistantWithMarket={(prod, orig, dest) => handleLaunchAiTrade(
                  `Analyze market entry strategy for exporting ${prod} from ${orig} to ${dest} under AfCFTA`,
                  orig,
                  dest,
                  prod
                )}
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

            {/* Dashboard role protection checks */}
            {activeView === 'buyer' && (
              <BuyerDashboardView
                currentUser={store.currentUser || authState.userProfile!}
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

            {activeView === 'seller' && (
              authState.role === 'buyer' ? (
                <div className="max-w-md mx-auto my-12 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl text-center space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Seller Access Required
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Your account is registered as a Commercial Buyer. You cannot access the Seller Hub.
                  </p>
                  <div className="flex gap-2 justify-center pt-2">
                    <button
                      onClick={() => setActiveView('buyer')}
                      className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs rounded-xl"
                    >
                      Go to Buyer Dashboard
                    </button>
                    <button
                      onClick={() => setActiveView('profile')}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs rounded-xl"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ) : (
                <SellerDashboardView
                  currentUser={store.currentUser || authState.userProfile!}
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
              )
            )}

            {activeView === 'admin' && (
              authState.role !== 'admin' ? (
                <div className="max-w-md mx-auto my-12 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl text-center space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Administrator Privileges Required
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Access to the AfriTrade AI Operations Console is restricted to authenticated administrators.
                  </p>
                  <button
                    onClick={() => setActiveView(authState.role === 'seller' ? 'seller' : 'buyer')}
                    className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs rounded-xl"
                  >
                    Return to User Dashboard
                  </button>
                </div>
              ) : (
                <AdminDashboardView
                  currentUser={store.currentUser || authState.userProfile!}
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
              )
            )}

            {activeView === 'messages' && (
              <MessagesView
                currentUser={store.currentUser || authState.userProfile!}
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

            {activeView === 'profile' && (
              <ProfileView onNavigate={navigateTo} />
            )}
          </>
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
          <div className="flex flex-wrap items-center gap-4 text-zinc-500 text-[11px]">
            <button 
              onClick={() => navigateTo('privacy-policy')}
              className="hover:text-zinc-300 transition"
            >
              Privacy Policy
            </button>
            <span className="text-zinc-700">•</span>
            <button 
              onClick={() => navigateTo('terms-of-service')}
              className="hover:text-zinc-300 transition"
            >
              Terms of Service
            </button>
            <span className="text-zinc-700">|</span>
            <span>Escrow Engine: Active</span>
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
            setAuthGateModal({
              isOpen: true,
              featureTitle: 'Request Quotation',
              featureDescription: 'Sign in to submit your formal RFQ.',
              targetView: 'marketplace'
            });
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

      {/* Auth Gate Feature Modal */}
      <AuthGateModal
        isOpen={authGateModal.isOpen}
        onClose={() => setAuthGateModal(prev => ({ ...prev, isOpen: false }))}
        featureTitle={authGateModal.featureTitle}
        featureDescription={authGateModal.featureDescription}
        targetView={authGateModal.targetView}
        onNavigateToLogin={(target) => {
          setRedirectTarget(target || null);
          setActiveView('login');
        }}
        onNavigateToRegister={(target) => {
          setRedirectTarget(target || null);
          setActiveView('register');
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-zinc-900/95 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-medium rounded-xl shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-zinc-500 hover:text-zinc-300 text-xs transition cursor-pointer"
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
