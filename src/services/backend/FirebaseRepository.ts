/**
 * GoLife Taxi Pakistan - Firebase Firestore Repository
 *
 * Implements direct reads, writes, transactions, and real-time streams to Firebase Cloud Firestore.
 * Handles Firestore security rule errors with handleFirestoreError conforming to specification.
 * Enforces Production Safety Locks:
 * - Rejects demo data writes to Firestore.
 * - Prohibits direct Firestore mutations while running in Demo Mode.
 * - Never returns fake/mock demo arrays when in Production Mode.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  Unsubscribe,
  QueryConstraint,
  serverTimestamp
} from 'firebase/firestore';
import { FIRESTORE_COLLECTIONS, FirestoreCollectionKey } from '../firebase/collections';
import {
  getFirebaseInstance,
  handleFirestoreError,
  OperationType
} from '../firebase/firebaseConfig';
import { isQuotaExceeded } from '../errorHandler';
import {
  isDemoDataSource,
  isProductionDataSource,
  validateProductionConfig,
  assertProductionSafetyLock,
  ProductionSafetyLockError
} from '../../config/dataSourceMode';
import { EntityFilter, PaginatedResult, PaginationOptions, IRepository } from './types';

export class FirebaseRepository implements IRepository {
  /**
   * Fetch a single document by ID
   */
  public async getById<T>(collectionKey: FirestoreCollectionKey, id: string): Promise<T | null> {
    if (isQuotaExceeded()) return null;
    const { db, isDemo } = getFirebaseInstance();
    if (isDemo || !db) return null;

    const colName = FIRESTORE_COLLECTIONS[collectionKey];
    try {
      const docRef = doc(db, colName, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return null;
      }
      return { id: docSnap.id, ...(docSnap.data() as any), isDemo: false, dataSource: 'production' } as T;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${colName}/${id}`);
    }
  }

  /**
   * Fetch documents with query constraints, filtering, and pagination limits
   * NEVER returns mock demo data. If Firestore is empty, returns empty list [].
   */
  public async list<T>(
    collectionKey: FirestoreCollectionKey,
    filters?: EntityFilter,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<T>> {
    if (isQuotaExceeded()) {
      return { items: [], total: 0, hasMore: false };
    }
    const { db, isDemo } = getFirebaseInstance();
    if (isDemo || !db) {
      // In Production mode without connected DB, return clean empty list. NEVER fallback to demo records!
      return { items: [], total: 0, hasMore: false };
    }

    const colName = FIRESTORE_COLLECTIONS[collectionKey];
    const constraints: QueryConstraint[] = [];

    // Optional filters
    if (filters?.city && filters.city !== 'All') {
      constraints.push(where('city', '==', filters.city));
    }
    if (filters?.status && filters.status !== 'all') {
      constraints.push(where('status', '==', filters.status));
    }
    if (filters?.category && filters.category !== 'all') {
      constraints.push(where('category', '==', filters.category));
    }

    // Sort and limit
    const pageLimit = pagination?.limit || 50;
    constraints.push(limit(pageLimit));

    try {
      const q = query(collection(db, colName), ...constraints);
      const querySnapshot = await getDocs(q);
      const items: T[] = [];
      querySnapshot.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as any), isDemo: false, dataSource: 'production' } as T);
      });

      return {
        items,
        total: items.length,
        hasMore: items.length >= pageLimit
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, colName);
    }
  }

  /**
   * Create or overwrite a document
   * Production Safety Lock prevents Demo records from writing to production Firestore.
   */
  public async create<T extends Record<string, any>>(
    collectionKey: FirestoreCollectionKey,
    id: string,
    data: T
  ): Promise<boolean> {
    // Safety lock: demo mode must not write to Firestore
    if (isDemoDataSource()) {
      throw new ProductionSafetyLockError(
        'Production Safety Lock: Direct Firebase Firestore writes are disabled in Demo Mode.',
        'DEMO_WRITE_TO_PROD_BLOCKED'
      );
    }

    // Safety lock: demo records must not be written to production
    if (data && (data.isDemo === true || data._isDemo === true)) {
      throw new ProductionSafetyLockError(
        `Production Safety Lock: Refusing to persist Demo record (${id}) to production Firestore.`,
        'DEMO_RECORD_IN_PRODUCTION'
      );
    }

    const { db } = getFirebaseInstance();
    if (!db) {
      throw new ProductionSafetyLockError(
        'Production Safety Lock: Cannot persist to Firestore. Firebase configuration is incomplete.',
        'PRODUCTION_CONFIG_MISSING'
      );
    }

    const colName = FIRESTORE_COLLECTIONS[collectionKey];
    try {
      const docRef = doc(db, colName, id);
      await setDoc(docRef, {
        ...data,
        isDemo: false,
        dataSource: 'production',
        createdAt: data.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${colName}/${id}`);
    }
  }

  /**
   * Update partial fields of a document
   */
  public async update(
    collectionKey: FirestoreCollectionKey,
    id: string,
    updates: Record<string, any>
  ): Promise<boolean> {
    if (isDemoDataSource()) {
      throw new ProductionSafetyLockError(
        'Production Safety Lock: Direct Firebase Firestore writes are disabled in Demo Mode.',
        'DEMO_WRITE_TO_PROD_BLOCKED'
      );
    }

    const { db } = getFirebaseInstance();
    if (!db) {
      throw new ProductionSafetyLockError(
        'Production Safety Lock: Cannot update Firestore. Firebase configuration is incomplete.',
        'PRODUCTION_CONFIG_MISSING'
      );
    }

    const colName = FIRESTORE_COLLECTIONS[collectionKey];
    try {
      const docRef = doc(db, colName, id);
      try {
        await updateDoc(docRef, {
          ...updates,
          isDemo: false,
          dataSource: 'production',
          updatedAt: serverTimestamp()
        });
      } catch (innerErr: any) {
        if (innerErr?.code === 'not-found' || String(innerErr?.message || '').includes('No document to update')) {
          await setDoc(docRef, {
            ...updates,
            id,
            isDemo: false,
            dataSource: 'production',
            updatedAt: serverTimestamp()
          }, { merge: true });
        } else {
          throw innerErr;
        }
      }
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${colName}/${id}`);
    }
  }

  /**
   * Delete a document
   */
  public async delete(collectionKey: FirestoreCollectionKey, id: string): Promise<boolean> {
    if (isDemoDataSource()) {
      throw new ProductionSafetyLockError(
        'Production Safety Lock: Direct Firebase Firestore deletes are disabled in Demo Mode.',
        'DEMO_WRITE_TO_PROD_BLOCKED'
      );
    }

    const { db } = getFirebaseInstance();
    if (!db) {
      throw new ProductionSafetyLockError(
        'Production Safety Lock: Cannot delete from Firestore. Firebase configuration is incomplete.',
        'PRODUCTION_CONFIG_MISSING'
      );
    }

    const colName = FIRESTORE_COLLECTIONS[collectionKey];
    try {
      const docRef = doc(db, colName, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${colName}/${id}`);
    }
  }

  /**
   * Attach real-time snapshot listener
   */
  public subscribe<T>(
    collectionKey: FirestoreCollectionKey,
    onData: (items: T[]) => void,
    onError?: (err: Error) => void,
    constraints: QueryConstraint[] = [limit(50)]
  ): Unsubscribe {
    if (isQuotaExceeded()) {
      return () => {};
    }
    const { db, isDemo } = getFirebaseInstance();
    const colName = FIRESTORE_COLLECTIONS[collectionKey];

    if (isDemo || !db) {
      // Return dummy unsubscription if db is not connected
      return () => {};
    }

    const q = query(collection(db, colName), ...constraints);

    return onSnapshot(
      q,
      (snapshot) => {
        const items: T[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...(d.data() as any), isDemo: false, dataSource: 'production' } as T);
        });
        onData(items);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, colName);
        } catch (err: any) {
          if (onError) onError(err);
        }
      }
    );
  }
}

export const firebaseRepository = new FirebaseRepository();
