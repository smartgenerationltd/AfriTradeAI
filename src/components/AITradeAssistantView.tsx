import React, { useState } from 'react';
import { 
  Sparkles, Send, Globe, ArrowRight, ShieldAlert, 
  FileCheck, Calculator, Users, CheckCircle2, RefreshCw, 
  HelpCircle, ChevronRight, AlertTriangle
} from 'lucide-react';
import { Country } from '../types';

interface AITradeAssistantViewProps {
  countries: Country[];
  initialPrompt?: string;
  initialOrigin?: string;
  initialDestination?: string;
  initialProduct?: string;
  onOpenCalculator: (origin?: string, dest?: string) => void;
  onOpenDocuments: (origin?: string, dest?: string, product?: string) => void;
  onOpenMatching: (query?: string) => void;
}

export const AITradeAssistantView: React.FC<AITradeAssistantViewProps> = ({
  countries,
  initialPrompt = '',
  initialOrigin = 'Rwanda',
  initialDestination = 'Kenya',
  initialProduct = 'Bourbon Arabica Coffee',
  onOpenCalculator,
  onOpenDocuments,
  onOpenMatching,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [originCountry, setOriginCountry] = useState(initialOrigin);
  const [destinationCountry, setDestinationCountry] = useState(initialDestination);
  const [productName, setProductName] = useState(initialProduct);
  const [loading, setLoading] = useState(false);
  const [responseContent, setResponseContent] = useState<string | null>(null);
  const [responseSource, setResponseSource] = useState<string | null>(null);

  const samplePrompts = [
    "I want to export Bourbon coffee from Rwanda to Kenya. What are the steps, documents, and transit corridors?",
    "What are the packaging standards and phyto requirements for dried mangoes from Uganda to Ghana?",
    "How do Rules of Origin work under AfCFTA for handwoven textile goods?",
    "What are the Northern Corridor transit logistics and border clearance posts between Kenya and Uganda?",
    "What are the cost considerations and tariffs for exporting pure shea butter from Uganda to Rwanda?",
    "What documents are required to export cocoa and chocolate from Ghana to Nigeria?"
  ];

  const handleAskAssistant = async (customPrompt?: string) => {
    const textToAsk = customPrompt || prompt;
    if (!textToAsk.trim()) return;

    setLoading(true);
    setResponseContent(null);

    try {
      const res = await fetch('/api/ai/trade-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToAsk,
          originCountry,
          destinationCountry,
          product: productName
        })
      });

      if (!res.ok) {
        throw new Error('Failed to get response');
      }

      const data = await res.json();
      setResponseContent(data.content);
      setResponseSource(data.source);
    } catch (err: any) {
      console.error(err);
      setResponseContent(`### ⚠️ Connection Notice\nUnable to connect to trade intelligence server. Please ensure your network is connected and try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-4 space-y-4 text-zinc-100">
      {/* Header Banner */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 sm:p-6 text-zinc-100">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-emerald-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" /> AfCFTA AI Trade Terminal
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
            AI Trade Assistant
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
            Pan-African trade copilot. Ask questions regarding transit corridors, EAC & AfCFTA rules of origin, mandatory customs documentation, and commodity tariff rates.
          </p>
        </div>
      </div>

      {/* Query Configuration & Input Box */}
      <div className="bg-zinc-900 rounded-xl p-4 sm:p-5 border border-zinc-800 space-y-4">
        {/* Origin & Destination Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">
              Origin Country (Exporting From)
            </label>
            <select
              value={originCountry}
              onChange={(e) => setOriginCountry(e.target.value)}
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
              Destination Market (Importing To)
            </label>
            <select
              value={destinationCountry}
              onChange={(e) => setDestinationCountry(e.target.value)}
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
              Commodity / Product Name
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Arabica Coffee, Shea Butter, Textiles"
              className="w-full p-2 rounded-lg border border-zinc-800 text-xs text-zinc-200 bg-zinc-950 focus:border-zinc-700 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Textarea Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono text-zinc-300">
            Inquiry or Trade Hypothesis:
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your trade plans, question about tariffs, transit routes, or certification requirements..."
              className="w-full p-3 rounded-lg border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden focus:border-zinc-700 bg-zinc-950"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-[11px] font-mono text-zinc-500">
            Tip: Specifying origin, destination, and product yields tailored corridor guidance.
          </p>

          <button
            onClick={() => handleAskAssistant()}
            disabled={loading || !prompt.trim()}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-semibold text-xs transition flex items-center gap-1.5"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Analyzing Corridors...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Generate Trade Analysis
              </>
            )}
          </button>
        </div>

        {/* Starter Suggested Questions */}
        <div className="pt-3 border-t border-zinc-800/80 space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            Frequently Analyzed African Corridors:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {samplePrompts.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(sample);
                  handleAskAssistant(sample);
                }}
                className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-850 hover:border-zinc-700 text-left text-xs text-zinc-300 font-mono transition flex items-center justify-between group"
              >
                <span className="line-clamp-1">{sample}</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Structured AI Output Display */}
      {responseContent && (
        <div className="bg-zinc-900 rounded-xl p-5 sm:p-6 border border-zinc-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-zinc-800 text-emerald-400 flex items-center justify-center border border-zinc-700">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-semibold text-sm text-zinc-100">Trade Intelligence Dossier</h2>
                <span className="text-[11px] font-mono text-zinc-400">
                  Route: {originCountry} → {destinationCountry} • Commodity: {productName}
                </span>
              </div>
            </div>

            {responseSource && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                Engine: {responseSource}
              </span>
            )}
          </div>

          {/* Formatted Content */}
          <div className="space-y-3">
            {responseContent.split('### ').map((section, idx) => {
              if (!section.trim()) return null;
              const [rawTitle, ...rest] = section.split('\n');
              const body = rest.join('\n');
              return (
                <div key={idx} className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1.5">
                  <h3 className="font-semibold text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                    {rawTitle}
                  </h3>
                  <div className="text-xs text-zinc-300 whitespace-pre-line leading-relaxed">
                    {body}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mandatory Customs Disclaimer */}
          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-900/50 flex items-start gap-2.5 text-amber-300 text-xs font-mono">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-[11px] mb-0.5">Mandatory Customs & Regulatory Disclaimer:</strong>
              <p className="leading-relaxed text-[11px] text-amber-300/80">
                Verify current requirements with the relevant customs, trade or government authority. AI output is informational and must not be presented as legal or customs advice.
              </p>
            </div>
          </div>

          {/* Next Practical Actions 1-Click Bar */}
          <div className="pt-3 border-t border-zinc-800 space-y-2 font-mono">
            <span className="text-[11px] uppercase text-zinc-400 block">
              Immediate Operations on AfriTrade:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => onOpenDocuments(originCountry, destinationCountry, productName)}
                className="p-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 text-xs font-medium transition flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Document Checklist
                </span>
                <ArrowRight className="w-3 h-3 text-zinc-500" />
              </button>

              <button
                onClick={() => onOpenCalculator(originCountry, destinationCountry)}
                className="p-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 text-xs font-medium transition flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                  Landed Cost Matrix
                </span>
                <ArrowRight className="w-3 h-3 text-zinc-500" />
              </button>

              <button
                onClick={() => onOpenMatching(`Verified buyers or distributors for ${productName} in ${destinationCountry}`)}
                className="p-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 text-xs font-medium transition flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  Find Counterparties
                </span>
                <ArrowRight className="w-3 h-3 text-zinc-500" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
