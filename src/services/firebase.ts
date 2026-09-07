import { 
  app, 
  auth, 
  db, 
  googleProvider, 
  firebaseConfig, 
  isFirebaseConfigured 
} from '../lib/firebase/client';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { UserProfile, Business } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function getUserProfileFromFirestore(userId: string): Promise<UserProfile | null> {
  if (!db || !isFirebaseConfigured) {
    try {
      const saved = localStorage.getItem('afritrade_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id === userId || parsed?.uid === userId) {
          return parsed as UserProfile;
        }
      }
    } catch {
      // ignore
    }
    return null;
  }
  if (!userId) return null;
  const docPath = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const data = userSnap.data() as Record<string, unknown>;
      // Normalize timestamp fields if stored as Firestore Timestamps or dates
      if (data.createdAt && typeof (data.createdAt as { toDate?: () => Date }).toDate === 'function') {
        data.createdAt = (data.createdAt as { toDate: () => Date }).toDate().toISOString();
      }
      if (data.lastLoginAt && typeof (data.lastLoginAt as { toDate?: () => Date }).toDate === 'function') {
        data.lastLoginAt = (data.lastLoginAt as { toDate: () => Date }).toDate().toISOString();
      }
      if (data.updatedAt && typeof (data.updatedAt as { toDate?: () => Date }).toDate === 'function') {
        data.updatedAt = (data.updatedAt as { toDate: () => Date }).toDate().toISOString();
      }
      return {
        ...data,
        id: (data.uid as string) || (data.id as string) || userId,
        uid: (data.uid as string) || (data.id as string) || userId,
      } as unknown as UserProfile;
    }
    return null;
  } catch (err) {
    console.warn(`[AfriTrade Firestore] Unable to fetch user profile from ${docPath}:`, err);
    return null;
  }
}

export async function saveUserProfileToFirestore(profile: UserProfile): Promise<void> {
  const uid = profile.uid || profile.id;
  if (!uid) {
    throw new Error('User UID is missing; cannot persist trader profile.');
  }

  if (!db || !isFirebaseConfigured) {
    console.info(`[AfriTrade Profile] Saved trader profile to local cache for user: ${uid}`);
    return;
  }

  const docPath = `users/${uid}`;
  const now = new Date().toISOString();

  // Construct structured profile matching requirements
  const docData: Record<string, unknown> = {
    uid: uid,
    id: uid,
    fullName: profile.fullName || '',
    email: profile.email || '',
    emailVerified: Boolean(profile.emailVerified),
    phone: profile.phone || '',
    country: profile.country || '',
    city: profile.city || '',
    role: profile.role || 'buyer',
    profileCompleted: Boolean(profile.profileCompleted),
    authProvider: profile.authProvider || (profile.email ? 'password' : 'unknown'),
    createdAt: profile.createdAt || now,
    lastLoginAt: profile.lastLoginAt || now,
    updatedAt: now,
    status: profile.status || 'active',
  };

  if (profile.photoURL !== undefined) {
    docData.photoURL = profile.photoURL;
  }
  if (profile.phoneVerified !== undefined) {
    docData.phoneVerified = profile.phoneVerified;
  }
  if (profile.businessId) {
    docData.businessId = profile.businessId;
  }
  if (profile.businessName) {
    docData.businessName = profile.businessName;
  }

  try {
    const userDocRef = doc(db, 'users', uid);
    // merge: true preserves any existing fields not explicitly overwritten
    await setDoc(userDocRef, docData, { merge: true });
    console.info(`[AfriTrade Firestore] Trader profile successfully saved to ${docPath}`);
  } catch (err: unknown) {
    const anyErr = err as { code?: string; message?: string };
    const code = anyErr?.code || '';
    const rawMsg = anyErr?.message || String(err);
    console.error(`[AfriTrade Firestore] Write error saving to ${docPath}:`, err);

    if (code === 'permission-denied' || rawMsg.includes('permission-denied') || rawMsg.includes('insufficient permissions')) {
      throw new Error('Database permission error. Unable to save trader profile to Cloud Firestore.');
    }
    if (code === 'unavailable' || rawMsg.includes('unavailable')) {
      throw new Error('Cloud Firestore is currently unreachable. Please check your connection and try again.');
    }
    throw new Error('Firestore write error: Unable to record trader profile in Cloud Firestore.');
  }
}

export async function saveBusinessToFirestore(business: Business): Promise<void> {
  if (!db) {
    throw new Error('Cloud Firestore database is not initialized. Please verify Firebase configuration.');
  }
  const docPath = `businesses/${business.businessId}`;
  try {
    const bizDocRef = doc(db, 'businesses', business.businessId);
    await setDoc(bizDocRef, business, { merge: true });
    console.info(`[AfriTrade Firestore] Business document successfully saved to ${docPath}`);
  } catch (err) {
    console.error(`[AfriTrade Firestore] Write error saving business to ${docPath}:`, err);
    throw new Error('Firestore write error: Unable to save business entity to Cloud Firestore.');
  }
}

export { app, auth, db, googleProvider, firebaseConfig, isFirebaseConfigured };
