import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail, 
  sendEmailVerification, 
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { 
  auth, 
  googleProvider, 
  getUserProfileFromFirestore, 
  saveUserProfileToFirestore, 
  saveBusinessToFirestore,
  isFirebaseConfigured
} from '../services/firebase';
import { UserProfile, UserRole, SellerBusinessSetupData, Business } from '../types';

export interface SignUpParams {
  fullName: string;
  email: string;
  password?: string;
  phone: string;
  country: string;
  role: 'buyer' | 'seller'; // Admin is strictly prohibited from public registration!
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  isAuthenticated: boolean;
  isFirebaseReady: boolean;
  error: string | null;
  clearError: () => void;
  signIn: (email: string, password: string) => Promise<UserProfile>;
  signUp: (params: SignUpParams) => Promise<UserProfile>;
  signInWithGoogle: (preferredRole?: 'buyer' | 'seller') => Promise<UserProfile>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  completeSellerBusinessSetup: (data: SellerBusinessSetupData) => Promise<Business>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  businessVerificationPending: boolean;
  emailVerificationSent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'afritrade_auth_user_profile';
const ADMIN_EMAILS = ['giniyomugabo@gmail.com', 'admin@afritrade.ai', 'operations@afritrade.ai'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [emailVerificationSent, setEmailVerificationSent] = useState<boolean>(false);

  const clearError = () => setError(null);

  // Sync user state from Firebase Auth
  useEffect(() => {
    if (!auth) {
      // In local mode without active Firebase client
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        try {
          // Attempt to load Firestore user document
          let profile = await getUserProfileFromFirestore(fbUser.uid);
          
          const isAdminUser = fbUser.email && ADMIN_EMAILS.includes(fbUser.email.toLowerCase());

          if (!profile) {
            // Profile doesn't exist yet (e.g. initial Google sign-in)
            profile = {
              id: fbUser.uid,
              fullName: fbUser.displayName || 'AfriTrade Trader',
              email: fbUser.email || '',
              phone: fbUser.phoneNumber || '',
              country: 'Rwanda',
              city: 'Kigali',
              role: isAdminUser ? 'admin' : 'buyer', // Default to buyer unless verified admin email
              photoURL: fbUser.photoURL || undefined,
              emailVerified: fbUser.emailVerified,
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            await saveUserProfileToFirestore(profile);
          } else if (isAdminUser && profile.role !== 'admin') {
            profile.role = 'admin';
            await saveUserProfileToFirestore(profile);
          }

          // Sync emailVerified status
          if (profile.emailVerified !== fbUser.emailVerified) {
            profile.emailVerified = fbUser.emailVerified;
            await saveUserProfileToFirestore(profile);
          }

          setUserProfile(profile);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
        } catch (err) {
          console.warn('[AfriTrade] Firestore profile sync error, using fallback:', err);
        }
      } else {
        setUserProfile(null);
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Format friendly error messages
  const parseAuthError = (err: unknown): string => {
    if (!err || typeof err !== 'object') return 'An unexpected authentication error occurred.';
    const anyErr = err as { code?: string; message?: string };
    const code = anyErr.code || '';

    switch (code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Unable to sign in. Please check your email and password and try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please sign in instead.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters with a combination of letters and numbers.';
      case 'auth/popup-closed-by-user':
        return 'Sign in window was closed before completion.';
      case 'auth/unauthorized-domain':
        return `Domain (${window.location.hostname}) is not authorized in Firebase Console. Please add this domain under Firebase Authentication > Settings > Authorized Domains.`;
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Please reset your password or try again in a few minutes.';
      case 'auth/network-request-failed':
        return 'Network connection issue. Please check your internet connectivity and try again.';
      default:
        return anyErr.message || 'Authentication failed. Please verify your credentials.';
    }
  };

  // 1. Email Sign In
  const signIn = async (email: string, password: string): Promise<UserProfile> => {
    setError(null);
    setLoading(true);

    try {
      if (auth) {
        const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const fbUser = credential.user;
        let profile = await getUserProfileFromFirestore(fbUser.uid);

        if (!profile) {
          const isAdminUser = fbUser.email && ADMIN_EMAILS.includes(fbUser.email.toLowerCase());
          profile = {
            id: fbUser.uid,
            fullName: fbUser.displayName || 'AfriTrade Trader',
            email: fbUser.email || email,
            phone: '',
            country: 'Rwanda',
            city: 'Kigali',
            role: isAdminUser ? 'admin' : 'buyer',
            emailVerified: fbUser.emailVerified,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await saveUserProfileToFirestore(profile);
        }

        setUserProfile(profile);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
        setLoading(false);
        return profile;
      } else {
        // Local mode fallback
        const isAdminUser = ADMIN_EMAILS.includes(email.toLowerCase());
        const mockProfile: UserProfile = {
          id: `usr-${Date.now()}`,
          fullName: email.split('@')[0],
          email: email.trim(),
          phone: '+250 788 000 000',
          country: 'Rwanda',
          city: 'Kigali',
          role: isAdminUser ? 'admin' : 'buyer',
          emailVerified: true,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setUserProfile(mockProfile);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mockProfile));
        setLoading(false);
        return mockProfile;
      }
    } catch (err) {
      setLoading(false);
      const msg = parseAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  // 2. Email Sign Up (BUYER or SELLER only - NEVER ADMIN)
  const signUp = async (params: SignUpParams): Promise<UserProfile> => {
    setError(null);
    setLoading(true);

    // CRITICAL SECURITY ENFORCEMENT: Only 'buyer' or 'seller' allowed from registration
    const validatedRole: UserRole = params.role === 'seller' ? 'seller' : 'buyer';

    try {
      if (auth) {
        const credential = await createUserWithEmailAndPassword(auth, params.email.trim(), params.password || 'Temporary#123');
        const fbUser = credential.user;

        // Set display name in Firebase Auth
        await updateProfile(fbUser, { displayName: params.fullName.trim() });

        // Send Email Verification
        try {
          await sendEmailVerification(fbUser);
          setEmailVerificationSent(true);
        } catch (verifErr) {
          console.warn('[AfriTrade] Email verification send warning:', verifErr);
        }

        // Create Firestore User Document
        const newProfile: UserProfile = {
          id: fbUser.uid,
          fullName: params.fullName.trim(),
          email: params.email.trim().toLowerCase(),
          phone: params.phone.trim(),
          country: params.country,
          city: '',
          role: validatedRole,
          photoURL: fbUser.photoURL || undefined,
          emailVerified: false,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await saveUserProfileToFirestore(newProfile);
        setUserProfile(newProfile);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newProfile));
        setLoading(false);
        return newProfile;
      } else {
        // Fallback local registration
        const newProfile: UserProfile = {
          id: `usr-${Date.now()}`,
          fullName: params.fullName.trim(),
          email: params.email.trim().toLowerCase(),
          phone: params.phone.trim(),
          country: params.country,
          city: '',
          role: validatedRole,
          emailVerified: false,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setEmailVerificationSent(true);
        setUserProfile(newProfile);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newProfile));
        setLoading(false);
        return newProfile;
      }
    } catch (err) {
      setLoading(false);
      const msg = parseAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  // 3. Google Sign In
  const signInWithGoogle = async (preferredRole: 'buyer' | 'seller' = 'buyer'): Promise<UserProfile> => {
    setError(null);
    setLoading(true);

    try {
      if (auth && googleProvider) {
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;
        let profile = await getUserProfileFromFirestore(fbUser.uid);

        const isAdminUser = fbUser.email && ADMIN_EMAILS.includes(fbUser.email.toLowerCase());

        if (!profile) {
          profile = {
            id: fbUser.uid,
            fullName: fbUser.displayName || 'AfriTrade Trader',
            email: fbUser.email || '',
            phone: fbUser.phoneNumber || '',
            country: 'Rwanda',
            city: 'Kigali',
            role: isAdminUser ? 'admin' : preferredRole,
            photoURL: fbUser.photoURL || undefined,
            emailVerified: fbUser.emailVerified,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await saveUserProfileToFirestore(profile);
        } else if (isAdminUser && profile.role !== 'admin') {
          profile.role = 'admin';
          await saveUserProfileToFirestore(profile);
        }

        setUserProfile(profile);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
        setLoading(false);
        return profile;
      } else {
        // Local mode fallback
        const mockProfile: UserProfile = {
          id: `usr-google-${Date.now()}`,
          fullName: 'Google African Trader',
          email: 'trader@google.com',
          phone: '+254 700 000 000',
          country: 'Kenya',
          city: 'Nairobi',
          role: preferredRole,
          emailVerified: true,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setUserProfile(mockProfile);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mockProfile));
        setLoading(false);
        return mockProfile;
      }
    } catch (err) {
      setLoading(false);
      const msg = parseAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  // 4. Sign Out
  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      if (auth) {
        await firebaseSignOut(auth);
      }
    } catch (err) {
      console.warn('[AfriTrade] Sign out error:', err);
    } finally {
      setUser(null);
      setUserProfile(null);
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      setLoading(false);
    }
  };

  // 5. Password Reset
  const resetPassword = async (email: string): Promise<void> => {
    setError(null);
    try {
      if (auth) {
        await sendPasswordResetEmail(auth, email.trim());
      }
    } catch (err) {
      const msg = parseAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  // 6. Resend Email Verification
  const resendVerificationEmail = async (): Promise<void> => {
    if (auth && auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      setEmailVerificationSent(true);
    }
  };

  // 7. Seller Business Setup
  const completeSellerBusinessSetup = async (data: SellerBusinessSetupData): Promise<Business> => {
    if (!userProfile) {
      throw new Error('You must be signed in to configure your business profile.');
    }

    const businessId = `biz-${userProfile.id}`;
    const newBusiness: Business = {
      businessId,
      ownerId: userProfile.id,
      businessName: data.businessName.trim(),
      description: data.description.trim(),
      category: data.category,
      country: data.country,
      city: data.city.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      website: data.website?.trim() || '',
      logo: data.logo || 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=400&h=400&q=80',
      verificationStatus: 'pending', // Pending verification per requirement #6
      rating: 5.0,
      reviewCount: 0,
      exportReady: true,
      yearsInOperation: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveBusinessToFirestore(newBusiness);

    // Update user profile with business information
    const updatedProfile: UserProfile = {
      ...userProfile,
      businessId,
      businessName: data.businessName.trim(),
      country: data.country,
      city: data.city.trim(),
      updatedAt: new Date().toISOString()
    };

    await saveUserProfileToFirestore(updatedProfile);
    setUserProfile(updatedProfile);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updatedProfile));

    return newBusiness;
  };

  // 8. Update User Profile (Strictly disallowing self-assigned admin / role tampering)
  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!userProfile) return;

    // Remove any attempt to change role client-side
    const sanitizedUpdates = { ...updates };
    delete (sanitizedUpdates as Record<string, unknown>).role;
    delete (sanitizedUpdates as Record<string, unknown>).id;

    const merged: UserProfile = {
      ...userProfile,
      ...sanitizedUpdates,
      updatedAt: new Date().toISOString()
    };

    await saveUserProfileToFirestore(merged);
    setUserProfile(merged);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(merged));
  };

  const businessVerificationPending = Boolean(
    userProfile?.role === 'seller' && userProfile?.businessId
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        role: userProfile?.role || null,
        loading,
        isAuthenticated: Boolean(userProfile),
        isFirebaseReady: isFirebaseConfigured,
        error,
        clearError,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        resendVerificationEmail,
        completeSellerBusinessSetup,
        updateUserProfile,
        businessVerificationPending,
        emailVerificationSent
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
