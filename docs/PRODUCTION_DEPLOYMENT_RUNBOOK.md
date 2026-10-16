# GoLife Taxi Pakistan — Production Deployment & Go-Live Protection Runbook
**Version:** 1.0.0 — Production Release Candidate  
**Target Platform:** GoLife Admin Control Panel (Web)  
**Region:** Pakistan National Operations (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Sialkot, Gujranwala, Hyderabad)  
**Security Baseline:** Tier-4 Strict Enterprise Isolation & Audit Compliance  

---

## 1. Executive Deployment Philosophy
GoLife Taxi Pakistan implements a **Zero-Accidental-Cutover Architecture**:
1. **Testing Stage (`VITE_DATA_SOURCE=DEMO`)**: Safe offline sandbox with complete Pakistan simulated datasets. Zero credentials needed. Impossible to corrupt real cloud records.
2. **Pre-Production Stage (`VITE_DATA_SOURCE=PRODUCTION` + `VITE_DEPLOYMENT_STAGE=PRE_PRODUCTION`)**: Staging Firebase project with real rules validation, test phone authentications, and sandbox mobile wallets.
3. **Live Production Stage (`VITE_DATA_SOURCE=PRODUCTION` + `VITE_DEPLOYMENT_STAGE=LIVE`)**: Real Firebase Cloud Firestore cluster, production Firebase Auth, encrypted corporate storage, and active merchant settlement rails.

> **CRITICAL RULE**: The environment switch is controlled strictly through deployment environment variables (`VITE_DATA_SOURCE`). There is no casual frontend toggle in live production that can accidentally flip environments.

---

## 2. Environment Variable Configuration Guide

| Variable Name | Required in Prod | Example / Description |
|---|---|---|
| `VITE_DATA_SOURCE` | **YES** | `PRODUCTION` (Enforces real Firebase backend. Never falls back to mock data). |
| `VITE_DEPLOYMENT_STAGE` | **YES** | `LIVE` or `PRE_PRODUCTION`. |
| `VITE_APP_URL` | **YES** | `https://admin.golifetaxi.com` (Must use strict HTTPS). |
| `VITE_FIREBASE_PROJECT_ID` | **YES** | `golife-taxi-pakistan` |
| `VITE_FIREBASE_API_KEY` | **YES** | Web API Key from Firebase Console (Client-safe public token). |
| `VITE_FIREBASE_AUTH_DOMAIN` | **YES** | `golife-taxi-pakistan.firebaseapp.com` |
| `VITE_FIREBASE_STORAGE_BUCKET` | **YES** | `golife-taxi-pakistan.appspot.com` |
| `VITE_FIREBASE_APP_ID` | **YES** | `1:441903474421:web:7f8e9a0b1c2d3e4f5a6b7c` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Recommended | Cloud Messaging sender ID for push notification dispatch. |
| `VITE_PAYMENT_ENVIRONMENT` | **YES** | `live` (Production) or `sandbox` (Staging). |
| `VITE_EASYPAISA_STORE_ID` | Optional | Corporate Till ID `882190` |
| `VITE_JAZZCASH_MERCHANT_ID` | Optional | Corporate Till ID `JC-GOLIFE-PK-02` |
| `VITE_GOOGLE_MAPS_API_KEY` | Optional | Restricted Web API Key for Maps / Route polylines. |

### Private Credentials Warning:
- **NEVER** expose Firebase service account private keys (`service-account.json`) in client environment variables.
- **NEVER** expose payment gateway secret hash salts or API secrets in client code.
- All high-privilege financial payouts and debit operations require backend authorization or dual-admin quorum.

---

## 3. Firestore Collection Verification List

Verify that the following collections are provisioned in the production Firestore database:

| # | Collection Key | Firestore Collection Name | Purpose | Immutability Rule |
|---|---|---|---|---|
| 1 | `adminUsers` | `adminUsers` | Administrator profiles and role assignments | Super Admin exclusive delete |
| 2 | `adminRoles` | `adminRoles` | Role definitions & granular permission matrix | Super Admin write |
| 3 | `passengers` | `passengers` | Passenger accounts, profiles, ratings | User own profile / Ops admin |
| 4 | `drivers` | `drivers` | Driver profiles, vehicle binding, KYC | Verifications Admin / Ops Admin |
| 5 | `driverDocuments`| `driverDocuments` | CNIC, driving license, registration papers | Append / Review status |
| 6 | `vehicles` | `vehicles` | Fleet vehicles, categories, inspection records| Ops / Verifications Admin |
| 7 | `rides` | `rides` | Master ride lifecycle from dispatch to settlement | Locked finalFare on completion |
| 8 | `payments` | `payments` | Passenger payments & ride fare receipts | **IMMUTABLE** (No delete) |
| 9 | `transactions` | `transactions` | Double-entry platform financial ledger | **IMMUTABLE** (Append-only) |
| 10 | `payouts` | `payouts` | Driver wallet cash-out requests | Dual-admin authorization |
| 11 | `wallets` | `wallets` | Passenger and driver account balances | Finance Admin only |
| 12 | `pricingRules` | `pricingRules` | Base fares, km/minute rates, surge rules | Finance Admin only |
| 13 | `cities` | `cities` | Pakistan operational cities & geo-fences | Operations Admin only |
| 14 | `safetyIncidents` | `safetyIncidents` | SOS alerts, panic triggers, collision reports | Safety Admin / Ops Admin |
| 15 | `supportCases` | `supportCases` | Customer & driver support dispute tickets | Support Admin only |
| 16 | `auditLogs` | `auditLogs` | Comprehensive audit trail of all admin actions | **STRICT APPEND-ONLY** (No delete/edit) |
| 17 | `systemSettings`| `systemSettings` | Platform maintenance flags & global parameters | Super Admin exclusive |

---

## 4. Security Rules & Indexes Deployment

### 4.1 Deploying Firestore Security Rules
Ensure `firebase-tools` is installed and run:
```bash
firebase deploy --only firestore:rules
```
Verify the output confirms:
```
✔  firestore: released rules firestore.rules to cloud.firestore
```

### 4.2 Deploying Cloud Storage Security Rules
```bash
firebase deploy --only storage:rules
```
Verify output confirms:
```
✔  storage: released rules storage.rules to firebase.storage
```

### 4.3 Deploying Composite Indexes
```bash
firebase deploy --only firestore:indexes
```
Indexes defined in `firestore.indexes.json`:
- `rides`: `(city ASC, createdAt DESC)`
- `rides`: `(status ASC, createdAt DESC)`
- `rides`: `(passengerId ASC, createdAt DESC)`
- `rides`: `(driverId ASC, createdAt DESC)`
- `transactions`: `(userId ASC, timestamp DESC)`
- `safetyIncidents`: `(status ASC, reportedAt DESC)`
- `supportCases`: `(status ASC, createdAt DESC)`
- `auditLogs`: `(action ASC, timestamp DESC)`
- `driverDocuments`: `(driverId ASC, status ASC)`
- `payouts`: `(driverId ASC, status ASC)`

---

## 5. Step-by-Step Live Switch Procedure

### Step 1: Pre-Flight Verification
1. Run local production build:
   ```bash
   npm run build
   ```
   Ensure build succeeds with 0 errors.
2. Verify all 17 Firestore collections exist or run the initialization script via the Admin Console Connection Center.
3. Check that Super Admin account exists in `adminUsers` with `role: "super_admin"` and `active: true`.

### Step 2: Deployment Configuration Setup
In your production hosting environment (e.g. Google Cloud Run, Firebase Hosting, Vercel, AWS):
1. Set `VITE_DATA_SOURCE=PRODUCTION`
2. Set `VITE_DEPLOYMENT_STAGE=LIVE`
3. Provide valid `VITE_FIREBASE_*` credentials.
4. Deploy the build artifacts (`dist/` directory).

### Step 3: Admin Console Access Verification
1. Navigate to your production URL (`https://admin.golifetaxi.com`).
2. Verify that the login screen displays the **Production Firebase Authentication** indicator.
3. Note that Quick Test credentials and Demo autofill buttons are **hidden** in Production mode.
4. Log in using your registered Super Admin email and password.
5. Confirm successful authentication and check that the Navbar indicates `PRODUCTION MODE (Live Firestore & Mobile App)`.

### Step 4: Live Data & Operational Check
1. **Cities**: Ensure Pakistan active cities (Lahore, Karachi, Islamabad, etc.) are loaded.
2. **Pricing Rules**: Verify standard base rates (e.g. GoMini: Rs 150 base + Rs 45/km).
3. **Audit Log**: Confirm that the login event was written to the `auditLogs` collection.
4. **Safety & Alerts**: Confirm real-time listeners are active without console errors.

---

## 6. Financial & Payment Safety Protections

1. **Cash Ride Settlement**: Standard completed rides remain strictly **CASH ONLY**. Passengers pay drivers directly. Platform commission is debited from the driver's wallet.
2. **Driver Minimum Reserve**: Drivers must maintain at least Rs 500 in their wallet to receive automated ride dispatch.
3. **Top-Up Approvals**: Driver wallet top-up requests via Easypaisa/JazzCash require manual or automated statement verification before credit ledger commitment.
4. **Payout Dual-Approval**: Payout requests above Rs 10,000 require dual authorization by Finance Manager and Super Admin.
5. **Anti-Duplication**: All transactions require unique alphanumeric transaction references (`TRX_ID`). Duplicate transaction references are rejected automatically.

---

## 7. Post-Launch Verification Tests

Execute these validation tests within the first 60 minutes of live deployment:

- [ ] **Test 1 — Authentication**: Log in with Super Admin; verify session token creation and 8-hour expiry.
- [ ] **Test 2 — Unauthorized Access**: Attempt accessing `/settings` with an unauthenticated session; verify redirection to login.
- [ ] **Test 3 — Real-Time Stream**: Trigger a test ride dispatch from the Driver App; verify instant appearance in Live Dispatch.
- [ ] **Test 4 — Immutable Audit Log**: Perform a role change; verify that the change cannot be deleted or altered in `auditLogs`.
- [ ] **Test 5 — Demo Isolation**: Verify that zero mock/sample records from Demo mode appear in any Production table.

---

## 8. Rollback Plan

If unexpected connectivity or database failures occur during launch:

1. **Immediate Staging Rollback**:
   In hosting environment variables:
   ```bash
   VITE_DATA_SOURCE=DEMO
   ```
   Redeploy or restart the container. The Admin Console immediately reverts to the self-contained safe testing sandbox with zero downtime.
2. **Database Data Preservation**:
   Since Demo Mode is 100% read/write isolated, switching to Demo will **never** alter or delete existing data in Cloud Firestore.
3. **Root Cause Analysis**:
   - Inspect Firebase Console -> Firestore -> Usage & Rules Monitor.
   - Inspect Browser DevTools Console for Firestore security rule denials (`permission-denied`).
   - Correct the rule or index definition and re-test in `PRE_PRODUCTION` stage before returning to `LIVE`.

---

## 9. Disaster Recovery, Backups & Version Rollback Architecture

### 9.1 Database Backup Policy (Cloud Firestore)
1. **Automated Daily Exports**:
   Configured via Google Cloud Scheduler invoking Cloud Firestore Managed Export to a dedicated cold-storage GCS bucket (`gs://golife-taxi-backups-asia-south1/firestore/daily`):
   ```bash
   gcloud firestore export gs://golife-taxi-backups-asia-south1/firestore/$(date +%Y-%m-%d) \
     --collection-ids=adminUsers,passengers,drivers,rides,payments,transactions,payouts,wallets,driverWallets,pricingRules
   ```
2. **Point-In-Time Recovery (PITR)**:
   Enabled on the production Firestore Enterprise cluster, providing up to a 7-day continuous recovery window down to the minute.
3. **Database Restore Procedure**:
   To restore collections to a previous point in time:
   ```bash
   gcloud firestore import gs://golife-taxi-backups-asia-south1/firestore/[BACKUP_DATE]/
   ```

### 9.2 Cloud Storage Backup & Object Versioning
1. **Document & KYC Bucket Versioning**:
   Bucket versioning is enabled on `gs://golife-taxi-pakistan.appspot.com` to prevent accidental file deletion:
   ```bash
   gcloud storage buckets update gs://golife-taxi-pakistan.appspot.com --versioning
   ```
2. **Cross-Region Bucket Replication**:
   Driver CNICs, vehicle registration certificates, and police verifications are mirrored to a secondary storage bucket (`gs://golife-taxi-pakistan-dr`).

### 9.3 Previous Stable Build & Release Tagging
1. **Deployment Preservation Policy**:
   Never delete the previous stable deployment image or build artifact.
2. **Release Artifacts**:
   - Stable Release Baseline: `v34.0.0-certified` (Git commit tag & container image digest).
   - Release Candidate: `v35.0.0-production-certified`.
3. **Instant Traffic Shift Rollback**:
   If hosting on Google Cloud Run or Firebase Hosting, execute an immediate 100% traffic shift to the previous stable revision without rebuilding:
   ```bash
   # Cloud Run instant traffic rollback:
   gcloud run services update-traffic golife-admin-panel --to-revisions=PREVIOUS_STABLE_REVISION=100
   
   # Firebase Hosting rollback:
   firebase hosting:clone golife-taxi-pakistan:previous_stable_version golife-taxi-pakistan:live
   ```

---

**Certified by:** GoLife Engineering Architecture Team  
**Approval:** Super Admin Operations Directorate
