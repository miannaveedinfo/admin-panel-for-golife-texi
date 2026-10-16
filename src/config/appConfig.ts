/**
 * GoLife Taxi Pakistan - Central Application Configuration (appConfig)
 * 
 * Single source of truth for runtime execution:
 * - mode: 'demo' | 'production'
 * - dataSource: 'demo' | 'firebase'
 * - payment: 'demo' | 'real'
 * - maps: 'demo' | 'real'
 * - notifications: 'demo' | 'real'
 * 
 * Strictly defaults to DEMO for all layers when external credentials/configurations are unavailable.
 * Never blocks startup, never prompts for missing secret values, and operates 100% self-contained.
 */

import {
  DataSourceMode,
  getCentralDataSourceMode,
  setCentralDataSourceMode,
  isProductionDataSource,
  isDemoDataSource,
  validateProductionConfig,
  getSafeEnv
} from './dataSourceMode';

export type AppRuntimeMode = 'demo' | 'production';
export type AppDataSource = 'demo' | 'firebase';
export type AppPaymentMode = 'demo' | 'real' | 'unconfigured';
export type AppMapsMode = 'demo' | 'real' | 'unconfigured';
export type AppNotificationsMode = 'demo' | 'real' | 'unconfigured';

export interface AppConfig {
  mode: AppRuntimeMode;
  dataSource: AppDataSource;
  centralMode: DataSourceMode;
  payment: AppPaymentMode;
  maps: AppMapsMode;
  notifications: AppNotificationsMode;
  isDemo: boolean;
  statusLabel: string;
  statusSecondaryText: string;
  projectId: string;
}

export const STORAGE_DATA_SOURCE_KEY = 'GOLIFE_CENTRAL_DATA_SOURCE';

/**
 * Safely inspect client environment variables without throwing errors or requiring user input.
 * All variables are completely optional with safe mock fallbacks.
 */
export function getSafeEnvironment(): Record<string, string | undefined> {
  return getSafeEnv();
}

/**
 * Check if valid Firebase configuration is present
 */
export function isFirebaseConfigAvailable(): boolean {
  return validateProductionConfig().isValid;
}

/**
 * Check if real Payment credentials (Easypaisa/JazzCash/Merchant) are configured
 */
export function isPaymentConfigAvailable(): boolean {
  try {
    const env = getSafeEnvironment();
    const merchantId = env.VITE_EASYPAISA_STORE_ID || env.VITE_JAZZCASH_MERCHANT_ID;
    return Boolean(merchantId && typeof merchantId === 'string' && merchantId.trim().length > 3);
  } catch {
    return false;
  }
}

/**
 * Check if Google Maps API key is configured
 */
export function isMapsConfigAvailable(): boolean {
  try {
    const env = getSafeEnvironment();
    const mapsKey = env.VITE_GOOGLE_MAPS_API_KEY;
    return Boolean(mapsKey && typeof mapsKey === 'string' && mapsKey.trim().length > 15);
  } catch {
    return false;
  }
}

/**
 * Check if real push notification service (FCM / OneSignal) is configured
 */
export function isNotificationsConfigAvailable(): boolean {
  try {
    const env = getSafeEnvironment();
    const fcmKey = env.VITE_FCM_SERVER_KEY || env.VITE_ONESIGNAL_APP_ID;
    return Boolean(fcmKey && typeof fcmKey === 'string' && fcmKey.trim().length > 10);
  } catch {
    return false;
  }
}

/**
 * Central configuration getter. Evaluates and returns the active runtime configuration.
 * Directly reads central DataSourceMode ('DEMO' | 'PRODUCTION').
 */
export function getAppConfig(): AppConfig {
  const centralMode = getCentralDataSourceMode();
  const validation = validateProductionConfig();
  const isDemo = centralMode === 'DEMO';
  const mode: AppRuntimeMode = isDemo ? 'demo' : 'production';
  const dataSource: AppDataSource = isDemo ? 'demo' : 'firebase';

  const paymentAvailable = isPaymentConfigAvailable();
  const mapsAvailable = isMapsConfigAvailable();
  const notificationsAvailable = isNotificationsConfigAvailable();

  const payment: AppPaymentMode = isDemo ? 'demo' : (paymentAvailable ? 'real' : 'unconfigured');
  const maps: AppMapsMode = isDemo ? 'demo' : (mapsAvailable ? 'real' : 'unconfigured');
  const notifications: AppNotificationsMode = isDemo ? 'demo' : (notificationsAvailable ? 'real' : 'unconfigured');

  const projectId = !isDemo && validation.projectId
    ? validation.projectId
    : isDemo
    ? 'Demo Sandbox'
    : 'Config Missing';

  let statusLabel = 'DEMO MODE';
  let statusSecondaryText = 'Safe mock datasets • Zero credentials required';
  if (!isDemo) {
    if (validation.isValid) {
      statusLabel = 'PRODUCTION MODE';
      statusSecondaryText = `Connected to live Firestore (${validation.projectId})`;
    } else {
      statusLabel = 'PRODUCTION MODE (Config Missing)';
      statusSecondaryText = `Missing: ${validation.missingKeys.join(', ')}`;
    }
  }

  return {
    mode,
    dataSource,
    centralMode,
    payment,
    maps,
    notifications,
    isDemo,
    statusLabel,
    statusSecondaryText,
    projectId
  };
}

/**
 * Update the user's preferred data source (stored in localStorage)
 */
export function setDataSourcePreference(source: AppDataSource | DataSourceMode): void {
  const targetMode: DataSourceMode = source === 'firebase' || source === 'PRODUCTION' ? 'PRODUCTION' : 'DEMO';
  setCentralDataSourceMode(targetMode);
}

/**
 * Export default appConfig instance
 */
export const appConfig = getAppConfig();
export default appConfig;

