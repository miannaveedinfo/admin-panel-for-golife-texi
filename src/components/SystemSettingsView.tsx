import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { BackToDashboardButton } from './common/BackToDashboardButton';
import {
  Settings,
  Save,
  RotateCcw,
  Shield,
  Phone,
  DollarSign,
  AlertTriangle,
  Building,
  CheckCircle2,
  Lock,
  Smartphone,
  Flame,
  Radio,
  Clock
} from 'lucide-react';

export const SystemSettingsView: React.FC = () => {
  const { settings, updateSettings, resetAllData, showToast } = useAdmin();

  // Local state initialized with current context settings
  const [localSettings, setLocalSettings] = useState(settings);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    updateSettings(localSettings);
    setTimeout(() => {
      setIsSaving(false);
      showToast('System configuration saved and applied across Pakistan operations', 'success');
    }, 400);
  };

  const handleResetData = () => {
    resetAllData();
    setShowResetConfirm(false);
    showToast('Demo environment reset to standard initial Pakistan data', 'info');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <BackToDashboardButton variant="dark" />
              <span className="p-2.5 bg-[#0F766E]/30 border border-[#0F766E]/50 rounded-xl text-teal-300">
                <Settings className="w-6 h-6 text-[#0F766E]" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">System Configuration & Policies</h1>
                <p className="text-slate-400 text-sm">
                  Global parameters for GoLife Taxi Pakistan, tax withholding, security thresholds, and gateway integrations.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-sm font-semibold transition"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Demo Store
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0d655e] text-white text-sm font-semibold transition shadow-md shadow-[#0F766E]/20"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Applying...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* General Brand & Helpdesk Info */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
            <Building className="w-5 h-5 text-[#0F766E]" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Platform Identity & Helplines</h3>
              <p className="text-xs text-slate-500">Public contact details displayed across Passenger and Driver apps</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Application Brand Name
              </label>
              <input
                type="text"
                value={localSettings.appName}
                onChange={(e) => setLocalSettings({ ...localSettings, appName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Support Helpline (UAN)
              </label>
              <input
                type="text"
                value={localSettings.supportPhone}
                onChange={(e) => setLocalSettings({ ...localSettings, supportPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Emergency SOS Dispatch Helpline
              </label>
              <input
                type="text"
                value={localSettings.emergencyPhone}
                onChange={(e) => setLocalSettings({ ...localSettings, emergencyPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Official Support Email
              </label>
              <input
                type="email"
                value={localSettings.supportEmail}
                onChange={(e) => setLocalSettings({ ...localSettings, supportEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Operational Currency & Timezone
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  disabled
                  value="PKR (Rs. Pakistani Rupee)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600"
                />
                <input
                  type="text"
                  disabled
                  value="Asia/Karachi (UTC+5)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Financial, Tax & Commission Controls */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Financial Policies, Taxes & Payout Limits</h3>
              <p className="text-xs text-slate-500">Define baseline commissions and withholding rules under Pakistani regulations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Standard Platform Commission (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={localSettings.defaultCommission}
                  onChange={(e) => setLocalSettings({ ...localSettings, defaultCommission: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Applied when category has no override</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                FBR Withholding Tax (WHT %)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={localSettings.taxPercentage}
                  onChange={(e) => setLocalSettings({ ...localSettings, taxPercentage: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Provincial tax on service fees</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Min. Wallet Balance for Dispatch
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Rs.</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={localSettings.driverMinWalletBalance}
                  onChange={(e) => setLocalSettings({ ...localSettings, driverMinWalletBalance: parseInt(e.target.value) || 0 })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Driver must have this credit to take cash rides</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Minimum Payout Request
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Rs.</span>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={localSettings.minPayoutAmount}
                  onChange={(e) => setLocalSettings({ ...localSettings, minPayoutAmount: parseInt(e.target.value) || 0 })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Via JazzCash, EasyPaisa, or 1Link Raast</p>
            </div>
          </div>
        </div>

        {/* Verification, Security & Compliance Protocols */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
            <Shield className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Safety, Driver Verification & Emergency Protocols</h3>
              <p className="text-xs text-slate-500">NADRA verification, telematics sensitivity, and emergency hotline routing</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Mandatory NADRA CNIC Verification</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Drivers cannot accept trips without approved front & back CNIC on file.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.requireDriverVerification}
                  onChange={(e) => setLocalSettings({ ...localSettings, requireDriverVerification: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F766E]"></div>
              </label>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Automatic SOS Police 15 Escalation</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Forward unacknowledged in-ride panic alerts directly to Punjab / Sindh Safe Cities Police desk.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.autoEscalateSafety}
                  onChange={(e) => setLocalSettings({ ...localSettings, autoEscalateSafety: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F766E]"></div>
              </label>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Driver Micro-Loan & Advance Module</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Allow verified drivers with rating &gt; 4.7 to request fuel & maintenance advances.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.loansEnabled}
                  onChange={(e) => setLocalSettings({ ...localSettings, loansEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F766E]"></div>
              </label>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Drivers Academy Mandatory Graduation</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Require customer etiquette and Pakistani highway code quiz completion before onboarding.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.academyMandatory}
                  onChange={(e) => setLocalSettings({ ...localSettings, academyMandatory: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F766E]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Gateways & Service Simulator */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
            <Radio className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Telecommunications & Payment Gateways</h3>
              <p className="text-xs text-slate-500">Pakistani mobile network operator and payment connectivity status</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">Jazz / Zong SMS Gateway</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  CONNECTED
                </span>
              </div>
              <p className="text-xs text-slate-500">Shortcode 9444 for OTP verification & passenger dispatch alerts</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">1Link Raast / JazzCash</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-500">Real-time driver IBAN / Wallet disbursement engine</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">Pakistan Safe Cities Link</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                  STANDBY
                </span>
              </div>
              <p className="text-xs text-slate-500">Punjab Police (PSCA Lahore) & Sindh 15 SOS telemetry bridge</p>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => setLocalSettings(settings)}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition"
          >
            Revert Changes
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0d655e] text-white text-sm font-semibold transition shadow-md shadow-[#0F766E]/20"
          >
            {isSaving ? 'Saving Changes...' : 'Save Configuration'}
          </button>
        </div>
      </form>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset Demo Store Data?</h3>
                <p className="text-xs text-slate-500">This will restore initial mock passengers, rides, and tariffs.</p>
              </div>
            </div>

            <div className="py-4 text-xs text-slate-600 space-y-2">
              <p>
                All newly created rides, promo codes, driver verifications, and audit logs stored in this browser session will be re-initialized.
              </p>
              <p className="font-semibold text-rose-700">
                Are you sure you wish to proceed?
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition"
              >
                Yes, Reset All Demo Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
