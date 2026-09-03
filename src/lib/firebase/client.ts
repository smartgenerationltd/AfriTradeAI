import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * AfriTrade AI — Firebase Client Configuration
 * 
 * Supports both Next.js (NEXT_PUBLIC_FIREBASE_*) and Vite (VITE_FIREBASE_*) environment variables.
 * Initialized as a singleton to avoid multiple Firebase instances.
 * 
 * IMPORTANT NOTE ON API KEYS VS OAUTH ACCESS TOKENS:
 * Firebase Web API keys (apiKey) are identifiers created by Google Cloud / Firebase Console
 * that typically start with "AIzaSy...".
 * OAuth access tokens (starting with "ya29." or "AQ.") are bearer tokens and MUST NEVER be used
 * as the Firebase Web API Key. Sending an OAuth access token as an API key causes Google Identity Toolkit
 * to reject requests with:
 * "auth/api-keys-are-not-supported-by-this-api.-expected-oauth2-access-token-or-other-authentication-credentials-that-assert-a-principal"
 */

function getEnvVar(key: string): string {
  // Vite client-side environment
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const metaVal = (import.meta.env as Record<string, string>)[key];
    if (metaVal) return metaVal;
  }
  // Node / SSR environment
  if (typeof process !== 'undefined' && process.env) {
    const procVal = process.env[key];
    if (procVal) return procVal;
  }
  return '';
}

const rawApiKey = 
  getEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY') || 
  getEnvVar('VITE_FIREBASE_API_KEY');

const rawAuthDomain = 
  getEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN') || 
  getEnvVar('VITE_FIREBASE_AUTH_DOMAIN');

const rawProjectId = 
  getEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID') || 
  getEnvVar('VITE_FIREBASE_PROJECT_ID');

const rawStorageBucket = 
  getEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET') || 
  getEnvVar('VITE_FIREBASE_STORAGE_BUCKET');

const rawMessagingSenderId = 
  getEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID') || 
  getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID');

const rawAppId = 
  getEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID') || 
  getEnvVar('VITE_FIREBASE_APP_ID');

/**
 * Diagnostic check: Verify whether a valid Firebase Web API key was provided.
 * Firebase Web API Keys begin with "AIzaSy..." and identify your web client.
 * OAuth access tokens ("AQ..." or "ya29...") represent user or service principals and cannot be passed to Identity Toolkit in the apiKey parameter.
 */
export const isOAuthTokenProvidedAsApiKey = Boolean(
  rawApiKey && (rawApiKey.startsWith('AQ.') || rawApiKey.startsWith('ya29.'))
);

export const isValidFirebaseApiKey = (key?: string): boolean => {
  if (!key) return false;
  const trimmed = key.trim();
  return trimmed.startsWith('AIza') && !trimmed.startsWith('AQ.') && !trimmed.startsWith('ya29.');
};

export const isValidFirebaseProjectId = (id?: string): boolean => {
  if (!id) return false;
  const trimmed = id.trim();
  return trimmed.length > 0 && !trimmed.startsWith('AQ.') && !trimmed.startsWith('ya29.');
};

if (isOAuthTokenProvidedAsApiKey) {
  console.warn(
    '[AfriTrade Firebase Client] OAuth2 Access Token detected in Firebase API Key environment variable.\n' +
    'Firebase Web API keys must be valid Google Cloud Web API keys (starting with "AIzaSy...").\n' +
    'To prevent "auth/api-keys-are-not-supported-by-this-api", the client is safely operating in local authentication mode.'
  );
}

export const firebaseConfig = {
  apiKey: rawApiKey,
  authDomain: rawAuthDomain,
  projectId: rawProjectId,
  storageBucket: rawStorageBucket,
  messagingSenderId: rawMessagingSenderId,
  appId: rawAppId,
};

export const isFirebaseConfigured = Boolean(
  isValidFirebaseApiKey(firebaseConfig.apiKey) && 
  isValidFirebaseProjectId(firebaseConfig.projectId)
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
    
    // Configure standard Firebase Web Google Auth Provider
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ 
      prompt: 'select_account' 
    });
    // Add standard email and profile scopes
    googleProvider.addScope('email');
    googleProvider.addScope('profile');

    console.info('[AfriTrade] Firebase client initialized with project:', firebaseConfig.projectId);
  } catch (err) {
    console.error('[AfriTrade] Error initializing Firebase client:', err);
  }
} else {
  console.info('[AfriTrade] Operating in secure local mode with comprehensive demo personas and persistence.');
}

export { app, auth, db, googleProvider };
export default app;
