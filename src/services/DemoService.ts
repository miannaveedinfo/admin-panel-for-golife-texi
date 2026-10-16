/**
 * GoLife Taxi Pakistan - Demo Service Adapter
 * 
 * Provides centralized management of the demo data store, ensuring:
 * - 100% offline-ready operations with zero required credentials.
 * - Realistic Pakistani mock datasets (PKR / Rs, +92 numbers, Lahore/Karachi/Islamabad/Rawalpindi).
 * - Safe persistence to localStorage for demo persistence across page refreshes.
 * - Clean one-click reset mechanism for demonstrations and testing.
 */

import { demoRepository } from './backend/DemoRepository';
import { FirestoreCollectionKey } from './firebase/collections';
import { getFirebaseInstance } from './firebase/firebaseConfig';

export class DemoService {
  /**
   * Check if running in demo mode
   */
  public static isDemoMode(): boolean {
    return getFirebaseInstance().isDemo;
  }

  /**
   * Reset all demo collections to clean baseline state
   */
  public static resetDemoDatabase(): void {
    demoRepository.resetToDefaults();
  }

  /**
   * Retrieve records for a specific collection key
   */
  public static async getCollection<T>(collectionKey: FirestoreCollectionKey): Promise<T[]> {
    const res = await demoRepository.list<T>(collectionKey, undefined, { limit: 500 });
    return res.items;
  }

  /**
   * Create or update record in demo repository
   */
  public static async saveRecord<T extends { id: string }>(
    collectionKey: FirestoreCollectionKey,
    record: T
  ): Promise<void> {
    const existing = await demoRepository.getById<T>(collectionKey, record.id);
    if (existing) {
      await demoRepository.update(collectionKey, record.id, record);
    } else {
      await demoRepository.create(collectionKey, record.id, record);
    }
  }

  /**
   * Get demo operational metrics
   */
  public static getDemoSummary(): {
    currency: string;
    operatingCities: string[];
    paymentMethods: string[];
    isIsolated: boolean;
  } {
    return {
      currency: 'PKR (Rs)',
      operatingCities: ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar'],
      paymentMethods: ['Cash (Normal Rides)', 'Easypaisa (Top-Up / Advance)', 'JazzCash (Top-Up / Advance)'],
      isIsolated: true
    };
  }
}

export default DemoService;
