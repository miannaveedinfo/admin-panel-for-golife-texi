# GOlife Admin Financial Architecture & Ledger System

## 1. System Overview & Core Directives

The GOlife Admin Financial Control System provides an authoritative, double-entry financial ledger and payment reconciliation engine for all ridesharing, freight, and courier operations across Pakistan (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, and Peshawar).

### Key Architectural Principles
- **Single Source of Truth**: All financial balances, transactions, top-ups, settlements, and payouts are sourced from authoritative backend storage (`FirebaseRepository` in production mode, `DemoRepository` in staging/demo mode).
- **Never Trust Frontend Financial Amounts**: Calculation of ride fares, platform commissions, surcharge deductions, and driver payouts is enforced by server-grade services (`payoutSettlementService.ts`, `commissionService.ts`, `centralPaymentService.ts`, `FinancialService.ts`).
- **No Mock or Synthetic Variances**: Real calculations are derived from verified ledger credits, debits, holds, and cash settlements.
- **Double-Entry Consistency**: Every financial movement creates an immutable ledger transaction with a verified debit and credit pair.

---

## 2. Supported Pakistani Payment Rails & Providers

| Rail / Provider | Type | Supported Operations | Verification Method |
|---|---|---|---|
| **EasyPaisa** | Mobile Wallet / Open API | Top-ups, Payouts, Advance Holds | Direct Webhook + Transaction Reference |
| **JazzCash** | Mobile Wallet / Merchant Portal | Top-ups, Payouts, Advance Holds | HMAC-SHA256 Webhook + Settlement File |
| **1LINK (1bill)** | Interbank Billing Protocol | Driver Wallet Top-ups, Invoice Settlements | 1LINK Real-time Switch Confirmation |
| **Raast** | SBP Instant Payment System | Instant Driver Payouts, Direct Bank Transfer | Raast Alias / IBAN Verification |
| **Bank IBFT** | Commercial Banks (HBL, Meezan, Alfalah, etc.) | Payout Disbursements, Corporate Billings | Core Banking Automated Clearing |
| **Cash Settlement** | On-Trip Driver Cash Collection | In-hand Fare Collection, Platform Commission Debit | Real-time Driver Wallet Debit & Reconciliation |

---

## 3. Database Schema & Collections Mapping

All financial entities reside in dedicated collections mapped in `/src/services/firebase/collections.ts`:

### 1. `paymentTransactions`
Authoritative double-entry ledger of all financial transactions:
- `id`: Unique system transaction ID (`TXN-...`)
- `referenceId`: Provider reference / 1LINK sequence / ride code
- `transactionType`: `ride_fare` | `commission_deduction` | `driver_topup` | `driver_payout` | `passenger_refund` | `fine_deduction` | `wallet_adjustment` | `escrow_hold` | `escrow_release`
- `paymentMethod`: `easypaisa` | `jazzcash` | `bank_transfer` | `raast` | `cash` | `wallet`
- `userId`: Identifier of Driver (`drv-...`) or Passenger (`pax-...`)
- `userName`, `userType`: Entity details
- `amount`: Gross transaction amount (PKR)
- `walletEffect`: Net impact on the wallet (+PKR / -PKR)
- `balanceAfter`: Balance snapshot immediately following execution
- `status`: `Completed` | `Processing` | `Failed` | `Reversed`
- `createdAt`: ISO/PKT timestamp

### 2. `driverWallets`
Real-time wallet state for drivers:
- `driverId`: Driver identifier
- `balance`: Total wallet balance (positive or negative)
- `payableBalance`: Available funds for withdrawal (after security reserve)
- `outstandingDeductions`: Commission debt owed to platform (when balance < 0)
- `pendingTopUps`: In-flight manual or webhook top-ups
- `pendingPayouts`: In-flight withdrawal requests under treasury review
- `currency`: `'PKR'`
- `lastActivity`: Timestamp of last mutation

### 3. `topUpRequests`
Driver manual and gateway top-up requests:
- `id`: Request ID
- `driverId`, `driverName`, `driverPhone`, `city`
- `amount`: Top-up amount in PKR
- `paymentMethod`: `easypaisa` | `jazzcash` | `bank_transfer` | `1link`
- `transactionReference`: Proof of payment / receipt ID / bank reference
- `receiptUrl`: Deposit slip / mobile screenshot attachment
- `status`: `pending_verification` | `verified` | `rejected`
- `verifiedBy`, `verifiedAt`, `rejectionReason`

### 4. `advanceBookingHolds`
Escrow holds for scheduled and intercity rides:
- `bookingCode`, `passengerId`, `driverId`
- `fareTotal`, `advanceAmount` (minimum 25% or flat deposit)
- `escrowStatus`: `held_in_escrow` | `released_to_driver` | `refunded`
- `heldAt`, `releasedAt`, `gatewayReference`

### 5. `driverCommissions` & `commissionRules`
Central commission configurations and ride-level deductions:
- Default Platform Commission Rate: **12%**
- Overrides: Configurable per vehicle category (Bike 10%, Rickshaw 11%, Mini 12%, Go Sedans 15%) and city zones.
- Rule Versioning: Changes are timestamped and logged with admin actor signatures.

### 6. `cashRideReconciliation`
Audits cash collected by drivers against the calculated platform fee:
- `rideId`, `rideCode`, `fareCollected`
- `commissionDue`: Computed fee deducted from driver wallet
- `walletDeductionStatus`: `settled` | `insufficient_balance` (triggers commission debt)
- `reconciliationTimestamp`

---

## 4. Wallet Lifecycle & State Transitions

### A. Cash Ride Execution & Auto-Commission
1. Driver finishes a cash ride (e.g. Fare: PKR 1,000).
2. Passenger pays driver PKR 1,000 in cash.
3. System triggers `settleCashRide`:
   - Calculates 12% commission = PKR 120.
   - Debits driver wallet by PKR 120 (`walletEffect: -120`).
   - If driver wallet had PKR 500, new balance is PKR 380.
   - If driver wallet had PKR 50, new balance is -PKR 70 (recorded as `outstandingDeductions: 70`).
   - Generates immutable `CentralPaymentTransaction`.

### B. Driver Wallet Top-Up Workflow
1. Driver deposits PKR 2,000 via EasyPaisa / JazzCash / Bank Transfer.
2. Top-up request is created with `pending_verification` status.
3. Treasury Admin reviews payment proof in the Admin Control Panel.
4. On Approval (`handleTopUpStatusChange` -> `verified`):
   - Driver wallet is credited by PKR 2,000.
   - Any outstanding negative balance is automatically settled first.
   - Immutable credit transaction is appended to `paymentTransactions`.
   - Driver receives push notification confirming credit.

### C. Driver Withdrawal / Payout Workflow
1. Driver requests withdrawal of PKR 5,000.
2. System validates request (`validatePayoutRequest`):
   - Must meet minimum payout threshold (PKR 1,000).
   - Driver must have sufficient `payableBalance`.
   - Driver must not have active fraud or safety holds.
3. Lifecycle States:
   - `Pending`: Queued for review.
   - `Under Review`: Treasury officer inspecting bank details.
   - `Approved`: Driver balance is debited; queued for gateway disbursement batch.
   - `Processing`: Dispatched via Raast / 1LINK / IBFT.
   - `Completed`: Confirmation reference recorded; reconciliation matched.
   - `Rejected`: If rejected, funds are automatically reversed back to the driver wallet.

---

## 5. Idempotency & Concurrency Protection

All sensitive financial operations are wrapped by `executeIdempotent(idempotencyKey, operation)` in `FinancialService.ts`:
- Prevents double-credit or double-debit on network retries or repeated button clicks.
- In-flight operations lock the idempotency key for 30 seconds.
- Completed operations cache the result for 24 hours.

---

## 6. Security, RBAC & Financial Audit Trail

- **Role-Based Access Control**:
  - `payout_approval`: Restricted to Super Admin and Finance Controller roles.
  - `refund_approval` & `reimbursement_approval`: Requires high-value dual authorization when amounts exceed PKR 5,000.
  - `wallet_adjustment`: Logs mandatory administrator justification and generates double-entry records.
- **Audit Logs**: Every financial action records the admin identity, IP/session, before/after values, and cryptographic timestamp in `audit_logs`.
