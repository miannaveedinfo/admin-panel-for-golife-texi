/**
 * GoLife Taxi Pakistan - Firebase Configuration Adapter
 * Provides backend-ready connectivity for the GoLife Mobile & Admin ecosystem.
 * 
 * Strict separation:
 * - DEMO: In-memory & local simulation with zero credentials.
 * - PRODUCTION: Real Firestore & Auth. NEVER silently falls back to Demo data.
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { classifyError } from '../errorHandler';
import {
  isProductionDataSource,
  isDemoDataSource,
  validateProductionConfig,
  setCentralDataSourceMode,
  getCentralDataSourceMode,
  DataSourceMode as CentralDataSourceMode
} from '../../config/dataSourceMode';

export type DataSourceMode = 'demo' | 'production';

export interface FirebaseClientConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

export interface ConfigChecklistItem {
  key: string;
  label: string;
  required: boolean;
  isSet: boolean;
  description: string;
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
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Standardized Firestore error handler adhering to platform specifications.
 * Throws a formatted JSON error message with comprehensive security rule debugging context.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  classifyError(error);

  const { auth } = getFirebaseInstance();
  const currentUser = auth?.currentUser;

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid || null,
      email: currentUser?.email || null,
      emailVerified: currentUser?.emailVerified || null,
      isAnonymous: currentUser?.isAnonymous || null,
      tenantId: currentUser?.tenantId || null,
      providerInfo: currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Safely inspect environment variables without throwing errors or requiring user input
export const getEnvFirebaseConfig = (): FirebaseClientConfig => {
  try {
    const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
    return {
      apiKey: env.VITE_FIREBASE_API_KEY || '',
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: env.VITE_FIREBASE_APP_ID || '',
      measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || ''
    };
  } catch {
    return {};
  }
};

export const getFirebaseConfigChecklist = (): ConfigChecklistItem[] => {
  return validateProductionConfig().checklist;
};

export function isFirebaseConfigured(): boolean {
  return validateProductionConfig().isValid;
}

let cachedApp: FirebaseApp | null = null;
let cachedDb: Firestore | null = null;
let cachedAuth: Auth | null = null;
let cachedStorage: FirebaseStorage | null = null;

export const getStoredDataSourceMode = (): DataSourceMode => {
  return isProductionDataSource() ? 'production' : 'demo';
};

export const setStoredDataSourceMode = (mode: DataSourceMode) => {
  setCentralDataSourceMode(mode === 'production' ? 'PRODUCTION' : 'DEMO');
};

export interface FirebaseInstanceResult {
  app: FirebaseApp | null;
  db: Firestore | null;
  auth: Auth | null;
  storage: FirebaseStorage | null;
  isDemo: boolean;
  isConfigured: boolean;
  mode: DataSourceMode;
  modeLabel: string;
  projectId: string;
  configError?: string;
}

/**
 * Returns the active Firebase instance or demo descriptor.
 * CRITICAL RULE: When in PRODUCTION mode, this NEVER silently falls back to Demo!
 */
export const getFirebaseInstance = (): FirebaseInstanceResult => {
  const isDemo = isDemoDataSource();

  if (isDemo) {
    return {
      app: null,
      db: null,
      auth: null,
      storage: null,
      isDemo: true,
      isConfigured: false,
      mode: 'demo',
      modeLabel: 'DEMO MODE (Mock Data)',
      projectId: 'Demo Sandbox'
    };
  }

  // PRODUCTION MODE: Real Firebase
  const validation = validateProductionConfig();

  if (!validation.isValid) {
    return {
      app: null,
      db: null,
      auth: null,
      storage: null,
      isDemo: false, // NOT DEMO! Production is requested, but configuration is missing.
      isConfigured: false,
      mode: 'production',
      modeLabel: 'PRODUCTION MODE (Configuration Incomplete)',
      projectId: validation.projectId || 'Unconfigured',
      configError: `Production Firebase configuration missing: ${validation.missingKeys.join(', ')}`
    };
  }

  try {
    if (!cachedApp) {
      const config = getEnvFirebaseConfig();
      cachedApp = getApps().length === 0 ? initializeApp(config) : getApps()[0];
      cachedDb = getFirestore(cachedApp);
      cachedAuth = getAuth(cachedApp);
      try {
        cachedStorage = getStorage(cachedApp);
      } catch {
        cachedStorage = null;
      }
    }
    return {
      app: cachedApp,
      db: cachedDb,
      auth: cachedAuth,
      storage: cachedStorage,
      isDemo: false,
      isConfigured: true,
      mode: 'production',
      modeLabel: 'PRODUCTION MODE (Live Firestore & Mobile App)',
      projectId: validation.projectId
    };
  } catch (err: any) {
    console.error('Firebase initialization error in Production Mode:', err);
    return {
      app: null,
      db: null,
      auth: null,
      storage: null,
      isDemo: false, // DO NOT silently fall back to demo!
      isConfigured: false,
      mode: 'production',
      modeLabel: 'PRODUCTION MODE (Initialization Error)',
      projectId: validation.projectId,
      configError: err?.message || 'Failed to initialize Firebase SDK'
    };
  }
};

/**
 * Validate live connection to Firestore
 */
export async function testFirestoreConnection(): Promise<{ success: boolean; latencyMs: number; message: string }> {
  const instance = getFirebaseInstance();

  if (instance.isDemo) {
    return {
      success: true,
      latencyMs: 10,
      message: 'Demo mode active. Operating safely with simulated fleet dataset.'
    };
  }

  if (!instance.isConfigured || !instance.db) {
    return {
      success: false,
      latencyMs: 0,
      message: instance.configError || 'Cannot test connection: Firebase configuration is missing.'
    };
  }

  const start = performance.now();
  try {
    await getDocFromServer(doc(instance.db, 'systemSettings', 'connection_test'));
    const latencyMs = Math.round(performance.now() - start);
    return {
      success: true,
      latencyMs,
      message: `Connected successfully to live Firestore project '${instance.projectId}' (${latencyMs}ms ping).`
    };
  } catch (error: any) {
    const latencyMs = Math.round(performance.now() - start);
    if (error?.message?.includes('the client is offline')) {
      return {
        success: false,
        latencyMs,
        message: 'Client appears offline or network is unreachable. Please check connection.'
      };
    }
    if (error?.code === 'permission-denied') {
      return {
        success: true, // DB is reachable, security rules evaluated properly
        latencyMs,
        message: `Firestore project '${instance.projectId}' reachable. Security rules active.`
      };
    }
    return {
      success: false,
      latencyMs,
      message: error?.message || 'Unable to connect to Firestore.'
    };
  }
}
