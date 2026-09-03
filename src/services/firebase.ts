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
  if (!db) return null;
  const docPath = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.warn('[AfriTrade Firestore] Unable to fetch user profile from cloud, using local state:', err);
    return null;
  }
}

export async function saveUserProfileToFirestore(profile: UserProfile): Promise<void> {
  if (!db) return;
  const docPath = `users/${profile.id}`;
  try {
    const userDocRef = doc(db, 'users', profile.id);
    await setDoc(userDocRef, profile, { merge: true });
  } catch (err) {
    console.warn('[AfriTrade Firestore] Cloud sync deferred for user profile:', err);
  }
}

export async function saveBusinessToFirestore(business: Business): Promise<void> {
  if (!db) return;
  const docPath = `businesses/${business.businessId}`;
  try {
    const bizDocRef = doc(db, 'businesses', business.businessId);
    await setDoc(bizDocRef, business, { merge: true });
  } catch (err) {
    console.warn('[AfriTrade Firestore] Cloud sync deferred for business profile:', err);
  }
}

export { app, auth, db, googleProvider, firebaseConfig, isFirebaseConfigured };
