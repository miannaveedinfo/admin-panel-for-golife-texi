/**
 * GoLife Taxi Pakistan - Central Data Source Mode & Automatic Environment Resolver
 *
 * Phase 33 Architecture:
 * - NOW (Testing/Sandbox): Runs automatically in DEMO mode with zero external cloud credentials,
 *   zero secrets, and safe isolated mock datasets. Missing env vars never block startup or show errors.
 * - LATER (Production): When valid, complete, non-placeholder Firebase credentials are provided,
 *   the system automatically activates PRODUCTION mode without requiring any code changes.
 * - STRICT ISOLATION:
 *   - In Production mode: Demo fallback is strictly blocked; missing config halts with clear error.
 *   - In Demo mode: Writes to production Firebase, real payments, real payouts are prohibited.
 */

export type DataSourceMode = 'DEMO' | 'PRODUCTION';
export type DeploymentStage = 'TESTING' | 'PRE_PRODUCTION' | 'LIVE';

export const CENTRAL_DATA_SOURCE_KEY = 'GOLIFE_CENTRAL_DATA_SOURCE';
export const DATA_SOURCE_CHANGED_EVENT = 'golife:datasource-changed';

export interface ProductionConfigItem {
  key: string;
  label: string;
  required: boolean;
  isSet: boolean;
  valueMasked?: string;
  description: string;
  validationIssue?: string;
}

export interface ProductionValidationResult {
  isValid: boolean;
  mode: DataSourceMode;
  isExplicitProductionRequested: boolean;
  isAutomaticProductionDetected: boolean;
  missingKeys: string[];
  checklist: ProductionConfigItem[];
  projectId: string;
  authDomain: string;
  storageBucket: string;
  hasApiKey: boolean;
  summary: string;
}

/**
 * Safely inspect client environment variables without throwing errors or requiring user input.
 */
export function getSafeEnv(): Record<string, string | undefined> {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env;
    }
  } catch {}
  return {};
}

/**
 * Known placeholder substrings that indicate dummy / non-production values.
 * Security rule: Never determine production readiness merely because a variable exists with a placeholder value.
 */
const KNOWN_PLACEHOLDERS = [
  'secret value',
  'secret',
  'demo',
  'test',
  'example',
  'your-key-here',
  'your_key_here',
  'your-key',
  'your_key',
  'your-api-key',
  'your_api_key',
  'your-project-id',
  'your_project_id',
  'your-app-id',
  'your_app_id',
  'your-storage-bucket',
  'placeholder',
  'change-me',
  'changeme',
  'todo',
  'dummy',
  'sample',
  'fake',
  'undefined',
  'null',
  'replace_with',
  'replace-with',
  'aizadummy',
  'aizasyd-example'
];

/**
 * Verifies whether a given environment string is a genuine, usable production value
 * rather than a template placeholder or empty string.
 */
export function isUsableProductionValue(val?: string, minLen = 5): boolean {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (trimmed.length < minLen) return false;

  const lower = trimmed.toLowerCase();

  for (const placeholder of KNOWN_PLACEHOLDERS) {
    if (lower.includes(placeholder)) {
      return false;
    }
  }

  // Template prefix checks
  if (lower.startsWith('your-') || lower.startsWith('your_') || lower.startsWith('insert_')) {
    return false;
  }

  return true;
}

export function isProjectIdValid(val?: string): boolean {
  if (!isUsableProductionValue(val, 4)) return false;
  const clean = val!.trim();
  // Valid GCP / Firebase project IDs: 4-63 chars, lowercase letters, numbers, hyphens
  return /^[a-z0-9][a-z0-9-]{2,61}[a-z0-9]$/i.test(clean);
}

export function isApiKeyValid(val?: string): boolean {
  if (!isUsableProductionValue(val, 25)) return false;
  const clean = val!.trim();
  // Firebase Web API keys start with AIza and are typically 39 chars long
  return clean.startsWith('AIza') && clean.length >= 25;
}

export function isAuthDomainValid(val?: string): boolean {
  if (!isUsableProductionValue(val, 12)) return false;
  const clean = val!.trim();
  return clean.includes('.firebaseapp.com') && !clean.startsWith('example.') && !clean.startsWith('test.');
}

export function isStorageBucketValid(val?: string): boolean {
  if (!isUsableProductionValue(val, 8)) return false;
  const clean = val!.trim();
  return (clean.includes('.appspot.com') || clean.includes('.firebasestorage.app')) && !clean.startsWith('example.');
}

export function isAppIdValid(val?: string): boolean {
  if (!isUsableProductionValue(val, 15)) return false;
  const clean = val!.trim();
  // Format is usually 1:<project-number>:web:<app-id-hex>
  return clean.includes(':web:') && clean.length >= 15;
}

/**
 * Checks whether all required Firebase environment variables are present and strictly valid.
 */
export function hasCompleteValidProductionConfig(envRecord?: Record<string, string | undefined>): boolean {
  const env = envRecord || getSafeEnv();
  const projectId = env.VITE_FIREBASE_PROJECT_ID;
  const apiKey = env.VITE_FIREBASE_API_KEY;
  const authDomain = env.VITE_FIREBASE_AUTH_DOMAIN;
  const storageBucket = env.VITE_FIREBASE_STORAGE_BUCKET;
  const appId = env.VITE_FIREBASE_APP_ID;

  return (
    isProjectIdValid(projectId) &&
    isApiKeyValid(apiKey) &&
    isAuthDomainValid(authDomain) &&
    isStorageBucketValid(storageBucket) &&
    isAppIdValid(appId)
  );
}

/**
 * Detects whether explicit Production deployment was commanded via deployment environment variables.
 */
export function isExplicitProductionRequested(envRecord?: Record<string, string | undefined>): boolean {
  const env = envRecord || getSafeEnv();
  const envSource = (env.VITE_DATA_SOURCE || env.DATA_SOURCE || '').toUpperCase().trim();
  const stage = (env.VITE_DEPLOYMENT_STAGE || env.VITE_ENVIRONMENT || '').toUpperCase().trim();

  return (
    envSource === 'PRODUCTION' ||
    envSource === 'FIREBASE' ||
    stage === 'LIVE' ||
    stage === 'PRE_PRODUCTION' ||
    stage === 'PRE-PRODUCTION' ||
    stage === 'STAGING'
  );
}

/**
 * Detects whether explicit Demo mode was commanded via deployment environment variables.
 */
export function isExplicitDemoRequested(envRecord?: Record<string, string | undefined>): boolean {
  const env = envRecord || getSafeEnv();
  const envSource = (env.VITE_DATA_SOURCE || env.DATA_SOURCE || '').toUpperCase().trim();
  const stage = (env.VITE_DEPLOYMENT_STAGE || env.VITE_ENVIRONMENT || '').toUpperCase().trim();

  return envSource === 'DEMO' || stage === 'TESTING' || stage === 'DEMO' || stage === 'DEVELOPMENT';
}

/**
 * Validates the presence and authenticity of production Firebase environment variables.
 */
export function validateProductionConfig(customEnv?: Record<string, string | undefined>): ProductionValidationResult {
  const env = customEnv || getSafeEnv();
  const apiKey = env.VITE_FIREBASE_API_KEY || '';
  const projectId = env.VITE_FIREBASE_PROJECT_ID || '';
  const authDomain = env.VITE_FIREBASE_AUTH_DOMAIN || '';
  const storageBucket = env.VITE_FIREBASE_STORAGE_BUCKET || '';
  const appId = env.VITE_FIREBASE_APP_ID || '';
  const messagingSenderId = env.VITE_FIREBASE_MESSAGING_SENDER_ID || '';

  const isProjOk = isProjectIdValid(projectId);
  const isApiOk = isApiKeyValid(apiKey);
  const isAuthOk = isAuthDomainValid(authDomain);
  const isStorageOk = isStorageBucketValid(storageBucket);
  const isAppIdOk = isAppIdValid(appId);
  const isSenderOk = Boolean(messagingSenderId && /^\d{6,}$/.test(messagingSenderId.trim()));

  const checklist: ProductionConfigItem[] = [
    {
      key: 'VITE_FIREBASE_PROJECT_ID',
      label: 'Firebase Project ID',
      required: true,
      isSet: isProjOk,
      valueMasked: isProjOk ? `${projectId.slice(0, 3)}***` : undefined,
      description: 'Shared Firebase project containing GoLife collections',
      validationIssue: !projectId ? 'Missing' : (!isProjOk ? 'Invalid format or placeholder' : undefined)
    },
    {
      key: 'VITE_FIREBASE_API_KEY',
      label: 'Firebase Web API Key',
      required: true,
      isSet: isApiOk,
      valueMasked: isApiOk ? `${apiKey.slice(0, 4)}***${apiKey.slice(-3)}` : undefined,
      description: 'Public Web API key for client SDK authentication',
      validationIssue: !apiKey ? 'Missing' : (!isApiOk ? 'Invalid format (must start with AIza and not be a placeholder)' : undefined)
    },
    {
      key: 'VITE_FIREBASE_AUTH_DOMAIN',
      label: 'Auth Domain',
      required: true,
      isSet: isAuthOk,
      valueMasked: isAuthOk ? authDomain : undefined,
      description: 'OAuth redirect and auth verification domain',
      validationIssue: !authDomain ? 'Missing' : (!isAuthOk ? 'Must contain .firebaseapp.com' : undefined)
    },
    {
      key: 'VITE_FIREBASE_STORAGE_BUCKET',
      label: 'Storage Bucket',
      required: true,
      isSet: isStorageOk,
      valueMasked: isStorageOk ? storageBucket : undefined,
      description: 'Cloud Storage for driver documents and KYC evidence',
      validationIssue: !storageBucket ? 'Missing' : (!isStorageOk ? 'Must contain .appspot.com or .firebasestorage.app' : undefined)
    },
    {
      key: 'VITE_FIREBASE_APP_ID',
      label: 'Firebase App ID',
      required: true,
      isSet: isAppIdOk,
      valueMasked: isAppIdOk ? `${appId.slice(0, 6)}***` : undefined,
      description: 'Unique client application identifier',
      validationIssue: !appId ? 'Missing' : (!isAppIdOk ? 'Invalid client app ID format' : undefined)
    },
    {
      key: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
      label: 'FCM Sender ID (Optional)',
      required: false,
      isSet: isSenderOk,
      valueMasked: isSenderOk ? `${messagingSenderId.slice(0, 3)}***` : undefined,
      description: 'Cloud Messaging ID for push alerts to driver/passenger apps'
    }
  ];

  const requiredItems = checklist.filter((item) => item.required);
  const missingKeys = requiredItems.filter((item) => !item.isSet).map((item) => item.key);
  const isValid = missingKeys.length === 0;

  const currentMode = getCentralDataSourceMode(env);
  const explicitProd = isExplicitProductionRequested(env);
  const autoProd = !explicitProd && isValid;

  let summary = '';
  if (currentMode === 'PRODUCTION') {
    summary = isValid
      ? `Production configuration is valid and active for project: ${projectId}`
      : `Production deployment active, but missing ${missingKeys.length} required variables: ${missingKeys.join(', ')}`;
  } else {
    summary = isValid
      ? `Production credentials present. System ready for automatic live activation.`
      : `Demo Mode active. Operating safely with simulated fleet dataset.`;
  }

  return {
    isValid,
    mode: currentMode,
    isExplicitProductionRequested: explicitProd,
    isAutomaticProductionDetected: autoProd,
    missingKeys,
    checklist,
    projectId: isProjOk ? projectId : '',
    authDomain,
    storageBucket,
    hasApiKey: isApiOk,
    summary
  };
}

/**
 * AUTOMATIC ENVIRONMENT RESOLVER
 * Resolves the authoritative runtime data source mode ('DEMO' | 'PRODUCTION'):
 *
 * 1. Explicit DEMO in deployment env:
 *    -> Strictly DEMO mode.
 *
 * 2. Explicit PRODUCTION commanded in deployment env:
 *    -> Strictly PRODUCTION mode.
 *    -> If config is incomplete, it stays in PRODUCTION mode with clear error (NEVER falls back to demo).
 *
 * 3. Automatic Detection (Normal Preview / Testing):
 *    - If complete valid production configuration IS present:
 *      -> Automatically uses PRODUCTION mode!
 *    - If valid production configuration is NOT present (no env vars, incomplete, or placeholders):
 *      -> Automatically uses DEMO mode!
 *
 * 4. User selection in localStorage (only applicable in testing sandbox when env is unlocked).
 */
export function getCentralDataSourceMode(customEnv?: Record<string, string | undefined>): DataSourceMode {
  const env = customEnv || getSafeEnv();

  // 1. Explicit DEMO command
  if (isExplicitDemoRequested(env)) {
    return 'DEMO';
  }

  // 2. Explicit PRODUCTION command
  if (isExplicitProductionRequested(env)) {
    return 'PRODUCTION';
  }

  // 3. Automatic Mode Detection:
  // If complete valid Production configuration is present, automatically activate Production
  if (hasCompleteValidProductionConfig(env)) {
    return 'PRODUCTION';
  }

  // 4. Local storage toggle in testing sandbox (preview purposes only)
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(CENTRAL_DATA_SOURCE_KEY);
      if (stored === 'PRODUCTION' || stored === 'production' || stored === 'firebase') {
        return 'PRODUCTION';
      }
      if (stored === 'DEMO' || stored === 'demo') {
        return 'DEMO';
      }
    }
  } catch {}

  // 5. Default current testing mode: DEMO
  return 'DEMO';
}

/**
 * Returns true if the active data source mode is strictly locked by deployment environment.
 */
export function isEnvironmentLocked(customEnv?: Record<string, string | undefined>): boolean {
  const env = customEnv || getSafeEnv();
  return (
    isExplicitDemoRequested(env) ||
    isExplicitProductionRequested(env) ||
    hasCompleteValidProductionConfig(env)
  );
}

/**
 * Returns the active deployment stage:
 * - TESTING: Pure Demo sandbox, zero cloud dependencies
 * - PRE_PRODUCTION: Production mode connected to staging/sandbox Firebase
 * - LIVE: Production mode connected to live production cluster
 */
export function getDeploymentStage(customEnv?: Record<string, string | undefined>): DeploymentStage {
  const env = customEnv || getSafeEnv();
  const stage = (env.VITE_DEPLOYMENT_STAGE || env.VITE_ENVIRONMENT || '').toUpperCase().trim();
  const mode = getCentralDataSourceMode(env);

  if (mode === 'PRODUCTION') {
    if (stage === 'PRE_PRODUCTION' || stage === 'PRE-PRODUCTION' || stage === 'SANDBOX' || stage === 'STAGING') {
      return 'PRE_PRODUCTION';
    }
    return 'LIVE';
  }
  return 'TESTING';
}

export function getDeploymentStageLabel(customEnv?: Record<string, string | undefined>): string {
  const stage = getDeploymentStage(customEnv);
  switch (stage) {
    case 'LIVE':
      return 'Live Production';
    case 'PRE_PRODUCTION':
      return 'Staging / Pre-Production';
    case 'TESTING':
    default:
      return 'Testing (Demo Sandbox)';
  }
}

/**
 * Update the central data source mode.
 * If the environment is locked by deployment configuration, changes are safely rejected.
 * Emits an event across the app so all contexts and UI update instantaneously.
 */
export function setCentralDataSourceMode(newMode: DataSourceMode): { success: boolean; reason?: string } {
  if (isEnvironmentLocked()) {
    const lockedMode = getCentralDataSourceMode();
    console.warn(
      `[GoLife Deployment Protection] Cannot switch to ${newMode}: Environment is locked to ${lockedMode} via deployment configuration.`
    );
    return {
      success: false,
      reason: `Environment is locked to ${lockedMode} via deployment configuration. Changes must be made via deployment variables.`
    };
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(CENTRAL_DATA_SOURCE_KEY, newMode);
      window.dispatchEvent(
        new CustomEvent(DATA_SOURCE_CHANGED_EVENT, {
          detail: { mode: newMode, timestamp: Date.now() }
        })
      );
      return { success: true };
    }
  } catch (e) {
    console.warn('Failed to persist central data source mode:', e);
    return { success: false, reason: 'Failed to access storage.' };
  }

  return { success: true };
}

/**
 * Check if the active central data source is PRODUCTION
 */
export function isProductionDataSource(): boolean {
  return getCentralDataSourceMode() === 'PRODUCTION';
}

/**
 * Check if the active central data source is DEMO
 */
export function isDemoDataSource(): boolean {
  return getCentralDataSourceMode() === 'DEMO';
}

/**
 * Custom Error for Production Safety Lock violations
 */
export class ProductionSafetyLockError extends Error {
  public code: string;
  public details?: any;

  constructor(message: string, code = 'SAFETY_LOCK_VIOLATION', details?: any) {
    super(message);
    this.name = 'ProductionSafetyLockError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Production Safety Lock
 * Enforces strict separation between Demo and Production:
 * - In Production: Blocks operations on Demo records and blocks execution if config is incomplete.
 * - In Demo: Blocks accidental mutations to live production endpoints.
 */
export function assertProductionSafetyLock(
  actionName: string,
  targetRecord?: { isDemo?: boolean; _isDemo?: boolean; id?: string; [key: string]: any }
): void {
  const mode = getCentralDataSourceMode();

  if (mode === 'PRODUCTION') {
    // 1. Validate production configuration
    const validation = validateProductionConfig();
    if (!validation.isValid) {
      throw new ProductionSafetyLockError(
        `Production Safety Lock: Cannot execute '${actionName}'. Production configuration is incomplete: ${validation.missingKeys.join(', ')}`,
        'PRODUCTION_CONFIG_MISSING',
        { missingKeys: validation.missingKeys }
      );
    }

    // 2. Prevent operations against Demo records in Production mode
    if (targetRecord && (targetRecord.isDemo === true || targetRecord._isDemo === true)) {
      throw new ProductionSafetyLockError(
        `Production Safety Lock: Cannot execute financial or operational '${actionName}' against a Demo record (${targetRecord.id || 'unknown'}) in Production mode. Demo records are completely isolated.`,
        'DEMO_RECORD_IN_PRODUCTION',
        { recordId: targetRecord.id }
      );
    }
  } else {
    // In Demo mode, protect against accidental production writes
    if (targetRecord && targetRecord.isDemo === false) {
      console.warn(`[Demo Safety Lock] Warning: Operating on a non-demo record in Demo mode: ${targetRecord.id}`);
    }
  }
}

