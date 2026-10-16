import React, { useState, useEffect, useRef } from 'react';
import { useAdmin, AdminTab } from '../context/AdminContext';
import { TRANSLATIONS } from '../utils/i18n';
import { isFirebaseConfigured } from '../services/firebase/firebaseConfig';
import { AdminProfileModal } from './AdminProfileModal';
import {
  LayoutDashboard,
  Users,
  Car,
  UserCheck,
  Radio,
  Clock,
  Sliders,
  Wallet,
  Tag,
  Truck,
  GraduationCap,
  BarChart3,
  Settings,
  ShieldCheck,
  X,
  Database,
  ShieldAlert,
  Shield,
  Sparkles,
  Bell,
  LogOut,
  ChevronDown,
  User,
  DollarSign,
  Building2,
  Headphones,
  Lock,
  AlertTriangle
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    activeTab,
    setActiveTab,
    language,
    rides = [],
    verifications = [],
    safetyIncidents = [],
    payouts = [],
    complaints = [],
    cases = [],
    notifications = [],
    fraudAlerts = [],
    riskAlerts = [],
    currentAdmin,
    logout,
    isAuthorizedForTab,
    canAccessTab,
    showToast
  } = useAdmin();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<'profile' | 'settings' | 'security' | 'notifications' | null>(null);

  const t = TRANSLATIONS[language];
  const isFbLive = isFirebaseConfigured();

  const profileSectionRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setShowProfileMenu(false);
    }
  }, [isOpen]);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showProfileMenu &&
        profileSectionRef.current &&
        !profileSectionRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  // Escape key to close profile dropdown or drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showProfileMenu) {
          setShowProfileMenu(false);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, showProfileMenu]);

  // Real-time operational badges calculation
  const activeLiveRidesCount = (rides || []).filter(
    (r) => r.status === 'in_progress' || r.status === 'driver_assigned' || r.status === 'arrived' || r.status === 'searching'
  ).length;
  const pendingVerificationsCount = (verifications || []).filter((v) => v.status === 'pending').length;
  const activeSafetyCount = (safetyIncidents || []).filter((s) => s.status === 'active').length;
  const pendingPayoutsCount = (payouts || []).filter((p) => p.status === 'pending').length;
  const openComplaintsCount = (complaints || []).filter((c) => c.status === 'open').length;
  const activeCasesCount = (cases || []).filter(
    (c) => c.status === 'open' || c.status === 'escalated' || c.status === 'new' || c.status === 'under_review'
  ).length;
  const unreadNotifsCount = (notifications || []).filter((n) => !n.read).length;
  const pendingFraudAlertsCount = (fraudAlerts || []).filter((f) => f.status === 'pending_review').length;
  const openRiskAlertsCount = (riskAlerts || []).filter((r) => r.status === 'open' || r.status === 'under_investigation').length;

  interface NavItem {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }

  // Phase 48 Strict Drawer Navigation Structure
  // 1. Dashboard
  // 2. Drivers
  // 3. Passengers
  // 4. Rides
  // 5. Live Operations
  // 6. Payments & Earnings
  // 7. Verification
  // 8. Complaints & Safety
  // 9. Reports
  // 3. MAIN NAVIGATION (Exact 16 items required by Phase 61-A)
  const primaryNavItems: NavItem[] = [
    { id: 'dashboard', label: t.dashboard || 'Dashboard', icon: LayoutDashboard },
    { id: 'drivers', label: t.drivers || 'Drivers', icon: Car },
    { id: 'passengers', label: t.passengers || 'Passengers', icon: Users },
    { id: 'rides', label: t.rides || 'Rides', icon: Clock },
    {
      id: 'live_rides',
      label: language === 'ur' ? 'لائیو آپریشنز' : 'Live Operations',
      icon: Radio,
      badge: activeLiveRidesCount,
      badgeColor: 'bg-emerald-500 text-slate-950 font-black'
    },
    {
      id: 'wallets',
      label: language === 'ur' ? 'والٹ اور ادائیگیاں' : 'Wallet & Payments',
      icon: Wallet,
      badge: pendingPayoutsCount,
      badgeColor: 'bg-amber-400 text-slate-950 font-black'
    },
    {
      id: 'fares',
      label: language === 'ur' ? 'کمیشن اور کرائے' : 'Commission',
      icon: Sliders
    },
    {
      id: 'safety',
      label: language === 'ur' ? 'شکایات اور تحفظ' : 'Complaints & Safety',
      icon: ShieldAlert,
      badge: activeSafetyCount + activeCasesCount + openComplaintsCount,
      badgeColor: 'bg-rose-500 text-white font-black animate-pulse'
    },
    {
      id: 'verification',
      label: t.verification || 'Verification',
      icon: UserCheck,
      badge: pendingVerificationsCount,
      badgeColor: 'bg-amber-400 text-slate-950 font-black'
    },
    {
      id: 'promos',
      label: language === 'ur' ? 'پروموشنز' : 'Promotions',
      icon: Tag,
      badge: pendingFraudAlertsCount,
      badgeColor: 'bg-rose-500 text-white font-black'
    },
    {
      id: 'cities',
      label: language === 'ur' ? 'شہر اور زمرہ جات' : 'Cities & Categories',
      icon: Building2
    },
    { id: 'reports', label: t.reports || 'Reports', icon: BarChart3 },
    {
      id: 'admins',
      label: language === 'ur' ? 'ایڈمن اور کردار' : 'Admin & Roles (RBAC)',
      icon: ShieldCheck
    },
    {
      id: 'settings',
      label: language === 'ur' ? 'سیٹنگز' : 'Settings',
      icon: Settings
    },
    {
      id: 'audit_logs',
      label: language === 'ur' ? 'آڈٹ لاگز' : 'Audit Logs',
      icon: Database
    }
  ];

  // Secondary/Extended Platform Modules
  const secondaryNavItems: NavItem[] = [
    {
      id: 'complaints',
      label: language === 'ur' ? 'شکایات اور کیسز' : 'Complaints & Case Desk',
      icon: Headphones,
      badge: activeCasesCount,
      badgeColor: 'bg-amber-500 text-slate-950 font-black'
    },
    {
      id: 'support',
      label: language === 'ur' ? 'سپورٹ سینٹر' : 'Support Ticket Center',
      icon: Headphones
    },
    {
      id: 'freight',
      label: language === 'ur' ? 'فریٹ اور کارگو' : 'Freight & Cargo Hub',
      icon: Building2
    },
    {
      id: 'fraud_risk',
      label: language === 'ur' ? 'فراڈ اور رسک' : 'Fraud & Risk Center',
      icon: AlertTriangle,
      badge: openRiskAlertsCount,
      badgeColor: 'bg-rose-600 text-white font-black'
    },
    {
      id: 'notifications',
      label: language === 'ur' ? 'اطلاعات' : 'Notifications',
      icon: Bell,
      badge: unreadNotifsCount,
      badgeColor: 'bg-rose-500 text-white font-black'
    },
    { id: 'academy', label: 'Drivers Academy', icon: GraduationCap },
    { id: 'loans', label: 'Driver Welfare Loans', icon: DollarSign },
    { id: 'driver_earnings', label: 'Driver Earnings & Risk', icon: DollarSign },
    { id: 'ai_assistant', label: 'AI Intelligence Desk', icon: Sparkles }
  ];

  const handleNavigate = (tabId: AdminTab, label: string) => {
    const isAllowed = canAccessTab ? canAccessTab(tabId) : isAuthorizedForTab(tabId);
    if (!isAllowed) {
      showToast(`Access Restricted: ${currentAdmin?.roleTitle || 'Current role'} does not have permission to access ${label}`, 'error');
      return;
    }
    setActiveTab(tabId);
    onClose();
  };

  const openProfileTab = (tab: 'profile' | 'settings' | 'security' | 'notifications') => {
    setProfileModalTab(tab);
    setShowProfileMenu(false);
  };

  return (
    <>
      {/* Backdrop for mobile & desktop drawer overlay */}
      {isOpen && (
        <div
          id="sidebar-drawer-backdrop"
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs z-40 transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Drawer Container */}
      <aside
        id="golife-hamburger-drawer"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-[#0B132B] border-r border-slate-800 text-slate-100 flex flex-col transition-transform duration-300 ease-out select-none shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* ========================================================
            TOP COMPACT ADMIN PROFILE SECTION
            - Styled in dark navy with GoLife Taxi gold accents
            - Kept inside hamburger drawer
           ======================================================== */}
        <div
          ref={profileSectionRef}
          className="p-3 sm:p-3.5 border-b border-slate-800 bg-[#0F172A] relative select-none"
        >
          <div className="flex items-center justify-between gap-2">
            {/* Compact Admin Profile Section (Trigger) */}
            <div
              id="admin-profile-trigger"
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1 group rounded-xl p-1 -m-1 hover:bg-slate-800/60 transition-colors"
              title="Click to view Profile, Role, Status & Settings"
            >
              {/* Profile Icon / Avatar */}
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-xl bg-amber-400 border border-amber-500/50 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform overflow-hidden">
                  {currentAdmin?.avatar ? (
                    <img
                      src={currentAdmin.avatar}
                      alt={currentAdmin?.name || 'Admin'}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{currentAdmin?.name ? currentAdmin.name.charAt(0).toUpperCase() : 'M'}</span>
                  )}
                </div>
                {/* Account Status Indicator */}
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0F172A] rounded-full ring-1 ring-emerald-600/30"
                  title="Account Status: Active"
                />
              </div>

              {/* Profile Info: Name, Email, Role */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 leading-tight">
                  <h4 className="text-xs font-black text-white truncate group-hover:text-amber-400 transition-colors">
                    {currentAdmin?.name || 'Muhammad Tariq Khan'}
                  </h4>
                </div>
                <div className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                  {currentAdmin?.email || 'admin@golife.pk'}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="px-1.5 py-0.2 rounded text-[8.5px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 inline-flex items-center">
                    {currentAdmin?.role?.replace('_', ' ') || 'SUPER ADMIN'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[8.5px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                  </span>
                </div>
              </div>

              {/* Chevron Dropdown Indicator */}
              <div className="p-1 text-slate-400 group-hover:text-amber-400 transition-colors shrink-0">
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    showProfileMenu ? 'rotate-180 text-amber-400' : ''
                  }`}
                />
              </div>
            </div>

            {/* Single Close Button for the drawer */}
            <button
              id="close-hamburger-drawer-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition cursor-pointer shrink-0 ml-1"
              aria-label="Close navigation drawer"
              title="Close drawer (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Dropdown Options Menu */}
          {showProfileMenu && (
            <div
              id="admin-profile-dropdown-menu"
              className="mt-2.5 pt-2 border-t border-slate-800 space-y-1 text-xs animate-in fade-in slide-in-from-top-1 duration-150 bg-[#0B132B] p-2 rounded-xl border border-slate-800/80"
            >
              {/* View Profile */}
              <button
                id="profile-action-view"
                type="button"
                onClick={() => openProfileTab('profile')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-amber-400 transition font-medium flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold">View Profile</span>
                </div>
                <span className="text-[10px] text-slate-400">Dossier</span>
              </button>

              {/* Admin Role */}
              <button
                id="profile-action-role"
                type="button"
                onClick={() => openProfileTab('profile')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-amber-400 transition font-medium flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Role</span>
                </div>
                <span className="text-[10px] font-black text-amber-300 bg-amber-400/20 px-1.5 py-0.2 rounded border border-amber-400/40">
                  {currentAdmin?.roleTitle || 'SUPER ADMIN'}
                </span>
              </button>

              {/* Account Status */}
              <button
                id="profile-action-status"
                type="button"
                onClick={() => openProfileTab('profile')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-amber-400 transition font-medium flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </span>
                  <span>Account Status</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/60">
                  Active (Verified)
                </span>
              </button>

              {/* Profile Settings */}
              <button
                id="profile-action-settings"
                type="button"
                onClick={() => openProfileTab('settings')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-amber-400 transition font-medium flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Profile Settings</span>
                </div>
                <span className="text-[10px] text-slate-400">Preferences</span>
              </button>

              {/* Security & 2FA */}
              <button
                id="profile-action-security"
                type="button"
                onClick={() => openProfileTab('security')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-amber-400 transition font-medium flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Security & 2FA</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">2FA Active</span>
              </button>

              {/* Notification Preferences */}
              <button
                id="profile-action-notifications"
                type="button"
                onClick={() => openProfileTab('notifications')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-amber-400 transition font-medium flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-slate-400" />
                  <span>Notification Preferences</span>
                </div>
                <span className="text-[10px] text-slate-400">Alerts</span>
              </button>

              {/* Logout */}
              <button
                id="profile-action-signout"
                type="button"
                onClick={() => {
                  logout();
                  setShowProfileMenu(false);
                  onClose();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition font-bold flex items-center justify-between cursor-pointer border-t border-slate-800 mt-1 pt-1.5"
              >
                <div className="flex items-center gap-2">
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Logout</span>
                </div>
                <span className="text-[10px] text-rose-400">End Session</span>
              </button>
            </div>
          )}
        </div>

        {/* ========================================================
            3. MAIN NAVIGATION LIST (EXACT ORDER REQUESTED)
           ======================================================== */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Main Core Modules */}
          <div className="space-y-0.5">
            <div className="px-3 pb-1 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase select-none">
              {language === 'ur' ? 'مرکزی مینیو' : 'GO-LIFE NAVIGATION'}
            </div>

            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isAllowed = canAccessTab ? canAccessTab(item.id) : isAuthorizedForTab(item.id);

              return (
                <button
                  key={`${item.id}-${item.label}`}
                  id={`nav-item-${item.id}-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  type="button"
                  onClick={() => handleNavigate(item.id, item.label)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                      : isAllowed
                      ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      : 'text-slate-400 hover:bg-slate-900 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-slate-950' : isAllowed ? 'text-amber-400' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isAllowed && (
                      <Lock className="w-3 h-3 text-slate-400" title="Permission Required" />
                    )}
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] shrink-0 ${
                          isActive
                            ? 'bg-slate-950 text-amber-400 font-black'
                            : item.badgeColor || 'bg-amber-400 text-slate-950 font-bold'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Secondary / Advanced Management Modules */}
          <div className="space-y-0.5 pt-2 border-t border-slate-800">
            <div className="px-3 pb-1 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase select-none">
              {language === 'ur' ? 'اضافی ماڈیولز' : 'EXTENDED SERVICES'}
            </div>

            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isAllowed = canAccessTab ? canAccessTab(item.id) : isAuthorizedForTab(item.id);

              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  type="button"
                  onClick={() => handleNavigate(item.id, item.label)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                      : isAllowed
                      ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      : 'text-slate-400 hover:bg-slate-900 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-slate-950' : isAllowed ? 'text-amber-400/80' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isAllowed && (
                      <Lock className="w-3 h-3 text-slate-400" title="Permission Required" />
                    )}
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] shrink-0 ${
                          isActive
                            ? 'bg-slate-950 text-amber-400 font-black'
                            : item.badgeColor || 'bg-amber-400 text-slate-950 font-bold'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer info: Firebase Status & Version */}
        <div className="p-3 border-t border-slate-800 bg-[#0F172A] text-[10px] text-slate-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isFbLive ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
              <span className="font-bold text-slate-300">
                {isFbLive ? 'Cloud Firestore Sync' : 'Demo Local Storage'}
              </span>
            </div>
            <span className="font-mono text-amber-400/80 font-bold">GoLife v61.0</span>
          </div>
        </div>
      </aside>

      {/* Admin Profile Modal for viewing profile, settings, security & notifications */}
      {profileModalTab && (
        <AdminProfileModal
          isOpen={!!profileModalTab}
          initialTab={profileModalTab}
          onClose={() => setProfileModalTab(null)}
        />
      )}
    </>
  );
};
