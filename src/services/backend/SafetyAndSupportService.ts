/**
 * GoLife Taxi Pakistan - Safety, Support, Complaints & Verification Services
 *
 * Provides real-time synchronization for SOS emergencies, passenger/driver complaints,
 * support tickets, driver document verification, and fraud risk tracking with immutable chronological timelines.
 */

import { BaseService } from './BaseService';
import {
  SafetyIncident,
  SupportCase,
  SupportTicket,
  Complaint,
  VerificationItem,
  DriverDocument,
  Driver,
  RiskAlertRecord,
  SupportCasePriority
} from '../../types';
import { ServiceResponse, EntityFilter, PaginationOptions } from './types';
import { calculateDriverEligibility, DriverEligibilityResult } from '../driverVerificationService';

export class SafetyService extends BaseService {
  public async getIncidents(
    filters?: EntityFilter,
    pagination?: PaginationOptions
  ): Promise<SafetyIncident[]> {
    const res = await this.repository.list<SafetyIncident>('safetyIncidents', filters, pagination || { limit: 100 });
    return res.items;
  }

  /**
   * Trigger SOS Alert from Passenger or Driver mobile app
   * Propagates immediately to Admin Safety Center.
   */
  public async triggerSosAlert(payload: {
    reporterType: 'passenger' | 'driver';
    reporterId: string;
    reporterName: string;
    reporterPhone: string;
    rideId?: string;
    city: string;
    lat: number;
    lng: number;
    reason?: string;
  }): Promise<ServiceResponse<SafetyIncident>> {
    return this.executeIdempotent('TRIGGER_SOS', `${payload.reporterId}_${Date.now()}`, async () => {
      const incidentId = `sos-${Date.now()}`;
      const now = new Date().toISOString();

      const incident: SafetyIncident = {
        id: incidentId,
        incidentCode: `SOS-PK-${Date.now().toString().slice(-6)}`,
        rideId: payload.rideId || 'ride-unknown',
        rideCode: payload.rideId ? `RD-${payload.rideId.slice(-4)}` : 'N/A',
        driverId: payload.reporterType === 'driver' ? payload.reporterId : 'drv-unknown',
        driverName: payload.reporterType === 'driver' ? payload.reporterName : 'Driver',
        driverPhone: payload.reporterType === 'driver' ? payload.reporterPhone : '+92 300 0000000',
        vehiclePlate: 'ABC-123',
        passengerId: payload.reporterType === 'passenger' ? payload.reporterId : 'pass-unknown',
        reportedBy: payload.reporterType,
        reporterName: payload.reporterName,
        reporterPhone: payload.reporterPhone,
        type: 'sos_trigger',
        category: 'sos_trigger',
        priority: 'critical',
        severity: 'critical',
        status: 'active',
        triggeredAt: now,
        notes: payload.reason || 'SOS Emergency Button Activated from Mobile App',
        city: payload.city || 'Lahore',
        description: payload.reason || 'SOS Emergency Button Activated from Mobile App',
        location: {
          lat: payload.lat,
          lng: payload.lng,
          address: `${payload.city} GeoCoordinates (${payload.lat.toFixed(4)}, ${payload.lng.toFixed(4)})`,
          speedKmh: 0
        },
        timeline: [
          {
            id: `tl-${Date.now()}`,
            timestamp: now,
            actor: `${payload.reporterName} (${payload.reporterType})`,
            actorRole: payload.reporterType === 'driver' ? 'driver' : 'passenger',
            action: 'SOS Alert Triggered',
            notes: payload.reason || 'SOS Emergency Button Activated from Mobile App'
          }
        ]
      };

      await this.repository.create('safetyIncidents', incidentId, incident);
      return incident;
    });
  }

  public async assignIncident(
    incidentId: string,
    assignedAdmin: string,
    assignedTeam: string = 'Emergency Ops Command',
    notes?: string
  ): Promise<ServiceResponse<boolean>> {
    const now = new Date().toISOString();
    const updates: Partial<SafetyIncident> = {
      assignedAdmin,
      assignedTeam,
      status: 'under_investigation'
    };
    await this.repository.update('safetyIncidents', incidentId, updates);

    const timelineEvent = {
      id: `stl-${Date.now()}`,
      incidentId,
      adminId: assignedAdmin,
      status: 'assigned',
      notes: `Assigned case officer: ${assignedAdmin} (${assignedTeam}). ${notes || ''}`,
      timestamp: now,
      immutable: true
    };
    await this.repository.create('safetyEventTimeline', timelineEvent.id, timelineEvent);
    return this.formatResponse(true);
  }

  public async addInternalNote(
    incidentId: string,
    author: string,
    noteText: string
  ): Promise<ServiceResponse<boolean>> {
    const now = new Date().toISOString();
    const timelineEvent = {
      id: `stl-${Date.now()}`,
      incidentId,
      adminId: author,
      status: 'internal_note',
      notes: `[INTERNAL ONLY] ${author}: ${noteText}`,
      timestamp: now,
      immutable: true
    };
    await this.repository.create('safetyEventTimeline', timelineEvent.id, timelineEvent);
    return this.formatResponse(true);
  }

  public async updateIncidentStatus(
    incidentId: string,
    status: 'active' | 'under_investigation' | 'resolved' | 'false_alarm' | 'escalated' | 'closed',
    resolutionNotes?: string,
    adminId?: string
  ): Promise<ServiceResponse<boolean>> {
    return this.executeIdempotent('SAFETY_INCIDENT_STATUS', incidentId, async () => {
      const now = new Date().toISOString();
      const updates: Partial<SafetyIncident> = {
        status: status === 'escalated' ? 'escalated' : status === 'closed' ? 'resolved' : status,
        resolvedAt: status === 'resolved' || status === 'closed' ? now : undefined
      };
      if (resolutionNotes) {
        updates.notes = resolutionNotes;
      }

      await this.repository.update('safetyIncidents', incidentId, updates);

      const timelineEvent = {
        id: `stl-${Date.now()}`,
        incidentId,
        adminId: adminId || 'Admin',
        status,
        notes: resolutionNotes || `Status updated to ${status}`,
        timestamp: now,
        immutable: true
      };
      await this.repository.create('safetyEventTimeline', timelineEvent.id, timelineEvent);
      return true;
    });
  }

  public async escalateIncident(
    incidentId: string,
    notes: string,
    escalateTo: string = 'Punjab Safe City / Senior Ops',
    adminId?: string
  ): Promise<ServiceResponse<boolean>> {
    const now = new Date().toISOString();
    await this.repository.update('safetyIncidents', incidentId, {
      status: 'escalated',
      priority: 'critical',
      notes: `ESCALATED TO ${escalateTo}: ${notes}`
    });

    const timelineEvent = {
      id: `stl-${Date.now()}`,
      incidentId,
      adminId: adminId || 'Admin',
      status: 'escalated',
      notes: `Escalated to ${escalateTo}: ${notes}`,
      timestamp: now,
      immutable: true
    };
    await this.repository.create('safetyEventTimeline', timelineEvent.id, timelineEvent);
    return this.formatResponse(true);
  }

  public async resolveIncident(
    incidentId: string,
    notes: string,
    resolutionType: string = 'Standard Protocol Completion',
    adminId?: string
  ): Promise<ServiceResponse<boolean>> {
    const now = new Date().toISOString();
    await this.repository.update('safetyIncidents', incidentId, {
      status: 'resolved',
      resolvedAt: now,
      notes: `RESOLVED (${resolutionType}): ${notes}`
    });

    const timelineEvent = {
      id: `stl-${Date.now()}`,
      incidentId,
      adminId: adminId || 'Admin',
      status: 'resolved',
      notes: `Resolution (${resolutionType}): ${notes}`,
      timestamp: now,
      immutable: true
    };
    await this.repository.create('safetyEventTimeline', timelineEvent.id, timelineEvent);
    return this.formatResponse(true);
  }

  public async closeIncident(
    incidentId: string,
    notes: string,
    adminId?: string
  ): Promise<ServiceResponse<boolean>> {
    const now = new Date().toISOString();
    await this.repository.update('safetyIncidents', incidentId, {
      status: 'closed' as any,
      resolvedAt: now,
      notes: `CLOSED: ${notes}`
    });

    const timelineEvent = {
      id: `stl-${Date.now()}`,
      incidentId,
      adminId: adminId || 'Admin',
      status: 'closed',
      notes: `Case closed: ${notes}`,
      timestamp: now,
      immutable: true
    };
    await this.repository.create('safetyEventTimeline', timelineEvent.id, timelineEvent);
    return this.formatResponse(true);
  }
}

export class ComplaintService extends BaseService {
  public async getComplaints(
    filters?: EntityFilter,
    pagination?: PaginationOptions
  ): Promise<Complaint[]> {
    const res = await this.repository.list<Complaint>('complaints', filters, pagination || { limit: 100 });
    return res.items;
  }

  public async assignComplaint(
    complaintId: string,
    assignedTo: string,
    notes?: string
  ): Promise<ServiceResponse<boolean>> {
    const ok = await this.repository.update('complaints', complaintId, {
      assignedTo,
      status: 'investigating' as any,
      adminNotes: notes ? `Assigned to ${assignedTo}: ${notes}` : `Assigned to ${assignedTo}`
    });
    return this.formatResponse(ok);
  }

  public async resolveComplaint(
    complaintId: string,
    adminNotes: string,
    refundAmount?: number,
    resolvedBy?: string,
    actionTaken?: string
  ): Promise<ServiceResponse<boolean>> {
    const now = new Date().toISOString();
    const ok = await this.repository.update('complaints', complaintId, {
      status: 'resolved',
      adminNotes: `Resolution: ${adminNotes}${actionTaken ? ` [Action: ${actionTaken}]` : ''}`,
      resolvedAt: now,
      resolvedBy: resolvedBy || 'Admin',
      refundAmount: refundAmount || undefined
    });
    return this.formatResponse(ok);
  }

  public async addInternalNote(
    complaintId: string,
    author: string,
    note: string
  ): Promise<ServiceResponse<boolean>> {
    const existing = await this.repository.getById<Complaint>('complaints', complaintId);
    const existingNotes = existing?.caseNotes || [];
    const timestamp = new Date().toLocaleString() + ' PKT';
    const ok = await this.repository.update('complaints', complaintId, {
      caseNotes: [...existingNotes, { author, text: note, date: timestamp }]
    });
    return this.formatResponse(ok);
  }

  public async rejectComplaint(
    complaintId: string,
    reason: string,
    resolvedBy: string
  ): Promise<ServiceResponse<boolean>> {
    const now = new Date().toISOString();
    const ok = await this.repository.update('complaints', complaintId, {
      status: 'rejected',
      adminNotes: `Rejected: ${reason}`,
      resolvedAt: now,
      resolvedBy
    });
    return this.formatResponse(ok);
  }
}

export class SupportCaseService extends BaseService {
  public async getCases(
    filters?: EntityFilter,
    pagination?: PaginationOptions
  ): Promise<SupportCase[]> {
    const res = await this.repository.list<SupportCase>('supportCases', filters, pagination || { limit: 100 });
    return res.items;
  }

  public async assignCase(
    caseId: string,
    assignedAdmin: string,
    assignedTeam: string = 'support',
    note?: string
  ): Promise<ServiceResponse<boolean>> {
    const ok = await this.repository.update('supportCases', caseId, {
      assignedAdmin,
      assignedTeam,
      status: 'under_review',
      updatedAt: new Date().toISOString()
    });
    if (note) {
      await this.addCaseInternalNote(caseId, assignedAdmin, 'Admin', note);
    }
    return this.formatResponse(ok);
  }

  public async addCaseInternalNote(
    caseId: string,
    author: string,
    authorRole: string,
    noteText: string
  ): Promise<ServiceResponse<boolean>> {
    const noteDoc = {
      id: `cn-${Date.now()}`,
      caseId,
      author,
      authorRole,
      content: noteText,
      createdAt: new Date().toISOString(),
      isInternalOnly: true,
      immutable: true
    };
    const ok = await this.repository.create('caseNotes', noteDoc.id, noteDoc);
    return this.formatResponse(ok);
  }

  public async resolveCase(
    caseId: string,
    outcome: string,
    note: string,
    resolvedBy: string,
    financialActionTaken: boolean = false
  ): Promise<ServiceResponse<boolean>> {
    const now = new Date().toISOString();
    const ok = await this.repository.update('supportCases', caseId, {
      status: 'resolved',
      resolvedAt: now,
      updatedAt: now,
      resolution: {
        outcome,
        note,
        resolvedBy,
        resolvedAt: now,
        financialActionTaken
      }
    });
    return this.formatResponse(ok);
  }

  public async closeCase(
    caseId: string,
    note: string,
    closedBy: string
  ): Promise<ServiceResponse<boolean>> {
    const now = new Date().toISOString();
    const ok = await this.repository.update('supportCases', caseId, {
      status: 'closed',
      closedAt: now,
      updatedAt: now
    });
    return this.formatResponse(ok);
  }

  public async reopenCase(
    caseId: string,
    reason: string,
    reopenedBy: string
  ): Promise<ServiceResponse<boolean>> {
    const now = new Date().toISOString();
    const ok = await this.repository.update('supportCases', caseId, {
      status: 'open',
      updatedAt: now
    });
    await this.addCaseInternalNote(caseId, reopenedBy, 'Admin', `Case reopened: ${reason}`);
    return this.formatResponse(ok);
  }
}

export class SupportTicketService extends BaseService {
  public async getTickets(
    filters?: EntityFilter,
    pagination?: PaginationOptions
  ): Promise<SupportTicket[]> {
    const res = await this.repository.list<SupportTicket>('supportCases', filters, pagination || { limit: 100 });
    return res.items;
  }

  public async createTicket(payload: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'replies'>): Promise<ServiceResponse<SupportTicket>> {
    const now = new Date().toISOString();
    const ticketId = `tkt-${Date.now()}`;
    const newTicket: SupportTicket = {
      ...payload,
      id: ticketId,
      createdAt: now,
      updatedAt: now,
      replies: []
    };
    await this.repository.create('supportCases', ticketId, newTicket);
    return this.formatResponse(newTicket);
  }

  public async assignTicket(ticketId: string, adminName: string): Promise<ServiceResponse<boolean>> {
    const ok = await this.repository.update('supportCases', ticketId, {
      assignedAdmin: adminName,
      status: 'in_progress',
      updatedAt: new Date().toISOString()
    });
    return this.formatResponse(ok);
  }

  public async updateTicketStatus(
    ticketId: string,
    status: SupportTicket['status'] | 'new' | 'waiting_for_user' | 'waiting_for_internal_action',
    resolvedBy?: string
  ): Promise<ServiceResponse<boolean>> {
    const now = new Date().toISOString();
    const ok = await this.repository.update('supportCases', ticketId, {
      status: status as any,
      updatedAt: now,
      resolvedAt: status === 'resolved' || status === 'closed' ? now : undefined,
      resolvedBy: status === 'resolved' || status === 'closed' ? resolvedBy : undefined
    });
    return this.formatResponse(ok);
  }

  public async addTicketReply(
    ticketId: string,
    sender: 'user' | 'admin',
    senderName: string,
    message: string,
    isInternal: boolean = false,
    attachments?: string[]
  ): Promise<ServiceResponse<boolean>> {
    const reply = {
      id: `rep-${Date.now()}`,
      sender,
      senderName,
      message,
      timestamp: new Date().toISOString(),
      isInternal,
      attachments: attachments || [],
      deliveryStatus: 'delivered' as const
    };
    const ok = await this.repository.create('caseMessages', reply.id, { ticketId, ...reply });
    return this.formatResponse(ok);
  }
}

export class DriverVerificationBackendService extends BaseService {
  public async getVerificationQueue(
    filters?: EntityFilter,
    pagination?: PaginationOptions
  ): Promise<VerificationItem[]> {
    const res = await this.repository.list<VerificationItem>('driverVerifications', filters, pagination || { limit: 100 });
    return res.items;
  }

  public validateEligibility(driver: Driver, documents: DriverDocument[], category?: string): DriverEligibilityResult {
    return calculateDriverEligibility(driver, documents, category as any);
  }

  public async approveVerification(
    verId: string,
    adminName: string,
    notes?: string
  ): Promise<ServiceResponse<{ approved: boolean; eligibility: DriverEligibilityResult }>> {
    const ver = await this.repository.getById<VerificationItem>('driverVerifications', verId);
    if (!ver) {
      return { success: false, error: 'Verification item not found', source: 'demo_repository' };
    }

    const driver = await this.repository.getById<Driver>('drivers', ver.driverId);
    const updatedDocs = ver.documents.map((d) => ({ ...d, verified: true, status: 'verified' as const }));

    const dummyDriver: Driver = driver || ({
      id: ver.driverId,
      name: ver.driverName,
      documents: updatedDocs,
      vehicle: { category: ver.category }
    } as any);

    const eligibility = this.validateEligibility(dummyDriver, updatedDocs, ver.category);
    const now = new Date().toISOString();

    const isFullyEligible = eligibility.eligibleToDrive;
    const finalVerStatus = isFullyEligible ? 'approved' : 'resubmission_required';
    const finalAccountStatus = isFullyEligible ? 'active' : 'suspended';
    const finalRideStatus = isFullyEligible ? 'online' : 'offline';

    await this.repository.update('driverVerifications', verId, {
      status: finalVerStatus,
      reviewedBy: adminName,
      reviewedAt: now,
      notes: notes || (isFullyEligible ? 'Verified compliance' : eligibility.restrictionReasons.join(', '))
    });

    if (driver) {
      await this.repository.update('drivers', driver.id, {
        verificationStatus: isFullyEligible ? 'verified' : 'rejected',
        accountStatus: finalAccountStatus,
        status: finalRideStatus,
        documents: updatedDocs
      });
    }

    return {
      success: true,
      data: { approved: isFullyEligible, eligibility },
      source: 'demo_repository'
    };
  }

  public async rejectVerification(
    verId: string,
    reason: string,
    adminName: string
  ): Promise<ServiceResponse<boolean>> {
    const ver = await this.repository.getById<VerificationItem>('driverVerifications', verId);
    if (!ver) {
      return { success: false, error: 'Verification item not found', source: 'demo_repository' };
    }

    const now = new Date().toISOString();
    await this.repository.update('driverVerifications', verId, {
      status: 'rejected',
      rejectionReason: reason,
      reviewedBy: adminName,
      reviewedAt: now
    });

    await this.repository.update('drivers', ver.driverId, {
      verificationStatus: 'rejected',
      rejectionReason: reason,
      accountStatus: 'suspended',
      status: 'offline'
    });

    return this.formatResponse(true);
  }

  public async requestResubmission(
    verId: string,
    reason: string,
    adminName: string,
    category?: string
  ): Promise<ServiceResponse<boolean>> {
    const ver = await this.repository.getById<VerificationItem>('driverVerifications', verId);
    if (!ver) {
      return { success: false, error: 'Verification item not found', source: 'demo_repository' };
    }

    const now = new Date().toISOString();
    await this.repository.update('driverVerifications', verId, {
      status: 'resubmission_required',
      reviewStatus: 'resubmission_required',
      rejectionReason: reason,
      reviewedBy: adminName,
      reviewedAt: now,
      notes: reason
    });

    await this.repository.update('drivers', ver.driverId, {
      verificationStatus: 'pending',
      accountStatus: 'suspended',
      status: 'offline'
    });

    return this.formatResponse(true);
  }

  public async updateDocumentStatus(
    driverId: string,
    docIdentifier: number | string,
    status: 'verified' | 'invalid' | 'rejected',
    notes?: string,
    adminName?: string
  ): Promise<ServiceResponse<boolean>> {
    const driver = await this.repository.getById<Driver>('drivers', driverId);
    if (!driver) {
      return { success: false, error: 'Driver not found', source: 'demo_repository' };
    }

    const docs = [...(driver.documents || [])];
    const docIndex = typeof docIdentifier === 'number'
      ? docIdentifier
      : docs.findIndex((d) => d.type === docIdentifier);

    if (docIndex >= 0 && docIndex < docs.length) {
      docs[docIndex] = {
        ...docs[docIndex],
        status,
        verified: status === 'verified',
        notes: notes || docs[docIndex].notes
      };
      await this.repository.update('drivers', driverId, { documents: docs });
    }

    return this.formatResponse(true);
  }

  public async updateReviewStatus(
    verId: string,
    reviewStatus: string,
    reason?: string,
    notes?: string,
    adminName?: string
  ): Promise<ServiceResponse<boolean>> {
    const now = new Date().toISOString();
    const updates: Partial<VerificationItem> = {
      reviewStatus: reviewStatus as any,
      reviewedAt: now,
      reviewedBy: adminName || 'Admin'
    };
    if (reason) updates.rejectionReason = reason;
    if (notes) updates.adminNotes = notes;

    const ok = await this.repository.update('driverVerifications', verId, updates);
    return this.formatResponse(ok);
  }
}

export class RiskService extends BaseService {
  public async getAlerts(): Promise<RiskAlertRecord[]> {
    const res = await this.repository.list<RiskAlertRecord>('fraudRiskAlerts', undefined, { limit: 100 });
    return res.items;
  }

  public async updateAlertStatus(
    alertId: string,
    status: 'investigating' | 'resolved' | 'dismissed',
    notes?: string
  ): Promise<ServiceResponse<boolean>> {
    const ok = await this.repository.update('fraudRiskAlerts', alertId, {
      status,
      resolutionNotes: notes || '',
      updatedAt: new Date().toISOString()
    });
    return this.formatResponse(ok);
  }
}

export const safetyService = new SafetyService();
export const complaintService = new ComplaintService();
export const supportCaseService = new SupportCaseService();
export const supportTicketService = new SupportTicketService();
export const driverVerificationBackendService = new DriverVerificationBackendService();
export const riskService = new RiskService();
