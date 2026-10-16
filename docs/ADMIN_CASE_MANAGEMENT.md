# GOlife Admin Control Panel — Phase 24: Case Management, Safety, Verification & Support

## 1. Executive Architecture Overview

The **GOlife Case Management, Safety, Verification, and Support Architecture** provides an end-to-end, enterprise-grade operations platform for managing customer support, emergency dispatch, regulatory compliance, and driver onboarding across Pakistan (Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Peshawar, and Multan).

The architecture unites:
1. **Driver Verification (KYC & Regulatory Compliance)**
2. **Safety & SOS Emergency Operations Center**
3. **Complaints & Dispute Resolution System**
4. **Omnichannel Support Ticket Management**
5. **Unified Central Case Management & Dispatch System**

All modules connect directly to the production backend (`CentralAdminControl` & `SafetyAndSupportService`) backed by Firestore databases, enforcing Phase 21 Role-Based Access Control (RBAC), multi-party verification protocols, and immutable audit logs.

---

## 2. Driver Verification & Regulatory Compliance (Pakistani KYC)

### 2.1 Mandatory Document Requirements Catalog
Driver onboarding in Pakistan mandates verification of 5 core documents:
1. **Computerized National Identity Card (CNIC Front & Back)**
   - Format: `XXXXX-XXXXXXX-X`
   - Verification of NADRA validity, watermarks, national identity match.
2. **Pakistani Driving License (LTV / HTV / Commercial)**
   - Verification against provincial licensing authorities (DLIMS Punjab, Sindh Police DL, Islamabad Traffic Police).
   - Category validation matching service type (GoRide, GoMini, GoComfort, CityFreight, GoBike).
3. **Vehicle Registration Book / Smart Card**
   - Verification of chassis number, engine number, license plate format (e.g., `LEA-22-4891`).
   - Ownership title verification (or notarized owner authorization deed if driving on lease/affidavit).
4. **Vehicle Fitness Certificate & Inspection Report**
   - Annual roadworthiness certificate (tires, brakes, lights, exhaust emissions, seatbelts, safety kit).
5. **Police Character Verification Certificate / Background Clearance**
   - Clean criminal record clearance certificate issued by Police Khidmat Markaz.

### 2.2 Expiry Compliance Monitoring
- **Real-time Status Evaluation**:
  - `Valid` (>30 days remaining)
  - `Expiring Soon` (<=30 days remaining)
  - `Expired` (past expiration date)
- **Automatic Dispatch Gate**:
  - Any expired mandatory document automatically flags the driver's profile, triggers warning notices, and suppresses dispatch availability until compliant renewal documents are reviewed.

### 2.3 Verification Review & Document Inspector Workflow
1. **Pending Queue**:
   - Filterable by Verification Status (`Awaiting Review`, `Under Review`, `Expiring Soon`, `Approved`, `Rejected`), City (`Karachi`, `Lahore`, `Islamabad`, etc.), and Service Category (`GoRide`, `GoComfort`, `CityFreight`, etc.).
   - Includes date range filtering and full-text search across Driver ID, name, phone, and vehicle plate.
2. **Document Inspection**:
   - High-resolution document viewer with zoom controls, version comparison (`v1` vs `v2`), and side-by-side metadata validation.
   - Individual document status controls: `Approve Document`, `Reject Document`, `Flag for Re-upload`.
3. **Rejection & Resubmission Presets**:
   - Standardized catalog with predefined reasons:
     - *Image Quality*: Blurry image, glare/flash obscuring text, cropped edges, illegible details.
     - *Expired Document*: Expired CNIC, lapsed driving license, outdated vehicle fitness certificate.
     - *Mismatch / Incomplete*: Name mismatch with CNIC, vehicle registration plate does not match vehicle photos, wrong document type uploaded.
     - *Tampering / Fraud*: Suspected image alteration, invalid license number, watermarks missing.
   - Pre-fills admin feedback and sends automated notifications to the driver app requesting re-upload.
4. **Audit History**:
   - Every approval, rejection, and status shift generates an audit entry logging reviewer admin ID, timestamp, and notes.

---

## 3. Safety & SOS Emergency Command Center

### 3.1 SOS Dispatch & Real-Time Telemetry
- **Emergency Triggers**:
  - Rider in-app SOS panic button.
  - Driver in-app emergency trigger.
  - Telematics crash detection / harsh impact sensor alerts.
  - Off-route / anomalous route deviation alerts.
- **Incident Inspector**:
  - Live GPS tracking of vehicle location, current speed, and heading.
  - Device telemetry: Battery level, cellular connectivity status, charging state.
  - Live audio stream / recording snippet playback with volume controls.
  - Quick contact links for Driver, Passenger, and Emergency Contacts.

### 3.2 Standard Operating Protocols (SOPs) & Escalation
1. **Immediate Acknowledgment**:
   - Operator acknowledges incoming SOS within target SLA (<30 seconds).
2. **Contact Protocol**:
   - Integrated contact attempt logging (Driver, Passenger, Emergency Contact, Local Police).
   - Channel recording: In-app VOIP, Phone Call, SMS, Push Emergency Notice.
   - Outcome classification: `Connected`, `Unanswered`, `Busy`, `Left Message`.
3. **Safe City / Law Enforcement Escalation**:
   - Integration with Punjab Safe City Authority (PSCA 15), Sindh Police 15, and Rescue 1122.
   - Sensitive action approval prompt required prior to dispatching external emergency services.
4. **Resolution & False Alarm Classification**:
   - Resolutions require comprehensive incident notes and supervisor sign-off.
   - Accidental triggers can be marked as `False Alarm` (`duplicate`, `accidental_tap`, `test_alert`, `cancelled_by_user`).
   - All historical telemetry, audio recordings, and contact attempts are permanently retained.

---

## 4. Complaints & Dispute Resolution System

### 4.1 Categorization & Queue Management
- Complaints are partitioned into critical operational domains:
  - **Fare & Billing Disputes**: Overcharging, toll mismatch, incorrect route fare calculation.
  - **Driver Conduct**: Unprofessional behavior, reckless driving, vehicle condition, cleanliness.
  - **Safety & Harassment**: Verbal misconduct, route deviation, unauthorized passenger.
  - **CityFreight / Cargo Disputes**: Damaged cargo, delayed delivery, weight dispute, missing package.

### 4.2 Resolution & Financial Compensation
- **Phase 23 Wallet Refund Integration**:
  - Admins can issue instant wallet refunds or fare adjustments directly during complaint resolution.
  - High-value refunds require Phase 21 sensitive action authorization (`refund_approval`).
  - Automatically credits the passenger's digital wallet and adjusts driver earnings ledger accordingly.
- **Driver Disciplinary Actions**:
  - Issue formal warnings.
  - Driver account suspension / freeze.
  - Fine levy with automated ledger entry.

---

## 5. Support Tickets & Central Case Management

### 5.1 Omnichannel Support Lifecycle
- **Statuses**: `New`, `Assigned`, `In Progress`, `Pending Customer`, `Escalated`, `Resolved`, `Closed`.
- **Assignment**: Tickets can be assigned across specialized teams (`Support Operations`, `Safety Dispatch`, `Billing & Finance`, `Regulatory Verification`).
- **Internal Collaboration**:
  - Confidential internal notes visible only to administrators.
  - Customer-facing messages dispatched directly to passenger/driver in-app support center.
- **Priority Matrix**: `Low`, `Medium`, `High`, `Urgent` (governed by SLA response clocks).

---

## 6. Security, RBAC & Audit Logging Architecture

### 6.1 Role-Based Permissions
| Role | Driver Verification | Safety SOS Command | Complaints & Disputes | Support Tickets | Sensitive Actions |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Super Admin** | Full Access | Full Access | Full Access | Full Access | Authorized |
| **Safety Dispatcher** | View Only | Full Access + Escalate | View Only | View / Edit | Requires Secondary Auth |
| **KYC Verification Officer**| Full Access | View Only | View Only | View Only | Standard Review |
| **Customer Support Lead** | View Only | View Only | Full Access + Refunds | Full Access | Refund Approval Req. |
| **Auditor / Compliance** | View Only (Masked) | View Logs Only | View Only | View Only | Denied |

### 6.2 Audit Trail Standards
Every interaction across Verification, Safety, Complaints, and Support writes immutable audit records to `admin_audit_logs`:
- `action_type`: e.g., `DRIVER_VERIFICATION_APPROVED`, `SAFETY_INCIDENT_ESCALATED`, `COMPLAINT_RESOLVED`.
- `target_id`: Identifier of driver, ticket, or incident.
- `admin_id` & `admin_name`: Identity of acting operator.
- `previous_state` & `new_state`: Documenting state transitions.
- `ip_address` & `client_agent`: Security context of the session.
- `timestamp`: PKT (Pakistan Standard Time) certified timestamp.
