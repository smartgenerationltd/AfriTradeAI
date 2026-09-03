import { useState, useEffect } from 'react';
import { 
  UserProfile, Business, Product, Country, Category, 
  CartItem, Order, Quotation, Message, NotificationItem, 
  Review, Favorite, Report, UserRole, OrderStatus, ProductStatus
} from '../types';
import { 
  AFRICAN_COUNTRIES, CATEGORIES, BUSINESSES, PRODUCTS, 
  INITIAL_ORDERS, INITIAL_QUOTATIONS, INITIAL_REVIEWS, INITIAL_NOTIFICATIONS 
} from '../data/seedData';

const STORAGE_KEYS = {
  USER: 'afritrade_user',
  PRODUCTS: 'afritrade_products',
  BUSINESSES: 'afritrade_businesses',
  ORDERS: 'afritrade_orders',
  QUOTATIONS: 'afritrade_quotations',
  CART: 'afritrade_cart',
  FAVORITES: 'afritrade_favorites',
  NOTIFICATIONS: 'afritrade_notifications',
  REVIEWS: 'afritrade_reviews',
  REPORTS: 'afritrade_reports',
  MESSAGES: 'afritrade_messages',
  CURRENCY: 'afritrade_currency',
  LANGUAGE: 'afritrade_lang',
};

export const DEMO_USERS: Record<string, UserProfile> = {
  buyer: {
    id: 'user-buyer-ke',
    fullName: 'Amina Kimani',
    email: 'amina@nairobispecialty.co.ke',
    phone: '+254 722 888 777',
    country: 'Kenya',
    city: 'Nairobi',
    role: 'buyer',
    businessName: 'Nairobi Specialty Importers Ltd',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2025-08-01T09:00:00Z',
    status: 'active'
  },
  seller: {
    id: 'user-seller-rw',
    fullName: 'Jean-Paul Ngarambe',
    email: 'export@kigalicraftagro.rw',
    phone: '+250 788 123 456',
    country: 'Rwanda',
    city: 'Kigali',
    role: 'seller',
    businessId: 'biz-kigali-craft',
    businessName: 'Kigali Craft & Agro Export Ltd',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2025-08-10T11:30:00Z',
    status: 'active'
  },
  admin: {
    id: 'user-admin-01',
    fullName: 'David Osei (AfriTrade Operations)',
    email: 'admin@afritrade.ai',
    phone: '+250 788 000 111',
    country: 'Rwanda',
    city: 'Kigali',
    role: 'admin',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
    createdAt: '2023-10-01T08:00:00Z',
    updatedAt: '2025-08-01T08:00:00Z',
    status: 'active'
  }
};

function getLocalData<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error(`Error reading ${key} from storage`, e);
  }
  return defaultValue;
}

function setLocalData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to storage`, e);
  }
}

export function useAppStore() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => 
    getLocalData<UserProfile | null>(STORAGE_KEYS.USER, DEMO_USERS.buyer)
  );

  const [currentCurrency, setCurrentCurrency] = useState<string>(() =>
    getLocalData<string>(STORAGE_KEYS.CURRENCY, 'USD')
  );

  const [currentLang, setCurrentLang] = useState<string>(() =>
    getLocalData<string>(STORAGE_KEYS.LANGUAGE, 'en')
  );

  const [products, setProducts] = useState<Product[]>(() =>
    getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, PRODUCTS)
  );

  const [businesses, setBusinesses] = useState<Business[]>(() =>
    getLocalData<Business[]>(STORAGE_KEYS.BUSINESSES, BUSINESSES)
  );

  const [orders, setOrders] = useState<Order[]>(() =>
    getLocalData<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS)
  );

  const [quotations, setQuotations] = useState<Quotation[]>(() =>
    getLocalData<Quotation[]>(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS)
  );

  const [cart, setCart] = useState<CartItem[]>(() =>
    getLocalData<CartItem[]>(STORAGE_KEYS.CART, [])
  );

  const [favorites, setFavorites] = useState<Favorite[]>(() =>
    getLocalData<Favorite[]>(STORAGE_KEYS.FAVORITES, [])
  );

  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    getLocalData<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS)
  );

  const [reviews, setReviews] = useState<Review[]>(() =>
    getLocalData<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS)
  );

  const [reports, setReports] = useState<Report[]>(() =>
    getLocalData<Report[]>(STORAGE_KEYS.REPORTS, [])
  );

  const [messages, setMessages] = useState<Message[]>(() =>
    getLocalData<Message[]>(STORAGE_KEYS.MESSAGES, [
      {
        id: 'msg-01',
        conversationId: 'conv-ke-rw',
        senderId: 'user-buyer-ke',
        senderName: 'Amina Kimani',
        receiverId: 'user-seller-rw',
        receiverName: 'Jean-Paul Ngarambe',
        message: 'Hello Jean-Paul, our sample batch of Rwandan Bourbon coffee arrived in Nairobi. The cupping score was 87.5! We would like to place an order for 120kg.',
        createdAt: '2025-08-27T14:30:00Z',
        read: true
      },
      {
        id: 'msg-02',
        conversationId: 'conv-ke-rw',
        senderId: 'user-seller-rw',
        senderName: 'Jean-Paul Ngarambe',
        receiverId: 'user-buyer-ke',
        receiverName: 'Amina Kimani',
        message: 'Greetings Amina! Fantastic news. We have prepared the 120kg in GrainPro moisture-sealed export sacks with Rwanda Standards Board clearance.',
        createdAt: '2025-08-27T16:10:00Z',
        read: true
      }
    ])
  );

  // Sync state to local storage
  useEffect(() => { setLocalData(STORAGE_KEYS.USER, currentUser); }, [currentUser]);
  useEffect(() => { setLocalData(STORAGE_KEYS.CURRENCY, currentCurrency); }, [currentCurrency]);
  useEffect(() => { setLocalData(STORAGE_KEYS.LANGUAGE, currentLang); }, [currentLang]);
  useEffect(() => { setLocalData(STORAGE_KEYS.PRODUCTS, products); }, [products]);
  useEffect(() => { setLocalData(STORAGE_KEYS.BUSINESSES, businesses); }, [businesses]);
  useEffect(() => { setLocalData(STORAGE_KEYS.ORDERS, orders); }, [orders]);
  useEffect(() => { setLocalData(STORAGE_KEYS.QUOTATIONS, quotations); }, [quotations]);
  useEffect(() => { setLocalData(STORAGE_KEYS.CART, cart); }, [cart]);
  useEffect(() => { setLocalData(STORAGE_KEYS.FAVORITES, favorites); }, [favorites]);
  useEffect(() => { setLocalData(STORAGE_KEYS.NOTIFICATIONS, notifications); }, [notifications]);
  useEffect(() => { setLocalData(STORAGE_KEYS.REVIEWS, reviews); }, [reviews]);
  useEffect(() => { setLocalData(STORAGE_KEYS.REPORTS, reports); }, [reports]);
  useEffect(() => { setLocalData(STORAGE_KEYS.MESSAGES, messages); }, [messages]);

  // Actions
  const switchUserRole = (role: UserRole) => {
    setCurrentUser(DEMO_USERS[role]);
  };

  const loginUser = (user: UserProfile) => {
    setCurrentUser(user);
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates, updatedAt: new Date().toISOString() };
    setCurrentUser(updated);
  };

  // Cart actions
  const addToCart = (product: Product, quantity: number = product.minimumOrderQuantity) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { productId: product.id, product, quantity }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.productId === productId ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Product actions
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ));
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  // Quotation actions
  const createQuotationRequest = (data: Omit<Quotation, 'quotationId' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const newQuote: Quotation = {
      ...data,
      quotationId: `quote-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setQuotations(prev => [newQuote, ...prev]);

    // Send notification to seller
    addNotification({
      userId: data.sellerId,
      type: 'quotation',
      title: 'New Quotation Request',
      message: `${data.buyerName} from ${data.buyerCountry} requested a quote for ${data.requestedQuantity} ${data.unit} of ${data.productName}`,
      link: '/seller',
      read: false
    });

    return newQuote;
  };

  const respondToQuotation = (quotationId: string, response: {
    offeredUnitPrice: number;
    shippingEstimate: number;
    estimatedDeliveryTime: string;
    sellerNotes?: string;
  }) => {
    let updatedQuote: Quotation | undefined;
    setQuotations(prev => prev.map(q => {
      if (q.quotationId === quotationId) {
        updatedQuote = {
          ...q,
          ...response,
          status: 'responded',
          updatedAt: new Date().toISOString()
        };
        return updatedQuote;
      }
      return q;
    }));

    if (updatedQuote) {
      addNotification({
        userId: (updatedQuote as Quotation).buyerId,
        type: 'quotation',
        title: 'Quotation Received!',
        message: `${(updatedQuote as Quotation).sellerBusinessName} offered ${(updatedQuote as Quotation).offeredUnitPrice} USD/unit for ${(updatedQuote as Quotation).productName}`,
        link: '/buyer',
        read: false
      });
    }
  };

  const acceptQuotation = (quotationId: string) => {
    const quote = quotations.find(q => q.quotationId === quotationId);
    if (!quote) return;

    // Mark quotation accepted
    setQuotations(prev => prev.map(q => 
      q.quotationId === quotationId ? { ...q, status: 'accepted', updatedAt: new Date().toISOString() } : q
    ));

    // Convert quotation to Order automatically!
    const subtotal = (quote.offeredUnitPrice || 0) * quote.requestedQuantity;
    const shipping = quote.shippingEstimate || 50;
    const platformFee = Number((subtotal * 0.025).toFixed(2));
    const total = Number((subtotal + shipping + platformFee).toFixed(2));

    const newOrder: Order = {
      orderId: `ord-${Date.now()}`,
      buyerId: quote.buyerId,
      buyerName: quote.buyerName,
      buyerEmail: quote.buyerEmail,
      sellerId: quote.sellerId,
      sellerBusinessName: quote.sellerBusinessName,
      items: [
        {
          productId: quote.productId,
          productName: quote.productName,
          unitPrice: quote.offeredUnitPrice || 0,
          quantity: quote.requestedQuantity,
          unit: quote.unit,
          image: quote.productImage
        }
      ],
      subtotal,
      shippingEstimate: shipping,
      platformFee,
      total,
      currency: 'USD',
      shippingAddress: {
        recipientName: quote.buyerName,
        street: 'Commercial Trade Depot',
        city: 'Metropolitan',
        country: quote.destinationCountry,
        phone: '+250 700 000 000'
      },
      destinationCountry: quote.destinationCountry,
      originCountry: quote.buyerCountry,
      status: 'confirmed',
      notes: `Generated from accepted quotation #${quote.quotationId}. Notes: ${quote.sellerNotes || ''}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOrders(prev => [newOrder, ...prev]);

    // Notify seller
    addNotification({
      userId: quote.sellerId,
      type: 'order',
      title: 'Quotation Accepted & Order Created! 🎉',
      message: `${quote.buyerName} accepted your quotation for ${quote.productName}. Order #${newOrder.orderId} created.`,
      link: '/seller',
      read: false
    });

    return newOrder;
  };

  // Order actions
  const createOrderFromCart = (shippingAddress: Order['shippingAddress']) => {
    if (cart.length === 0 || !currentUser) return;

    // Group items by seller
    const ordersBySeller: Record<string, CartItem[]> = {};
    cart.forEach(item => {
      const sellerId = item.product.sellerId;
      if (!ordersBySeller[sellerId]) ordersBySeller[sellerId] = [];
      ordersBySeller[sellerId].push(item);
    });

    const newOrders: Order[] = [];

    Object.entries(ordersBySeller).forEach(([sellerId, items]) => {
      const firstProduct = items[0].product;
      const subtotal = items.reduce((sum, it) => sum + (it.product.price * it.quantity), 0);
      const shippingEstimate = 65.00;
      const platformFee = Number((subtotal * 0.025).toFixed(2));
      const total = Number((subtotal + shippingEstimate + platformFee).toFixed(2));

      const order: Order = {
        orderId: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        buyerId: currentUser.id,
        buyerName: currentUser.fullName,
        buyerEmail: currentUser.email,
        buyerPhone: currentUser.phone,
        sellerId,
        sellerBusinessName: firstProduct.businessName,
        items: items.map(it => ({
          productId: it.productId,
          productName: it.product.name,
          unitPrice: it.product.price,
          quantity: it.quantity,
          unit: it.product.unit,
          image: it.product.images[0]
        })),
        subtotal,
        shippingEstimate,
        platformFee,
        total,
        currency: 'USD',
        shippingAddress,
        destinationCountry: shippingAddress.country,
        originCountry: firstProduct.country,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      newOrders.push(order);

      // Notify seller
      addNotification({
        userId: sellerId,
        type: 'order',
        title: 'New Order Request Placed',
        message: `${currentUser.fullName} placed an order for ${items.length} product(s) totaling $${total.toFixed(2)}`,
        link: '/seller',
        read: false
      });
    });

    setOrders(prev => [...newOrders, ...prev]);
    clearCart();
    return newOrders;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, trackingNumber?: string) => {
    setOrders(prev => prev.map(o => {
      if (o.orderId === orderId) {
        const updated = { 
          ...o, 
          status, 
          ...(trackingNumber ? { trackingNumber } : {}),
          updatedAt: new Date().toISOString() 
        };
        
        // Notify buyer
        addNotification({
          userId: o.buyerId,
          type: 'order',
          title: `Order #${orderId} Updated to ${status.toUpperCase()}`,
          message: trackingNumber 
            ? `Tracking number assigned: ${trackingNumber}` 
            : `Your order status with ${o.sellerBusinessName} is now ${status}.`,
          link: '/buyer',
          read: false
        });

        return updated;
      }
      return o;
    }));
  };

  // Review actions
  const addReview = (reviewData: Omit<Review, 'reviewId' | 'createdAt'>) => {
    const newReview: Review = {
      ...reviewData,
      reviewId: `rev-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setReviews(prev => [newReview, ...prev]);

    // Update product rating
    setProducts(prev => prev.map(p => {
      if (p.id === reviewData.productId) {
        const productReviews = [...reviews.filter(r => r.productId === p.id), newReview];
        const avg = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
        return {
          ...p,
          rating: Number(avg.toFixed(1)),
          reviewCount: productReviews.length
        };
      }
      return p;
    }));

    return newReview;
  };

  // Business verification (Admin action)
  const setBusinessVerification = (businessId: string, status: Business['verificationStatus']) => {
    setBusinesses(prev => prev.map(b => 
      b.businessId === businessId ? { ...b, verificationStatus: status, updatedAt: new Date().toISOString() } : b
    ));

    const biz = businesses.find(b => b.businessId === businessId);
    if (biz) {
      addNotification({
        userId: biz.ownerId,
        type: 'verification',
        title: status === 'verified' ? 'Business Verified ✓' : `Business status changed to ${status}`,
        message: status === 'verified' 
          ? 'Your enterprise has been officially verified as a trusted African business by AfriTrade platform operations.' 
          : 'Your business verification status was updated by platform compliance.',
        link: '/seller',
        read: false
      });
    }
  };

  // Messaging actions
  const sendMessage = (receiverId: string, receiverName: string, text: string, conversationId?: string) => {
    if (!currentUser) return;
    const convId = conversationId || `conv-${[currentUser.id, receiverId].sort().join('-')}`;
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId: convId,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      receiverId,
      receiverName,
      message: text,
      createdAt: new Date().toISOString(),
      read: false
    };
    setMessages(prev => [...prev, newMsg]);

    addNotification({
      userId: receiverId,
      type: 'message',
      title: `Message from ${currentUser.fullName}`,
      message: text.length > 60 ? `${text.substring(0, 60)}...` : text,
      link: '/messages',
      read: false
    });

    return newMsg;
  };

  // Favorites
  const toggleFavorite = (targetType: 'product' | 'business', targetId: string) => {
    if (!currentUser) return;
    setFavorites(prev => {
      const exists = prev.some(f => f.userId === currentUser.id && f.targetType === targetType && f.targetId === targetId);
      if (exists) {
        return prev.filter(f => !(f.userId === currentUser.id && f.targetType === targetType && f.targetId === targetId));
      }
      return [...prev, {
        id: `fav-${Date.now()}`,
        userId: currentUser.id,
        targetType,
        targetId,
        createdAt: new Date().toISOString()
      }];
    });
  };

  const isFavorite = (targetType: 'product' | 'business', targetId: string): boolean => {
    if (!currentUser) return false;
    return favorites.some(f => f.userId === currentUser.id && f.targetType === targetType && f.targetId === targetId);
  };

  // Reports
  const submitReport = (data: Omit<Report, 'reportId' | 'status' | 'createdAt'>) => {
    const report: Report = {
      ...data,
      reportId: `rep-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setReports(prev => [report, ...prev]);
    return report;
  };

  const resolveReport = (reportId: string, status: Report['status']) => {
    setReports(prev => prev.map(r => r.reportId === reportId ? { ...r, status } : r));
  };

  // Notifications
  const addNotification = (item: Omit<NotificationItem, 'id' | 'createdAt'>) => {
    const notif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => n.userId === currentUser.id ? { ...n, read: true } : n));
  };

  // Reset to seed data
  const resetToSeedData = () => {
    localStorage.clear();
    setProducts(PRODUCTS);
    setBusinesses(BUSINESSES);
    setOrders(INITIAL_ORDERS);
    setQuotations(INITIAL_QUOTATIONS);
    setReviews(INITIAL_REVIEWS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCart([]);
    setFavorites([]);
    setReports([]);
    setCurrentUser(DEMO_USERS.buyer);
    setCurrentCurrency('USD');
  };

  return {
    currentUser,
    currentCurrency,
    currentLang,
    setCurrentCurrency,
    setCurrentLang,
    switchUserRole,
    loginUser,
    logoutUser,
    updateUserProfile,
    products,
    businesses,
    orders,
    quotations,
    cart,
    favorites,
    notifications,
    reviews,
    reports,
    messages,
    countries: AFRICAN_COUNTRIES,
    categories: CATEGORIES,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    addProduct,
    updateProduct,
    deleteProduct,
    createQuotationRequest,
    respondToQuotation,
    acceptQuotation,
    createOrderFromCart,
    updateOrderStatus,
    addReview,
    setBusinessVerification,
    sendMessage,
    toggleFavorite,
    isFavorite,
    submitReport,
    resolveReport,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    resetToSeedData,
  };
}
