import React, { useState } from 'react';
import { Driver } from '../types';
import { MANUAL_SUSPENSION_REASONS, SUSPENSION_DURATIONS } from '../services/driverComplianceService';
import { ShieldAlert, AlertTriangle, X, Clock, FileText } from 'lucide-react';

interface ManualSuspensionModalProps {
  driver: Driver;
  onClose: () => void;
  onConfirm: (options: {
    reason: string;
    reasonCategory: string;
    durationHours: number;
    notes: string;
  }) => void;
}

export const ManualSuspensionModal: React.FC<ManualSuspensionModalProps> = ({
  driver,
  onClose,
  onConfirm
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(MANUAL_SUSPENSION_REASONS[0]);
  const [selectedDuration, setSelectedDuration] = useState<number>(12); // Default 12 hours
  const [customHours, setCustomHours] = useState<string>('48');
  const [isCustomDuration, setIsCustomDuration] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const finalDurationHours = isCustomDuration ? (Number(customHours) || 12) : selectedDuration;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    onConfirm({
      reason: selectedReason,
      reasonCategory: selectedReason,
      durationHours: finalDurationHours,
      notes: notes.trim() || `Suspended by admin for ${selectedReason}`
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl overflow-hidden text-[#111827]">
        {/* Header */}
        <div className="p-5 border-b border-[#E5E7EB] bg-rose-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-rose-950">
                Suspend Driver Account
              </h2>
              <p className="text-xs text-rose-800">
                {driver.name} • {driver.vehicle.plate} • {driver.city}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-rose-700 hover:bg-rose-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {!showConfirm ? (
            <>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  Suspended drivers are immediately disqualified from receiving ride dispatches, cannot go online, and cannot accept passenger bookings until the suspension expires or is manually revoked.
                </div>
              </div>

              {/* 17 Predefined Reasons */}
              <div>
                <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                  Suspension Reason (Select Category)
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-rose-500 font-medium"
                >
                  {MANUAL_SUSPENSION_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration Options */}
              <div>
                <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                  Suspension Duration
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SUSPENSION_DURATIONS.map((dur) => (
                    <button
                      key={dur.hours}
                      type="button"
                      onClick={() => {
                        setSelectedDuration(dur.hours);
                        setIsCustomDuration(false);
                      }}
                      className={`p-2 rounded-xl text-xs font-semibold border transition text-left ${
                        !isCustomDuration && selectedDuration === dur.hours
                          ? 'border-rose-600 bg-rose-50 text-rose-800'
                          : 'border-[#E5E7EB] bg-slate-50 text-[#111827] hover:bg-slate-100'
                      }`}
                    >
                      {dur.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsCustomDuration(true)}
                    className={`p-2 rounded-xl text-xs font-semibold border transition text-left ${
                      isCustomDuration
                        ? 'border-rose-600 bg-rose-50 text-rose-800'
                        : 'border-[#E5E7EB] bg-slate-50 text-[#111827] hover:bg-slate-100'
                    }`}
                  >
                    Custom Duration
                  </button>
                </div>

                {isCustomDuration && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-xs text-[#6B7280]">Hours:</span>
                    <input
                      type="number"
                      min="1"
                      max="87600"
                      value={customHours}
                      onChange={(e) => setCustomHours(e.target.value)}
                      className="w-24 p-1.5 text-xs rounded-lg border border-[#E5E7EB] bg-slate-50"
                    />
                    <span className="text-xs text-[#6B7280]">
                      ({Math.round(Number(customHours) / 24)} days)
                    </span>
                  </div>
                )}
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                  Administrative Notes & Compliance Investigation Summary
                </label>
                <textarea
                  rows={3}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="State the detailed investigation finding, reference ride code or complaint number..."
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 text-xs rounded-xl bg-slate-100 text-[#6B7280] hover:text-[#111827]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                >
                  Review & Confirm Suspension
                </button>
              </div>
            </>
          ) : (
            /* Confirmation Screen */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-2">
                <div className="font-bold text-rose-950 text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-700" />
                  Are you sure you want to suspend this driver?
                </div>
                <div className="text-rose-900">
                  <strong>Driver:</strong> {driver.name} ({driver.id})
                </div>
                <div className="text-rose-900">
                  <strong>Reason:</strong> {selectedReason}
                </div>
                <div className="text-rose-900">
                  <strong>Duration:</strong> {finalDurationHours} hours (
                  {Math.round(finalDurationHours / 24)} days)
                </div>
                <div className="text-rose-900">
                  <strong>Notes:</strong> {notes}
                </div>
              </div>

              <div className="text-[11px] text-[#6B7280]">
                An audit entry will be created under your admin profile, and the driver will be blocked from online dispatch across Pakistan.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="px-3.5 py-1.5 text-xs rounded-xl bg-slate-100 text-[#111827]"
                >
                  Back to Edit
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                >
                  Confirm and Apply Suspension
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
