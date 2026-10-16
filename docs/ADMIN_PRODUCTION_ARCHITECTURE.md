# GOlife Admin Control Panel — Production Architecture & Data Integration Blueprint
**Project:** GOlife Single Central Admin Control Panel  
**Target Backend:** Google Cloud / Firebase Firestore & Authentication  
**Ecosystem:** Shared Backend with GOlife Passenger Mobile App & GOlife Driver Mobile App  
**Document Version:** 1.0.0 (Phase 20 Production Foundation)

---

## 1. Architectural Overview & System Topology

The GOlife platform operates on a **Unified Single-Backend Architecture**. The Admin Control Panel, Passenger Mobile Application (React Native / Flutter / Android), and Driver Mobile Application all interact with the **exact same Firebase project, Firestore database instance, and Cloud Functions suite**.

```
                           ┌─────────────────────────────────────────┐
                           │       GOlife Single Central Admin       │
                           │              Control Panel              │
                           └────────────────────┬────────────────────┘
                                                │
                                    HTTPS / WebSockets / gRPC
                                                │
                                                ▼
┌──────────────────────┐           ┌─────────────────────────┐           ┌──────────────────────┐
│   GOlife Passenger   │◄─────────►│  Unified Cloud Backend  │◄─────────►│    GOlife Driver     │
│      Mobile App      │           │    (Firebase Cloud)     │           │      Mobile App      │
└──────────────────────┘           └────────────┬────────────┘           └──────────────────────┘
                                                │
                        ┌───────────────────────┼───────────────────────┐
                        ▼                       ▼                       ▼
             ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
             │   Cloud Firestore   │ │  Cloud Functions    │ │   Firebase Auth     │
             │  (Shared Database)  │ │ (Triggers & Fares)  │ │ (MFA & Claims RBAC) │
             └─────────────────────┘ └─────────────────────┘ └─────────────────────┘
```

### Core Architecture Principles:
1. **Single Source of Truth:** No separate databases for Admin vs. Mobile. If an admin suspends a driver in the Admin Panel, the driver's mobile app immediately disconnects and displays the suspension dossier in real time via Firestore `onSnapshot`.
2. **Deterministic Pricing Engine:** Fare calculations, waiting fees, night surcharges, and peak multipliers are calculated using identical algorithms (`calculateCentralFare`) across mobile booking flows and admin simulation centers.
3. **Idempotency & Double-Entry Ledger:** All financial mutations (driver earnings, passenger refunds, administrative fines, payout disbursements) produce immutable double-entry ledger entries in `/transactions` before updating mutable wallet balances.
4. **Dual-Mode Operation (Production / Demo):** The Admin Control Panel retains its zero-setup, self-contained Demo Mode with localStorage persistence, while seamlessly elevating to live Firestore production mode when verified cloud credentials are provided.

---

## 2. Unified Data Model & Schema Specifications

The table below defines the shared Firestore collections, their primary keys, read/write actors, and cross-application consumption:

```
Collections Hierarchy:
├── /adminUsers/{adminId}
├── /adminRoles/{roleId}
├── /passengers/{passengerId}
├── /drivers/{driverId}
│    └── /dailySummaries/{date} (subcollection)
├── /driverDocuments/{docId}
├── /rides/{rideId}
│    └── /events/{eventId} (subcollection)
├── /rideLocations/{rideId}
├── /payments/{paymentId}
├── /transactions/{transactionId} (immutable)
├── /payouts/{payoutId}
├── /driverFines/{fineId}
├── /refunds/{refundId}
├── /safetyIncidents/{incidentId}
├── /supportCases/{caseId}
├── /promoCodes/{codeId}
├── /cities/{cityId}
├── /systemSettings/{settingDoc}
└── /auditLogs/{logId} (immutable write-only)
```

### 2.1 Collection Schemas & Field Mappings

#### 1. Drivers Collection (`/drivers/{driverId}`)
*Shared between Driver Mobile App and Admin Panel*
```typescript
interface DriverDocument {
  id: string; // Auth UID
  fullName: string;
  phoneNumber: string; // "+923001234567"
  cnicNumber: string; // "35201-1234567-1"
  city: 'Lahore' | 'Karachi' | 'Islamabad' | 'Rawalpindi' | 'Peshawar' | 'Multan' | 'Faisalabad';
  vehicleCategory: 'bike' | 'rickshaw' | 'economy' | 'comfort' | 'executive' | 'freight_mini' | 'intercity';
  vehicleMake: string; // "Toyota"
  vehicleModel: string; // "Corolla"
  vehicleYear: number; // 2022
  vehicleColor: string; // "White"
  licensePlate: string; // "LEA-1234"
  status: 'offline' | 'online' | 'assigned' | 'on_trip' | 'suspended' | 'blocked';
  accountStatus: 'active' | 'suspended' | 'blocked' | 'pending_verification';
  verificationStatus: 'verified' | 'pending' | 'rejected';
  rideEligibility: boolean; // Admin master toggle
  isOnline: boolean;
  rating: number; // 1.0 - 5.0
  totalRides: number;
  acceptanceRate: number; // Percentage (0-100)
  cancellationRate: number; // Percentage (0-100)
  walletBalance: number; // Floating PKR
  currentLocation?: {
    latitude: number;
    longitude: number;
    heading: number;
    updatedAt: string; // ISO 8601
  };
  suspensionDossier?: {
    reason: string;
    suspendedAt: string;
    durationHours: number;
    expiresAt: string;
    adminEmail: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

#### 2. Passengers Collection (`/passengers/{passengerId}`)
*Shared between Passenger Mobile App and Admin Panel*
```typescript
interface PassengerDocument {
  id: string; // Auth UID
  fullName: string;
  phoneNumber: string; // "+923211234567"
  email?: string;
  city: string;
  status: 'active' | 'suspended' | 'blocked';
  rating: number;
  totalRides: number;
  walletBalance: number; // PKR
  preferredPaymentMethod: 'cash' | 'wallet' | 'easypaisa' | 'jazzcash' | 'credit_card';
  createdAt: string;
  updatedAt: string;
}
```

#### 3. Rides Collection (`/rides/{rideId}`)
*Shared between Passenger App, Driver App, and Admin Panel*
```typescript
interface RideDocument {
  id: string; // "RIDE-20260920-001"
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleCategory: 'bike' | 'rickshaw' | 'economy' | 'comfort' | 'executive' | 'freight_mini';
  city: string;
  status: 'requested' | 'searching' | 'driver_assigned' | 'arrived' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  canonicalState: 'REQUESTED' | 'SEARCHING' | 'DRIVER_ACCEPTED' | 'DRIVER_ARRIVING' | 'DRIVER_ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  pickupAddress: string;
  destAddress: string;
  pickupLocation: { latitude: number; longitude: number };
  destLocation: { latitude: number; longitude: number };
  distanceKm: number;
  durationMinutes: number;
  fareBreakdown: {
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    waitingFare: number;
    surgeMultiplier: number;
    discountAmount: number;
    finalFare: number;
  };
  commission: {
    ruleId: string;
    percentage: number;
    platformAmount: number;
    driverNetEarnings: number;
  };
  paymentMethod: 'cash' | 'wallet' | 'easypaisa' | 'jazzcash' | 'credit_card';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'cancelled';
  createdAt: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  cancelledBy?: 'passenger' | 'driver' | 'admin' | 'system';
}
```

#### 4. Double-Entry Financial Ledger (`/transactions/{transactionId}`)
*Immutable audit trail for financial reconciliation*
```typescript
interface TransactionDocument {
  id: string; // "TXN-1726880000000"
  referenceType: 'ride_fare' | 'platform_commission' | 'driver_payout' | 'passenger_refund' | 'driver_fine' | 'wallet_topup';
  referenceId: string; // e.g. rideId or payoutId
  payerType: 'passenger' | 'driver' | 'platform' | 'gateway';
  payerId: string;
  payeeType: 'passenger' | 'driver' | 'platform' | 'gateway';
  payeeId: string;
  amount: number; // PKR
  currency: 'PKR';
  status: 'completed' | 'pending' | 'failed' | 'reversed';
  paymentMethod: 'cash' | 'wallet' | 'easypaisa' | 'jazzcash' | 'bank_transfer';
  adminEmail?: string; // If manually triggered
  timestamp: string; // ISO 8601
  immutable: true;
}
```

---

## 3. Real-Time & On-Demand Hybrid Synchronization Strategy (Phase 36)

To balance **zero-latency operational responsiveness** against **Firestore read quotas and billing**, the Admin Control Panel employs a **Hybrid Synchronization Architecture** across the 94 canonical Firestore collections defined in `src/services/firebase/collections.ts`:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  Phase 36 Hybrid Synchronization Engine                 │
├───────────────────────────────────┬─────────────────────────────────────┤
│   Real-Time WebSocket/Snapshot    │     Paginated On-Demand Queries     │
│   (22 Critical Live Collections)  │     (34+ Config & Ledger Views)     │
├───────────────────────────────────┼─────────────────────────────────────┤
│ • passengers, drivers, rides      │ • cities, serviceCategories         │
│ • driverLocations, rideLocations  │ • cityCategoryConfigurations        │
│ • driverVerifications             │ • intercityRoutes, freight          │
│ • safetyIncidents, complaints     │ • pricingRules, pricingRuleVersions │
│ • supportCases, notifications     │ • commissionRules, driverCommissions│
│ • payouts, driverWallets          │ • cashRideReconciliation, refunds   │
│ • paymentTransactions, topUps     │ • reimbursements, dailySettlements  │
│ • promoCodes, driverFines         │ • transactions, driverDailySummaries│
│ • riskAlerts, auditLogs           │ • latePickupIncidents, suspensions  │
│ • adminUsers, adminRoles          │ • fineRules, fineTransactions       │
│ • adminSessions, adminInvitations │ • promoUsage, promotionCampaigns    │
└───────────────────────────────────┴─────────────────────────────────────┘
```

### 3.1 Real-Time Subscription Constraints
- Active subscriptions (`onSnapshot`) are mounted **only when their corresponding view is active** and unmount immediately when navigating away.
- Queries are restricted by city filter (`where('city', '==', selectedCity)`) and status (`where('status', 'in', ['in_progress', 'searching', 'arrived'])`).
- Read quotas are guarded by the global circuit breaker (`src/services/errorHandler.ts`), which throttles queries if daily limits approach warning thresholds.

---

## 4. Role-Based Access Control (RBAC) & Security Integration

The Admin Control Panel enforces security at two decoupled levels:

### Level 1: Database-Level Security (`firestore.rules`)
Authentication uses Firebase Auth with Custom Claims embedded in user JWT tokens:
- `request.auth.token.role == 'super_admin'`
- `request.auth.token.cityScope == 'Lahore'` (for city managers)

```
                              RBAC PERMISSION MATRIX
┌──────────────────────┬───────┬──────┬───────┬───────┬───────┬───────┬───────┐
│ Module / Action      │ Super │ Ops  │ Fin   │ Safe  │ Supp  │ Supp  │ City  │
│                      │ Admin │ Mgr  │ Mgr   │ Off   │ Lead  │ Agent │ Mgr   │
├──────────────────────┼───────┼──────┼───────┼───────┼───────┼───────┼───────┤
│ View Dashboard       │   ✓   │  ✓   │   ✓   │   ✓   │   ✓   │   ✓   │   ✓   │
│ Manage Drivers (KYC) │   ✓   │  ✓   │   -   │   -   │   -   │   -   │ City  │
│ Suspend Drivers      │   ✓   │  ✓   │   -   │   ✓   │   -   │   -   │ City  │
│ Dispatch / Cancel    │   ✓   │  ✓   │   -   │   -   │   -   │   -   │ City  │
│ Pricing Rules Edit   │   ✓   │  -   │   ✓   │   -   │   -   │   -   │   -   │
│ Approve Payouts      │   ✓   │  -   │   ✓   │   -   │   -   │   -   │   -   │
│ Issue Driver Fines   │   ✓   │  ✓   │   ✓   │   ✓   │   -   │   -   │ City  │
│ Passenger Refunds    │   ✓   │  -   │   ✓   │   -   │   ✓   │   -   │   -   │
│ Safety SOS Triage    │   ✓   │  ✓   │   -   │   ✓   │   -   │   -   │ City  │
│ Support Desk Cases   │   ✓   │  ✓   │   -   │   -   │   ✓   │   ✓   │ City  │
│ Audit Logs (Read)    │   ✓   │  ✓   │   ✓   │   ✓   │   ✓   │   -   │   -   │
│ Admin Management     │   ✓   │  -   │   -   │   -   │   -   │   -   │   -   │
└──────────────────────┴───────┴──────┴───────┴───────┴───────┴───────┴───────┘
```

### Level 2: UI View Guards (`AdminContext.tsx`)
The existing `rbacCanAccessTab()` and `rbacHasSensitivePermission()` utilities dynamically hide and disable unauthorized menu items, buttons, and mutation modals.

---

## 5. Dual-Mode Transition Roadmap (Demo to Live Production)

The panel is pre-configured with a clean zero-downtime transition mechanism:

```
[Current State: DEMO MODE]
  • isFirebaseConfigured() === false
  • Data Source: DemoRepository (localStorage + Pakistani Mock Dataset)
  • Zero external credentials or setup required
  • Instant, self-contained demonstration
           │
           │ Step 1: Provision Firebase Project (Shared with Passenger & Driver apps)
           │ Step 2: Set VITE_FIREBASE_* in environment
           │ Step 3: Deploy firestore.rules
           │ Step 4: Seed initial city configuration & admin master accounts
           ▼
[Target State: PRODUCTION LIVE MODE]
  • isFirebaseConfigured() === true
  • Data Source: FirebaseRepository (Cloud Firestore)
  • Driver and Passenger mobile apps connect concurrently
  • Real-time updates reflect live road telemetry across Pakistan
```

### 5.1 Environment Configuration Template (`.env.example`)
To connect the Admin Panel to the shared production Firebase project:
```env
# Shared Firebase Project Credentials (Connects to Mobile Backend)
VITE_FIREBASE_PROJECT_ID=golife-taxi-pk
VITE_FIREBASE_API_KEY=AIzaSyA...
VITE_FIREBASE_AUTH_DOMAIN=golife-taxi-pk.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=golife-taxi-pk.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-ABCDEF1234

# Google Maps API Key (Live Driver Routing & Maps)
VITE_GOOGLE_MAPS_API_KEY=AIzaSyB...

# Optional Payment Gateway Test Integrations (Easypaisa / JazzCash)
VITE_EASYPAISA_STORE_ID=
VITE_JAZZCASH_MERCHANT_ID=
```

---

## 6. Audit Logging & Compliance Standards

Every administrative mutation executed in the Admin Panel is permanently written to the `/auditLogs` collection before the UI state is settled:

```typescript
interface AuditLogEntry {
  id: string; // "audit-1726880000000"
  timestamp: string; // ISO 8601
  adminId: string;
  adminEmail: string;
  adminRole: string;
  action: 'SUSPEND_DRIVER' | 'APPROVE_KYC' | 'MODIFY_FARE_RULE' | 'APPROVE_PAYOUT' | 'ISSUE_FINE' | 'REFUND_PASSENGER';
  targetType: 'driver' | 'passenger' | 'ride' | 'payout' | 'pricing' | 'system_setting';
  targetId: string;
  reason: string;
  note?: string;
  clientIp?: string;
  userAgent?: string;
  immutable: true;
}
```

Firestore security rules permanently forbid `update` and `delete` operations on `/auditLogs`, guaranteeing compliance with state regulations and internal corporate governance.
