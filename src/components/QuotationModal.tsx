import React, { useState } from 'react';
import { X, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Product, Country } from '../types';
import { formatMoney } from '../services/currency';

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  countries: Country[];
  currentCurrency: string;
  onSubmitQuotation: (data: {
    productId: string;
    sellerId: string;
    requestedQuantity: number;
    destinationCountry: string;
    targetPrice?: number;
    message: string;
  }) => void;
}

export const QuotationModal: React.FC<QuotationModalProps> = ({
  isOpen,
  onClose,
  product,
  countries,
  currentCurrency,
  onSubmitQuotation,
}) => {
  if (!isOpen || !product) return null;

  const [quantity, setQuantity] = useState<number>(product.minimumOrderQuantity * 2);
  const [destinationCountry, setDestinationCountry] = useState<string>('Kenya');
  const [targetPrice, setTargetPrice] = useState<number>(product.price);
  const [message, setMessage] = useState<string>(
    `Hello ${product.businessName}, we are interested in importing a wholesale batch of ${product.name}. Please provide your best CIF or FOB price and lead time to ${destinationCountry}.`
  );
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitQuotation({
      productId: product.id,
      sellerId: product.sellerId,
      requestedQuantity: quantity,
      destinationCountry,
      targetPrice,
      message,
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-zinc-900 rounded-xl max-w-lg w-full p-5 sm:p-6 border border-zinc-800 relative space-y-4 text-zinc-100 font-mono text-xs">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            B2B Commercial Tender
          </span>
          <h2 className="text-base sm:text-lg font-bold text-zinc-100">
            Request Formal Quotation
          </h2>
          <p className="text-[11px] text-zinc-400">
            Direct tender request to <strong className="text-zinc-200">{product.businessName}</strong> ({product.country}).
          </p>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 text-emerald-400 border border-zinc-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-100">Quotation Request Sent</h3>
            <p className="text-[11px] text-zinc-400">
              The seller will review your order specs and respond with a formal pro-forma invoice in your Buyer Portal.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Product summary card */}
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center gap-3">
              <img
                src={product.images[0]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-lg object-cover border border-zinc-800 shrink-0"
              />
              <div className="text-xs">
                <h4 className="font-semibold text-zinc-100 line-clamp-1">{product.name}</h4>
                <p className="text-[11px] text-zinc-400">
                  Price: {formatMoney(product.price, currentCurrency)} / {product.unit} (MOQ: {product.minimumOrderQuantity})
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Requested Quantity ({product.unit})
                </label>
                <input
                  type="number"
                  min={product.minimumOrderQuantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  required
                  className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Destination Country
                </label>
                <select
                  value={destinationCountry}
                  onChange={(e) => setDestinationCountry(e.target.value)}
                  className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100"
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">
                Target Unit Price (USD) - Optional
              </label>
              <input
                type="number"
                step="0.01"
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">
                Custom Specifications & Inquiries
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-3 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Quotation Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
