import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckSquare, Square, AlertCircle, 
  Download, Printer, AlertTriangle, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { Country, Category } from '../types';

interface TradeDocumentsViewProps {
  countries: Country[];
  categories: Category[];
  initialOrigin?: string;
  initialDestination?: string;
  initialProduct?: string;
}

export const TradeDocumentsView: React.FC<TradeDocumentsViewProps> = ({
  countries,
  categories,
  initialOrigin = 'Rwanda',
  initialDestination = 'Kenya',
  initialProduct = 'Bourbon Arabica Coffee',
}) => {
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [category, setCategory] = useState('Coffee & Tea');
  const [checkedDocs, setCheckedDocs] = useState<{ [key: string]: boolean }>({});
  const [docData, setDocData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trade-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          category,
          product: initialProduct
        })
      });
      const data = await res.json();
      setDocData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [origin, destination, category]);

  const toggleCheck = (docName: string) => {
    setCheckedDocs(prev => ({
      ...prev,
      [docName]: !prev[docName]
    }));
  };

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-4 space-y-4 text-zinc-100">
      {/* Header Banner */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 sm:p-6 text-zinc-100">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-emerald-400 text-xs font-mono">
            <FileText className="w-3.5 h-3.5" /> Customs Compliance Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
            Trade Document Checklist
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
            Generate an official, interactive documentation roadmap for customs clearance, standards inspection, and AfCFTA preferential tariff qualification.
          </p>
        </div>
      </div>

      {/* Origin, Destination & Category Controls */}
      <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">
              Exporting Country (Origin)
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
              Importing Country (Destination)
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

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">
              Commodity Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 rounded-lg border border-zinc-800 text-xs text-zinc-200 bg-zinc-950 focus:border-zinc-700 focus:outline-hidden"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Document Checklist Display */}
      {docData && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                Mandatory Documentation: {docData.origin} → {docData.destination}
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Category: {docData.category} • Complete all required documents prior to border checkpoint dispatch.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-mono transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Checklist
            </button>
          </div>

          {/* Document Cards */}
          <div className="space-y-2.5">
            {docData.documents?.map((doc: any, idx: number) => {
              const isDone = Boolean(checkedDocs[doc.name]);
              return (
                <div
                  key={idx}
                  onClick={() => toggleCheck(doc.name)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                    isDone 
                      ? 'bg-zinc-950/90 border-emerald-900/60' 
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 text-zinc-500 shrink-0 focus:outline-hidden"
                  >
                    {isDone ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-zinc-600" />
                    )}
                  </button>

                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className={`text-xs font-semibold ${isDone ? 'text-zinc-400 line-through' : 'text-zinc-200'}`}>
                        {doc.name}
                      </h3>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        doc.required ? 'bg-amber-950/60 text-amber-300 border border-amber-900/50' : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                      }`}>
                        {doc.status}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {doc.description}
                    </p>

                    <div className="pt-1 text-[11px] text-zinc-500 font-mono">
                      <span className="text-zinc-400">Authority: </span>
                      {doc.issuedBy}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Practical Guidelines */}
          {docData.guidelines && (
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
              <h4 className="font-mono text-xs uppercase tracking-wider text-zinc-400">
                Corridor Clearance Guidelines
              </h4>
              <ul className="space-y-1 text-xs text-zinc-300 font-mono">
                {docData.guidelines.map((g: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mandatory Disclaimer */}
          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-900/50 flex items-start gap-2 text-amber-300 text-[11px] font-mono">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-amber-300/80">
              {docData.disclaimer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
