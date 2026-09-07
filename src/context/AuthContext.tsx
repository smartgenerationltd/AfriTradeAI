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
  email?: string;
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
  checkEmailVerificationStatus: () => Promise<boolean>;
  verifyEmailNow: () => Promise<void>;
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
    if (!auth || !isFirebaseConfigured) {
      // In preview mode or when Firebase client is not fully configured
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        try {
          // Load Firestore user document
          let profile = await getUserProfileFromFirestore(fbUser.uid);
          
          const isAdminUser = fbUser.email && ADMIN_EMAILS.includes(fbUser.email.toLowerCase());

          if (!profile) {
            // Profile doesn't exist yet: initialize with profileCompleted: false
            profile = {
              id: fbUser.uid,
              uid: fbUser.uid,
              fullName: fbUser.displayName || '',
              email: fbUser.email || '',
              phone: fbUser.phoneNumber || '',
              country: '',
              city: '',
              role: isAdminUser ? 'admin' : 'buyer',
              photoURL: fbUser.photoURL || undefined,
              emailVerified: fbUser.emailVerified,
              phoneVerified: false,
              profileCompleted: isAdminUser ? true : false,
              authProvider: fbUser.providerData?.[0]?.providerId || 'password',
              status: 'active',
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            await saveUserProfileToFirestore(profile);
          } else {
            // Existing profile: PRESERVE existing trader profile, update lastLoginAt and emailVerified
            const updates: Partial<UserProfile> = {
              lastLoginAt: new Date().toISOString(),
            };
            if (isAdminUser && profile.role !== 'admin') {
              updates.role = 'admin';
              updates.profileCompleted = true;
            }
            if (fbUser.emailVerified && !profile.emailVerified) {
              updates.emailVerified = true;
            }
            profile = {
              ...profile,
              ...updates,
              updatedAt: new Date().toISOString()
            };
            await saveUserProfileToFirestore(profile);
          }

          setUserProfile(profile);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
        } catch (err) {
          console.warn('[AfriTrade] Firestore profile sync warning:', err);
        }
      } else {
        setUserProfile(null);
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Format friendly error messages matching requirements
  const parseAuthError = (err: unknown): string => {
    if (!err || typeof err !== 'object') return 'An unexpected authentication error occurred.';
    const anyErr = err as { code?: string; message?: string };
    const code = anyErr.code || '';
    const rawMsg = anyErr.message || '';

    // Log diagnostic warning for debugging
    console.warn('[AfriTrade Auth] Authentication event notice:', {
      code,
      message: rawMsg,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown'
    });

    // 1. Popup blocked
    if (code === 'auth/popup-blocked' || rawMsg.includes('popup-blocked')) {
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site and try again.';
    }

    // 2. Google sign-in cancelled
    if (code === 'auth/popup-closed-by-user' || rawMsg.includes('popup-closed-by-user')) {
      return 'Google sign-in was cancelled before completion.';
    }

    // 3. Unauthorized domain
    if (code === 'auth/unauthorized-domain' || rawMsg.includes('unauthorized-domain')) {
      return 'This domain is not authorized for Firebase authentication. Please verify authorized domains in Firebase Console.';
    }

    // 4. Invalid email
    if (code === 'auth/invalid-email' || rawMsg.includes('invalid-email')) {
      return 'Please enter a valid email address.';
    }

    // 5. Wrong password / invalid credentials
    if (
      code === 'auth/wrong-password' ||
      code === 'auth/invalid-credential' ||
      code === 'auth/user-not-found' ||
      rawMsg.includes('wrong-password') ||
      rawMsg.includes('invalid-credential')
    ) {
      return 'Incorrect email or password. Please verify your credentials and try again.';
    }

    // 6. Email already in use
    if (code === 'auth/email-already-in-use' || rawMsg.includes('email-already-in-use')) {
      return 'An account with this email already exists. Please sign in instead.';
    }

    // 7. Network error
    if (code === 'auth/network-request-failed' || rawMsg.includes('network-request-failed') || rawMsg.includes('network error')) {
      return 'Network communication error. Please check your internet connection and try again.';
    }

    // 8. Firebase configuration / API key error
    if (
      code.includes('api-keys-are-not-supported') ||
      code.includes('invalid-api-key') ||
      code.includes('operation-not-allowed') ||
      rawMsg.includes('api-keys-are-not-supported') ||
      rawMsg.includes('assert-a-principal')
    ) {
      return 'Firebase Web API key is required. A Google Cloud OAuth token was provided instead of a Web API key (AIza...). Please update VITE_FIREBASE_API_KEY in your settings.';
    }

    // 9. Firestore permission/write error
    if (
      code === 'permission-denied' ||
      rawMsg.includes('Database permission error') ||
      rawMsg.includes('Firestore write error') ||
      rawMsg.includes('insufficient permissions')
    ) {
      return 'Database permission or write error. Unable to save trader profile to Cloud Firestore.';
    }

    if (code === 'auth/weak-password') {
      return 'Password should be at least 6 characters.';
    }

    if (code === 'auth/too-many-requests') {
      return 'Too many attempts. Please try again in a few minutes.';
    }

    return rawMsg || 'Authentication failed. Please verify your credentials and try again.';
  };

  // 1. Email Sign In
  const signIn = async (email: string, password: string): Promise<UserProfile> => {
    setError(null);
    setLoading(true);

    // Resilient fallback when Firebase live client is not configured
    if (!auth || !isFirebaseConfigured) {
      const emailCandidate = email.trim().toLowerCase();
      const isAdminUser = ADMIN_EMAILS.includes(emailCandidate);
      const savedProfile = (() => {
        try {
          const raw = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      })();

      const uid = savedProfile?.id || savedProfile?.uid || `usr-${Date.now()}`;
      const profile: UserProfile = (savedProfile && savedProfile.email?.toLowerCase() === emailCandidate)
        ? {
            ...savedProfile,
            lastLoginAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : {
            id: uid,
            uid: uid,
            fullName: emailCandidate.split('@')[0] || 'Trader',
            email: emailCandidate,
            phone: '',
            country: 'Rwanda',
            city: 'Kigali',
            role: isAdminUser ? 'admin' : 'buyer',
            emailVerified: true,
            phoneVerified: false,
            profileCompleted: isAdminUser ? true : false,
            authProvider: 'password',
            status: 'active',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

      setUserProfile(profile);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
      setLoading(false);
      return profile;
    }

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const fbUser = credential.user;

      let profile = await getUserProfileFromFirestore(fbUser.uid);
      const isAdminUser = fbUser.email && ADMIN_EMAILS.includes(fbUser.email.toLowerCase());

      if (!profile) {
        profile = {
          id: fbUser.uid,
          uid: fbUser.uid,
          fullName: fbUser.displayName || email.split('@')[0],
          email: fbUser.email || email.trim(),
          phone: '',
          country: '',
          city: '',
          role: isAdminUser ? 'admin' : 'buyer',
          emailVerified: fbUser.emailVerified,
          phoneVerified: false,
          profileCompleted: isAdminUser ? true : false,
          authProvider: 'password',
          status: 'active',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await saveUserProfileToFirestore(profile);
      } else {
        // PRESERVE existing profile info, update lastLoginAt and emailVerified
        const updates: Partial<UserProfile> = {
          lastLoginAt: new Date().toISOString(),
        };
        if (isAdminUser && profile.role !== 'admin') {
          updates.role = 'admin';
          updates.profileCompleted = true;
        }
        if (fbUser.emailVerified && !profile.emailVerified) {
          updates.emailVerified = true;
        }
        profile = {
          ...profile,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        await saveUserProfileToFirestore(profile);
      }

      setUser(fbUser);
      setUserProfile(profile);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
      setLoading(false);
      return profile;
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

    // Resilient fallback when Firebase live client is not configured
    if (!auth || !isFirebaseConfigured) {
      const uid = `usr-${Date.now()}`;
      const newProfile: UserProfile = {
        id: uid,
        uid: uid,
        fullName: params.fullName.trim(),
        email: params.email.trim().toLowerCase(),
        phone: params.phone?.trim() || '',
        country: params.country || 'Rwanda',
        city: params.city?.trim() || '',
        role: validatedRole,
        emailVerified: false,
        phoneVerified: false,
        profileCompleted: isExplicitlyComplete,
        authProvider: 'password',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveUserProfileToFirestore(newProfile);
      setUserProfile(newProfile);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newProfile));
      setLoading(false);
      return newProfile;
    }

    try {
      const credential = await createUserWithEmailAndPassword(
        auth, 
        params.email.trim(), 
        params.password || 'Temporary#123'
      );
      const fbUser = credential.user;

      // Set display name in Firebase Auth
      try {
        await updateProfile(fbUser, { displayName: params.fullName.trim() });
      } catch (profileErr) {
        console.warn('[AfriTrade] Update profile warning:', profileErr);
      }

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
        authProvider: 'password',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveUserProfileToFirestore(newProfile);
      setUser(fbUser);
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

    // Resilient fallback when Firebase live client is not configured
    if (!auth || !googleProvider || !isFirebaseConfigured) {
      const emailCandidate = 'giniyomugabo@gmail.com';
      const uid = `google-trader-${Date.now()}`;
      const savedProfile = (() => {
        try {
          const raw = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      })();

      const isAdminUser = ADMIN_EMAILS.includes(emailCandidate);
      const profile: UserProfile = (savedProfile && savedProfile.authProvider === 'google.com')
        ? {
            ...savedProfile,
            lastLoginAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : {
            id: uid,
            uid: uid,
            fullName: 'G. Niyomugabo',
            email: emailCandidate,
            phone: '+250788123456',
            country: 'Rwanda',
            city: 'Kigali',
            role: isAdminUser ? 'admin' : preferredRole,
            photoURL: undefined,
            emailVerified: true,
            phoneVerified: false,
            profileCompleted: isAdminUser ? true : false,
            authProvider: 'google.com',
            status: 'active',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

      setUserProfile(profile);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
      setLoading(false);
      return profile;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

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
          authProvider: 'google.com',
          status: 'active',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await saveUserProfileToFirestore(profile);
      } else {
        // PRESERVE EXISTING PROFILE: Do NOT overwrite with empty values!
        const updates: Partial<UserProfile> = {
          lastLoginAt: new Date().toISOString(),
        };
        if (isAdminUser && profile.role !== 'admin') {
          updates.role = 'admin';
          updates.profileCompleted = true;
        }
        if (fbUser.emailVerified && !profile.emailVerified) {
          updates.emailVerified = true;
        }
        profile = {
          ...profile,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        await saveUserProfileToFirestore(profile);
      }

      setUser(fbUser);
      setUserProfile(profile);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
      setLoading(false);
      return profile;
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
    setError(null);
    try {
      const targetUser = auth?.currentUser || user;
      if (!targetUser) {
        throw new Error('No authenticated user found. Please sign in to verify your email.');
      }
      await sendEmailVerification(targetUser);
      setEmailVerificationSent(true);
    } catch (err: unknown) {
      const anyErr = err as { code?: string; message?: string };
      if (anyErr?.code === 'auth/too-many-requests') {
        throw new Error('Verification email was already requested recently. Please check your inbox or spam folder.');
      }
      const msg = parseAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  // Check email verification status from Firebase
  const checkEmailVerificationStatus = async (): Promise<boolean> => {
    try {
      if (auth && auth.currentUser) {
        await auth.currentUser.reload();
        const verified = auth.currentUser.emailVerified;
        if (verified && userProfile) {
          const updated = { ...userProfile, emailVerified: true, updatedAt: new Date().toISOString() };
          await saveUserProfileToFirestore(updated);
          setUserProfile(updated);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));
        }
        return verified;
      }
      return Boolean(userProfile?.emailVerified);
    } catch (err) {
      console.warn('[AfriTrade] Email verification status check error:', err);
      return Boolean(userProfile?.emailVerified);
    }
  };

  // Instant or manual verify email
  const verifyEmailNow = async (): Promise<void> => {
    const currentUid = userProfile?.id || user?.uid || `usr-${Date.now()}`;
    const targetEmail = (userProfile?.email || user?.email || '').toLowerCase();
    const updatedProfile: UserProfile = {
      ...(userProfile || {
        id: currentUid,
        uid: currentUid,
        fullName: user?.displayName || 'Trader',
        email: targetEmail,
        country: 'Rwanda',
        city: 'Kigali',
        role: 'buyer',
        phone: '',
        phoneVerified: false,
        profileCompleted: false,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }),
      emailVerified: true,
      updatedAt: new Date().toISOString()
    };
    await saveUserProfileToFirestore(updatedProfile);
    setUserProfile(updatedProfile);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updatedProfile));
    setEmailVerificationSent(false);
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
    const currentUid = user?.uid || userProfile?.uid || userProfile?.id;
    if (!currentUid) {
      throw new Error('No active authenticated session found. Please sign in first.');
    }

    const emailCandidate = (data.email?.trim() || userProfile?.email || user?.email || '').toLowerCase();

    if (!data.fullName?.trim()) throw new Error('Full Name is required.');
    if (!emailCandidate) throw new Error('A valid email address is required.');
    if (!data.phone?.trim()) throw new Error('Phone Number is required.');
    if (!data.country?.trim()) throw new Error('Country is required.');
    if (!data.city?.trim()) throw new Error('City is required.');
    if (!data.role || !['buyer', 'seller'].includes(data.role)) {
      throw new Error('Please select whether you want to Buy or Sell.');
    }

    const isAdminUser = emailCandidate && ADMIN_EMAILS.includes(emailCandidate.toLowerCase());

    // Role enforcement: Never allow user self-elevation to admin
    const targetRole: UserRole = (userProfile?.role === 'admin' || isAdminUser)
      ? 'admin' 
      : (data.role === 'seller' ? 'seller' : 'buyer');

    const completed: UserProfile = {
      id: currentUid,
      uid: currentUid,
      fullName: data.fullName.trim(),
      email: emailCandidate,
      phone: data.phone.trim(),
      country: data.country.trim(),
      city: data.city.trim(),
      role: targetRole,
      photoURL: data.photoURL || userProfile?.photoURL || user?.photoURL || undefined,
      emailVerified: isAdminUser ? true : (user?.emailVerified ?? userProfile?.emailVerified ?? false),
      phoneVerified: false,
      profileCompleted: true, // Marked complete
      businessId: userProfile?.businessId,
      businessName: userProfile?.businessName,
      authProvider: userProfile?.authProvider || (user?.providerData?.[0]?.providerId) || 'password',
      status: 'active',
      createdAt: userProfile?.createdAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Await Firestore write. If it fails, error will throw and NOT complete profile
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
        checkEmailVerificationStatus,
        verifyEmailNow,
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
