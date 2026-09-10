import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import appletConfig from '../../../firebase-applet-config.json';

/**
 * AfriTrade AI — Firebase Client Configuration
 * 
 * Configured using live provisioned Firebase project credentials from firebase-applet-config.json.
 * Initialized as a singleton to avoid multiple Firebase instances.
 */

export const FIREBASE_PROJECT_ID = 'afritradeai';

export const firebaseConfig = {
  apiKey: appletConfig.apiKey || '',
  authDomain: appletConfig.authDomain || `${FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: appletConfig.storageBucket || `${FIREBASE_PROJECT_ID}.firebasestorage.app`,
  messagingSenderId: appletConfig.messagingSenderId || undefined,
  appId: appletConfig.appId || undefined,
  firestoreDatabaseId: appletConfig.firestoreDatabaseId || 'ai-studio-afritradeai-4a228df2-d4af-46f4-8eef-6cd609ad642d',
};

export const hasValidApiKey = Boolean(firebaseConfig.apiKey && firebaseConfig.apiKey.startsWith('AIzaSy'));

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let googleProvider: GoogleAuthProvider;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  auth = getAuth(app);

  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ 
    prompt: 'select_account' 
  });
  googleProvider.addScope('email');
  googleProvider.addScope('profile');

  console.info('[AfriTrade] Live Firebase Client successfully initialized for project:', FIREBASE_PROJECT_ID, 'db:', firebaseConfig.firestoreDatabaseId);

  // Connection test per Firebase skill instructions
  if (typeof window !== 'undefined') {
    getDocFromServer(doc(db, 'test', 'connection')).catch((error) => {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error('Please check your Firebase configuration.');
      }
    });
  }
} catch (err) {
  console.warn('[AfriTrade] Error initializing Firebase client:', err);
  app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
}

export const isFirebaseConfigured = Boolean(app && auth && db && hasValidApiKey);

export { app, auth, db, googleProvider };
export default app;
