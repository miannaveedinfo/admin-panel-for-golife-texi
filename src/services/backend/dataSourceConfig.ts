/**
 * GoLife Taxi Pakistan - Central Data Source & Backend Architecture Configuration
 *
 * Current Phase: DEMO MODE (Active Default, Zero Secrets or Configuration Required)
 * Production Phase: PRODUCTION MODE (Activated seamlessly when real credentials provided)
 *
 * Architecture:
 * UI (Admin Views)
 *   ↓
 * Service Layer (DriverService, FinancialService, RideService, etc.)
 *   ↓
 * Repository Interface (IRepository)
 *  ↙                    ↘
 * DemoRepository      FirebaseRepository
 * (Local/Mock/State)  (Live Firestore Cloud)
 */

import {
  DataSourceMode,
  getCentralDataSourceMode,
  setCentralDataSourceMode,
  isProductionDataSource,
  isDemoDataSource,
  validateProductionConfig,
  assertProductionSafetyLock,
  ProductionSafetyLockError,
  isEnvironmentLocked,
  getDeploymentStage,
  getDeploymentStageLabel,
  DeploymentStage
} from '../../config/dataSourceMode';
import { getAppConfig, AppDataSource } from '../../config/appConfig';

export type AppMode = 'DEMO' | 'PRODUCTION';
export type DataSource = AppDataSource;
export type { DataSourceMode, DeploymentStage };

export interface DataSourceConfiguration {
  appMode: AppMode;
  dataSource: DataSource;
  centralMode: DataSourceMode;
  isDemo: boolean;
  isFirebaseReady: boolean;
  activeModeLabel: string;
  projectId: string;
}

export const DEFAULT_APP_MODE: AppMode = 'DEMO';
export const DEFAULT_DATA_SOURCE: DataSource = 'demo';

/**
 * Checks if real, non-placeholder Firebase configuration is present in environment
 */
export function isFirebaseConfigured(): boolean {
  return validateProductionConfig().isValid;
}

/**
 * Get the currently active Data Source mode ('demo' | 'firebase' for backward compatibility)
 */
export function getActiveDataSource(): DataSource {
  return isProductionDataSource() ? 'firebase' : 'demo';
}

/**
 * Set the currently active data source mode
 */
export function setActiveDataSource(mode: DataSource | DataSourceMode): void {
  const target: DataSourceMode = mode === 'firebase' || mode === 'PRODUCTION' ? 'PRODUCTION' : 'DEMO';
  setCentralDataSourceMode(target);
}

/**
 * Get full data source configuration
 */
export function getDataSourceConfig(): DataSourceConfiguration {
  const centralMode = getCentralDataSourceMode();
  const validation = validateProductionConfig();
  const isDemo = centralMode === 'DEMO';

  return {
    appMode: isDemo ? 'DEMO' : 'PRODUCTION',
    dataSource: isDemo ? 'demo' : 'firebase',
    centralMode,
    isDemo,
    isFirebaseReady: validation.isValid,
    activeModeLabel: isDemo ? 'DEMO MODE' : (validation.isValid ? 'PRODUCTION MODE' : 'PRODUCTION (CONFIG MISSING)'),
    projectId: validation.projectId || (isDemo ? 'Demo Sandbox' : 'Not Configured')
  };
}

export {
  getCentralDataSourceMode,
  setCentralDataSourceMode,
  isProductionDataSource,
  isDemoDataSource,
  validateProductionConfig,
  assertProductionSafetyLock,
  ProductionSafetyLockError,
  isEnvironmentLocked,
  getDeploymentStage,
  getDeploymentStageLabel
};
