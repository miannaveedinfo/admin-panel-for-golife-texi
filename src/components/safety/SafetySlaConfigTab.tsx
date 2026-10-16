import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { SafetyResponseSlaConfig } from '../../types';
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Info,
  Building,
  ShieldAlert,
  FileCheck
} from 'lucide-react';

export const SafetySlaConfigTab: React.FC = () => {
  const {
    safetySlaConfig,
    updateSafetySlaConfig,
    safetyIncidentCategories,
    showToast
  } = useAdmin();

  const [formData, setFormData] = useState<SafetyResponseSlaConfig>({
    ...safetySlaConfig
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: keyof SafetyResponseSlaConfig, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSaveSla = (e: React.FormEvent) => {
    e.preventDefault();
    updateSafetySlaConfig(formData);
    setHasChanges(false);
    showToast('Safety Response SLA targets updated successfully', 'success');
  };

  const handleResetDefaults = () => {
    const defaults: SafetyResponseSlaConfig = {
      sosAcknowledgementSeconds: 60,
      sosFirstResponseSeconds: 180,
      sosResolutionMinutes: 30,
      standardAcknowledgementMinutes: 15,
      standardResolutionHours: 24
    };
    setFormData(defaults);
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* SLA CONFIGURATION FORM */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Safety Response SLA Thresholds & Breach Detection</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Define operational response time limits for real-time SOS alerts and standard safety complaints.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition"
            >
              Reset Recommended
            </button>
            {hasChanges && (
              <button
                type="button"
                onClick={handleSaveSla}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition"
              >
                Save SLA Targets
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSaveSla} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* SOS Acknowledgement Seconds */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">SOS Operator Ack Target</span>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  Critical
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Max seconds before an unacknowledged SOS alert flashes red across all command consoles.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={15}
                  max={300}
                  step={5}
                  value={formData.sosAcknowledgementSeconds}
                  onChange={(e) => handleChange('sosAcknowledgementSeconds', Number(e.target.value))}
                  className="w-24 text-sm font-bold px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                />
                <span className="text-xs text-slate-600 font-semibold">Seconds ({Math.round(formData.sosAcknowledgementSeconds / 60 * 10) / 10}m)</span>
              </div>
            </div>

            {/* SOS First Response Seconds */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">First Contact Outreach</span>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Urgent
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Max seconds to initiate outbound call, VOIP voice check, or prompt to the user.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={60}
                  max={600}
                  step={10}
                  value={formData.sosFirstResponseSeconds}
                  onChange={(e) => handleChange('sosFirstResponseSeconds', Number(e.target.value))}
                  className="w-24 text-sm font-bold px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                />
                <span className="text-xs text-slate-600 font-semibold">Seconds ({Math.round(formData.sosFirstResponseSeconds / 60)} mins)</span>
              </div>
            </div>

            {/* SOS Resolution Minutes */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">SOS Full Incident Resolution</span>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Standard
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Target minutes to confirm user safety, dispatch ground units, or complete safe arrival.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={10}
                  max={120}
                  step={5}
                  value={formData.sosResolutionMinutes}
                  onChange={(e) => handleChange('sosResolutionMinutes', Number(e.target.value))}
                  className="w-24 text-sm font-bold px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                />
                <span className="text-xs text-slate-600 font-semibold">Minutes</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Standard Acknowledgement Minutes */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">Standard Safety Incident Ack</span>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                  Non-Emergency
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Target acknowledgement time for driving complaints, vehicle safety, or route disputes.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={5}
                  max={120}
                  step={5}
                  value={formData.standardAcknowledgementMinutes}
                  onChange={(e) => handleChange('standardAcknowledgementMinutes', Number(e.target.value))}
                  className="w-24 text-sm font-bold px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                />
                <span className="text-xs text-slate-600 font-semibold">Minutes</span>
              </div>
            </div>

            {/* Standard Resolution Hours */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">Standard Investigation Closure</span>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                  Resolution
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Max hours allowed to conclude investigative review, driver interview, and report submission.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={4}
                  max={72}
                  step={2}
                  value={formData.standardResolutionHours}
                  onChange={(e) => handleChange('standardResolutionHours', Number(e.target.value))}
                  className="w-24 text-sm font-bold px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                />
                <span className="text-xs text-slate-600 font-semibold">Hours</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* INCIDENT CLASSIFICATION MATRIX */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>Incident Classification & Escalation Protocols</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Configured safety event types and their standard escalation rules.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Classification Type</th>
                <th className="py-2.5 px-3">Default Severity</th>
                <th className="py-2.5 px-3">Rescue 1122 Medical</th>
                <th className="py-2.5 px-3">Police 15 Dispatch</th>
                <th className="py-2.5 px-3">Protocol Directive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {safetyIncidentCategories.map((cat, idx) => (
                <tr key={(cat as any).code || (cat as any).id || (cat as any).name || idx} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {cat.name}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cat.defaultPriority === 'critical'
                          ? 'bg-rose-100 text-rose-800'
                          : cat.defaultPriority === 'urgent'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {cat.defaultPriority.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {cat.requiresMedicalEscalation ? (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mandatory</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">On Condition</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {cat.requiresPoliceEscalation ? (
                      <span className="text-blue-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mandatory</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">On Condition</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {cat.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGULATORY & OPERATIONAL MANDATES */}
      <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 shadow-xs">
        <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-amber-700" />
          <span>Operational Rules & Compliance Mandates</span>
        </h4>
        <ul className="text-xs text-amber-800 space-y-1.5 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>No Silent Disciplinary Actions:</strong> The Safety Center must never silently suspend or fine a driver. Any action requires logged operator confirmation with explicit rationale.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>GPS Degradation Fair Treatment:</strong> A temporary signal loss or technical location failure must NOT automatically be treated as unsafe or malicious driver behavior.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>AI Advisory Limit:</strong> AI models generate triage guidance and telemetry summaries only. AI cannot independently suspend accounts, fine drivers, or close critical cases.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>Data Privacy Protection:</strong> Contact logs and telemetry breadcrumbs are strictly confidential, restricted to authorized safety controllers under role-based audit.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
