/**
 * GoLife Taxi Pakistan - Demo Repository
 *
 * Implements the exact IRepository interface for safe, offline, zero-setup testing.
 * Operates with rich Pakistan-based fleet data (PKR / Rs, +92 numbers, Lahore/Karachi/Islamabad).
 * Persists modifications cleanly to localStorage so demo interactions remain between reloads,
 * but are 100% isolated from production Firebase.
 */

import {
  INITIAL_PASSENGERS,
  INITIAL_DRIVERS,
  INITIAL_RIDES,
  INITIAL_FARE_CONFIGS,
  INITIAL_CITIES,
  INITIAL_PROMOS,
  INITIAL_PAYOUTS,
  INITIAL_COMPLAINTS,
  INITIAL_SAFETY_INCIDENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS,
  INITIAL_ADMINS,
  INITIAL_VERIFICATIONS,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REFERRALS,
  INITIAL_SUPPORT_TICKETS
} from '../mockData';
import {
  INITIAL_COMPANY_PAYMENT_ACCOUNTS,
  INITIAL_TOPUP_REQUESTS,
  INITIAL_PAYMENT_TRANSACTIONS,
  INITIAL_ADVANCE_BOOKINGS,
  INITIAL_PAYMENT_PROVIDERS,
  INITIAL_WEBHOOK_LOGS,
  INITIAL_PAYMENT_RECONCILIATION_ITEMS,
  createInitialDriverWallets
} from '../centralPaymentService';
import {
  INITIAL_COMMISSION_RULES,
  INITIAL_DRIVER_OVERRIDES,
  INITIAL_CASH_RECONCILIATIONS,
  INITIAL_ADVANCE_RECONCILIATIONS
} from '../commissionService';
import { FirestoreCollectionKey } from '../firebase/collections';
import { EntityFilter, PaginatedResult, PaginationOptions, IRepository } from './types';
import { isProductionDataSource, ProductionSafetyLockError } from '../../config/dataSourceMode';

const STORAGE_PREFIX = 'GOLIFE_DEMO_STORE_';

export class DemoRepository implements IRepository {
  private inMemoryStore: Map<string, any[]> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private assertDemoModeAllowed(opName: string): void {
    if (isProductionDataSource()) {
      throw new ProductionSafetyLockError(
        `Production Safety Lock: DemoRepository.${opName} was called while DATA_SOURCE=PRODUCTION. Demo fallback is strictly prohibited in Production mode.`,
        'DEMO_CALLED_IN_PRODUCTION'
      );
    }
  }

  private tagWithDemo(item: any): any {
    if (!item || typeof item !== 'object') return item;
    return {
      ...item,
      isDemo: true,
      _isDemo: true,
      dataSource: 'demo'
    };
  }

  private loadStoredCollection(key: string, defaults: any[]): any[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item) => this.tagWithDemo(item));
          }
        }
      }
    } catch {
      // Return defaults on error
    }
    return defaults.map((item) => this.tagWithDemo(item));
  }

  private persistCollection(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = this.inMemoryStore.get(key);
        if (data) {
          window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(data));
        }
      }
    } catch (e) {
      console.warn(`Failed to persist demo collection ${key}:`, e);
    }
  }

  private seedDefaults() {
    this.inMemoryStore.set('passengers', this.loadStoredCollection('passengers', INITIAL_PASSENGERS));
    this.inMemoryStore.set('drivers', this.loadStoredCollection('drivers', INITIAL_DRIVERS));
    this.inMemoryStore.set('rides', this.loadStoredCollection('rides', INITIAL_RIDES));
    this.inMemoryStore.set('cities', this.loadStoredCollection('cities', INITIAL_CITIES));
    this.inMemoryStore.set('promoCodes', this.loadStoredCollection('promoCodes', INITIAL_PROMOS));
    this.inMemoryStore.set('payouts', this.loadStoredCollection('payouts', INITIAL_PAYOUTS));
    this.inMemoryStore.set('complaints', this.loadStoredCollection('complaints', INITIAL_COMPLAINTS));
    this.inMemoryStore.set('safetyIncidents', this.loadStoredCollection('safetyIncidents', INITIAL_SAFETY_INCIDENTS));
    this.inMemoryStore.set('auditLogs', this.loadStoredCollection('auditLogs', INITIAL_AUDIT_LOGS));
    this.inMemoryStore.set('adminUsers', this.loadStoredCollection('adminUsers', INITIAL_ADMINS));
    this.inMemoryStore.set('driverVerifications', this.loadStoredCollection('driverVerifications', INITIAL_VERIFICATIONS));
    this.inMemoryStore.set('walletTransactions', this.loadStoredCollection('walletTransactions', INITIAL_TRANSACTIONS));
    this.inMemoryStore.set('notifications', this.loadStoredCollection('notifications', INITIAL_NOTIFICATIONS));
    this.inMemoryStore.set('referrals', this.loadStoredCollection('referrals', INITIAL_REFERRALS));
    this.inMemoryStore.set('supportCases', this.loadStoredCollection('supportCases', INITIAL_SUPPORT_TICKETS));
    this.inMemoryStore.set('centralPricingRules', this.loadStoredCollection('centralPricingRules', INITIAL_FARE_CONFIGS));
    this.inMemoryStore.set('systemSettings', this.loadStoredCollection('systemSettings', [INITIAL_SETTINGS]));
    this.inMemoryStore.set('driverFines', this.loadStoredCollection('driverFines', []));
    this.inMemoryStore.set('passengerRefunds', this.loadStoredCollection('passengerRefunds', []));
    this.inMemoryStore.set('driverReimbursements', this.loadStoredCollection('driverReimbursements', []));
    this.inMemoryStore.set('payoutTransactions', this.loadStoredCollection('payoutTransactions', []));
    this.inMemoryStore.set('riskAlerts', this.loadStoredCollection('riskAlerts', []));
    this.inMemoryStore.set('rideLocations', this.loadStoredCollection('rideLocations', []));
    this.inMemoryStore.set('rideEvents', this.loadStoredCollection('rideEvents', []));
    this.inMemoryStore.set('driverStatuses', this.loadStoredCollection('driverStatuses', []));
    this.inMemoryStore.set('passengerStatuses', this.loadStoredCollection('passengerStatuses', []));
    this.inMemoryStore.set('driverLocations', this.loadStoredCollection('driverLocations', []));
    this.inMemoryStore.set('locationEvents', this.loadStoredCollection('locationEvents', []));
    this.inMemoryStore.set('locationHistory', this.loadStoredCollection('locationHistory', []));
    this.inMemoryStore.set('routeSnapshots', this.loadStoredCollection('routeSnapshots', []));
    this.inMemoryStore.set('etaUpdates', this.loadStoredCollection('etaUpdates', []));
    this.inMemoryStore.set('geofenceEvents', this.loadStoredCollection('geofenceEvents', []));
    this.inMemoryStore.set('driverWallets', this.loadStoredCollection('driverWallets', createInitialDriverWallets(INITIAL_DRIVERS)));
    this.inMemoryStore.set('topUpRequests', this.loadStoredCollection('topUpRequests', INITIAL_TOPUP_REQUESTS));
    this.inMemoryStore.set('paymentTransactions', this.loadStoredCollection('paymentTransactions', INITIAL_PAYMENT_TRANSACTIONS));
    this.inMemoryStore.set('companyPaymentAccounts', this.loadStoredCollection('companyPaymentAccounts', INITIAL_COMPANY_PAYMENT_ACCOUNTS));
    this.inMemoryStore.set('advanceBookingHolds', this.loadStoredCollection('advanceBookingHolds', INITIAL_ADVANCE_BOOKINGS));
    this.inMemoryStore.set('paymentProviderConfigs', this.loadStoredCollection('paymentProviderConfigs', INITIAL_PAYMENT_PROVIDERS));
    this.inMemoryStore.set('paymentWebhooks', this.loadStoredCollection('paymentWebhooks', INITIAL_WEBHOOK_LOGS));
    this.inMemoryStore.set('paymentReconciliation', this.loadStoredCollection('paymentReconciliation', INITIAL_PAYMENT_RECONCILIATION_ITEMS));
    this.inMemoryStore.set('commissionRules', this.loadStoredCollection('commissionRules', INITIAL_COMMISSION_RULES));
    this.inMemoryStore.set('driverCommissions', this.loadStoredCollection('driverCommissions', INITIAL_DRIVER_OVERRIDES));
    this.inMemoryStore.set('cashRideReconciliation', this.loadStoredCollection('cashRideReconciliation', INITIAL_CASH_RECONCILIATIONS));
    this.inMemoryStore.set('advancePaymentReconciliation', this.loadStoredCollection('advancePaymentReconciliation', INITIAL_ADVANCE_RECONCILIATIONS));
  }

  public resetToDefaults(): void {
    try {
      for (const key of Array.from(this.inMemoryStore.keys())) {
        localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
      }
      this.seedDefaults();
    } catch (e) {
      console.warn('Error resetting demo repository:', e);
    }
  }

  public async getById<T>(collectionKey: FirestoreCollectionKey, id: string): Promise<T | null> {
    this.assertDemoModeAllowed('getById');
    const list = this.inMemoryStore.get(collectionKey) || [];
    const item = list.find((i: any) => i.id === id);
    return item ? (JSON.parse(JSON.stringify(item)) as T) : null;
  }

  public async list<T>(
    collectionKey: FirestoreCollectionKey,
    filters?: EntityFilter,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<T>> {
    this.assertDemoModeAllowed('list');
    let list = [...(this.inMemoryStore.get(collectionKey) || [])];

    if (filters?.city && filters.city !== 'All') {
      list = list.filter((item: any) => item.city === filters.city || item.cityName === filters.city);
    }
    if (filters?.status && filters.status !== 'all') {
      list = list.filter((item: any) => item.status === filters.status);
    }
    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      list = list.filter((item: any) =>
        JSON.stringify(item).toLowerCase().includes(q)
      );
    }

    const pageLimit = pagination?.limit || 50;
    const items = list.slice(0, pageLimit);

    return {
      items: JSON.parse(JSON.stringify(items)),
      total: list.length,
      hasMore: list.length > pageLimit
    };
  }

  public async create<T extends Record<string, any>>(
    collectionKey: FirestoreCollectionKey,
    id: string,
    data: T
  ): Promise<boolean> {
    this.assertDemoModeAllowed('create');
    const list = this.inMemoryStore.get(collectionKey) || [];
    const existingIndex = list.findIndex((i: any) => i.id === id);
    const itemToSave = this.tagWithDemo({ ...data, id });

    if (existingIndex >= 0) {
      list[existingIndex] = itemToSave;
    } else {
      list.unshift(itemToSave);
    }
    this.inMemoryStore.set(collectionKey, list);
    this.persistCollection(collectionKey);
    return true;
  }

  public async update(
    collectionKey: FirestoreCollectionKey,
    id: string,
    updates: Record<string, any>
  ): Promise<boolean> {
    this.assertDemoModeAllowed('update');
    const list = this.inMemoryStore.get(collectionKey) || [];
    const index = list.findIndex((i: any) => i.id === id);
    if (index >= 0) {
      list[index] = this.tagWithDemo({ ...list[index], ...updates });
      this.inMemoryStore.set(collectionKey, list);
      this.persistCollection(collectionKey);
      return true;
    }
    return false;
  }

  public async delete(collectionKey: FirestoreCollectionKey, id: string): Promise<boolean> {
    this.assertDemoModeAllowed('delete');
    const list = this.inMemoryStore.get(collectionKey) || [];
    const filtered = list.filter((i: any) => i.id !== id);
    this.inMemoryStore.set(collectionKey, filtered);
    this.persistCollection(collectionKey);
    return true;
  }

  public subscribe<T>(
    collectionKey: FirestoreCollectionKey,
    onData: (data: T[]) => void,
    _onError?: (err: Error) => void,
    _constraints?: any[]
  ): () => void {
    this.assertDemoModeAllowed('subscribe');
    const list = this.inMemoryStore.get(collectionKey) || [];
    // Safe async trigger without polling
    setTimeout(() => {
      onData(JSON.parse(JSON.stringify(list)));
    }, 0);
    return () => {};
  }
}

export const demoRepository = new DemoRepository();
