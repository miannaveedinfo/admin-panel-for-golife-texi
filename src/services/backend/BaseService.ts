/**
 * GoLife Taxi Pakistan - Base Service Layer
 *
 * Automatically routes calls to either DemoRepository or FirebaseRepository
 * based on the central DataSourceMode, enforces Production Safety Locks,
 * and provides audit logging & idempotency protection.
 */

import { getFirebaseInstance, DataSourceMode } from '../firebase/firebaseConfig';
import {
  isDemoDataSource,
  isProductionDataSource,
  validateProductionConfig,
  assertProductionSafetyLock,
  ProductionSafetyLockError
} from '../../config/dataSourceMode';
import { firebaseRepository } from './FirebaseRepository';
import { demoRepository } from './DemoRepository';
import { idempotencyService } from './IdempotencyService';
import { FirestoreCollectionKey } from '../firebase/collections';
import { EntityFilter, PaginatedResult, PaginationOptions, ServiceResponse, IRepository } from './types';

export abstract class BaseService {
  protected get activeMode(): DataSourceMode {
    return isProductionDataSource() ? 'production' : 'demo';
  }

  protected get isDemo(): boolean {
    return isDemoDataSource();
  }

  /**
   * Safe repository accessor:
   * - In DEMO mode: returns demoRepository (100% isolated).
   * - In PRODUCTION mode: returns firebaseRepository. If production configuration is missing,
   *   throws a ProductionSafetyLockError rather than falling back to demo data.
   */
  protected get repository(): IRepository {
    if (this.isDemo) {
      return demoRepository;
    }

    const validation = validateProductionConfig();
    if (!validation.isValid) {
      throw new ProductionSafetyLockError(
        `Production Safety Lock: Backend configuration is missing: ${validation.missingKeys.join(', ')}. Demo fallback is prohibited in Production Mode.`,
        'PRODUCTION_CONFIG_MISSING'
      );
    }

    return firebaseRepository;
  }

  /**
   * Helper to format unified service response
   */
  protected formatResponse<T>(data?: T, error?: string, idempotencyKey?: string): ServiceResponse<T> {
    return {
      success: !error,
      data,
      error,
      source: this.isDemo ? 'demo_repository' : 'firestore_repository',
      idempotencyKey
    };
  }

  /**
   * Protected execution for sensitive financial or operational actions
   */
  protected async executeIdempotent<T>(
    actionType: string,
    targetId: string,
    action: () => Promise<T>
  ): Promise<ServiceResponse<T>> {
    const actionKey = idempotencyService.generateActionKey(actionType, targetId);
    const result = await idempotencyService.executeProtectedAction(
      actionType,
      targetId,
      action,
      actionKey
    );

    if (!result.success) {
      return this.formatResponse<T>(undefined, result.error, actionKey);
    }
    return this.formatResponse<T>(result.result, undefined, actionKey);
  }
}
