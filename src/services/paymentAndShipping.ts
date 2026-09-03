// Abstract Payment Service Interface
// Ready for African payment gateways (e.g., Paystack, Flutterwave, DPO Group, M-Pesa, MTN MoMo)
export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerPhone?: string;
  description: string;
}

export interface PaymentResponse {
  transactionId: string;
  status: 'initiated' | 'pending' | 'completed' | 'failed';
  provider: 'paystack' | 'flutterwave' | 'momo' | 'offline_invoice';
  paymentUrl?: string;
  reference: string;
  message: string;
}

export interface PaymentService {
  createPayment(request: PaymentRequest): Promise<PaymentResponse>;
  verifyPayment(transactionId: string): Promise<{ verified: boolean; status: string }>;
  refundPayment(transactionId: string, amount?: number): Promise<{ success: boolean; message: string }>;
  getPaymentStatus(transactionId: string): Promise<string>;
}

// Default implementation configured for MVP Quotation & Pro-Forma Invoice mode
export class ProFormaInvoicePaymentService implements PaymentService {
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    return {
      transactionId: `TXN-${Date.now()}-${request.orderId}`,
      status: 'pending',
      provider: 'offline_invoice',
      reference: `INV-AFRITRADE-${request.orderId}`,
      message: 'Pro-Forma commercial invoice generated for bank letter of credit / escrow transfer under AfCFTA protocol.'
    };
  }

  async verifyPayment(transactionId: string) {
    return { verified: true, status: 'confirmed' };
  }

  async refundPayment(transactionId: string) {
    return { success: true, message: 'Payment authorization reversed.' };
  }

  async getPaymentStatus(transactionId: string) {
    return 'pending_document_verification';
  }
}

// Abstract Shipping & Logistics Service Interface
// Ready for DHL Africa, Bolloré Africa Logistics, DP World Kigali, and regional truckers
export interface ShippingQuoteRequest {
  originCountry: string;
  originCity: string;
  destinationCountry: string;
  destinationCity: string;
  weightKg: number;
  volumeM3?: number;
  shippingMethod: 'road' | 'air' | 'sea';
  goodsCategory: string;
}

export interface ShippingQuoteResult {
  provider: string;
  carrierType: string;
  costUSD: number;
  currency: string;
  estimatedTransitDays: string;
  corridor: string;
  customsClearanceIncluded: boolean;
  trackingAvailable: boolean;
  disclaimer: string;
}

export interface ShippingService {
  calculateShipping(request: ShippingQuoteRequest): Promise<ShippingQuoteResult>;
  createShipment(orderId: string, details: any): Promise<{ trackingNumber: string; labelUrl?: string }>;
  trackShipment(trackingNumber: string): Promise<{ status: string; checkpoints: { location: string; time: string; status: string }[] }>;
  cancelShipment(trackingNumber: string): Promise<boolean>;
}

export class CorridorShippingService implements ShippingService {
  async calculateShipping(request: ShippingQuoteRequest): Promise<ShippingQuoteResult> {
    const isEAC = ['Rwanda', 'Kenya', 'Uganda', 'Tanzania', 'Burundi', 'DR Congo'].includes(request.originCountry) &&
                  ['Rwanda', 'Kenya', 'Uganda', 'Tanzania', 'Burundi', 'DR Congo'].includes(request.destinationCountry);
    
    let baseRatePerKg = 1.20;
    let corridorName = 'Cross-Regional African Transit Corridor';
    let days = '7-12 business days';

    if (isEAC) {
      if (request.shippingMethod === 'road') {
        baseRatePerKg = 0.65;
        corridorName = request.originCountry === 'Kenya' || request.destinationCountry === 'Kenya' 
          ? 'Northern Corridor (Mombasa - Nairobi - Malaba - Kampala - Kigali)'
          : 'Central Corridor (Dar es Salaam - Isaka - Rusumo - Kigali)';
        days = '3-6 business days';
      } else if (request.shippingMethod === 'air') {
        baseRatePerKg = 2.80;
        corridorName = 'RwandAir / Kenya Airways Regional Cargo';
        days = '1-2 business days';
      }
    } else {
      if (request.shippingMethod === 'air') {
        baseRatePerKg = 4.50;
        corridorName = 'Ethiopian Airlines Cargo Pan-African Hub';
        days = '2-4 business days';
      } else if (request.shippingMethod === 'sea') {
        baseRatePerKg = 0.40;
        corridorName = 'West-to-East Coastal Maritime Route';
        days = '20-30 business days';
      }
    }

    const cost = Math.max(35, Number((request.weightKg * baseRatePerKg + 25).toFixed(2)));

    return {
      provider: 'AfriTrade Freight Partner Network',
      carrierType: request.shippingMethod.toUpperCase(),
      costUSD: cost,
      currency: 'USD',
      estimatedTransitDays: days,
      corridor: corridorName,
      customsClearanceIncluded: false,
      trackingAvailable: true,
      disclaimer: 'Indicative freight calculation based on regional corridor benchmarks. Actual carrier tariffs may vary based on fuel surcharges and customs bonded handling.'
    };
  }

  async createShipment(orderId: string, details: any) {
    return {
      trackingNumber: `AFT-${orderId.substring(0, 8).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      labelUrl: `/labels/${orderId}.pdf`
    };
  }

  async trackShipment(trackingNumber: string) {
    return {
      status: 'In Transit',
      checkpoints: [
        { location: 'Kigali Dry Port, Masaka', time: '2025-08-28 10:00', status: 'Dispatched & Customs Cleared' },
        { location: 'Gatuna / Katuna Border', time: '2025-08-29 14:30', status: 'Transit Bond Sealed' },
        { location: 'Nairobi ICD Yard', time: '2025-08-30 08:15', status: 'Arrived at Destination Hub' }
      ]
    };
  }

  async cancelShipment(trackingNumber: string) {
    return true;
  }
}
