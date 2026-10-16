/**
 * GoLife Taxi Pakistan - Service Layer & Repository Contract Types
 */

import {
  Passenger,
  Driver,
  Ride,
  WalletTransaction,
  CentralPricingRule,
  CityConfig,
  ServiceCategoryConfig,
  DriverFine,
  PassengerRefundRecord,
  DriverReimbursementRecord,
  DriverPayoutRecord,
  SupportCase,
  SafetyIncident,
  RiskAlertRecord,
  PromoCode,
  AuditLog,
  AdminUser,
  AppSettings
} from '../../types';
import { FirestoreCollectionKey } from '../firebase/collections';

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  lastDocId?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  lastDocId?: string;
}

export interface EntityFilter {
  city?: string;
  status?: string;
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  source: 'demo_repository' | 'firestore_repository';
  idempotencyKey?: string;
}

export interface IRepository {
  getById<T>(collectionKey: FirestoreCollectionKey, id: string): Promise<T | null>;
  list<T>(
    collectionKey: FirestoreCollectionKey,
    filters?: EntityFilter,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<T>>;
  create<T extends Record<string, any>>(
    collectionKey: FirestoreCollectionKey,
    id: string,
    data: T
  ): Promise<boolean>;
  update(
    collectionKey: FirestoreCollectionKey,
    id: string,
    updates: Record<string, any>
  ): Promise<boolean>;
  delete(collectionKey: FirestoreCollectionKey, id: string): Promise<boolean>;
  subscribe<T>(
    collectionKey: FirestoreCollectionKey,
    onData: (data: T[]) => void,
    onError?: (err: Error) => void,
    constraints?: any[]
  ): () => void;
}
