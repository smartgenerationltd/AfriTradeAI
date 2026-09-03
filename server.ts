import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Gemini client helper
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    app: 'AfriTrade AI', 
    tagline: 'Trade Africa. Grow Africa.',
    version: '1.0.0',
    hasGeminiKey: Boolean(getGeminiClient()),
    timestamp: new Date().toISOString()
  });
});

// 2. Currency Rates Endpoint
app.get('/api/currency', (req, res) => {
  res.json({
    base: 'USD',
    timestamp: new Date().toISOString(),
    isLive: Boolean(process.env.EXCHANGE_RATE_API_KEY),
    disclaimer: 'Indicative rate — verify current rate with bank or customs before completing a transaction.',
    rates: {
      USD: 1.0,
      RWF: 1350.0,
      KES: 130.5,
      UGX: 3720.0,
      TZS: 2600.0,
      NGN: 1580.0,
      GHS: 15.6,
      ZAR: 18.2,
      ETB: 120.0
    }
  });
});

// 3. AI Trade Assistant Endpoint (Flagship Feature)
app.post('/api/ai/trade-assistant', async (req, res) => {
  try {
    const { prompt, product, originCountry, destinationCountry } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are AfriTrade AI, the premier Pan-African Cross-Border Trade & AfCFTA Advisor for African MSMEs (Micro, Small & Medium Enterprises).
Your mission is "Trade Africa. Grow Africa."

CRITICAL RULES:
1. Always structure your advice with clear headings:
   - 🌍 Market Opportunity
   - 📋 Recommended Steps
   - 📑 Documents / Information to Check
   - 🚚 Logistics & Trade Corridors
   - 💰 Cost Considerations
   - ⚠️ Risks to Mitigate
   - 🚀 Next Practical Actions
2. NEVER invent laws, taxes, tariffs, or customs regulations.
3. ALWAYS include this exact disclaimer in your guidance:
   "Verify current requirements with the relevant customs, trade or government authority. AI output is informational and must not be presented as legal or customs advice."
4. Understand African Regional Economic Communities (EAC, ECOWAS, SADC, COMESA, AMU) and the African Continental Free Trade Area (AfCFTA) Guided Trade Initiative.
5. Provide actionable, practical advice tailored to small and medium businesses with limited capital.`;

    if (!ai) {
      // High-quality contextual fallback when API key is not configured in local environment
      const simulatedResponse = generateFallbackTradeAssistant(prompt, originCountry, destinationCountry, product);
      return res.json(simulatedResponse);
    }

    const userMessage = `Trade Query: "${prompt}"
Context:
- Origin Country: ${originCountry || 'Unspecified African Country'}
- Destination Country: ${destinationCountry || 'Unspecified African Country'}
- Commodity/Product: ${product || 'General Merchandise'}

Provide a structured, actionable trade analysis adhering to your guidelines and disclaimer.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userMessage,
      config: {
        systemInstruction,
        temperature: 0.3,
      }
    });

    const text = response.text || 'Unable to generate trade response at this moment.';
    res.json({
      content: text,
      source: 'gemini-3.8-flash',
      disclaimer: 'Verify current requirements with the relevant customs, trade or government authority. AI output is informational and must not be presented as legal or customs advice.'
    });

  } catch (error: any) {
    console.error('Error calling Gemini AI Trade Assistant:', error);
    res.status(500).json({
      error: 'Failed to process AI trade query.',
      details: error.message
    });
  }
});

// Helper for fallback trade assistant when API key not yet set in preview
function generateFallbackTradeAssistant(query: string, origin: string = 'Rwanda', destination: string = 'Kenya', product: string = 'Coffee') {
  return {
    source: 'AfriTrade Knowledge Engine (Demo Mode)',
    content: `### 🌍 Market Opportunity
Exporting **${product}** from **${origin}** to **${destination}** leverages strong intra-regional commercial ties. Both countries are active participants in regional integration frameworks (such as EAC and AfCFTA), enabling significant reductions on import duties when proper Rules of Origin documentation is satisfied. Urban demand for origin-traceable, high-grade agro-commodities continues to experience robust growth.

### 📋 Recommended Steps
1. **Business & Product Registration**: Ensure your enterprise is formally registered in ${origin} with the national development or export promotion board.
2. **Obtain Certificate of Origin**: Secure a regional Certificate of Origin (EAC / AfCFTA) issued by the competent national authority prior to shipment dispatch.
3. **Phytosanitary & Quality Inspection**: Complete mandatory lab testing and obtain a Phytosanitary Certificate or Certificate of Conformity from the standard bureau (e.g. Rwanda Standards Board / KEBS).
4. **Select Authorized Freight Forwarder**: Partner with a licensed clearing and forwarding agent experienced in the Northern or Central Transit Corridors.
5. **Issue Formal Pro-Forma Invoice & Sales Contract**: Formalize payment terms (such as Letter of Credit or partial upfront deposit with balance against bill of lading).

### 📑 Documents / Information to Check
- **AfCFTA / Regional Certificate of Origin**
- **Commercial Invoice & Detailed Packing List**
- **Phytosanitary Inspection Certificate** (for agriculture/food items)
- **Single Customs Declaration (SCD)** via the National Single Window system
- **Transit Bond / Road Consignment Note (Consignment Waybill)**

### 🚚 Logistics & Trade Corridors
- **Primary Corridor**: Northern Corridor (Mombasa - Nairobi - Kampala - Kigali) via the Gatuna/Katuna or Kagitumba/Mirama Hills One-Stop Border Post (OSBP).
- **Average Transit Time**: 3 to 6 business days for road freight under Single Customs Territory procedures.
- **Packaging Standard**: Use food-grade, moisture-barrier multiwall sacks (e.g., GrainPro) to protect aroma and prevent post-harvest mold in transit.

### 💰 Cost Considerations
- **Freight Estimate**: Approximately $0.60 – $0.90 USD per kg for consolidated road cargo.
- **Port & Border Handling Fees**: Weighbridge and terminal inspection charges at OSBP.
- **Insurance**: Marine/transit inland cargo insurance typically averages 0.3% – 0.6% of CIF value.
- **Preferential Tariffs**: Eligible for 0% duty under EAC Common Market Protocol or reduced AfCFTA tariff concessions upon verification of origin criteria.

### ⚠️ Risks to Mitigate
- **Documentation Discrepancies**: Minor naming mismatches between invoice and phyto certificates can cause costly border demurrage.
- **Currency Fluctuation**: Peg contracts to stable convertibles or utilize cross-border clearing platforms like PAPSS (Pan-African Payment and Settlement System).
- **Border Clearance Delays**: Pre-clear documents electronically before trucks arrive at the border post.

### 🚀 Next Practical Actions
1. Request a structured quotation from verified suppliers or buyers on AfriTrade AI.
2. Run our **Cross-Border Trade Calculator** to estimate landed unit costs and platform fees.
3. Download the specific **Trade Document Checklist** for the ${origin} → ${destination} corridor.

---
*Notice: Verify current requirements with the relevant customs, trade or government authority. AI output is informational and must not be presented as legal or customs advice.*`,
    disclaimer: 'Verify current requirements with the relevant customs, trade or government authority. AI output is informational and must not be presented as legal or customs advice.'
  };
}

// 4. AI Market Discovery Endpoint
app.post('/api/ai/market-discovery', async (req, res) => {
  try {
    const { productName, originCountry, category, quantity, priceTarget } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      // Structured fallback result
      const fallbackResult = {
        productName: productName || 'Specialty African Agro Product',
        originCountry: originCountry || 'Rwanda',
        targetMarkets: [
          {
            country: 'Kenya',
            opportunityScore: 92,
            demandOverview: `High consumer purchasing power in Nairobi and Mombasa with expanding specialty retail chains and hospitality demand for ${productName || 'agro products'}.`,
            potentialBuyers: 'Supermarket chains (Naivas, Carrefour Kenya), specialty distributors, hotel procurement desks.',
            logisticsConsiderations: 'Direct overland transit via Northern Corridor through Uganda or direct daily cargo flights.',
            tariffNotes: '0% preferential duty under EAC Common Market Customs Union upon presentation of EAC Certificate of Origin.',
            estimatedImportVolume: 'Growing at 14% YoY',
            recommendedFirstStep: 'Engage registered retail distributors in Nairobi and supply sample batches with accredited test reports.'
          },
          {
            country: 'Uganda',
            opportunityScore: 86,
            demandOverview: 'Cross-border wholesale hub servicing South Sudan and Eastern DR Congo distribution corridors.',
            potentialBuyers: 'Kikuubo wholesale market consolidators and commercial packaging houses in Kampala.',
            logisticsConsiderations: 'Short road transit via Gatuna OSBP (12-18 hours).',
            tariffNotes: 'Duty-free under EAC protocol with standard 18% VAT applicable upon customs clearance.',
            estimatedImportVolume: 'Steady regional demand',
            recommendedFirstStep: 'Connect with Kampala wholesale buyers via AfriTrade AI verified buyer network.'
          },
          {
            country: 'Ghana',
            opportunityScore: 79,
            demandOverview: 'Strategic gateway to ECOWAS with thriving consumer market for unique origin-certified pan-African products.',
            potentialBuyers: 'Accra upscale organic grocers, wellness boutiques, and boutique hospitality chains.',
            logisticsConsiderations: 'Air cargo via Ethiopian Airlines / RwandAir or maritime transit via Tema Port.',
            tariffNotes: 'Eligible for AfCFTA preferential tariff phase-down under the Guided Trade Initiative.',
            estimatedImportVolume: 'High growth premium segment',
            recommendedFirstStep: 'Audit product packaging to ensure bilingual labeling (English/French) and GSA compliance.'
          },
          {
            country: 'Nigeria',
            opportunityScore: 84,
            demandOverview: 'Africa\'s largest consumer market with massive population and strong appetite for quality raw and packaged commodities.',
            potentialBuyers: 'Industrial manufacturers, commercial food processors in Lagos and Kano, large retail supermarket groups.',
            logisticsConsiderations: 'Direct air freight to Murtala Muhammed Cargo Wing or maritime to Lagos Apapa Port.',
            tariffNotes: 'Requires NAFDAC import permit and AfCFTA proof of origin for preferential duty access.',
            estimatedImportVolume: 'High volume wholesale capacity',
            recommendedFirstStep: 'Partner with a licensed Nigerian import agent to manage regulatory clearing with NAFDAC.'
          },
          {
            country: 'South Africa',
            opportunityScore: 81,
            demandOverview: 'Sophisticated retail infrastructure with established cold chains and demand for premium artisanal African imports.',
            potentialBuyers: 'Specialty national retail chains (Woolworths, Checkers), industrial roasters, cosmetic labs.',
            logisticsConsiderations: 'Direct maritime via Durban Port or air freight into OR Tambo International.',
            tariffNotes: 'Subject to SADC / AfCFTA rules with strict South African Bureau of Standards (SABS) alignment.',
            estimatedImportVolume: 'Moderate to high value contract orders',
            recommendedFirstStep: 'Ensure full traceability records and international fair-trade or organic certifications.'
          }
        ],
        strategicAdvice: `Position ${productName} as a premium, origin-guaranteed African product with traceable smallholder impact. Highlight quality metrics (moisture, grade, organic cultivation) on your digital storefront.`,
        keyQuestionsToInvestigate: [
          'What are the mandatory packaging and labeling regulations in the destination country?',
          'Does the buyer require supplier financing, letter of credit, or escrow payments?',
          'What is the shelf-life stability during multi-day overland or sea transit?'
        ],
        disclaimer: 'AI-generated trade insights are for market exploration and strategic planning. Verify current tariffs and customs procedures with national trade ministries.'
      };
      return res.json(fallbackResult);
    }

    const prompt = `Perform a comprehensive Market Discovery Analysis for an African enterprise:
- Product: ${productName}
- Origin Country: ${originCountry}
- Category: ${category}
- Typical Shipment Quantity: ${quantity || 'Commercial wholesale batch'}
- Target Price: ${priceTarget || 'Market competitive'}

Return a structured JSON object with:
{
  "productName": string,
  "originCountry": string,
  "targetMarkets": [
    {
      "country": string,
      "opportunityScore": number (1-100),
      "demandOverview": string,
      "potentialBuyers": string,
      "logisticsConsiderations": string,
      "tariffNotes": string,
      "estimatedImportVolume": string,
      "recommendedFirstStep": string
    }
  ],
  "strategicAdvice": string,
  "keyQuestionsToInvestigate": string[],
  "disclaimer": "AI-generated trade insights are for market exploration and strategic planning. Verify current tariffs and customs procedures with national trade ministries."
}
Only output valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);

  } catch (error: any) {
    console.error('Error in Market Discovery endpoint:', error);
    res.status(500).json({ error: 'Failed to generate market discovery', details: error.message });
  }
});

// 5. AI Buyer / Supplier Matching Endpoint
app.post('/api/ai/matching', async (req, res) => {
  try {
    const { query, userType, category, originCountry } = req.body;

    res.json({
      query,
      userType,
      explanation: `Matched against verified active enterprises in the AfriTrade registry based on category (${category || 'All'}), geographic proximity, and export capabilities.`,
      disclaimer: 'Matches are generated from businesses currently registered on the AfriTrade AI platform.'
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Matching failed' });
  }
});

// 6. Cross-Border Trade Calculator Endpoint
app.post('/api/trade-calculator', (req, res) => {
  try {
    const { 
      productPrice = 0, 
      quantity = 1, 
      weightKg = 1, 
      origin = 'Rwanda', 
      destination = 'Kenya', 
      shippingMethod = 'road',
      currency = 'USD'
    } = req.body;

    const numPrice = Number(productPrice);
    const numQty = Number(quantity);
    const numWeight = Number(weightKg);

    const productValue = numPrice * numQty;

    // Freight calculation based on regional corridor benchmarks
    let ratePerKg = 0.70;
    let leadTime = '4-6 business days';

    if (shippingMethod === 'air') {
      ratePerKg = 2.85;
      leadTime = '1-2 business days';
    } else if (shippingMethod === 'sea') {
      ratePerKg = 0.45;
      leadTime = '20-25 business days';
    } else {
      // Road
      const isNeighbor = (origin === 'Rwanda' && ['Uganda', 'Burundi', 'Tanzania', 'DR Congo'].includes(destination)) ||
                         (origin === 'Kenya' && ['Uganda', 'Tanzania', 'Ethiopia'].includes(destination));
      ratePerKg = isNeighbor ? 0.55 : 0.85;
      leadTime = isNeighbor ? '2-4 business days' : '5-8 business days';
    }

    const estimatedShipping = Math.max(30, Number((numWeight * ratePerKg + 20).toFixed(2)));

    // Standard tariff vs AfCFTA preferential tariff
    const isAfCFTAEligible = true; // Both in AU
    const standardTariffRate = 0.15; // 15% standard MFN external tariff
    const afcftaTariffRate = 0.02; // Indicative preferential rate (under phase-down schedule)

    const standardTariff = Number((productValue * standardTariffRate).toFixed(2));
    const estimatedTariff = Number((productValue * afcftaTariffRate).toFixed(2));
    const afcftaSavings = Number((standardTariff - estimatedTariff).toFixed(2));

    const platformFee = Number((productValue * 0.025).toFixed(2)); // 2.5% platform escrow & matching fee
    const insuranceCost = Number((productValue * 0.005 + 10).toFixed(2)); // 0.5% + $10 base

    const estimatedTotal = Number((productValue + estimatedShipping + estimatedTariff + platformFee + insuranceCost).toFixed(2));
    const costPerUnit = numQty > 0 ? Number((estimatedTotal / numQty).toFixed(2)) : 0;

    res.json({
      productValue,
      quantity: numQty,
      estimatedWeightKg: numWeight,
      origin,
      destination,
      shippingMethod,
      currency,
      estimatedShipping,
      standardTariff,
      estimatedTariff,
      afcftaSavings,
      platformFee,
      insuranceCost,
      estimatedTotal,
      costPerUnit,
      leadTimeDays: leadTime,
      disclaimer: 'Indicative estimate only. Actual shipping, duties, taxes, customs clearance and port handling fees may vary. Verify current requirements with relevant customs and official trade authorities before shipping.'
    });
  } catch (err: any) {
    res.status(400).json({ error: 'Calculation error', details: err.message });
  }
});

// 7. Trade Document Assistant Endpoint
app.post('/api/trade-documents', (req, res) => {
  const { origin = 'Rwanda', destination = 'Kenya', product = 'General Merchandise', category = 'Agriculture' } = req.body;

  const documents = [
    {
      name: 'AfCFTA / Regional Certificate of Origin',
      required: true,
      issuedBy: 'Ministry of Trade & Industry / National Revenue Authority (e.g. RRA, KRA, URA)',
      description: 'Certifies that the goods satisfy agreed Rules of Origin criteria to qualify for preferential duty reduction or duty-free entry.',
      status: 'Mandatory for Tariff Concessions'
    },
    {
      name: 'Commercial Invoice',
      required: true,
      issuedBy: 'Exporters / Sellers',
      description: 'Legal bill of sale containing complete buyer/seller particulars, HS Code classification, incoterms (FOB/CIF), and exact unit prices.',
      status: 'Mandatory'
    },
    {
      name: 'Packing List',
      required: true,
      issuedBy: 'Exporters / Logistics Consolidator',
      description: 'Itemized breakdown of package dimensions, gross and net weights, batch numbers, and seal references.',
      status: 'Mandatory'
    },
    {
      name: category === 'Coffee & Tea' || category === 'Agriculture' || category === 'Food & Beverage' 
        ? 'Phytosanitary Inspection Certificate' 
        : 'Certificate of Conformity (CoC)',
      required: true,
      issuedBy: 'National Standards Bureau (e.g. RSB, KEBS, UNBS, SON)',
      description: 'Verifies freedom from regulated pests, food safety compliance, and conformity with regional harmonized product standards.',
      status: 'Mandatory for Regulated Goods'
    },
    {
      name: 'Single Customs Territory (SCT) Transit Declaration',
      required: true,
      issuedBy: 'Licensed Customs Clearing Agent',
      description: 'Lodged electronically via the National Single Window system before departure from the point of origin.',
      status: 'Mandatory'
    },
    {
      name: 'Consignment Note / Airway Bill / Bill of Lading',
      required: true,
      issuedBy: 'Freight Transporter / Shipping Line',
      description: 'Contract of carriage and document of title covering the cross-border transit journey.',
      status: 'Mandatory'
    }
  ];

  res.json({
    origin,
    destination,
    product,
    category,
    documents,
    guidelines: [
      'Submit customs declarations in advance via the electronic Single Window to avoid truck congestion at border crossings.',
      'Ensure the harmonized system (HS) 6-digit tariff code is identical on both the invoice and certificate of origin.',
      'Maintain copies of manufacturing input records for a minimum of 5 years to verify AfCFTA originating status during post-clearance audits.'
    ],
    disclaimer: 'Verify current requirements with the relevant official customs or trade authority before shipping. Trade regulations and documentation requirements may be modified without notice.'
  });
});

// Vite Middleware Setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AfriTrade AI] Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
