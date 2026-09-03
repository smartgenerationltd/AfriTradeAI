import React, { useState } from 'react';
import { 
  Globe, ShoppingCart, Bell, User, Search, ShieldCheck, 
  Menu, X, Sparkles, Compass, Calculator, FileText, 
  Store, Package, LogOut, CheckCircle2, ChevronDown
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { SUPPORTED_CURRENCIES } from '../services/currency';
import { LANGUAGES, LanguageCode, TRANSLATIONS } from '../i18n';

interface NavbarProps {
  currentUser: UserProfile | null;
  currentCurrency: string;
  currentLang: LanguageCode;
  cartCount: number;
  unreadNotifsCount: number;
  activeView: string;
  onSelectView: (view: string) => void;
  onSelectCurrency: (curr: string) => void;
  onSelectLanguage: (lang: LanguageCode) => void;
  onSwitchRole: (role: UserRole) => void;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentCurrency,
  currentLang,
  cartCount,
  unreadNotifsCount,
  activeView,
  onSelectView,
  onSelectCurrency,
  onSelectLanguage,
  onSwitchRole,
  onOpenCart,
  onOpenAuth,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const t = (key: string) => TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS['en'][key] || key;

  return (
    <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-800 text-zinc-100">
      {/* Top utility bar */}
      <div className="bg-zinc-950 border-b border-zinc-800/80 text-zinc-400 text-xs py-1 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" /> AfCFTA Terminal Active
            </span>
            <span className="hidden sm:inline text-zinc-700">|</span>
            <span className="hidden sm:inline text-zinc-400">
              Pan-African Trade Matrix • 35+ Nations Interconnected
            </span>
          </div>

          {/* Quick Demo Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-medium text-[11px]">Role Switch:</span>
            <div className="inline-flex rounded-md p-0.5 bg-zinc-900 border border-zinc-800">
              <button
                onClick={() => onSwitchRole('buyer')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  currentUser?.role === 'buyer' 
                    ? 'bg-zinc-800 text-emerald-400 shadow-xs border border-zinc-700/60' 
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Buyer (KE)
              </button>
              <button
                onClick={() => onSwitchRole('seller')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  currentUser?.role === 'seller' 
                    ? 'bg-zinc-800 text-emerald-400 shadow-xs border border-zinc-700/60' 
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Seller (RW)
              </button>
              <button
                onClick={() => onSwitchRole('admin')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  currentUser?.role === 'admin' 
                    ? 'bg-zinc-800 text-amber-400 shadow-xs border border-zinc-700/60' 
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <button 
            onClick={() => onSelectView('home')}
            className="flex items-center gap-2.5 text-left focus:outline-hidden group"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100 font-bold shadow-xs group-hover:border-zinc-700 transition">
              <Globe className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-zinc-100 font-display">
                  AfriTrade<span className="text-emerald-400">.AI</span>
                </span>
                <span className="px-1.5 py-0.2 bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 text-[9px] font-mono rounded">
                  AfCFTA
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 font-mono tracking-tight hidden sm:block">
                High Density Cross-Border Protocol
              </p>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs">
            <button
              onClick={() => onSelectView('marketplace')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition ${
                activeView === 'marketplace' 
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              Marketplace
            </button>
            <button
              onClick={() => onSelectView('ai-trade-assistant')}
              className={`px-2.5 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition ${
                activeView === 'ai-trade-assistant' 
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 shadow-xs' 
                  : 'text-emerald-400 bg-zinc-900/60 border border-zinc-800 hover:bg-zinc-800/80'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              AI Trade Assistant
            </button>
            <button
              onClick={() => onSelectView('market-discovery')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition ${
                activeView === 'market-discovery' 
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              Discovery
            </button>
            <button
              onClick={() => onSelectView('matching')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition ${
                activeView === 'matching' 
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              Partner Match
            </button>
            <button
              onClick={() => onSelectView('trade-calculator')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition ${
                activeView === 'trade-calculator' 
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              Calculator
            </button>
            <button
              onClick={() => onSelectView('trade-documents')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition ${
                activeView === 'trade-documents' 
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              Documents
            </button>
          </nav>

          {/* Right Action Icons: Currency, Language, Cart, Profile */}
          <div className="flex items-center gap-1.5">
            {/* Currency Selector */}
            <div className="relative">
              <button
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="px-2 py-1 rounded-md border border-zinc-800 bg-zinc-900 text-xs font-mono text-zinc-300 hover:bg-zinc-850 hover:border-zinc-700 flex items-center gap-1.5"
                title="Change Currency"
              >
                <span>{SUPPORTED_CURRENCIES[currentCurrency]?.flag}</span>
                <span>{currentCurrency}</span>
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </button>

              {currencyDropdownOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-zinc-900 rounded-lg shadow-2xl border border-zinc-800 py-1 z-50 text-xs">
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-mono text-zinc-500 border-b border-zinc-800">
                    Select Currency
                  </div>
                  {Object.values(SUPPORTED_CURRENCIES).map(curr => (
                    <button
                      key={curr.code}
                      onClick={() => {
                        onSelectCurrency(curr.code);
                        setCurrencyDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-zinc-800 ${
                        curr.code === currentCurrency ? 'font-semibold text-emerald-400 bg-zinc-800/60' : 'text-zinc-300'
                      }`}
                    >
                      <span className="flex items-center gap-2 font-mono">
                        <span>{curr.flag}</span>
                        <span>{curr.code} ({curr.symbol})</span>
                      </span>
                      {curr.code === currentCurrency && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="px-2 py-1 rounded-md border border-zinc-800 bg-zinc-900 text-xs font-mono text-zinc-300 hover:bg-zinc-850 hover:border-zinc-700 flex items-center gap-1"
                title="Change Language"
              >
                <Globe className="w-3 h-3 text-zinc-400" />
                <span className="uppercase">{currentLang}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-zinc-900 rounded-lg shadow-2xl border border-zinc-800 py-1 z-50 text-xs">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onSelectLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-zinc-800 ${
                        lang.code === currentLang ? 'font-semibold text-emerald-400 bg-zinc-800/60' : 'text-zinc-300'
                      }`}
                    >
                      <span>{lang.nativeName}</span>
                      {lang.code === currentLang && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-1.5 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-zinc-950 text-[9px] font-bold flex items-center justify-center font-mono">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => {
                if (currentUser?.role === 'seller') onSelectView('seller');
                else if (currentUser?.role === 'admin') onSelectView('admin');
                else onSelectView('buyer');
              }}
              className="relative p-1.5 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute 1 top-1 right-1 w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>

            {/* User Account / Dashboard Menu */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 pl-1.5 pr-1 py-1 rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-700 transition"
                >
                  <img
                    src={currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80'}
                    alt={currentUser.fullName}
                    className="w-5 h-5 rounded-full object-cover border border-zinc-700"
                  />
                  <span className="hidden md:inline text-xs font-medium text-zinc-200">
                    {currentUser.fullName.split(' ')[0]}
                  </span>
                  <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-semibold uppercase ${
                    currentUser.role === 'admin' 
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                      : currentUser.role === 'seller'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                      : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                  }`}>
                    {currentUser.role}
                  </span>
                  <ChevronDown className="w-3 h-3 text-zinc-500" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-56 bg-zinc-900 rounded-lg shadow-2xl border border-zinc-800 py-1.5 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-zinc-800">
                      <p className="font-semibold text-zinc-100 truncate">{currentUser.fullName}</p>
                      <p className="text-[11px] text-zinc-400 font-mono truncate">{currentUser.email}</p>
                      <p className="text-[10px] text-emerald-400 font-medium mt-0.5">
                        📍 {currentUser.city}, {currentUser.country}
                      </p>
                    </div>

                    <div className="py-1">
                      {currentUser.role === 'buyer' && (
                        <button
                          onClick={() => {
                            onSelectView('buyer');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full px-3 py-1.5 text-left text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 flex items-center gap-2"
                        >
                          <Package className="w-3.5 h-3.5 text-zinc-400" />
                          Buyer Orders & Dashboard
                        </button>
                      )}

                      {currentUser.role === 'seller' && (
                        <button
                          onClick={() => {
                            onSelectView('seller');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full px-3 py-1.5 text-left text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 flex items-center gap-2"
                        >
                          <Store className="w-3.5 h-3.5 text-zinc-400" />
                          Seller Hub & Inventory
                        </button>
                      )}

                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            onSelectView('admin');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full px-3 py-1.5 text-left text-zinc-300 hover:bg-zinc-800 hover:text-amber-300 flex items-center gap-2"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                          Admin Console
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onSelectView('messages');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-3 py-1.5 text-left text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 flex items-center gap-2"
                      >
                        Trade Messages
                      </button>
                    </div>

                    <div className="border-t border-zinc-800 pt-1">
                      <button
                        onClick={() => {
                          onLogout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-3 py-1.5 text-left text-red-400 hover:bg-red-950/40 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-md border border-zinc-800 text-zinc-400 hover:bg-zinc-800"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-zinc-950 border-t border-zinc-800 px-3 py-2.5 space-y-2">
          <div className="grid grid-cols-2 gap-1.5 pb-2 border-b border-zinc-800 text-xs">
            <button
              onClick={() => { onSelectView('marketplace'); setMobileMenuOpen(false); }}
              className={`p-2 rounded font-medium text-center ${
                activeView === 'marketplace' ? 'bg-zinc-800 text-zinc-100' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              Marketplace
            </button>
            <button
              onClick={() => { onSelectView('ai-trade-assistant'); setMobileMenuOpen(false); }}
              className={`p-2 rounded font-medium text-center flex items-center justify-center gap-1 ${
                activeView === 'ai-trade-assistant' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-zinc-900 text-emerald-400'
              }`}
            >
              <Sparkles className="w-3 h-3" /> AI Trade
            </button>
            <button
              onClick={() => { onSelectView('market-discovery'); setMobileMenuOpen(false); }}
              className={`p-2 rounded font-medium text-center ${
                activeView === 'market-discovery' ? 'bg-zinc-800 text-zinc-100' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              Discovery
            </button>
            <button
              onClick={() => { onSelectView('matching'); setMobileMenuOpen(false); }}
              className={`p-2 rounded font-medium text-center ${
                activeView === 'matching' ? 'bg-zinc-800 text-zinc-100' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              Partner Match
            </button>
            <button
              onClick={() => { onSelectView('trade-calculator'); setMobileMenuOpen(false); }}
              className={`p-2 rounded font-medium text-center ${
                activeView === 'trade-calculator' ? 'bg-zinc-800 text-zinc-100' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              Calculator
            </button>
            <button
              onClick={() => { onSelectView('trade-documents'); setMobileMenuOpen(false); }}
              className={`p-2 rounded font-medium text-center ${
                activeView === 'trade-documents' ? 'bg-zinc-800 text-zinc-100' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              Documents
            </button>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs">
            <span className="font-mono text-zinc-500">Dashboards:</span>
            <div className="flex gap-1.5">
              <button 
                onClick={() => { onSelectView('buyer'); setMobileMenuOpen(false); }}
                className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded font-mono text-[11px]"
              >
                Buyer
              </button>
              <button 
                onClick={() => { onSelectView('seller'); setMobileMenuOpen(false); }}
                className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded font-mono text-[11px]"
              >
                Seller
              </button>
              <button 
                onClick={() => { onSelectView('admin'); setMobileMenuOpen(false); }}
                className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-amber-400 rounded font-mono text-[11px]"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
