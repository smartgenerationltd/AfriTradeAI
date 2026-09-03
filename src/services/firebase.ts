import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  getDocFromServer 
} from 'firebase/firestore';
import { UserProfile, Business } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || (import.meta.env as Record<string, string>).NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || (import.meta.env as Record<string, string>).NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || (import.meta.env as Record<string, string>).NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || (import.meta.env as Record<string, string>).NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || (import.meta.env as Record<string, string>).NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || (import.meta.env as Record<string, string>).NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.apiKey !== ''
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    console.log('[AfriTrade] Firebase initialized successfully with Project ID:', firebaseConfig.projectId);

    // Test connection to Firestore
    testConnection();
  } catch (err) {
    console.warn('[AfriTrade] Firebase client init error:', err);
  }
} else {
  console.info('[AfriTrade] Firebase config not detected; running in secure local state mode with full auth emulation.');
}

async function testConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[AfriTrade] Firestore is currently offline or unreachable.');
    }
  }
}

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
    handleFirestoreError(err, OperationType.GET, docPath);
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
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

export async function saveBusinessToFirestore(business: Business): Promise<void> {
  if (!db) return;
  const docPath = `businesses/${business.businessId}`;
  try {
    const bizDocRef = doc(db, 'businesses', business.businessId);
    await setDoc(bizDocRef, business, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

export { app, auth, db, googleProvider, firebaseConfig };
