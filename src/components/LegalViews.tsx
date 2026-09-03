import React from 'react';
import { ShieldCheck, Lock, FileText, ArrowLeft } from 'lucide-react';

interface PolicyProps {
  onNavigate: (view: string) => void;
}

export const PrivacyPolicyView: React.FC<PolicyProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6 font-sans text-zinc-100">
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </button>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
          Privacy Policy
        </h1>
        <p className="text-xs text-zinc-400 font-mono">
          Last updated: September 2025 • Compliant with African Continental Free Trade Area (AfCFTA) Digital Trade Protocol
        </p>
      </div>

      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-5 text-xs leading-relaxed text-zinc-300">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white">1. Information We Collect</h2>
          <p>
            AfriTrade AI collects account information including legal names, business names, corporate registrations, phone numbers, email addresses, and country of origin required for enterprise compliance and cross-border customs declarations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white">2. Authentication & Data Protection</h2>
          <p>
            User authentication credentials are managed securely via Firebase Authentication with industry-standard encryption. We do not store plaintext passwords on our servers. Access to trade communications, quotations, and commercial invoices is restricted to authorized transaction parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white">3. AfCFTA Trade Matrix Usage</h2>
          <p>
            Trade inquiries submitted to the AI Trade Assistant are processed through secure server-side APIs to provide customs, tariff, and shipping advice. Confidential pricing quotes are not shared with unauthorized third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white">4. User Rights & Data Subject Access</h2>
          <p>
            You have the right to inspect, update, or request deletion of your account and enterprise profile at any time by contacting AfriTrade Operations at compliance@afritrade.ai.
          </p>
        </section>
      </div>
    </div>
  );
};

export const TermsOfServiceView: React.FC<PolicyProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6 font-sans text-zinc-100">
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </button>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
          Terms of Service
        </h1>
        <p className="text-xs text-zinc-400 font-mono">
          Last updated: September 2025 • Governing cross-border B2B transactions
        </p>
      </div>

      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-5 text-xs leading-relaxed text-zinc-300">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white">1. Platform Eligibility</h2>
          <p>
            AfriTrade AI is a B2B trade intelligence and commodities marketplace. By registering as an African Producer or Commercial Buyer, you warrant that you are legally authorized to engage in cross-border trade under your home nation&apos;s commercial code.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white">2. Mandatory Verification for Sellers</h2>
          <p>
            All sellers registering an enterprise agree to submit legitimate corporate documentation. Businesses remain in pending status until vetted by platform administrators. Display of unauthorized verification seals is strictly prohibited.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white">3. Quotations & Escrow Settlement</h2>
          <p>
            Price quotations tendered through the platform constitute formal commercial offers. Incoterms (FOB, CIF, EXW) and delivery lead times specified in accepted quotations are legally binding between buyer and seller.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white">4. Tariff Accuracy Disclaimer</h2>
          <p>
            While AfriTrade AI calculates AfCFTA preferential tariff rates based on official published tariff books, customs border authorities retain final jurisdiction over commodity classification, rules of origin certificates, and inspection fees.
          </p>
        </section>
      </div>
    </div>
  );
};
