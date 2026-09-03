import React, { useState, useEffect } from 'react';
import { 
  Calculator, Sparkles, AlertTriangle, ArrowRight, 
  Truck, Plane, Ship, CheckCircle2, ShieldCheck, DollarSign
} from 'lucide-react';
import { Country } from '../types';
import { formatMoney } from '../services/currency';

interface TradeCalculatorViewProps {
  countries: Country[];
  currentCurrency: string;
  initialOrigin?: string;
  initialDestination?: string;
  initialPrice?: number;
  initialQuantity?: number;
  onOpenDocuments: (origin: string, dest: string) => void;
}

export const TradeCalculatorView: React.FC<TradeCalculatorViewProps> = ({
  countries,
  currentCurrency,
  initialOrigin = 'Rwanda',
  initialDestination = 'Kenya',
  initialPrice = 6.5,
  initialQuantity = 100,
  onOpenDocuments,
}) => {
  const [productPrice, setProductPrice] = useState<number>(initialPrice);
  const [quantity, setQuantity] = useState<number>(initialQuantity);
  const [weightKg, setWeightKg] = useState<number>(initialQuantity * 1);
  const [origin, setOrigin] = useState<string>(initialOrigin);
  const [destination, setDestination] = useState<string>(initialDestination);
  const [shippingMethod, setShippingMethod] = useState<'road' | 'air' | 'sea'>('road');

  const [calculation, setCalculation] = useState<any | null>(null);
  const [calculating, setCalculating] = useState(false);

  const runCalculation = async () => {
    setCalculating(true);
    try {
      const res = await fetch('/api/trade-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productPrice,
          quantity,
          weightKg,
          origin,
          destination,
          shippingMethod,
          currency: currentCurrency
        })
      });

      const data = await res.json();
      setCalculation(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    runCalculation();
  }, [productPrice, quantity, weightKg, origin, destination, shippingMethod, currentCurrency]);

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-4 space-y-4 text-zinc-100">
      {/* Header Banner */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 sm:p-6 text-zinc-100">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-emerald-400 text-xs font-mono">
            <Calculator className="w-3.5 h-3.5" /> AfCFTA Tariff & Freight Simulator
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
            Cross-Border Trade Calculator
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
            Estimate landed costs, freight transit budgets, marine cargo insurance, and indicative AfCFTA preferential tariff savings across African trade corridors.
          </p>
        </div>
      </div>

      {/* Grid: Inputs (Left) and Landed Cost Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-900 rounded-xl p-4 sm:p-5 border border-zinc-800 space-y-4">
          <h2 className="font-semibold text-xs font-mono uppercase tracking-wider text-zinc-300">
            Shipment Parameters
          </h2>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">
                Unit Price (USD)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={productPrice}
                onChange={(e) => setProductPrice(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-zinc-800 text-xs text-zinc-100 bg-zinc-950 focus:border-zinc-700 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => {
                    const q = Number(e.target.value);
                    setQuantity(q);
                    setWeightKg(q * 1); // 1kg default per unit
                  }}
                  className="w-full p-2 rounded-lg border border-zinc-800 text-xs text-zinc-100 bg-zinc-950 focus:border-zinc-700 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  min="1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-zinc-800 text-xs text-zinc-100 bg-zinc-950 focus:border-zinc-700 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Origin Country
                </label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full p-2 rounded-lg border border-zinc-800 text-xs text-zinc-200 bg-zinc-950 focus:border-zinc-700 focus:outline-hidden"
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Destination
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full p-2 rounded-lg border border-zinc-800 text-xs text-zinc-200 bg-zinc-950 focus:border-zinc-700 focus:outline-hidden"
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
              <label className="block text-[11px] text-zinc-400 mb-1.5">
                Transit Method & Corridor
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setShippingMethod('road')}
                  className={`p-2.5 rounded-lg border text-center transition flex flex-col items-center gap-1 ${
                    shippingMethod === 'road'
                      ? 'border-emerald-500 bg-zinc-950 text-emerald-400 font-semibold'
                      : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 text-xs'
                  }`}
                >
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px]">Road Transit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShippingMethod('air')}
                  className={`p-2.5 rounded-lg border text-center transition flex flex-col items-center gap-1 ${
                    shippingMethod === 'air'
                      ? 'border-emerald-500 bg-zinc-950 text-emerald-400 font-semibold'
                      : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 text-xs'
                  }`}
                >
                  <Plane className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px]">Air Cargo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShippingMethod('sea')}
                  className={`p-2.5 rounded-lg border text-center transition flex flex-col items-center gap-1 ${
                    shippingMethod === 'sea'
                      ? 'border-emerald-500 bg-zinc-950 text-emerald-400 font-semibold'
                      : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 text-xs'
                  }`}
                >
                  <Ship className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px]">Sea Freight</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Cost Summary (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {calculation && (
            <div className="bg-zinc-900 rounded-xl p-4 sm:p-5 border border-zinc-800 space-y-4 font-mono">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Landed Cost Breakdown
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Route: {origin} → {destination} • Transit Time: {calculation.leadTimeDays}
                  </p>
                </div>
                <span className="text-[10px] text-emerald-400 bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded">
                  AfCFTA Phase-Down
                </span>
              </div>

              {/* Cost Rows */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Product Invoice Value (FOB)</span>
                  <span className="text-zinc-200 font-semibold">
                    {formatMoney(calculation.productValue, currentCurrency)}
                  </span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>Corridor Freight ({weightKg} kg via {shippingMethod})</span>
                  <span className="text-zinc-200 font-semibold">
                    {formatMoney(calculation.estimatedShipping, currentCurrency)}
                  </span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>AfCFTA Preferential Duty (~2%)</span>
                  <span className="text-emerald-400 font-semibold">
                    {formatMoney(calculation.estimatedTariff, currentCurrency)}
                  </span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>Marine & Inland Cargo Insurance</span>
                  <span className="text-zinc-200 font-semibold">
                    {formatMoney(calculation.insuranceCost, currentCurrency)}
                  </span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>AfriTrade Platform & Escrow (2.5%)</span>
                  <span className="text-zinc-200 font-semibold">
                    {formatMoney(calculation.platformFee, currentCurrency)}
                  </span>
                </div>

                {/* AfCFTA Savings Callout */}
                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs text-zinc-200">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-zinc-300">AfCFTA Preferential Savings:</span>
                  </div>
                  <span className="text-emerald-400 font-bold">
                    -{formatMoney(calculation.afcftaSavings, currentCurrency)}
                  </span>
                </div>

                {/* Total Landed Cost */}
                <div className="pt-3 border-t border-zinc-800 flex justify-between items-baseline">
                  <div>
                    <span className="text-[10px] uppercase text-zinc-500 block">
                      Estimated Landed Cost
                    </span>
                    <p className="text-xl sm:text-2xl font-bold text-zinc-100">
                      {formatMoney(calculation.estimatedTotal, currentCurrency)}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 block">Per Unit</span>
                    <p className="text-base font-bold text-emerald-400">
                      {formatMoney(calculation.costPerUnit, currentCurrency)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-900/50 flex items-start gap-2 text-amber-300 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-amber-300/80">
                  {calculation.disclaimer}
                </p>
              </div>

              {/* Action */}
              <button
                onClick={() => onOpenDocuments(origin, destination)}
                className="w-full py-2 px-3 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition flex items-center justify-center gap-1.5"
              >
                <span>View Mandatory Documents for {origin} → {destination}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
