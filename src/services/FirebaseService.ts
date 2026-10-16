/**
 * GoLife Taxi Pakistan - Firebase Service Adapter
 * Clean facade for Firebase services (Firestore, Auth, Storage).
 * 
 * Guarantees zero blocking / zero crashing:
 * - If Firebase environment variables are missing, automatically operates in Demo Mode.
 * - Never prompts user for secrets on application startup.
 * - Never passes undefined or placeholder secrets to the Firebase SDK.
 */

import { getFirebaseInstance, isFirebaseConfigured, testFirestoreConnection } from './firebase/firebaseConfig';
import { getActiveDataSource, setActiveDataSource, getDataSourceConfig } from './backend/dataSourceConfig';
import { FIRESTORE_COLLECTIONS, FirestoreCollectionKey } from './firebase/collections';

export class FirebaseService {
  /**
   * Check if Firebase is legitimately configured and active
   */
  public static isConnected(): boolean {
    const config = getDataSourceConfig();
    return !config.isDemo && config.isFirebaseReady;
  }

  /**
   * Get clean human-readable connection status
   */
  public static getStatusDescription(): {
    mode: 'demo' | 'firebase';
    label: string;
    isDemo: boolean;
    projectId: string;
    statusText: string;
  } {
    const config = getDataSourceConfig();
    if (config.isDemo || !config.isFirebaseReady) {
      return {
        mode: 'demo',
        label: 'Demo Mode',
        isDemo: true,
        projectId: 'Demo Sandbox',
        statusText: 'Demo Mode — Backend connection not enabled'
      };
    }
    return {
      mode: 'firebase',
      label: 'Firebase Live',
      isDemo: false,
      projectId: config.projectId,
      statusText: `Connected to live Firestore (${config.projectId})`
    };
  }

  /**
   * Safe ping check
   */
  public static async checkHealth(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    return testFirestoreConnection();
  }

  /**
   * Safe switch between Demo and Firebase
   */
  public static switchMode(mode: 'demo' | 'firebase'): boolean {
    if (mode === 'firebase' && !isFirebaseConfigured()) {
      return false;
    }
    setActiveDataSource(mode);
    return true;
  }
}

export default FirebaseService;
