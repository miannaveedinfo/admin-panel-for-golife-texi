# GOlife Admin Control Panel — Reporting & Analytics Architecture

**Phase 25 — Dashboard, Reports, Analytics & Unified Calendar System**  
*Authoritative Documentation & Metric Specification*  
*Timezone Standard: `Asia/Karachi` (PKT, UTC+5)*

---

## 1. Overview & System Purpose

The GOlife Admin Reporting & Analytics Engine provides the executive and operational command staff with live, unmanipulated telemetry across all Pakistani metropolitan markets (Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Faisalabad, Multan, and surrounding operational zones).

The system enforces a **Zero-Mock Policy**:
- **No hardcoded statistics or sample multipliers.**
- **No fake graphs or static weight distributions.**
- **No simulated driver counts or placeholder revenue values.**
- **Strict separation of test/unsettled events from GAAP-compliant enterprise revenue.**

All aggregations originate directly from the authoritative financial system (`commissionService.ts`), the central transaction ledger (`centralTransactions`), and live trip dispatches (`rides`).

---

## 2. Authoritative Metric Definitions & Calculations

Every metric rendered on the Admin Dashboard is computed in accordance with the single source of truth defined in Phase 23 and Phase 25:

### 2.1 Ride & Volume Metrics

| Metric | Calculation | Authoritative Source |
| :--- | :--- | :--- |
| **Total Rides** | `Completed Rides + Live Active Rides + Cancelled Rides` for the selected timeframe. | `rides` collection & `driverDailySummaries` |
| **Completed Rides** | Rides where `status === 'completed'`. | `getUnifiedCommissionRecords` |
| **Live Active Rides** | Only applicable when viewing `Today`. Count of rides with status `in_progress`, `driver_assigned`, or `searching`. Evaluates to `0` for historical dates. | `rides` |
| **Cancelled Rides** | Rides with `status === 'cancelled'`. Evaluates to 0 completed fare; does not generate platform commission. | `rides` & `driverDailySummaries` |
| **Average Fare per Ride** | `grossFare / completedRidesCount` (or `PKR 0` if 0 completed rides). | `calculateGlobalFinancials` |
| **Average Commission per Ride** | `platformCommission / completedRidesCount` (or `PKR 0` if 0 completed rides). | `calculateGlobalFinancials` |

### 2.2 Financial & Revenue Metrics

| Metric | Calculation | Notes |
| :--- | :--- | :--- |
| **Gross Fare (Customer Bookings)** | $\sum \text{grossFarePKR}$ of all completed rides within the timeframe filter. | Does NOT count failed payments or cancelled rides. |
| **Platform Commission** | $\sum \text{finalCommissionPKR}$ after applying tier rates, minimum floors, and verified driver-specific commission overrides. | Stored in PKR integer precision. |
| **Driver Net Earnings** | $\text{Gross Fare} - \text{Platform Commission}$. | Authoritative net credited to driver wallets. |
| **Platform Revenue** | $\text{Platform Commission} + \text{Fines Collected} - \text{Passenger Refunds} + \text{Adjustments}$. | Consolidated GAAP platform margin. |
| **Driver Fines Total** | Fines assessed with status `'applied'` or `'paid'` in the timeframe. | Directly debited from driver balances. |
| **Passenger Refunds Total** | Approved customer service refunds issued in the timeframe. | Subtracted from gross operational yield. |
| **Pending Payouts** | Total withdrawal requests currently marked `'pending'`. | Outstanding liability to verified drivers. |

### 2.3 Fleet & Support KPIs

| Metric | Calculation | Source |
| :--- | :--- | :--- |
| **Operating Fleet / Online Drivers** | When viewing `Today`: drivers with `status === 'online' \|\| status === 'on_trip'`. When viewing historical dates: unique active `driverId` count extracted from daily summaries and ride records. | `drivers`, `driverDailySummaries`, `rides` |
| **Pending Driver Requests** | Driver KYC verification submissions with `status === 'pending'` logged in the selected window. | `verifications` |
| **Pending Complaints** | Passenger/driver safety and service complaints with `status === 'open'` logged in the selected window. | `complaints` |

---

## 3. Date & Calendar System Architecture

### 3.1 Timezone Invariant (`Asia/Karachi`)

All date resolution, midnight boundaries, and weekly/monthly cutoffs strictly follow Pakistan Standard Time (PKT, UTC+5). Dates are formatted internally as standard ISO-8601 calendar dates (`YYYY-MM-DD`).

### 3.2 Supported Timeframe Modes

The system supports 10 distinct, synchronized timeframe modes:

1. **Today (`today`)**: Real-time intraday operations. Includes live in-progress rides and real-time fleet presence.
2. **Yesterday (`yesterday`)**: Exactly the calendar day immediately preceding today in PKT.
3. **This Week (`weekly`)**: Monday of the current week at 00:00:00 PKT through Sunday 23:59:59 PKT.
4. **Last Week (`last_week`)**: Monday through Sunday of the previous calendar week.
5. **This Month (`monthly`)**: First calendar day through the last calendar day of the current month.
6. **Last Month (`last_month`)**: First through last calendar day of the preceding month.
7. **This Year (`yearly`)**: January 1 through December 31 of the selected year.
8. **Last Year (`last_year`)**: January 1 through December 31 of the previous year.
9. **Custom Single Date (`custom_date`)**: Any historical date selected by the administrator.
10. **Custom Date Range (`custom_range`)**: Arbitrary multi-day range defined by `[startDate, endDate]`.

### 3.3 Interactive Calendar Grid & Date Range Picker

The `DashboardCalendarPicker` component provides:
- Two compact preset button trays covering all 10 timeframe presets.
- Full calendar matrix with two-click range selection (Start Date and End Date).
- Real-time cell range highlighting between boundaries.
- Historical date badge notifying administrators that they are viewing non-live ledger entries.
- One-click "Reset to Today" trigger.

---

## 4. Chart Telemetry & Dynamic Aggregation

The central **Earnings Overview & Fleet Volume** chart dynamically alters its buckets depending on the selected timeframe:

- **Intraday / Daily (`today`, `yesterday`, `custom_date`)**:  
  Six 4-hour temporal buckets: `00-04`, `04-08`, `08-12`, `12-16`, `16-20`, `20-24`.  
  Each bar displays the real completed rides and gross revenue booked in that specific window.

- **Weekly (`weekly`, `last_week`)**:  
  Seven daily slots: `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun`.  
  Bars correspond to individual day totals extracted from unified records.

- **Monthly (`monthly`, `last_month`)**:  
  Four calendar partitions: `Week 1` (Days 1–7), `Week 2` (Days 8–14), `Week 3` (Days 15–21), and `Week 4` (Days 22–31).

- **Yearly (`yearly`, `last_year`)**:  
  Twelve monthly buckets from `Jan` to `Dec`.

- **Custom Range (`custom_range`)**:  
  Automatically switches between daily intervals (for ranges $\le 7$ days) and 4 equal partitions (for multi-week ranges).

---

## 5. Zero-Mock & Stale Data Rules

1. **Synchronous Reactivity**: Every KPI card, chart bucket, and ride table item is bound to `useMemo` hooks dependent on `dashboardDateFilter` and `selectedCityFilter`. When the administrator changes dates, new values are evaluated immediately.
2. **Zero-State Integrity**: If zero trips took place on a given date:
   - Total Rides shows `0`.
   - Gross Revenue shows `PKR 0`.
   - Chart bars display baseline neutral markers with `PKR 0` gross and `0` rides.
   - An informative alert banner informs the administrator: *"No records found for [Period Name]"*.
3. **No Phantom Multipliers**: No static numbers like `145,000`, `890,000`, or `42,000,000` exist anywhere in the reporting pipeline.

---

## 6. Verification and Audit Matrix

| Verification ID | Test Case | Expected Behavior |
| :--- | :--- | :--- |
| **V-01** | Switch to `Yesterday` | Header indicates "Viewing: Yesterday ([Date])", chart switches to 4-hour blocks for that date, live rides display 0. |
| **V-02** | Switch to `This Week` | Displays 7-day Monday–Sunday timeline, aggregates all rides in current week. |
| **V-03** | Switch to `Last Month` | Correctly resolves previous month boundaries, displays 4 weekly aggregates. |
| **V-04** | Select Historical Empty Date | Shows clean zero-state banner, all metrics evaluate to 0 PKR / 0 rides without errors. |
| **V-05** | City Filter ("Lahore") | Filters all revenue, drivers, and rides exclusively to Lahore metropolitan records. |
| **V-06** | Custom Date Range (Click Start & End) | Grid highlights selected range, triggers full dashboard re-aggregation across the custom interval. |
