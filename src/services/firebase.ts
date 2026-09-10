import { 
  app, 
  auth, 
  db, 
  googleProvider, 
  firebaseConfig, 
  isFirebaseConfigured,
  FIREBASE_PROJECT_ID 
} from '../lib/firebase/client';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { UserProfile, Business } from '../types';

export interface AIChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
  groundingChunks?: Array<{
    web?: { uri: string; title: string };
    maps?: { uri: string; title: string; placeAnswerSources?: { reviewSnippets?: Array<{ text: string }> } };
  }>;
  webSearchQueries?: string[];
}

export interface AIChatSession {
  id: string;
  userId: string;
  title: string;
  role: string;
  taskType: 'complex' | 'general' | 'fast';
  messages: AIChatMessage[];
  createdAt: string;
  updatedAt: string;
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
  if (!db || !isFirebaseConfigured) {
    try {
      const saved = localStorage.getItem('afritrade_auth_user_profile') || localStorage.getItem('afritrade_auth_user');
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

/**
 * Persists an AI multi-turn chat session into Firestore under `ai_chats/{chatId}`
 */
export async function saveChatSessionToFirestore(session: AIChatSession): Promise<void> {
  if (!session.id) return;

  // Local storage cache fallback
  try {
    const key = `afritrade_ai_chat_${session.id}`;
    localStorage.setItem(key, JSON.stringify(session));
    const allSessionsKey = 'afritrade_ai_chat_sessions';
    const existingStr = localStorage.getItem(allSessionsKey);
    const existingList: AIChatSession[] = existingStr ? JSON.parse(existingStr) : [];
    const idx = existingList.findIndex(s => s.id === session.id);
    if (idx >= 0) {
      existingList[idx] = session;
    } else {
      existingList.unshift(session);
    }
    localStorage.setItem(allSessionsKey, JSON.stringify(existingList.slice(0, 30)));
  } catch (e) {
    console.warn('Failed to cache chat session locally:', e);
  }

  // Firestore persistence
  if (db && isFirebaseConfigured && session.userId) {
    const docPath = `ai_chats/${session.id}`;
    try {
      const chatDocRef = doc(db, 'ai_chats', session.id);
      await setDoc(chatDocRef, {
        id: session.id,
        userId: session.userId,
        title: session.title,
        role: session.role,
        taskType: session.taskType,
        messages: session.messages,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      }, { merge: true });
      console.info(`[AfriTrade Firestore] Saved AI chat session to ${docPath}`);
    } catch (err) {
      console.warn(`[AfriTrade Firestore] Notice: Error writing to ${docPath}:`, err);
    }
  }
}

/**
 * Loads previous chat sessions for the current user
 */
export async function getUserChatSessionsFromFirestore(userId: string): Promise<AIChatSession[]> {
  const localSessions: AIChatSession[] = [];
  try {
    const existingStr = localStorage.getItem('afritrade_ai_chat_sessions');
    if (existingStr) {
      localSessions.push(...JSON.parse(existingStr));
    }
  } catch (e) {
    console.warn('Failed to read local chat sessions:', e);
  }

  if (!db || !isFirebaseConfigured || !userId) {
    return localSessions;
  }

  try {
    const q = query(collection(db, 'ai_chats'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const remoteSessions: AIChatSession[] = [];
    snapshot.forEach((docSnap) => {
      remoteSessions.push(docSnap.data() as AIChatSession);
    });

    // Sort by updatedAt descending
    remoteSessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return remoteSessions.length > 0 ? remoteSessions : localSessions;
  } catch (err) {
    console.warn('[AfriTrade Firestore] Unable to fetch user chat sessions from Firestore, using local cache:', err);
    return localSessions;
  }
}

/**
 * Deletes a chat session from Firestore and local storage
 */
export async function deleteChatSessionFromFirestore(chatId: string): Promise<void> {
  try {
    localStorage.removeItem(`afritrade_ai_chat_${chatId}`);
    const existingStr = localStorage.getItem('afritrade_ai_chat_sessions');
    if (existingStr) {
      const list: AIChatSession[] = JSON.parse(existingStr);
      const filtered = list.filter(s => s.id !== chatId);
      localStorage.setItem('afritrade_ai_chat_sessions', JSON.stringify(filtered));
    }
  } catch (e) {
    console.warn('Error clearing local chat cache:', e);
  }

  if (db && isFirebaseConfigured) {
    try {
      await deleteDoc(doc(db, 'ai_chats', chatId));
    } catch (err) {
      console.warn('Error deleting chat from Firestore:', err);
    }
  }
}

export { app, auth, db, googleProvider, firebaseConfig, isFirebaseConfigured, FIREBASE_PROJECT_ID };
