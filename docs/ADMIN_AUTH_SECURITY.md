# GoLife Taxi Admin Control Panel — Authentication & Security Architecture

**Document Version:** 2.1 (Production Grade)  
**System Classification:** Enterprise Central Command Control Panel (Pakistan Operations)  
**Security Standard:** Strict Server-Enforced RBAC, 256-Bit TLS, Immutable Append-Only Ledger  

---

## 1. Executive Security Summary

The GoLife Taxi Admin Control Panel is the **single central management system** for the entire GoLife transportation, logistics, and driver financial operations in Pakistan. It is strictly protected against unauthorized access, privilege escalation, and configuration tampering.

### Core Security Tenets
1. **Zero Frontend-Only Security:** Frontend tab/button hiding is treated as a visual convenience only. Every administrative write, update, financial disburse, and system configuration change is validated at the backend service layer and enforced cryptographically via `firestore.rules`.
2. **Identity & Session Governance:** Admin sessions are tracked with cryptographic session tokens, bound to 8-hour absolute lifespans and 2-hour idle timeouts.
3. **Last Super Admin Immutability Guard:** The system programmatically prevents deleting, demoting, deactivating, or locking the last active Super Admin, preventing accidental platform lockout.
4. **Strict Immutable Audit Ledger:** Administrative actions (logins, logouts, KYC approvals, driver suspensions, pricing modifications, promo additions, financial refunds, and access denials) are appended to the immutable `auditLogs` collection with zero client update or deletion permissions.
5. **Separation of Environments:** Real Firebase Authentication is active in production (`firebaseConfig.ts`), with strict schema validation and defense against user enumeration.

---

## 2. Supported Administrator Roles & Privilege Matrix

GoLife employs a role-based access control (RBAC) model aligned with Pakistani operational departments:

| Role Identifier | Role Title | Core Responsibilities | Module Access | Sensitive Action Authorizations |
|---|---|---|---|---|
| `super_admin` | Super Administrator | Full platform sovereignty, system parameters, security policies, role delegation | All 21 Modules | All Sensitive Permissions (100% bypass ceiling) |
| `operations_admin` | Operations Dispatcher | Fleet operations, live dispatch, driver performance, trip anomalies | Live Rides, Rides, Drivers, Passengers, Cities, Support | Cancel rides, flag drivers, dispatch notifications |
| `finance_admin` | Finance Officer | Tariff configurations, driver wallets, bank payouts, fee structures, refunds | Pricing, Wallets & Payouts, Promos, Reports | Modify tariffs, approve payouts, disburse wallet credits/refunds |
| `safety_admin` | Safety & Compliance Director | Emergency response, SOS monitoring, accident dispatch, driver disciplinary actions | Safety Incident Desk, SOS, Complaints, Driver Suspensions | Lock driver accounts, issue fines, resolve SOS alerts |
| `verification_admin`| Document Verification Officer| Driver onboarding, CNIC/Driving License verification, vehicle roadworthiness checks | Verification Queue, Academy, Driver Roster | Approve/Reject KYC, request re-upload of CNIC/License |
| `support_admin` | Customer Experience Lead | Dispute arbitration, customer tickets, driver ratings, lost & found | Support Desk, Feedback, Passenger Profiles | Issue passenger ride credits, re-assign tickets |
| `city_manager` | Regional Operations Lead | Localized dispatch, zonal service categories, provincial regulatory compliance | Localized City Operations, Drivers, Rides | Geo-fenced driver actions within assigned city scope |
| `read_only_admin` | Auditor / Compliance Inspector| Read-only platform inspection for regulatory reporting and auditing | Dashboard, Read-only Reports, Read-only Logs | Zero write permissions. All action buttons disabled |

---

## 3. Production Authentication Architecture

### 3.1 Sign-In & Credential Validation
1. **Endpoint / Interface:** Administrator navigates to `/` and is presented with `<AdminAuth />`.
2. **Credential Sanitization:** Admin email is normalized (`toLowerCase().trim()`). Passwords are evaluated with minimum complexity guards (>= 6 characters).
3. **Firebase Authentication Integration:**
   - Production mode invokes `signInWithEmailAndPassword(auth, email, password)` via Firebase Authentication SDK.
   - User account status is retrieved from the `adminUsers` Firestore collection.
   - If account is marked `locked`, `suspended`, or `inactive`, session generation is immediately rejected with an explicit security alert logged to the ledger.
4. **Sanitized Error Messaging:** Error responses return generic, safe messages (e.g., *"Invalid administrator credentials or inactive account."*) to prevent user enumeration attacks.

### 3.2 Session Persistence & Inactivity Guards
- **Session Lifespan:** 8 hours maximum lifetime (`expiresAt`).
- **Inactivity Timeout:** 2 hours of mouse/keyboard inactivity triggers automatic session revocation (`SESSION_IDLE_TIMEOUT_MS = 7,200,000 ms`).
- **Cross-Window Multi-Tab Synchronization:** A `storage` event listener on `localStorage` detects sign-outs or session invalidation across any browser tab and synchronizes the session termination instantly across all open windows.
- **Session Ledger:** Active tokens and device metadata (User Agent, IP, login timestamp) are tracked in the `adminSessions` collection.

---

## 4. Backend Authorization & Security Rules (`firestore.rules`)

Backend security enforces the principle of least privilege with proactive default denial:

```protobuf
match /{document=**} {
  allow read, write: if false; // Proactive default deny
}
```

### 4.1 Server-Side Identity Helpers
- `isSignedIn()`: Verifies `request.auth != null`.
- `isAdmin()`: Validates that `request.auth.uid` exists in the `/adminUsers/` document tree and `active == true`.
- `isSuperAdmin()`: Validates that `getAdminDoc().data.role == 'super_admin'`.
- `hasAdminRole(role)`: Validates that the active admin possesses the designated functional role or is a `super_admin`.

### 4.2 Module-Specific Authorization Rules
- **Admin Accounts (`/adminUsers/{userId}`):**
  - Read: Authenticated admins only.
  - Create / Delete: `isSuperAdmin()` exclusively. Admins are blocked from deleting their own active profile (`request.auth.uid != userId`).
- **Audit Logs (`/auditLogs/{logId}`):**
  - Read: Authenticated admins.
  - Create: Authenticated admins.
  - Update / Delete: `if false;` (Strict, permanent immutability).
- **Tariffs & Pricing Engine (`/pricingRules/{ruleId}`):**
  - Read: Public / Mobile passenger and driver apps.
  - Write: Restricted to `hasAdminRole('finance_admin')` or `super_admin`.
- **Driver Payouts & Wallets (`/payouts/{payoutId}`, `/wallets/{walletId}`):**
  - Updates and disbursements strictly restricted to `hasAdminRole('finance_admin')`.
- **Driver Document Verification (`/driverDocuments/{docId}`):**
  - Review and verification status writes strictly restricted to `hasAdminRole('verification_admin')` or `super_admin`.
- **System Settings (`/systemSettings/{settingId}`):**
  - Modifying platform operating thresholds is restricted exclusively to `isSuperAdmin()`.

---

## 5. Defense-in-Depth Gatekeeper (403 Access Denied System)

If an administrative user attempts to bypass UI navigation (e.g. altering browser storage or invoking restricted tabs):
1. **Route Interceptor (`App.tsx`):**
   ```tsx
   if (!canAccessTab(activeTab)) {
     return <AccessDeniedView attemptedTab={activeTab} />;
   }
   ```
2. **Visual Diagnostics & Escalation Flow (`AccessDeniedView.tsx`):**
   - Displays clear HTTP 403 Access Restricted feedback.
   - Shows active administrator credentials, department, and required role privilege.
   - Provides a direct "Request Temporary Role Escalation" dialog where the admin can supply a business operational justification.
   - Escalation requests are logged to the Super Admin audit ledger with action `'PERMISSION_ELEVATION_REQUESTED'`.

---

## 6. Immutable Administrative Audit Logging

All administrative actions trigger an immutable append to the system ledger:

| Logged Event Type | Context Captured | Target Entity | Immutability Assurance |
|---|---|---|---|
| `ADMIN_LOGIN` | IP, User Agent, Timestamp, Admin ID | Admin Session | Append-Only, No Edit/Delete |
| `ADMIN_LOGOUT` | Admin ID, Session ID, Timestamp | Admin Session | Append-Only, No Edit/Delete |
| `FAILED_LOGIN_ATTEMPT` | Attempted Email, IP Address, Reason | Security Ledger | Append-Only, No Edit/Delete |
| `DRIVER_VERIFICATION_APPROVED` | Verifier Name, Driver ID, Notes | Driver Account | Append-Only, No Edit/Delete |
| `DRIVER_ACCOUNT_STATUS_CHANGE`| Reason, Admin Name, Old/New Status | Driver Account | Append-Only, No Edit/Delete |
| `PASSENGER_WALLET_ADJUST` | Delta Amount, Reason, Admin Name | Passenger Wallet | Append-Only, No Edit/Delete |
| `FARE_CONFIG_MODIFIED` | Vehicle Category, Fare Parameters | Central Pricing | Append-Only, No Edit/Delete |
| `PAYOUT_APPROVED` | Beneficiary Driver, Transaction ID | Treasury Ledger | Append-Only, No Edit/Delete |
| `LAST_SUPER_ADMIN_PROTECTION` | Target Admin ID, Blocked Action | Security Guard | Append-Only, No Edit/Delete |

---

## 7. Production Verification & Deployment Checklist

Before deploying the GoLife Admin Control Panel to production:

- [x] **No Hardcoded Passwords:** Removed all preset demo credentials, auto-login passwords, and test auth bypasses.
- [x] **Server-Side Validation:** `firestore.rules` deployed and verified with strict RBAC rules.
- [x] **Last Super Admin Guard:** Confirmed deleting or locking the final Super Admin is blocked at both service and UI layers.
- [x] **Session Expiry Active:** 8-hour maximum session lifetime and 2-hour idle timeout verified.
- [x] **Cross-Tab Sync:** Confirmed logging out in one window revokes session in all open windows.
- [x] **403 Gatekeeper:** Accessing restricted tabs as non-authorized roles triggers the `<AccessDeniedView />` diagnostics.
- [x] **Audit Ledger Integrity:** Confirmed `auditLogs` collection rejects any update or delete requests from client apps.
- [x] **Password Recovery:** Asynchronous recovery flow triggers secure reset links to registered email addresses.

---
*Developed by the GoLife Core Infrastructure Engineering Team for GoLife Pakistan Operations.*
