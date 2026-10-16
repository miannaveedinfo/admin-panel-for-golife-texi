import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { formatPKR } from '../../utils/i18n';
import { calculateRiskSummaryMetrics } from '../../services/fraudRiskService';
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Flame,
  Sparkles,
  RefreshCw,
  MapPin,
  Car,
  Users,
  Search,
  CheckCircle2,
  DollarSign,
  Activity,
  Zap,
  ArrowRight,
  Shield
} from 'lucide-react';

interface RiskDashboardTabProps {
  onNavigateToAlerts: (filterCategory?: string) => void;
  onNavigateToRules: () => void;
  onNavigateToWatchlist: () => void;
}

export const RiskDashboardTab: React.FC<RiskDashboardTabProps> = ({
  onNavigateToAlerts,
  onNavigateToRules,
  onNavigateToWatchlist
}) => {
  const {
    riskAlerts,
    riskRules,
    riskWatchlist,
    riskAiInsights,
    triggerDemoRiskScan,
    openUniversalDetail
  } = useAdmin();

  const [isScanning, setIsScanning] = useState(false);
  const [selectedScanCity, setSelectedScanCity] = useState('Lahore');

  const metrics = calculateRiskSummaryMetrics(riskAlerts, riskRules, riskWatchlist);

  const handleRunSentinelScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      triggerDemoRiskScan(selectedScanCity);
      setIsScanning(false);
    }, 1200);
  };

  // City breakdown data
  const cityCounts: Record<string, { total: number; critical: number; financial: number }> = {};
  riskAlerts.forEach((alert) => {
    const city = alert.city || 'National';
    if (!cityCounts[city]) {
      cityCounts[city] = { total: 0, critical: 0, financial: 0 };
    }
    cityCounts[city].total += 1;
    if (alert.riskLevel === 'critical' || alert.riskLevel === 'high') {
      cityCounts[city].critical += 1;
    }
    cityCounts[city].financial += alert.financialImpactPkr || 0;
  });

  const cityEntries = Object.entries(cityCounts).sort((a, b) => b[1].total - a[1].total);

  // Category breakdown data
  const categoryCounts: Record<string, number> = {};
  riskAlerts.forEach((alert) => {
    const cat = alert.category;
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categoryLabels: Record<string, string> = {
    gps_spoofing: 'GPS Spoofing & Telemetry',
    ghost_rides: 'Ghost & Phantom Rides',
    promo_abuse: 'Voucher & Referral Abuse',
    fare_manipulation: 'Fare & Toll Padding',
    cancellation_abuse: 'Surge Cancellation Spree',
    driver_passenger_collusion: 'Driver-Passenger Collusion',
    account_takeover: 'Account Takeover / SIM Swap',
    document_fraud: 'Forged Identity / Fake CNIC',
    route_tampering: 'Detour & Route Tampering',
    fake_surge_creation: 'Artificial Surge Clusters'
  };

  const recentCriticalAlerts = riskAlerts
    .filter((a) => a.riskLevel === 'critical' || a.riskLevel === 'high')
    .slice(0, 4);

  return (
    <div id="risk-dashboard-view" className="space-y-6 text-[#111827]">
      {/* 1. Autonomous Risk Sentinel Header Widget */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-700 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Live Sentinel Engine
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Phase 53 Enterprise Defense
              </span>
              <span className="text-xs text-slate-400">
                Tracking 1,420 Active Signals / sec
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Autonomous Fraud & Anomaly Defense System
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Multi-dimensional neural heuristics monitoring GPS jump anomalies, mock location drivers, ghost ride rings, promo voucher farming, and toll padding across all Pakistani metropolitan hubs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 shrink-0">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400">Scan Geographic Focus</span>
              <select
                id="sentinel-city-selector"
                value={selectedScanCity}
                onChange={(e) => setSelectedScanCity(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-amber-400 mt-1 cursor-pointer"
              >
                <option value="Lahore">Lahore Hub</option>
                <option value="Karachi">Karachi Hub</option>
                <option value="Islamabad">Islamabad Capital</option>
                <option value="Rawalpindi">Rawalpindi Hub</option>
                <option value="Faisalabad">Faisalabad Zone</option>
                <option value="Multan">Multan Zone</option>
              </select>
            </div>

            <button
              id="btn-trigger-sentinel-scan"
              type="button"
              onClick={handleRunSentinelScan}
              disabled={isScanning}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 text-xs font-black rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap self-end sm:self-auto"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Analyzing Telemetry...' : 'Trigger Sentinel Scan'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Total Risk Alerts</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-black text-slate-950 font-mono mt-1">
            {metrics.totalAlerts}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span className="text-rose-600 font-bold">{metrics.openAlerts}</span> open & pending
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs bg-rose-50/20">
          <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider flex items-center justify-between">
            <span>Critical Anomalies</span>
            <Flame className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl font-black text-rose-700 font-mono mt-1">
            {metrics.criticalAlerts}
          </div>
          <div className="text-[11px] text-rose-600 font-semibold mt-1">
            Immediate action required
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Capital at Risk</span>
            <DollarSign className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-700 font-mono mt-1">
            {formatPKR(metrics.financialAtRiskPKR)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Under active scrutiny
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/20">
          <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center justify-between">
            <span>Fraud Mitigated</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-700 font-mono mt-1">
            {formatPKR(metrics.mitigatedLossesPKR)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Protected platform funds
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>High-Vigilance</span>
            <Shield className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-black text-blue-700 font-mono mt-1">
            {metrics.watchlistCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Captains & riders tracked
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Autonomous Rules</span>
            <Zap className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xl font-black text-purple-700 font-mono mt-1">
            {metrics.activeRulesCount} <span className="text-xs text-slate-400 font-normal">/ {riskRules.length}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Real-time enforcement
          </div>
        </div>
      </div>

      {/* 3. Main Grid: Active Urgent Threats & Geographic Anomaly Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Alerts Feed */}
        <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-950">High-Priority Risk Incidents</h3>
                <p className="text-[11px] text-slate-500">Autonomous triggers requiring investigator resolution</p>
              </div>
            </div>
            <button
              id="btn-view-all-alerts"
              type="button"
              onClick={() => onNavigateToAlerts()}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
            >
              View Full Incident Queue ({metrics.openAlerts}) &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {recentCriticalAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => onNavigateToAlerts()}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/20 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        alert.riskLevel === 'critical'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {alert.riskLevel}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {alert.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                      {categoryLabels[alert.category] || alert.category}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {alert.city} • {alert.timestamp}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition">
                    {alert.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {alert.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  {alert.financialImpactPkr ? (
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Exposure</div>
                      <div className="text-xs font-mono font-black text-rose-700">
                        {formatPKR(alert.financialImpactPkr)}
                      </div>
                    </div>
                  ) : null}

                  <div className="px-3 py-1.5 rounded-xl bg-slate-100 group-hover:bg-amber-400 group-hover:text-slate-950 transition text-slate-700 text-xs font-bold flex items-center gap-1">
                    Investigate
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* City Anomaly Breakdown & High-Risk Zones */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-black text-slate-950">Metropolitan Risk Exposure</h3>
            </div>
            <p className="text-[11px] text-slate-500">Geographic anomaly distribution across active operating hubs</p>
          </div>

          <div className="space-y-2.5 my-2">
            {cityEntries.map(([city, data]) => {
              const maxAlerts = Math.max(...cityEntries.map((c) => c[1].total), 1);
              const pct = Math.round((data.total / maxAlerts) * 100);
              return (
                <div key={city} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      {city}
                      {data.critical > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-rose-100 text-rose-700">
                          {data.critical} critical
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-slate-600 text-[11px]">
                      {data.total} alerts • {formatPKR(data.financial)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        data.critical > 1 ? 'bg-rose-500' : 'bg-amber-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between">
            <span className="font-semibold">Vigilance Watchlist Active</span>
            <button
              type="button"
              onClick={onNavigateToWatchlist}
              className="font-bold underline cursor-pointer hover:text-amber-950"
            >
              Inspect {metrics.watchlistCount} entities
            </button>
          </div>
        </div>
      </div>

      {/* 4. Categorical Breakdown & AI Intelligence Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Category Breakdown */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-black text-slate-950">Threat Vector Distribution</h3>
              </div>
              <p className="text-[11px] text-slate-500">Autonomous classification of detected risk patterns</p>
            </div>
            <button
              type="button"
              onClick={onNavigateToRules}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
            >
              Configure Defense Rules &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {Object.entries(categoryCounts).map(([catKey, count]) => (
              <div
                key={catKey}
                onClick={() => onNavigateToAlerts(catKey)}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200/80 transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    {categoryLabels[catKey] || catKey}
                  </div>
                  <div className="text-[10px] text-slate-400">Click to filter queue</div>
                </div>
                <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-slate-800">
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Copilot & Anomaly Insights */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <div>
              <h3 className="text-sm font-black text-slate-950">AI Risk Intelligence & Heuristics</h3>
              <p className="text-[11px] text-slate-500">Correlated anomaly clusters synthesized by autonomous Sentinel</p>
            </div>
          </div>

          <div className="space-y-3">
            {riskAiInsights.slice(0, 3).map((insight) => (
              <div
                key={insight.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    {insight.patternName}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                    {Math.round(insight.confidence * 100)}% confidence
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {insight.explanation}
                </p>

                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/60 text-[11px] text-amber-950 font-medium flex items-center justify-between">
                  <span>
                    <strong>Recommended Action:</strong> {insight.suggestedAction}
                  </span>
                  {insight.potentialImpactPKR && (
                    <span className="font-mono font-bold text-amber-800 shrink-0 ml-2">
                      Save {formatPKR(insight.potentialImpactPKR)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
