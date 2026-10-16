/**
 * GoLife Taxi Pakistan - System, Audit, Storage & FCM Messaging Services
 *
 * Provides:
 * 1. AuditService: Append-only immutable administrative audit trail
 * 2. StorageService: Structured paths for driver KYC documents and case evidence with tokenized paths
 * 3. FcmMessagingService: Predictable push payload builders for Passenger & Driver apps
 * 4. SettingsService: Global platform configuration & business rules
 * 5. NotificationService: In-app notification dispatcher
 */

import { BaseService } from './BaseService';
import { AuditLog, AppSettings, AdminNotification } from '../../types';
import { ServiceResponse } from './types';
import { getFirebaseInstance } from '../firebase/firebaseConfig';
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage';

export interface FcmPayload {
  recipientId: string;
  recipientType: 'passenger' | 'driver' | 'admin' | 'topic';
  topic?: string;
  title: string;
  body: string;
  category: 'ride_offer' | 'verification' | 'payout' | 'emergency_sos' | 'announcement' | 'warning';
  data: Record<string, string>;
}

export class AuditService extends BaseService {
  /**
   * Append an immutable administrative audit log
   * Audit logs are strictly append-only; cannot be updated or deleted.
   */
  public async recordLog(
    adminEmail: string,
    adminRole: string,
    action: string,
    entity: string,
    reason: string,
    note?: string,
    targetType?: string,
    targetId?: string,
    changes?: { previous?: any; next?: any }
  ): Promise<ServiceResponse<boolean>> {
    const logId = `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const logEntry: AuditLog & { immutable: boolean; previousValue?: any; newValue?: any } = {
      id: logId,
      timestamp: now,
      adminEmail,
      adminRole: (adminRole as any) || 'Super Admin',
      action,
      entity,
      reason,
      details: note || `${action} on ${entity}`,
      note: note || '',
      ipAddress: typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost'
        ? `${window.location.hostname} (Client Console)`
        : 'Admin Client Console',
      targetType: (targetType as any) || 'system',
      targetId: targetId || '',
      previousValue: changes?.previous || null,
      newValue: changes?.next || null,
      immutable: true
    };

    // Always append
    const ok = await this.repository.create('auditLogs', logId, logEntry);
    return this.formatResponse(ok);
  }

  public async getLogs(): Promise<AuditLog[]> {
    const res = await this.repository.list<AuditLog>('auditLogs', undefined, { limit: 150 });
    return res.items;
  }
}

export class StorageService extends BaseService {
  /**
   * Generates canonical cloud storage path for documents
   */
  public getStoragePath(
    type: 'driver_doc' | 'vehicle_doc' | 'safety_evidence' | 'complaint_evidence',
    entityId: string,
    fileName: string
  ): string {
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    switch (type) {
      case 'driver_doc':
        return `driver-documents/${entityId}/${sanitizedFileName}`;
      case 'vehicle_doc':
        return `vehicle-documents/${entityId}/${sanitizedFileName}`;
      case 'safety_evidence':
        return `safety-evidence/${entityId}/${Date.now()}_${sanitizedFileName}`;
      case 'complaint_evidence':
        return `case-evidence/${entityId}/${Date.now()}_${sanitizedFileName}`;
    }
  }

  /**
   * Upload file to Firebase Storage (with graceful mock in demo mode, strict failure in production)
   */
  public async uploadFile(
    path: string,
    fileBlob: Blob | File
  ): Promise<ServiceResponse<{ downloadUrl: string; storagePath: string }>> {
    const { app, storage: fbStorage, isDemo } = getFirebaseInstance();

    if (isDemo) {
      // Return safe demo mock URI in Demo mode
      return this.formatResponse({
        downloadUrl: `https://storage.googleapis.com/golife-taxi-pk.appspot.com/${path}?mock=true`,
        storagePath: path
      });
    }

    // Production Mode: Strict isolation, NEVER fall back to mock URLs
    if (!app && !fbStorage) {
      return this.formatResponse(
        undefined,
        'Production Storage Error: Firebase Cloud Storage is not configured. Demo fallback is prohibited in Production mode.'
      );
    }

    try {
      const storage = fbStorage || getStorage(app!);
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, fileBlob);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return this.formatResponse({ downloadUrl, storagePath: path });
    } catch (err: any) {
      console.error('Storage upload error:', err);
      return this.formatResponse(undefined, err?.message || 'Storage upload failed');
    }
  }
}

export class FcmMessagingService extends BaseService {
  /**
   * Dispatch push notification via FCM architecture
   */
  public async dispatchPush(payload: FcmPayload): Promise<ServiceResponse<{ messageId: string }>> {
    const messageId = `fcm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    // 1. Record in notifications collection for in-app inbox
    const notificationItem: AdminNotification = {
      id: messageId,
      title: payload.title,
      message: payload.body,
      body: payload.body,
      target: payload.recipientType === 'driver' ? 'drivers' : payload.recipientType === 'passenger' ? 'passengers' : 'all',
      targetCity: 'all',
      sentAt: now,
      sentBy: 'System',
      reachCount: 1,
      status: 'sent',
      read: false,
      category: payload.category === 'emergency_sos' ? 'safety' : 'system'
    };
    await this.repository.create('notifications', messageId, notificationItem);

    // In production, server Cloud Function or FCM admin SDK transmits to device tokens
    return this.formatResponse({ messageId });
  }

  /**
   * Broadcast emergency alert to city drivers
   */
  public async broadcastEmergency(cityId: string, title: string, body: string) {
    return this.dispatchPush({
      recipientId: `all_drivers_${cityId}`,
      recipientType: 'topic',
      topic: `emergency_${cityId}`,
      title,
      body,
      category: 'emergency_sos',
      data: { cityId, urgent: 'true' }
    });
  }
}

export class SettingsService extends BaseService {
  public async getSettings(): Promise<AppSettings | null> {
    return this.repository.getById<AppSettings>('systemSettings', 'global_config');
  }

  public async updateSettings(updates: Partial<AppSettings>): Promise<ServiceResponse<boolean>> {
    const ok = await this.repository.create('systemSettings', 'global_config', updates);
    return this.formatResponse(ok);
  }
}

export const auditService = new AuditService();
export const storageService = new StorageService();
export const fcmService = new FcmMessagingService();
export const settingsService = new SettingsService();
export const notificationService = fcmService;
