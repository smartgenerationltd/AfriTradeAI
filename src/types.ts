export type UserRole = 'buyer' | 'seller' | 'admin';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  role: UserRole;
  businessName?: string;
  businessId?: string;
  photoURL?: string;
  emailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'suspended';
}

export interface SellerBusinessSetupData {
  businessName: string;
  description: string;
  category: string;
  country: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
}

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'suspended';

export interface Business {
  businessId: string;
  ownerId: string;
  businessName: string;
  description: string;
  category: string;
  country: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  logo: string;
  verificationStatus: VerificationStatus;
  rating: number;
  reviewCount: number;
  exportReady: boolean;
  yearsInOperation: number;
  createdAt: string;
  updatedAt: string;
}

export interface Country {
  code: string;
  name: string;
  flag: string;
  currency: string;
  region: 'East Africa' | 'West Africa' | 'Southern Africa' | 'North Africa' | 'Central Africa';
  capital: string;
  majorPorts: string[];
  afcftaSignatory: boolean;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  productCount: number;
}

export type ProductStatus = 'draft' | 'published' | 'out_of_stock' | 'suspended';

export interface Product {
  id: string;
  sellerId: string;
  businessId: string;
  businessName: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  country: string;
  city: string;
  price: number;
  currency: string;
  quantity: number;
  minimumOrderQuantity: number;
  unit: string; // e.g. "kg", "bags", "tons", "units", "liters", "crates"
  images: string[];
  shippingCountries: string[];
  exportAvailable: boolean;
  certifications?: string[];
  shelfLife?: string;
  originDetails?: string;
  status: ProductStatus;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  unit: string;
  image?: string;
}

export interface Order {
  orderId: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  sellerId: string;
  sellerBusinessName: string;
  items: OrderItem[];
  subtotal: number;
  shippingEstimate: number;
  platformFee: number;
  total: number;
  currency: string;
  shippingAddress: {
    recipientName: string;
    street: string;
    city: string;
    country: string;
    postalCode?: string;
    phone: string;
  };
  destinationCountry: string;
  originCountry: string;
  status: OrderStatus;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type QuotationStatus = 'pending' | 'responded' | 'accepted' | 'declined';

export interface Quotation {
  quotationId: string;
  productId: string;
  productName: string;
  productImage?: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerCountry: string;
  destinationCountry: string;
  sellerId: string;
  sellerBusinessName: string;
  requestedQuantity: number;
  unit: string;
  message: string;
  offeredUnitPrice?: number;
  shippingEstimate?: number;
  estimatedDeliveryTime?: string;
  sellerNotes?: string;
  status: QuotationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  relatedProductId?: string;
  relatedProductName?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'order' | 'quotation' | 'message' | 'verification' | 'system';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface Review {
  reviewId: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  productId: string;
  orderId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  targetType: 'product' | 'business';
  targetId: string;
  createdAt: string;
}

export interface Report {
  reportId: string;
  reporterId: string;
  reporterName: string;
  targetType: 'product' | 'seller' | 'message' | 'business';
  targetId: string;
  targetName: string;
  reason: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface TradeCalculationResult {
  productValue: number;
  quantity: number;
  unit: string;
  currency: string;
  estimatedWeightKg: number;
  origin: string;
  destination: string;
  shippingMethod: 'road' | 'air' | 'sea';
  estimatedShipping: number;
  estimatedTariff: number; // Indicative AfCFTA preferential vs standard
  standardTariff: number;
  afcftaSavings: number;
  platformFee: number;
  insuranceCost: number;
  estimatedTotal: number;
  costPerUnit: number;
  leadTimeDays: string;
  disclaimer: string;
}

export interface AITradeAssistantResponse {
  marketOpportunity: string;
  recommendedSteps: string[];
  documentsToCheck: string[];
  logistics: string;
  costConsiderations: string;
  risks: string[];
  nextActions: string[];
  disclaimer: string;
}

export interface MarketDiscoveryResult {
  productName: string;
  originCountry: string;
  targetMarkets: {
    country: string;
    opportunityScore: number; // 1-100
    demandOverview: string;
    potentialBuyers: string;
    logisticsConsiderations: string;
    tariffNotes: string;
    estimatedImportVolume: string;
    recommendedFirstStep: string;
  }[];
  strategicAdvice: string;
  keyQuestionsToInvestigate: string[];
  disclaimer: string;
}

export interface BusinessMatchResult {
  business: Business;
  matchScore: number;
  matchReason: string;
  keyProducts: string[];
  suggestedCollaboration: string;
}
