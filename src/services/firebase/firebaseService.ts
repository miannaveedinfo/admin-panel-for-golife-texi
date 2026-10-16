/**
 * GoLife Taxi Pakistan - Firebase Service & Repository Layer
 * Bridges Admin Panel state with Firestore collections or Local/Mock storage.
 * Designed for immediate production swap when the live Firebase project is connected.
 */

import { FIRESTORE_COLLECTIONS, FirestoreCollectionKey } from './collections';
import { getFirebaseInstance, isFirebaseConfigured } from './firebaseConfig';
import { firebaseRepository } from '../backend/FirebaseRepository';

export interface SyncStatus {
  connected: boolean;
  projectId: string;
  mode: 'demo_mock' | 'firestore_live';
  lastSyncedAt: string;
  collectionsReady: number;
}

export const getFirestoreSyncStatus = (): SyncStatus => {
  const configured = isFirebaseConfigured();
  const { projectId } = getFirebaseInstance();
  return {
    connected: configured,
    projectId: projectId || 'golife-taxi-pk',
    mode: configured ? 'firestore_live' : 'demo_mock',
    lastSyncedAt: new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Karachi' }) + ' PKT',
    collectionsReady: Object.keys(FIRESTORE_COLLECTIONS).length
  };
};

/**
 * Fetch documents from a Firestore collection, or return null if in demo mode
 */
export async function fetchFirestoreDocuments<T>(collectionKey: FirestoreCollectionKey): Promise<T[] | null> {
  const { isDemo } = getFirebaseInstance();
  if (isDemo) {
    return null;
  }

  try {
    const res = await firebaseRepository.list<T>(collectionKey, undefined, { limit: 200 });
    return res.items;
  } catch (error) {
    console.error(`Firestore read failed for collection ${collectionKey}:`, error);
    return null;
  }
}

/**
 * Persist document to Firestore (safely logged in demo mode)
 */
export async function saveFirestoreDocument<T extends Record<string, any>>(
  collectionKey: FirestoreCollectionKey,
  docId: string,
  data: T
): Promise<boolean> {
  const { isDemo } = getFirebaseInstance();
  if (isDemo) {
    return true;
  }

  return firebaseRepository.create(collectionKey, docId, data);
}

/**
 * Update document fields in Firestore
 */
export async function updateFirestoreDocument(
  collectionKey: FirestoreCollectionKey,
  docId: string,
  updates: Record<string, any>
): Promise<boolean> {
  const { isDemo } = getFirebaseInstance();
  if (isDemo) {
    return true;
  }

  return firebaseRepository.update(collectionKey, docId, updates);
}

/**
 * Delete document from Firestore
 */
export async function deleteFirestoreDocument(
  collectionKey: FirestoreCollectionKey,
  docId: string
): Promise<boolean> {
  const { isDemo } = getFirebaseInstance();
  if (isDemo) {
    return true;
  }

  return firebaseRepository.delete(collectionKey, docId);
}
