import React, { useState } from 'react';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AdminAuth } from './components/AdminAuth';
import { DashboardView } from './components/DashboardView';
import { LiveRidesView } from './components/LiveRidesView';
import { RideManagementView } from './components/RideManagementView';
import { DriverManagementView } from './components/DriverManagementView';
import { DriverVerificationView } from './components/DriverVerificationView';
import { PassengerManagementView } from './components/PassengerManagementView';
import { PricingAndChargesView } from './components/PricingAndChargesView';
import { CitiesOperationsView } from './components/CitiesOperationsView';
import { CityFreightView } from './components/CityFreightView';
import { WalletPayoutView } from './components/WalletPayoutView';
import { PromoDiscountView } from './components/PromoDiscountView';
import { AcademyLoanView } from './components/AcademyLoanView';
import { ReportsSettingsView } from './components/ReportsSettingsView';
import { SupportCenterView } from './components/SupportCenterView';
import { AdminManagementView } from './components/AdminManagementView';
import { SystemBusinessRulesCenter } from './components/settings/SystemBusinessRulesCenter';
import { AuditLogsView } from './components/AuditLogsView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { UniversalDetailDrawer } from './components/UniversalDetailDrawer';
import { AiAssistantView } from './components/AiAssistantView';
import { DriverEarningsView } from './components/DriverEarningsView';
import { NotificationsCenterView } from './components/NotificationsCenterView';
import { CaseManagementView } from './components/CaseManagementView';
import { SafetyEmergencyCenterView } from './components/safety/SafetyEmergencyCenterView';
import { FraudRiskCenterView } from './components/FraudRiskCenterView';
import { AccessDeniedView } from './components/common/AccessDeniedView';
import { ProductionConfigAlert } from './components/common/ProductionConfigAlert';
import { FirebaseConnectionModal } from './components/FirebaseConnectionModal';

const AdminApp: React.FC = () => {
  const { currentAdmin, activeTab, language, canAccessTab, authLoading } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/10">
          <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="text-base font-bold text-slate-100 tracking-tight">Verifying Administrative Credentials...</div>
        <div className="text-xs text-slate-400 mt-1">Checking session integrity, cryptographic tokens & RBAC permissions</div>
      </div>
    );
  }

  if (!currentAdmin) {
    return <AdminAuth />;
  }

  const renderActiveView = () => {
    if (!canAccessTab(activeTab)) {
      return <AccessDeniedView attemptedTab={activeTab} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'ai_assistant':
        return <AiAssistantView />;
      case 'drivers':
        return <DriverManagementView />;
      case 'driver_earnings':
        return <DriverEarningsView />;
      case 'verification':
        return <DriverVerificationView />;
      case 'academy':
        return <AcademyLoanView initialTab="academy" />;
      case 'loans':
        return <AcademyLoanView initialTab="loans" />;
      case 'live_rides':
        return <LiveRidesView />;
      case 'rides':
        return <RideManagementView />;
      case 'passengers':
        return <PassengerManagementView />;
      case 'freight':
        return <CityFreightView initialTab="freight" />;
      case 'cities':
        return <CitiesOperationsView />;
      case 'fares':
        return <PricingAndChargesView />;
      case 'wallets':
        return <WalletPayoutView />;
      case 'promos':
        return <PromoDiscountView />;
      case 'safety':
      case 'safety_emergency':
        return <SafetyEmergencyCenterView />;
      case 'fraud_risk':
        return <FraudRiskCenterView />;
      case 'complaints':
        return <CaseManagementView />;
      case 'support':
        return <SupportCenterView />;
      case 'admins':
        return <AdminManagementView />;
      case 'settings':
        return <SystemBusinessRulesCenter />;
      case 'audit':
      case 'audit_logs':
        return <AuditLogsView />;
      case 'notifications':
        return <NotificationsCenterView />;
      case 'reports':
        return <ReportsSettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div
      id="golife-admin-app-root"
      className={`min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col font-sans antialiased selection:bg-[#0F766E] selection:text-white ${
        language === 'ur' ? 'font-urdu' : ''
      }`}
    >
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main
          id="main-admin-viewport"
          className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 bg-[#F8FAFC] relative"
        >
          <div className="max-w-7xl mx-auto pb-12">
            <ProductionConfigAlert onOpenConfigModal={() => setIsConfigModalOpen(true)} />
            {renderActiveView()}
          </div>
        </main>
      </div>
      <GlobalSearchModal />
      <UniversalDetailDrawer />
      <FirebaseConnectionModal isOpen={isConfigModalOpen} onClose={() => setIsConfigModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AdminProvider>
      <AdminApp />
    </AdminProvider>
  );
}

