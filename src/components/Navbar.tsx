import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { TRANSLATIONS } from '../utils/i18n';
import {
  isFirebaseConfigured,
  getStoredDataSourceMode,
  getFirebaseInstance
} from '../services/firebase/firebaseConfig';
import { getDataSourceConfig } from '../services/backend/dataSourceConfig';
import {
  getCentralDataSourceMode,
  validateProductionConfig,
  DATA_SOURCE_CHANGED_EVENT
} from '../config/dataSourceMode';
import { FirebaseConnectionModal } from './FirebaseConnectionModal';
import { EndToEndFlowAuditModal } from './operations/EndToEndFlowAuditModal';
import {
  Search,
  Globe,
  Bell,
  Menu,
  CheckCircle2,
  MapPin,
  ChevronRight,
  Radio,
  ExternalLink,
  Database,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const {
    language,
    setLanguage,
    searchQuery,
    verifications = [],
    safetyIncidents = [],
    payouts = [],
    complaints = [],
    rides = [],
    selectedCityFilter,
    setSelectedCityFilter,
    setActiveTab,
    setIsGlobalSearchOpen,
    notifications = [],
    cities = []
  } = useAdmin();

  const [showNotifications, setShowNotifications] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isE2EModalOpen, setIsE2EModalOpen] = useState(false);
  const [centralMode, setCentralMode] = useState<string>(() => getCentralDataSourceMode());

  useEffect(() => {
    const handleModeChange = () => {
      setCentralMode(getCentralDataSourceMode());
    };
    window.addEventListener(DATA_SOURCE_CHANGED_EVENT, handleModeChange);
    return () => window.removeEventListener(DATA_SOURCE_CHANGED_EVENT, handleModeChange);
  }, []);

  const t = TRANSLATIONS[language];
  const fbInstance = getFirebaseInstance();
  const isFbLive = !fbInstance.isDemo;

  // Actionable counts & Live stats
  const activeLiveRidesCount = (rides || []).filter(
    (r) => r.status === 'in_progress' || r.status === 'driver_assigned' || r.status === 'arrived' || r.status === 'searching'
  ).length;
  const unreadNotifsCount = (notifications || []).filter((n) => !n.read).length;
  const pendingVerificationsCount = (verifications || []).filter((v) => v.status === 'pending').length;
  const activeSafetyCount = (safetyIncidents || []).filter((s) => s.status === 'active').length;
  const pendingPayoutsCount = (payouts || []).filter((p) => p.status === 'pending').length;
  const openComplaintsCount = (complaints || []).filter((c) => c.status === 'open').length;
  const totalAlerts = unreadNotifsCount > 0 ? unreadNotifsCount : (pendingVerificationsCount + activeSafetyCount + pendingPayoutsCount + openComplaintsCount);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 text-slate-900 shadow-xs select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Hamburger Menu Button + Branding */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 text-slate-600 hover:text-slate-950 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            aria-label="Toggle Navigation & Admin Profile"
            title="Open Menu & Admin Profile"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 cursor-pointer select-none group"
            title="GoLife Taxi Control Center"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-400 border border-amber-500/40 flex items-center justify-center font-black text-slate-950 text-base shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              G
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-black tracking-tight text-base text-slate-950">
                  Go<span className="text-amber-500">Life</span> Taxi
                </span>
                <span className="bg-amber-100 text-amber-950 text-[9px] font-black px-1.5 py-0.2 rounded border border-amber-300">
                  PAKISTAN
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5 tracking-tight">
                Move Freely. Live Fully.
              </div>
            </div>
          </div>
        </div>

        {/* Center: Consolidated Compact Control Center Pill + Quick Search */}
        <div className="flex items-center gap-2 flex-1 max-w-xl mx-1 sm:mx-3 justify-center">
          {/* Compact Control Center Indicator */}
          <div
            onClick={() => setActiveTab('live_rides')}
            className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition shadow-2xs shrink-0"
            title="Control Center: Click to view Live Dispatch Operations"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1">
              <span>Control Center</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700">{activeLiveRidesCount} Live</span>
            </span>
          </div>

          {/* Quick Search */}
          <div
            onClick={() => setIsGlobalSearchOpen(true)}
            className="relative w-full max-w-xs flex items-center cursor-pointer group"
          >
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-amber-600 transition" />
            <input
              type="text"
              readOnly
              value={searchQuery}
              placeholder={t.searchPlaceholder || "Search rides, drivers, tickets... (Ctrl+K)"}
              className="w-full pl-8 pr-12 py-1 text-xs rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 border border-slate-200 group-hover:border-amber-400 cursor-pointer transition select-none shadow-2xs"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center">
              <kbd className="px-1.5 py-0.2 text-[9px] font-mono font-semibold text-slate-400 bg-white border border-slate-200 rounded">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right: Demo Mode Pill + City Dropdown + Notifications Bell + Language */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Small non-disruptive status indicator: DEMO MODE or PRODUCTION MODE */}
          {(() => {
            const isProd = centralMode === 'PRODUCTION';
            const validation = validateProductionConfig();
            return (
              <button
                type="button"
                onClick={() => setIsFirebaseModalOpen(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer border transition shadow-2xs hover:scale-102 shrink-0 ${
                  isProd
                    ? (validation.isValid
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-rose-50 border-rose-300 text-rose-800')
                    : 'bg-amber-50/80 border-amber-300/80 text-amber-950'
                }`}
                title={
                  isProd
                    ? (validation.isValid
                        ? `PRODUCTION MODE — Connected to ${validation.projectId}`
                        : `PRODUCTION MODE — Missing configuration: ${validation.missingKeys.join(', ')}`)
                    : 'DEMO MODE — Operating safely with local simulated datasets'
                }
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isProd
                      ? (validation.isValid ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse')
                      : 'bg-amber-500'
                  }`}
                />
                <span className="font-extrabold tracking-tight">
                  {isProd ? 'PRODUCTION MODE' : 'DEMO MODE'}
                </span>
                <Database className="w-2.5 h-2.5 text-slate-400 hidden sm:inline" />
              </button>
            );
          })()}

          {/* E2E Flow Audit & Simulator Button */}
          <button
            type="button"
            onClick={() => setIsE2EModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500/40 cursor-pointer transition shadow-2xs hover:scale-102 shrink-0"
            title="Passenger ↔ Driver ↔ Admin E2E Flow Audit & Simulator"
          >
            <Sparkles className="w-3 h-3 text-slate-950" />
            <span className="hidden sm:inline">E2E Flow Audit</span>
            <span className="sm:hidden">Audit</span>
          </button>

          {/* Global City Dropdown */}
          <div className="relative flex items-center">
            <MapPin className="w-3 h-3 text-amber-600 absolute left-2 pointer-events-none" />
            <select
              value={selectedCityFilter}
              onChange={(e) => setSelectedCityFilter(e.target.value)}
              className="pl-6 pr-2 py-1 text-xs font-bold rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer shadow-2xs transition max-w-[140px] sm:max-w-[170px] truncate"
              title="Filter by City"
            >
              <option value="All">{t.allCities || 'All Cities'}</option>
              <optgroup label="Active Operations">
                {(cities || [])
                  .filter((c) => c.status === 'active' || (c.active && c.status !== 'coming_soon' && c.status !== 'temporarily_suspended'))
                  .map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} {c.cityCode ? `(${c.cityCode})` : ''}
                    </option>
                  ))}
              </optgroup>
              {(cities || []).some((c) => c.status === 'coming_soon' || c.status === 'temporarily_suspended') && (
                <optgroup label="Upcoming / Paused">
                  {(cities || [])
                    .filter((c) => c.status === 'coming_soon' || c.status === 'temporarily_suspended')
                    .map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.status === 'coming_soon' ? 'Coming Soon' : 'Paused'})
                      </option>
                    ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Real-time Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
              aria-label="Notification Center"
              title="Notification Center & Operational Alerts"
            >
              <Bell className="w-4 h-4" />
              {totalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl p-3 z-50 text-slate-900">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-amber-500" />
                    <span>Communications</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('notifications');
                      setShowNotifications(false);
                    }}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Center</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100 mt-1 max-h-72 overflow-y-auto">
                  {notifications.slice(0, 4).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        setActiveTab('notifications');
                        setShowNotifications(false);
                      }}
                      className={`p-2 hover:bg-amber-50/50 rounded-xl cursor-pointer transition text-xs ${
                        !notif.read ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 truncate max-w-[190px]">
                          {notif.title}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {notif.sentAt?.split(' ')[1] || 'Today'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {notif.message}
                      </p>
                    </div>
                  ))}

                  {notifications.length === 0 && (
                    <div className="py-6 text-center text-xs text-slate-500 flex flex-col items-center gap-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span>All notification queues cleared!</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('notifications');
                      setShowNotifications(false);
                    }}
                    className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-amber-400 hover:text-slate-950 text-xs font-bold text-slate-800 transition cursor-pointer text-center"
                  >
                    View All Notifications & Dispatch Composer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bilingual Switcher */}
          <button
            type="button"
            onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
            className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-amber-50/60 transition cursor-pointer shadow-2xs"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[11px] font-bold">{language === 'en' ? 'اردو' : 'EN'}</span>
          </button>
        </div>
      </div>

      {/* Backend / Data Source Configuration Modal */}
      <FirebaseConnectionModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />

      {/* End-to-End Flow Audit & Simulator Modal */}
      <EndToEndFlowAuditModal
        isOpen={isE2EModalOpen}
        onClose={() => setIsE2EModalOpen(false)}
      />
    </header>
  );
};
