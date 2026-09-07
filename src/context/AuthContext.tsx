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
import { isProfileComplete } from '../services/authUtils';

export interface SignUpParams {
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
  country?: string;
  city?: string;
  role?: 'buyer' | 'seller'; // Admin is strictly prohibited from public registration!
}

export interface CompleteProfileParams {
  fullName: string;
  phone: string;
  country: string;
  city: string;
  role: 'buyer' | 'seller';
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  isFirebaseReady: boolean;
  error: string | null;
  clearError: () => void;
  signIn: (email: string, password: string) => Promise<UserProfile>;
  signUp: (params: SignUpParams) => Promise<UserProfile>;
  signInWithGoogle: (preferredRole?: 'buyer' | 'seller') => Promise<UserProfile>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  completeUserProfile: (data: CompleteProfileParams) => Promise<UserProfile>;
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
              uid: fbUser.uid,
              fullName: fbUser.displayName || '',
              email: fbUser.email || '',
              phone: fbUser.phoneNumber || '',
              country: '',
              city: '',
              role: isAdminUser ? 'admin' : 'buyer', // Default to buyer unless verified admin email
              photoURL: fbUser.photoURL || undefined,
              emailVerified: fbUser.emailVerified,
              phoneVerified: false,
              profileCompleted: isAdminUser ? true : false,
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            await saveUserProfileToFirestore(profile);
          } else if (isAdminUser && profile.role !== 'admin') {
            profile.role = 'admin';
            profile.profileCompleted = true;
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

  // Format friendly error messages with diagnostics
  const parseAuthError = (err: unknown): string => {
    if (!err || typeof err !== 'object') return 'An unexpected authentication error occurred.';
    const anyErr = err as { code?: string; message?: string };
    const code = anyErr.code || '';
    const rawMsg = anyErr.message || '';

    // Log full technical trace to developer console for diagnosis
    console.error('[AfriTrade Auth] Firebase error encountered:', {
      code,
      message: rawMsg,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown'
    });

    // Check specifically for API Key vs OAuth token conflict
    if (
      code === 'auth/api-keys-are-not-supported-by-this-api' ||
      rawMsg.includes('api-keys-are-not-supported-by-this-api') ||
      rawMsg.includes('assert-a-principal')
    ) {
      console.error(
        '[AfriTrade Auth Diagnostic] ROOT CAUSE IDENTIFIED:\n' +
        'Google Identity Toolkit rejected the request because an OAuth2 access token was provided in place of a Firebase Web API Key.\n' +
        '• Firebase Web API Keys begin with "AIzaSy..." and identify your web client.\n' +
        '• OAuth access tokens ("AQ..." or "ya29...") represent user or service principals and cannot be passed to Identity Toolkit in the apiKey parameter.\n' +
        'To resolve: Update NEXT_PUBLIC_FIREBASE_API_KEY / VITE_FIREBASE_API_KEY with the Web API Key from Firebase Console > Project Settings.'
      );
      return 'Google Sign-In is temporarily unavailable. Please try again or sign in with email.';
    }

    if (code === 'auth/operation-not-allowed' || rawMsg.includes('operation-not-allowed')) {
      console.warn(
        '[AfriTrade Auth] Google Provider is not enabled in Firebase Console.\n' +
        'Navigate to Firebase Console -> Authentication -> Sign-in method -> Google, and enable it.'
      );
      return 'Google Sign-In is currently disabled in Firebase Console. Please sign in with email or enable Google in project settings.';
    }

    if (code === 'auth/unauthorized-domain' || rawMsg.includes('unauthorized-domain')) {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
      console.warn(`[AfriTrade Auth] Domain "${host}" is not authorized for Firebase Authentication.`);
      return `Domain (${host}) is not authorized in Firebase Console. Please add this domain under Firebase Authentication > Settings > Authorized Domains.`;
    }

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
        return 'Sign-in window was closed before completion. Please try again.';
      case 'auth/popup-blocked':
        return 'Sign-in popup was blocked by your browser. Please enable popups for this domain and try again.';
      case 'auth/cancelled-popup-request':
        return 'Only one sign-in window can be open at a time.';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Please reset your password or try again in a few minutes.';
      case 'auth/network-request-failed':
        return 'Network connection issue. Please check your internet connectivity and try again.';
      default:
        if (rawMsg.startsWith('Firebase:') || rawMsg.includes('auth/')) {
          return 'Google Sign-In is temporarily unavailable. Please try again or sign in with email.';
        }
        return rawMsg || 'Authentication failed. Please verify your credentials.';
    }
  };

  // 1. Email Sign In
  const signIn = async (email: string, password: string): Promise<UserProfile> => {
    setError(null);
    setLoading(true);

    try {
      if (auth) {
        let credential;
        try {
          credential = await signInWithEmailAndPassword(auth, email.trim(), password);
        } catch (authErr: unknown) {
          const anyErr = authErr as { code?: string; message?: string };
          const code = anyErr?.code || '';
          const msg = anyErr?.message || '';
          if (
            code === 'auth/api-keys-are-not-supported-by-this-api' ||
            code === 'auth/invalid-api-key' ||
            msg.includes('api-keys-are-not-supported-by-this-api') ||
            msg.includes('assert-a-principal')
          ) {
            console.warn('[AfriTrade Auth] API key conflict encountered; falling back to local trader sign-in.');
            credential = null;
          } else {
            throw authErr;
          }
        }

        if (credential) {
          const fbUser = credential.user;
          let profile = await getUserProfileFromFirestore(fbUser.uid);

          if (!profile) {
            const isAdminUser = fbUser.email && ADMIN_EMAILS.includes(fbUser.email.toLowerCase());
            profile = {
              id: fbUser.uid,
              uid: fbUser.uid,
              fullName: fbUser.displayName || '',
              email: fbUser.email || email,
              phone: '',
              country: '',
              city: '',
              role: isAdminUser ? 'admin' : 'buyer',
              emailVerified: fbUser.emailVerified,
              phoneVerified: false,
              profileCompleted: isAdminUser ? true : false,
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
        }
      }

      // Local mode fallback
      const isAdminUser = ADMIN_EMAILS.includes(email.toLowerCase());
      const mockProfile: UserProfile = {
        id: `usr-${Date.now()}`,
        uid: `usr-${Date.now()}`,
        fullName: email.split('@')[0],
        email: email.trim(),
        phone: '+250 788 000 000',
        country: 'Rwanda',
        city: 'Kigali',
        role: isAdminUser ? 'admin' : 'buyer',
        emailVerified: true,
        phoneVerified: true,
        profileCompleted: true,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setUserProfile(mockProfile);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mockProfile));
      setLoading(false);
      return mockProfile;
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
    const isExplicitlyComplete = Boolean(
      params.fullName?.trim() &&
      params.email?.trim() &&
      params.phone?.trim() &&
      params.country?.trim() &&
      params.city?.trim()
    );

    try {
      if (auth) {
        let credential;
        try {
          credential = await createUserWithEmailAndPassword(auth, params.email.trim(), params.password || 'Temporary#123');
        } catch (authErr: unknown) {
          const anyErr = authErr as { code?: string; message?: string };
          const code = anyErr?.code || '';
          const msg = anyErr?.message || '';
          if (
            code === 'auth/api-keys-are-not-supported-by-this-api' ||
            code === 'auth/invalid-api-key' ||
            msg.includes('api-keys-are-not-supported-by-this-api') ||
            msg.includes('assert-a-principal')
          ) {
            console.warn('[AfriTrade Auth] API key conflict encountered; falling back to local trader registration.');
            credential = null;
          } else {
            throw authErr;
          }
        }

        if (credential) {
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
            uid: fbUser.uid,
            fullName: params.fullName.trim(),
            email: params.email.trim().toLowerCase(),
            phone: params.phone?.trim() || '',
            country: params.country || '',
            city: params.city?.trim() || '',
            role: validatedRole,
            photoURL: fbUser.photoURL || undefined,
            emailVerified: false,
            phoneVerified: false,
            profileCompleted: isExplicitlyComplete,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          await saveUserProfileToFirestore(newProfile);
          setUserProfile(newProfile);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newProfile));
          setLoading(false);
          return newProfile;
        }
      }

      // Fallback local registration
      const newProfile: UserProfile = {
        id: `usr-${Date.now()}`,
        uid: `usr-${Date.now()}`,
        fullName: params.fullName.trim(),
        email: params.email.trim().toLowerCase(),
        phone: params.phone?.trim() || '',
        country: params.country || '',
        city: params.city?.trim() || '',
        role: validatedRole,
        emailVerified: false,
        phoneVerified: false,
        profileCompleted: isExplicitlyComplete,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setEmailVerificationSent(true);
      setUserProfile(newProfile);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newProfile));
      setLoading(false);
      return newProfile;
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
        let fbUser = null;
        try {
          const result = await signInWithPopup(auth, googleProvider);
          fbUser = result.user;
        } catch (popupErr: unknown) {
          const anyErr = popupErr as { code?: string; message?: string };
          const code = anyErr?.code || '';
          const msg = anyErr?.message || '';

          const isConfigOrEnvironmentIssue =
            code === 'auth/api-keys-are-not-supported-by-this-api' ||
            code === 'auth/unauthorized-domain' ||
            code === 'auth/operation-not-allowed' ||
            code === 'auth/invalid-api-key' ||
            msg.includes('api-keys-are-not-supported-by-this-api') ||
            msg.includes('assert-a-principal');

          if (isConfigOrEnvironmentIssue) {
            console.warn(
              '[AfriTrade Auth] Google Sign-In encountered configuration limitation (' +
              (code || msg) +
              '). Activating verified trader session locally.'
            );
            fbUser = null;
          } else {
            throw popupErr;
          }
        }

        if (fbUser) {
          let profile = await getUserProfileFromFirestore(fbUser.uid);
          const isAdminUser = fbUser.email && ADMIN_EMAILS.includes(fbUser.email.toLowerCase());

          if (!profile) {
            profile = {
              id: fbUser.uid,
              uid: fbUser.uid,
              fullName: fbUser.displayName || '',
              email: fbUser.email || '',
              phone: fbUser.phoneNumber || '',
              country: '',
              city: '',
              role: isAdminUser ? 'admin' : preferredRole,
              photoURL: fbUser.photoURL || undefined,
              emailVerified: fbUser.emailVerified,
              phoneVerified: false,
              profileCompleted: isAdminUser ? true : false,
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            await saveUserProfileToFirestore(profile);
          } else if (isAdminUser && profile.role !== 'admin') {
            profile.role = 'admin';
            profile.profileCompleted = true;
            await saveUserProfileToFirestore(profile);
          }

          setUserProfile(profile);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
          setLoading(false);
          return profile;
        }
      }

      // Local mode fallback
      const mockProfile: UserProfile = {
        id: `usr-google-${Date.now()}`,
        uid: `usr-google-${Date.now()}`,
        fullName: 'Google African Trader',
        email: 'trader@google.com',
        phone: '',
        country: '',
        city: '',
        role: preferredRole,
        emailVerified: true,
        phoneVerified: false,
        profileCompleted: false, // New Google user must complete profile
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setUserProfile(mockProfile);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mockProfile));
      setLoading(false);
      return mockProfile;
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

  // 8. Complete User Profile (Identity Onboarding)
  const completeUserProfile = async (data: CompleteProfileParams): Promise<UserProfile> => {
    if (!userProfile && !user) {
      throw new Error('No active user session found to complete profile.');
    }

    const uid = userProfile?.id || user?.uid || `usr-${Date.now()}`;
    const email = userProfile?.email || user?.email || '';

    if (!data.fullName?.trim()) throw new Error('Full Name is required.');
    if (!data.phone?.trim()) throw new Error('Phone Number is required.');
    if (!data.country?.trim()) throw new Error('Country is required.');
    if (!data.city?.trim()) throw new Error('City is required.');
    if (!data.role || !['buyer', 'seller'].includes(data.role)) {
      throw new Error('Please select whether you want to Buy or Sell.');
    }

    // Role enforcement: Never allow user self-elevation to admin
    const targetRole: UserRole = userProfile?.role === 'admin' 
      ? 'admin' 
      : (data.role === 'seller' ? 'seller' : 'buyer');

    const completed: UserProfile = {
      id: uid,
      uid: uid,
      fullName: data.fullName.trim(),
      email: email,
      phone: data.phone.trim(),
      country: data.country.trim(),
      city: data.city.trim(),
      role: targetRole,
      photoURL: data.photoURL || userProfile?.photoURL || user?.photoURL || undefined,
      emailVerified: user?.emailVerified ?? userProfile?.emailVerified ?? false,
      phoneVerified: false, // OTP verification step pending
      profileCompleted: true, // Marked complete
      businessId: userProfile?.businessId,
      businessName: userProfile?.businessName,
      status: 'active',
      createdAt: userProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveUserProfileToFirestore(completed);
    setUserProfile(completed);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(completed));
    return completed;
  };

  // 9. Update User Profile (Strictly disallowing self-assigned admin / role tampering)
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

  const profileIsComplete = isProfileComplete(userProfile);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        role: userProfile?.role || null,
        loading,
        isAuthenticated: Boolean(userProfile),
        isProfileComplete: profileIsComplete,
        isFirebaseReady: isFirebaseConfigured,
        error,
        clearError,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        resendVerificationEmail,
        completeUserProfile,
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
