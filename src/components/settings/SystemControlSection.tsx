import React, { useState } from 'react';
import {
  SystemControlSettings,
  SystemMaintenanceScope
} from '../../types';
import {
  Building2,
  Phone,
  Globe2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Save,
  CheckCircle2,
  RotateCcw,
  Flame,
  Power,
  Lock,
  Mail,
  MessageSquare,
  Sparkles,
  Database,
  Radio,
  Trash2,
  CreditCard,
  Smartphone
} from 'lucide-react';
import { getDataSourceConfig } from '../../services/backend/dataSourceConfig';
import { INITIAL_COMPANY_PAYMENT_ACCOUNTS } from '../../services/centralPaymentService';

interface SystemControlSectionProps {
  settings: SystemControlSettings;
  onUpdate: (updated: SystemControlSettings, reason: string) => void;
  onResetDemoData?: () => void;
  canEdit: boolean;
}

export const SystemControlSection: React.FC<SystemControlSectionProps> = ({
  settings,
  onUpdate,
  onResetDemoData,
  canEdit
}) => {
  const [formData, setFormData] = useState<SystemControlSettings>(settings);
  const [changeReason, setChangeReason] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (field: keyof SystemControlSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (field: keyof SystemControlSettings['supportContact'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      supportContact: {
        ...prev.supportContact,
        [field]: value
      }
    }));
  };

  const handleMaintenanceChange = (field: keyof SystemControlSettings['maintenance'], value: any) => {
    setFormData((prev) => ({
      ...prev,
      maintenance: {
        ...prev.maintenance,
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setShowConfirmModal(true);
  };

  const executeSave = () => {
    onUpdate(formData, changeReason || 'System general control parameters updated');
    setShowConfirmModal(false);
    setChangeReason('');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Save Feedback Banner */}
      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between text-xs font-semibold animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>System parameters successfully updated and broadcast across GoLife Pakistan fleet.</span>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
            Synchronized
          </span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Brand & Identity Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-300">
                <Building2 className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-900">Platform Identity & Brand Standards</h3>
                <p className="text-xs text-slate-500">
                  Global display names, official bilingual slogans, and platform head office details.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              Core Identity
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Platform Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                disabled={!canEdit}
                value={formData.platformName}
                onChange={(e) => handleChange('platformName', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-400 font-medium text-slate-900 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                App Name (Rider & Driver Displays) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                disabled={!canEdit}
                value={formData.appName}
                onChange={(e) => handleChange('appName', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-400 font-medium text-slate-900 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                English Tagline
              </label>
              <input
                type="text"
                disabled={!canEdit}
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-400 font-medium text-slate-900 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Urdu Tagline (اردو نعرہ)
              </label>
              <input
                type="text"
                dir="rtl"
                disabled={!canEdit}
                value={formData.taglineUrdu}
                onChange={(e) => handleChange('taglineUrdu', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-400 font-semibold text-slate-900 disabled:opacity-60"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">
                Head Office Address (Pakistan Registration)
              </label>
              <input
                type="text"
                disabled={!canEdit}
                value={formData.supportContact.headOfficeAddress}
                onChange={(e) => handleContactChange('headOfficeAddress', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-400 font-medium text-slate-900 disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* 2. Official Contact & Emergency Desks */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-blue-100 text-blue-900 border border-blue-300">
                <Phone className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-900">Official Helplines & Emergency Bridges</h3>
                <p className="text-xs text-slate-500">
                  UAN Call Center, WhatsApp automated gateway, and direct Police 15 incident desks.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Emergency Integrated
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                UAN Customer Helpline (Pakistan) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                disabled={!canEdit}
                value={formData.supportContact.helplineUan}
                onChange={(e) => handleContactChange('helplineUan', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-400 font-medium text-slate-900 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Police 15 & Emergency Rescue Bridge <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                disabled={!canEdit}
                value={formData.supportContact.emergencyHelpline}
                onChange={(e) => handleContactChange('emergencyHelpline', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/40 focus:bg-white focus:ring-1 focus:ring-rose-400 font-semibold text-rose-950 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                WhatsApp Business Support Number
              </label>
              <input
                type="text"
                disabled={!canEdit}
                value={formData.supportContact.whatsapp}
                onChange={(e) => handleContactChange('whatsapp', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-400 font-medium text-slate-900 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Support Email Address
              </label>
              <input
                type="email"
                disabled={!canEdit}
                value={formData.supportContact.email}
                onChange={(e) => handleContactChange('email', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-400 font-medium text-slate-900 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Safety & Compliance Email Address
              </label>
              <input
                type="email"
                disabled={!canEdit}
                value={formData.supportContact.safetyEmail}
                onChange={(e) => handleContactChange('safetyEmail', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-400 font-medium text-slate-900 disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* 3. Regional & Currency Standards */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300">
                <Globe2 className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-900">Regional, Currency & Units Standard</h3>
                <p className="text-xs text-slate-500">
                  Default currency (PKR), distance units (km), time zone, and language configurations.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              National Standard
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Operating Country</label>
              <input
                type="text"
                disabled
                value={formData.defaultCountry}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 font-bold text-slate-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Currency Code & Symbol</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  disabled
                  value={formData.defaultCurrency}
                  className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 font-bold text-slate-700 cursor-not-allowed"
                />
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.defaultCurrencySymbol}
                  onChange={(e) => handleChange('defaultCurrencySymbol', e.target.value)}
                  className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Primary System Timezone</label>
              <input
                type="text"
                disabled
                value={formData.timezone}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 font-medium text-slate-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Distance Unit</label>
              <select
                disabled={!canEdit}
                value={formData.distanceUnit}
                onChange={(e) => handleChange('distanceUnit', e.target.value as 'km' | 'miles')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900"
              >
                <option value="km">Kilometers (km) — Pakistan Standard</option>
                <option value="miles">Miles (mi)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Platform Operating Mode & Maintenance Switch */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2.5">
              <span className={`p-2 rounded-xl border ${formData.maintenance.enabled ? 'bg-amber-100 text-amber-900 border-amber-400' : 'bg-slate-100 text-slate-800 border-slate-300'}`}>
                <Power className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-900">Platform Maintenance & Status Control</h3>
                <p className="text-xs text-slate-500">
                  Execute controlled platform maintenance, display bilingual banners, and set admin bypass rules.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                formData.maintenance.enabled
                  ? 'bg-amber-100 text-amber-900 border border-amber-400 animate-pulse'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              }`}>
                {formData.maintenance.enabled ? 'Maintenance Active' : 'Live Platform'}
              </span>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span>Maintenance Mode Master Switch</span>
                  {formData.maintenance.enabled && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  )}
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  When enabled, affected mobile apps display maintenance notice and prevent new bookings.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  disabled={!canEdit}
                  onClick={() => handleMaintenanceChange('enabled', !formData.maintenance.enabled)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 ${
                    formData.maintenance.enabled
                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-xs'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{formData.maintenance.enabled ? 'Disable Maintenance' : 'Activate Maintenance'}</span>
                </button>
              </div>
            </div>

            {formData.maintenance.enabled && (
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Maintenance Scope</label>
                    <select
                      disabled={!canEdit}
                      value={formData.maintenance.scope}
                      onChange={(e) => handleMaintenanceChange('scope', e.target.value as SystemMaintenanceScope)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white font-bold text-slate-900"
                    >
                      <option value="all">Entire Platform (Passenger & Driver Apps)</option>
                      <option value="passenger_app">Passenger Booking App Only</option>
                      <option value="driver_app">Driver Dispatch App Only</option>
                      <option value="admin_panel">Administrative Portal Only</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        disabled={!canEdit}
                        checked={formData.maintenance.adminBypassAllowed}
                        onChange={(e) => handleMaintenanceChange('adminBypassAllowed', e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                      />
                      <span>Allow Super Admins to bypass maintenance screen</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">English Notice Message</label>
                    <textarea
                      rows={2}
                      disabled={!canEdit}
                      value={formData.maintenance.message}
                      onChange={(e) => handleMaintenanceChange('message', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Urdu Notice Message (اردو پیغام)</label>
                    <textarea
                      rows={2}
                      dir="rtl"
                      disabled={!canEdit}
                      value={formData.maintenance.messageUrdu}
                      onChange={(e) => handleMaintenanceChange('messageUrdu', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white font-medium text-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Backend Connection (Compact Architecture Info) */}
        {(() => {
          const dsConfig = getDataSourceConfig();
          return (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
                    <Database className="w-4 h-4 text-amber-600" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Backend Connection</h3>
                    <p className="text-xs text-slate-500">
                      Central data source architecture and future production synchronization
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-950 border border-amber-300">
                  {dsConfig.activeModeLabel}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Mode</div>
                  <div className="font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>DEMO</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Firebase Status</div>
                  <div className="font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>{dsConfig.isFirebaseReady ? 'Configured' : 'Not Configured'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Production Firebase</div>
                  <div className="font-extrabold text-emerald-700 mt-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ready to Configure</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic pt-1">
                Note: Demo Mode operates with zero external secrets. Production Firebase will be seamlessly attached via environment configuration after final mobile app testing.
              </p>
            </div>
          );
        })()}

        {/* Telecommunications, Gateway Connectivity & Emergency Bridge */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <Radio className="w-4 h-4 text-emerald-600" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">National Gateways & Telecommunications Status</h3>
                <p className="text-xs text-slate-500">
                  SMS shortcode routes, 1Link Raast payment rails, and Police 15 Safe Cities integration
                </p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-950 border border-emerald-300">
              Operational Live
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">SMS Gateway</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                <span>Jazz / Zong (9444)</span>
              </div>
              <p className="text-[10px] text-slate-500">Passenger OTP & Driver Dispatch SMS alerts active</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Payment Rails</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                <span>1Link Raast / Wallets</span>
              </div>
              <p className="text-[10px] text-slate-500">Instant driver payouts & passenger digital collections</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Safe Cities PSCA</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Police 15 Telemetry Bridge</span>
              </div>
              <p className="text-[10px] text-slate-500">Lahore PSCA & Sindh 15 SOS telemetry webhook linked</p>
            </div>
          </div>
        </div>

        {/* Corporate Receiving Payment Accounts */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-900">
                <Building2 className="w-4 h-4 text-amber-700" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">GoLife Corporate Payment Receiving Accounts</h3>
                <p className="text-xs text-slate-500">
                  Designated channels where captains submit commission settlements & top-ups
                </p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
              {INITIAL_COMPANY_PAYMENT_ACCOUNTS.length} Active Channels
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 text-xs">
            {INITIAL_COMPANY_PAYMENT_ACCOUNTS.map((acc) => (
              <div key={acc.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wide">{acc.provider}</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {acc.status}
                  </span>
                </div>
                <div className="font-bold text-slate-800 truncate text-[11px]">{acc.accountTitle}</div>
                <div className="font-mono text-[10px] text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">
                  {acc.tillNumber ? `Till: ${acc.tillNumber}` : acc.accountNumber || acc.iban}
                </div>
                <p className="text-[9px] text-slate-400 truncate">{acc.accountType}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-500">
            Last updated by: <span className="font-bold text-slate-800">{settings.updatedBy}</span> ({settings.lastUpdated})
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onResetDemoData && (
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-xs font-bold text-rose-700 transition cursor-pointer flex items-center gap-1.5"
                title="Reset all browser simulation data to initial defaults"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Reset Demo Store Data</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setFormData(settings)}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard Changes</span>
            </button>

            <button
              type="submit"
              disabled={!canEdit}
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black transition cursor-pointer shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </div>
      </form>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <span className="p-2.5 rounded-xl bg-rose-100 text-rose-800">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-black text-slate-900 text-sm">Reset Demo Store Data?</h4>
                <p className="text-xs text-slate-500">Restore factory simulation state</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This will restore initial mock passengers, rides, tariffs, driver wallet records, and configuration policies. All changes created in this browser session will be re-initialized.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  onResetDemoData?.();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs"
              >
                Yes, Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <span className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-black text-slate-900 text-sm">Confirm System Settings Update</h4>
                <p className="text-xs text-slate-500">Sensitive operational action</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are about to modify global platform parameters. These changes will be committed with a version record and logged to the administrative audit trail.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason / Justification for Change <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Updated UAN helpline after telecom routing migration"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeSave}
                disabled={!changeReason.trim()}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black shadow-xs disabled:opacity-50"
              >
                Authorize & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
