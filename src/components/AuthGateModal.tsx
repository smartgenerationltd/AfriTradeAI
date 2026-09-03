import React from 'react';
import { ShieldCheck, Sparkles, ShoppingBag, ArrowRight, X, Lock } from 'lucide-react';

interface AuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle?: string;
  featureDescription?: string;
  targetView: string;
  onNavigateToLogin: (redirectTarget?: string) => void;
  onNavigateToRegister: (redirectTarget?: string) => void;
}

export const AuthGateModal: React.FC<AuthGateModalProps> = ({
  isOpen,
  onClose,
  featureTitle = 'Protected Trade Feature',
  featureDescription = 'Create your free AfriTrade AI account or sign in to continue.',
  targetView,
  onNavigateToLogin,
  onNavigateToRegister,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-3 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
              AfriTrade Member Access
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {featureTitle}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xs mx-auto leading-relaxed">
              {featureDescription}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-2.5">
          <button
            onClick={() => {
              onClose();
              onNavigateToRegister(targetView);
            }}
            className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              onClose();
              onNavigateToLogin(targetView);
            }}
            className="w-full py-2.5 px-4 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition"
          >
            Sign In
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-zinc-800/80 text-center">
          <p className="text-[11px] text-zinc-500">
            Compliant with AfCFTA cross-border transaction protocols.
          </p>
        </div>
      </div>
    </div>
  );
};
