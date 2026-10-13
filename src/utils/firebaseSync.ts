import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, initializeFirebase } from '../firebase';
import { ExpenseRecord, ReimbursementBatch, UserProfile, ReimbursementOffset } from '../types';
import { 
  INITIAL_EXPENSES, 
  INITIAL_OFFSETS, 
  INITIAL_BATCHES, 
  DEFAULT_USER_PROFILE,
  sortExpensesByDateDesc,
  sortOffsetsByDateDesc,
  filterOutUnwantedOffsets
} from './storage';

export interface CloudSyncCallbacks {
  onExpenses: (expenses: ExpenseRecord[]) => void;
  onOffsets: (offsets: ReimbursementOffset[]) => void;
  onBatches: (batches: ReimbursementBatch[]) => void;
  onProfile: (profile: UserProfile) => void;
  onSyncStatus?: (status: 'connecting' | 'connected' | 'error') => void;
}

let isInitialized = false;

export async function setupCloudRealtimeSync(callbacks: CloudSyncCallbacks): Promise<() => void> {
  callbacks.onSyncStatus?.('connecting');
  const ready = await initializeFirebase();
  if (!ready) {
    callbacks.onSyncStatus?.('error');
    console.warn('[CloudSync] Firebase init failed, running in local fallback');
    return () => {};
  }

  try {
    // 1. Safety check: Only seed once during first-ever workspace initialization, never overwrite
    if (!isInitialized) {
      isInitialized = true;
      const initDocSnap = await getDocs(collection(db, 'expenses'));
      // Only do anything if collections have never been setup and no expenses exist
      // Will not overwrite user-cleared or user-updated records
    }

    callbacks.onSyncStatus?.('connected');

    // 2. Setup real-time listeners for all collaborators
    const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snap) => {
      const items: ExpenseRecord[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data() as ExpenseRecord;
        if (data && data.id) {
          items.push(data);
        }
      });
      callbacks.onExpenses(sortExpensesByDateDesc(items));
    }, (err) => {
      console.warn('[CloudSync] Expenses listener error:', err);
    });

    const unsubOffsets = onSnapshot(collection(db, 'offsets'), (snap) => {
      const items: ReimbursementOffset[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data() as ReimbursementOffset;
        if (data && data.id) {
          items.push(data);
        }
      });
      const cleaned = filterOutUnwantedOffsets(items);
      callbacks.onOffsets(sortOffsetsByDateDesc(cleaned));
    }, (err) => {
      console.warn('[CloudSync] Offsets listener error:', err);
    });

    const unsubBatches = onSnapshot(collection(db, 'batches'), (snap) => {
      const items: ReimbursementBatch[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data() as ReimbursementBatch;
        if (data && data.id) {
          items.push(data);
        }
      });
      callbacks.onBatches(items);
    }, (err) => {
      console.warn('[CloudSync] Batches listener error:', err);
    });

    const unsubProfile = onSnapshot(doc(db, 'settings', 'profile'), (docSnap) => {
      if (docSnap.exists()) {
        callbacks.onProfile(docSnap.data() as UserProfile);
      }
    }, (err) => {
      console.warn('[CloudSync] Profile listener error:', err);
    });

    return () => {
      unsubExpenses();
      unsubOffsets();
      unsubBatches();
      unsubProfile();
    };
  } catch (error) {
    console.error('[CloudSync] Failed to setup realtime sync:', error);
    callbacks.onSyncStatus?.('error');
    return () => {};
  }
}

// Cloud Mutation Operations
export async function syncSaveExpense(expense: ExpenseRecord): Promise<void> {
  try {
    await setDoc(doc(db, 'expenses', expense.id), expense);
  } catch (err) {
    console.error('[CloudSync] saveExpense error:', err);
  }
}

export async function syncDeleteExpense(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'expenses', id));
  } catch (err) {
    console.error('[CloudSync] deleteExpense error:', err);
  }
}

export async function syncSaveOffset(offset: ReimbursementOffset): Promise<void> {
  try {
    await setDoc(doc(db, 'offsets', offset.id), offset);
  } catch (err) {
    console.error('[CloudSync] saveOffset error:', err);
  }
}

export async function syncDeleteOffset(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'offsets', id));
  } catch (err) {
    console.error('[CloudSync] deleteOffset error:', err);
  }
}

export async function syncSaveBatch(batchItem: ReimbursementBatch): Promise<void> {
  try {
    await setDoc(doc(db, 'batches', batchItem.id), batchItem);
  } catch (err) {
    console.error('[CloudSync] saveBatch error:', err);
  }
}

export async function syncDeleteBatch(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'batches', id));
  } catch (err) {
    console.error('[CloudSync] deleteBatch error:', err);
  }
}

export async function syncSaveProfile(profile: UserProfile): Promise<void> {
  try {
    await setDoc(doc(db, 'settings', 'profile'), profile);
  } catch (err) {
    console.error('[CloudSync] saveProfile error:', err);
  }
}
