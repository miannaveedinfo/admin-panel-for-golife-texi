import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { RiskDashboardTab } from './RiskDashboardTab';
import { RiskAlertsTab } from './RiskAlertsTab';
import { RiskRulesTab } from './RiskRulesTab';
import { RiskWatchlistTab } from './RiskWatchlistTab';
import {
  ShieldAlert,
  Activity,
  Zap,
  Shield,
  RefreshCw,
  Bell
} from 'lucide-react';

export type FraudRiskTabKey = 'dashboard' | 'alerts' | 'rules' | 'watchlist';

export const FraudRiskCenterView: React.FC = () => {
  const {
    riskAlerts,
    riskRules,
    riskWatchlist,
    triggerDemoRiskScan
  } = useAdmin();

  const [activeSubTab, setActiveSubTab] = useState<FraudRiskTabKey>('dashboard');
  const [selectedAlertCategory, setSelectedAlertCategory] = useState<string | undefined>(undefined);
  const [isQuickScanning, setIsQuickScanning] = useState(false);

  const openAlertsCount = riskAlerts.filter(
    (a) => a.status === 'open' || a.status === 'under_investigation'
  ).length;

  const criticalAlertsCount = riskAlerts.filter(
    (a) => a.riskLevel === 'critical' && (a.status === 'open' || a.status === 'under_investigation')
  ).length;

  const handleNavigateToAlertsWithCategory = (category?: string) => {
    setSelectedAlertCategory(category);
    setActiveSubTab('alerts');
  };

  const handleQuickScan = () => {
    setIsQuickScanning(true);
    setTimeout(() => {
      triggerDemoRiskScan('Lahore');
      setIsQuickScanning(false);
    }, 1000);
  };

  return (
    <div id="fraud-risk-center-view" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* 1. View Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
              Phase 53 Enterprise Defense
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Real-time Fleet Sentinel • GPS & Financial Integrity
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7 text-rose-600" />
            Fraud, Anti-Abuse & Risk Control Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
            Centralized intelligence hub monitoring spoofed telemetry, ghost rides, voucher farming, fare tampering, and high-vigilance fleet entities across all Pakistani operations.
          </p>
        </div>

        {/* Sentinel Live Scanner Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleQuickScan}
            disabled={isQuickScanning}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold rounded-2xl transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-amber-400 ${isQuickScanning ? 'animate-spin' : ''}`} />
            {isQuickScanning ? 'Sentinel Scanning Fleet...' : 'Live Sentinel Radar'}
          </button>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          id="btn-subtab-risk-dashboard"
          type="button"
          onClick={() => {
            setSelectedAlertCategory(undefined);
            setActiveSubTab('dashboard');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'dashboard'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          Risk Dashboard
        </button>

        <button
          id="btn-subtab-risk-alerts"
          type="button"
          onClick={() => {
            setSelectedAlertCategory(undefined);
            setActiveSubTab('alerts');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'alerts'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Alerts & Incidents Queue
          {openAlertsCount > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                criticalAlertsCount > 0
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-900 text-white'
              }`}
            >
              {openAlertsCount}
            </span>
          )}
        </button>

        <button
          id="btn-subtab-risk-rules"
          type="button"
          onClick={() => {
            setSelectedAlertCategory(undefined);
            setActiveSubTab('rules');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'rules'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-4 h-4" />
          Autonomous Defense Rules ({riskRules.length})
        </button>

        <button
          id="btn-subtab-risk-watchlist"
          type="button"
          onClick={() => {
            setSelectedAlertCategory(undefined);
            setActiveSubTab('watchlist');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'watchlist'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-4 h-4" />
          Vigilance Watchlist ({riskWatchlist.length})
        </button>
      </div>

      {/* 3. Subtab Content */}
      <div id="risk-active-subtab-container">
        {activeSubTab === 'dashboard' && (
          <RiskDashboardTab
            onNavigateToAlerts={handleNavigateToAlertsWithCategory}
            onNavigateToRules={() => setActiveSubTab('rules')}
            onNavigateToWatchlist={() => setActiveSubTab('watchlist')}
          />
        )}

        {activeSubTab === 'alerts' && (
          <RiskAlertsTab initialCategory={selectedAlertCategory} />
        )}

        {activeSubTab === 'rules' && <RiskRulesTab />}

        {activeSubTab === 'watchlist' && <RiskWatchlistTab />}
      </div>
    </div>
  );
};
