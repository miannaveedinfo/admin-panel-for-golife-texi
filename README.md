# GoLife Taxi Pakistan — Enterprise Admin Control Center

> **Move Freely. Live Fully.**  
> Next-generation, real-time fleet operations, dispatch, verification, safety, and financial control center for GoLife Taxi Pakistan.

---

## 🌟 Overview

The **GoLife Taxi Admin Panel** is a production-grade, enterprise administrative platform architected for nationwide ride-hailing and freight logistics across Pakistan (Lahore, Karachi, Islamabad, Rawalpindi, Peshawar, Faisalabad, Multan, and beyond).

The application features a complete **Tri-Device Synchronization Engine** connecting:
1. 📱 **Passenger App Flow**: Dynamic fare bidding, vehicle category selection (GoRide, GoMoto, GoAuto, GoMini, GoComfort, GoFreight), real-time broadcast, live tracking, cash-on-delivery (COD) & wallet payments, trip history, and driver ratings.
2. 🚗 **Driver App Flow**: Driver online/offline toggling, incoming ride broadcast radar, acceptance countdown timers, navigation telemetry, arrival verification, trip start & completion, gross cash collection, and automated 15% platform commission deductions.
3. 🖥️ **Central Admin Control Center**: Unified 3-column live dispatch radar, late-pickup fine enforcement, driver KYC/CNIC document verification, safety & SOS incident escalation, fraud/risk center with GPS anomaly detection, and comprehensive financial ledger reconciliation.

---

## 🚀 Key Features

- **Zero-Credential Demo Mode**: Works 100% autonomously on initial clone with no Firebase credentials, Google Maps keys, or payment gateway APIs required.
- **Tri-App End-to-End Simulator**: Integrated interactive testing suite to simulate passenger booking, driver acceptance, telemetry tracking, and cash settlement in real-time.
- **15-Domain Compliance Matrix**: Complete audit verification covering passenger, driver, dispatch, wallet, cash COD, platform commissions, payouts, safety SOS, dispute tickets, driver KYC, and promotional vouchers.
- **Unified 3-Column Command Center**: High-density operational dashboard featuring live entity lists, interactive GIS radar maps, and detail inspection drawers.
- **Bilingual Support**: Instant toggle between English and Urdu (`اردو`).
- **Compact 2027 Design System**: Tailored in signature GoLife Yellow/Gold (`#F59E0B` / `#FBBF24`) and high-contrast Slate with fluid responsive layouts.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Animations**: Motion (`motion/react`)
- **Icons**: Lucide React
- **Data Visualization**: Recharts, D3
- **State & Synchronization**: React Context with deterministic local persistence and optional live Firestore connector

---

## 📦 Quick Start & Installation

Clone the repository and install dependencies:

```bash
# 1. Clone the repository
git clone https://github.com/your-org/golife-taxi-admin.git
cd golife-taxi-admin

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

The application will start at `http://localhost:3000`.

---

## ⚙️ Environment Configuration

The application is engineered to run seamlessly **without any `.env` configuration**:

```env
# .env.example
# All features operate out-of-the-box in Demo Mode.
# No secrets or environment variables required.
```

If you wish to connect a live Google Cloud / Firebase Firestore instance, you can do so directly from the in-app **Data Source Modal** in the top navigation bar.

---

## 🧪 Testing the End-to-End Flow

To test the entire ride lifecycle:
1. Click the **"E2E Flow Audit"** button in the top navigation bar or on the **Live Operations** screen.
2. Use the **Interactive Tri-App Sync** tab to trigger a simulated passenger ride request, accept it from the driver's perspective, navigate to pickup, and settle cash payment.
3. Alternatively, click **"Run Full End-to-End Automated Audit"** in the **Automated 10-Step Audit Suite** tab to verify all 10 phases programmatically.

---

## 📄 License

Proprietary enterprise software built for **GoLife Taxi Pakistan**. All rights reserved.
