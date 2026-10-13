import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Use specific firestoreDatabaseId if configured
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize anonymous authentication and test connection
export async function initializeFirebase() {
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
    // Test connectivity as per Firestore validation guidelines
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch {
      // test doc may not exist, connection is valid as long as not offline error
    }
    return true;
  } catch (error) {
    console.warn('[Firebase] Connection / Auth init issue:', error);
    return false;
  }
}
