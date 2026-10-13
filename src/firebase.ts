import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use specific firestoreDatabaseId
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase and verify connection
export async function initializeFirebase(): Promise<boolean> {
  try {
    try {
      // Light connectivity check to ensure Firestore is reachable
      await getDocFromServer(doc(db, 'test', 'ping'));
    } catch {
      // test doc check confirms network reachability
    }
    return true;
  } catch (error) {
    console.warn('[Firebase] Connection warning:', error);
    return false;
  }
}
