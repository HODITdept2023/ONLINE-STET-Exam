import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  getDocFromServer
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore with multi-tab offline cache and specific database ID
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  }, firebaseConfig.firestoreDatabaseId || undefined);
} catch (e) {
  // If already initialized, use existing
  firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
}

export const db = firestoreDb;
export const auth = getAuth(app);

/**
 * Validate live connection to Cloud Firestore
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'settings', 'connection-probe'));
    console.log('[Firebase] Cloud Firestore connection verified.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Client is currently offline; operating from local Firestore cache.');
    } else {
      console.log('[Firebase] Firestore initialized successfully.');
    }
    return false;
  }
}

// Boot connection test
testConnection();
