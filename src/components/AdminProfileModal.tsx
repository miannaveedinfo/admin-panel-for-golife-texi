import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  User,
  Shield,
  Settings,
  Bell,
  LogOut,
  X,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Smartphone,
  Eye,
  EyeOff
} from 'lucide-react';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'profile' | 'settings' | 'security' | 'notifications';
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'profile'
}) => {
  const { currentAdmin, logout, showToast, language, setLanguage } = useAdmin();
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'settings' | 'security' | 'notifications'>(initialTab);

  // Security Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Notification Preferences
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsUrgentAlerts, setSmsUrgentAlerts] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setActiveSubTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen || !currentAdmin) return null;

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('Please enter both current and new password', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    showToast('Admin password updated successfully. Next login will require updated credentials.', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSavePreferences = () => {
    showToast('Admin preferences and notification thresholds saved.', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 border border-amber-500/40 text-slate-950 font-black text-sm flex items-center justify-center shadow-xs">
              {currentAdmin.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  {currentAdmin.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-950 border border-amber-300">
                  {currentAdmin.role.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500">{currentAdmin.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-4 sm:px-6 bg-white overflow-x-auto no-scrollbar text-xs font-bold gap-1">
          <button
            type="button"
            onClick={() => setActiveSubTab('profile')}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'profile'
                ? 'border-amber-500 text-slate-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>View Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('settings')}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'settings'
                ? 'border-amber-500 text-slate-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Account Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('security')}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'security'
                ? 'border-amber-500 text-slate-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Security & 2FA</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('notifications')}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'notifications'
                ? 'border-amber-500 text-slate-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Notification Prefs</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs text-slate-700">
          {/* 1. VIEW PROFILE */}
          {activeSubTab === 'profile' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Administrative Personnel Dossier
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold">Admin Full Name</span>
                    <span className="font-bold text-slate-900">{currentAdmin.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold">Official Email</span>
                    <span className="font-bold text-slate-900">{currentAdmin.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold">Assigned Role</span>
                    <span className="font-bold text-amber-700 uppercase">{currentAdmin.role.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold">Status</span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active & Authorized
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold">Operating Headquarters</span>
                    <span className="font-bold text-slate-900">GoLife Command Center, Lahore PK</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold">Current Shift</span>
                    <span className="font-bold text-slate-900">General Operations (PKT GMT+5)</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-800">
                <div className="flex items-center gap-1.5 font-bold text-amber-950 mb-1">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Access Privileges & Security Scope</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  You possess full supervisory privileges across the GoLife Taxi fleet in Pakistan, including Driver Verification, Fare Tariff overrides, Live Dispatch intervention, Passenger Refunds, and Central Case Management.
                </p>
              </div>
            </div>
          )}

          {/* 2. ACCOUNT SETTINGS */}
          {activeSubTab === 'settings' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  System Interface Language
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition ${
                      language === 'en'
                        ? 'border-amber-400 bg-amber-50 text-amber-950 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>English (International)</span>
                    {language === 'en' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setLanguage('ur')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition ${
                      language === 'ur'
                        ? 'border-amber-400 bg-amber-50 text-amber-950 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-urdu text-sm">اردو (Urdu PK)</span>
                    {language === 'ur' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Administrative Timezone
                </label>
                <input
                  type="text"
                  readOnly
                  value="Asia/Karachi (PKT - Pakistan Standard Time GMT+5)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-medium cursor-not-allowed"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-xs">High Density Operations View</div>
                  <div className="text-[11px] text-slate-500">Compact padding for dispatchers & support leads</div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-300 text-amber-500 focus:ring-amber-400 h-4 w-4"
                />
              </div>
            </div>
          )}

          {/* 3. SECURITY & 2FA */}
          {activeSubTab === 'security' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-5 h-5 text-amber-600" />
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Two-Factor Authentication (2FA)</div>
                    <div className="text-[11px] text-slate-500">Enforces OTP confirmation for sensitive financial transactions</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    showToast(
                      !twoFactorEnabled ? '2FA Enabled via SMS/Authenticator' : '2FA Temporarily Disabled',
                      'info'
                    );
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    twoFactorEnabled
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {/* Password update */}
              <form onSubmit={handlePasswordUpdate} className="space-y-3 pt-1">
                <div className="text-xs font-bold text-slate-900">Change Admin Password</div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      New Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Hide password' : 'Show password'}</span>
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 4. NOTIFICATION PREFERENCES */}
          {activeSubTab === 'notifications' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-xs">Urgent Safety & SOS Push Alerts</div>
                  <div className="text-[11px] text-slate-500">Real-time alerts for high-priority incidents</div>
                </div>
                <input
                  type="checkbox"
                  checked={smsUrgentAlerts}
                  onChange={(e) => setSmsUrgentAlerts(e.target.checked)}
                  className="rounded border-slate-300 text-amber-500 focus:ring-amber-400 h-4 w-4 cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-xs">Email Dispatches & Escalation Notices</div>
                  <div className="text-[11px] text-slate-500">Sent when a support case is assigned or escalated</div>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="rounded border-slate-300 text-amber-500 focus:ring-amber-400 h-4 w-4 cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-xs">Operational Sound & Chime Alerts</div>
                  <div className="text-[11px] text-slate-500">Audible ping when new cases or SOS are lodged</div>
                </div>
                <input
                  type="checkbox"
                  checked={soundAlerts}
                  onChange={(e) => setSoundAlerts(e.target.checked)}
                  className="rounded border-slate-300 text-amber-500 focus:ring-amber-400 h-4 w-4 cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-xs">Daily Fleet Performance Digest</div>
                  <div className="text-[11px] text-slate-500">Summary email every morning at 08:00 PKT</div>
                </div>
                <input
                  type="checkbox"
                  checked={dailyDigest}
                  onChange={(e) => setDailyDigest(e.target.checked)}
                  className="rounded border-slate-300 text-amber-500 focus:ring-amber-400 h-4 w-4 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:px-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              logout();
              onClose();
            }}
            className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSavePreferences}
              className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-extrabold transition cursor-pointer shadow-xs"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
