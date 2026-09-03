import React, { useState } from 'react';
import { 
  X, ShoppingCart, Trash2, ShieldCheck, ArrowRight, 
  CreditCard, Smartphone, Building, CheckCircle2 
} from 'lucide-react';
import { CartItem, UserProfile } from '../types';
import { formatMoney } from '../services/currency';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currentCurrency: string;
  currentUser: UserProfile | null;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: (orderData: {
    shippingAddress: string;
    shippingCity: string;
    shippingCountry: string;
    contactPhone: string;
    paymentMethod: string;
  }) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  currentCurrency,
  currentUser,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  const [shippingAddress, setShippingAddress] = useState(currentUser?.city ? `Plot 14, Commercial Avenue, ${currentUser.city}` : 'KN 4 Ave, Commercial Trade Center');
  const [shippingCity, setShippingCity] = useState(currentUser?.city || 'Nairobi');
  const [shippingCountry, setShippingCountry] = useState(currentUser?.country || 'Kenya');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '+254 712 345 678');
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'card' | 'bank' | 'escrow'>('escrow');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const estimatedShipping = items.length > 0 ? 35 : 0;
  const platformFee = Number((subtotal * 0.025).toFixed(2));
  const grandTotal = subtotal + estimatedShipping + platformFee;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckingOut(true);

    setTimeout(() => {
      onCheckout({
        shippingAddress,
        shippingCity,
        shippingCountry,
        contactPhone,
        paymentMethod
      });
      setIsCheckingOut(false);
      setOrderSuccess(true);
      setTimeout(() => {
        setOrderSuccess(false);
        onClose();
      }, 2500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 text-zinc-100 h-full flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
            <h2 className="font-bold text-xs text-zinc-100">Trade Cart ({items.length})</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {orderSuccess ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-lg bg-zinc-800 text-emerald-400 border border-zinc-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-zinc-100">Order Placed Successfully</h3>
              <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
                Your order has been recorded in the buyer portal. The exporter has been notified to prepare export documentation.
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <ShoppingCart className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-xs font-semibold text-zinc-300">Your cart is empty</p>
              <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                Discover verified African commodities and products in the marketplace to start trading.
              </p>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="space-y-2.5">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 rounded-lg border border-zinc-800 bg-zinc-950 flex gap-2.5"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-lg object-cover border border-zinc-800 shrink-0"
                    />

                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="text-xs font-semibold text-zinc-100 line-clamp-1">
                          {item.product.name}
                        </h3>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-zinc-500 hover:text-red-400 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[10px] text-zinc-400">
                        {item.product.businessName} • 📍 {item.product.country}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center rounded border border-zinc-800 bg-zinc-900">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 5)}
                            className="px-2 py-0.5 text-xs text-zinc-400 hover:bg-zinc-800 rounded-l font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-bold text-zinc-200">
                            {item.quantity} {item.product.unit}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 5)}
                            className="px-2 py-0.5 text-xs text-zinc-400 hover:bg-zinc-800 rounded-r font-bold"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-xs font-bold text-emerald-400">
                          {formatMoney(item.product.price * item.quantity, currentCurrency)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Checkout Form */}
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-3 pt-3 border-t border-zinc-800">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-zinc-400">
                  Cross-Border Delivery & Payment
                </h4>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      Destination Country
                    </label>
                    <input
                      type="text"
                      value={shippingCountry}
                      onChange={(e) => setShippingCountry(e.target.value)}
                      required
                      className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">
                        City / Port
                      </label>
                      <input
                        type="text"
                        value={shippingCity}
                        onChange={(e) => setShippingCity(e.target.value)}
                        required
                        className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        required
                        className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      Delivery Address / Warehouse
                    </label>
                    <input
                      type="text"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      required
                      className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs"
                    />
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      Payment Settlement Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('escrow')}
                        className={`p-2 rounded-lg border text-left transition ${
                          paymentMethod === 'escrow'
                            ? 'border-emerald-500 bg-zinc-850 text-zinc-100 font-semibold'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mb-0.5" />
                        <span className="block text-[11px]">Trade Escrow</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('momo')}
                        className={`p-2 rounded-lg border text-left transition ${
                          paymentMethod === 'momo'
                            ? 'border-emerald-500 bg-zinc-850 text-zinc-100 font-semibold'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5 text-emerald-400 mb-0.5" />
                        <span className="block text-[11px]">Mobile Money</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-2 rounded-lg border text-left transition ${
                          paymentMethod === 'card'
                            ? 'border-emerald-500 bg-zinc-850 text-zinc-100 font-semibold'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5 text-emerald-400 mb-0.5" />
                        <span className="block text-[11px]">Card (Visa/MC)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('bank')}
                        className={`p-2 rounded-lg border text-left transition ${
                          paymentMethod === 'bank'
                            ? 'border-emerald-500 bg-zinc-850 text-zinc-100 font-semibold'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                        }`}
                      >
                        <Building className="w-3.5 h-3.5 text-emerald-400 mb-0.5" />
                        <span className="block text-[11px]">Bank Wire / LC</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Footer with Totals & Place Order CTA */}
        {items.length > 0 && !orderSuccess && (
          <div className="p-3.5 border-t border-zinc-800 bg-zinc-950 space-y-2.5">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Items Subtotal</span>
                <span>{formatMoney(subtotal, currentCurrency)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Estimated Freight & Transit</span>
                <span>{formatMoney(estimatedShipping, currentCurrency)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Platform & Escrow (2.5%)</span>
                <span>{formatMoney(platformFee, currentCurrency)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-zinc-100 pt-1.5 border-t border-zinc-800">
                <span>Total Amount</span>
                <span className="text-emerald-400">{formatMoney(grandTotal, currentCurrency)}</span>
              </div>
            </div>

            <button
              form="checkout-form"
              type="submit"
              disabled={isCheckingOut}
              className="w-full py-2 px-3 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isCheckingOut ? (
                <span>Securing Pan-African Trade Order...</span>
              ) : (
                <>
                  <span>Place Cross-Border Order</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
