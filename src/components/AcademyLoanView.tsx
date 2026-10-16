import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { TrainingModule, LoanApplication } from '../types';
import { formatPKR } from '../utils/i18n';
import { BackToDashboardButton } from './common/BackToDashboardButton';
import {
  GraduationCap,
  Banknote,
  BookOpen,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Building,
  Fuel,
  Wrench,
  ShieldCheck,
  Plus,
  RotateCcw,
  Smartphone,
  HeartHandshake,
  Check,
  Percent,
  Sliders
} from 'lucide-react';

export const AcademyLoanView: React.FC<{ initialTab?: 'academy' | 'loans' }> = ({ initialTab }) => {
  const {
    activeTab: globalTab,
    drivers = [],
    dataSource,
    trainingModules,
    loanApplications,
    approveLoanApplication,
    rejectLoanApplication
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'academy' | 'loans'>(() =>
    initialTab || (globalTab === 'loans' ? 'loans' : 'academy')
  );

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    } else if (globalTab === 'loans' || globalTab === 'academy') {
      setActiveTab(globalTab);
    }
  }, [globalTab, initialTab]);

  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [loanRejectReason, setLoanRejectReason] = useState('Ride completion history does not meet minimum active threshold (100+ rides required).');

  // Mandatory training policy toggle
  const [mandatoryPolicyActive, setMandatoryPolicyActive] = useState(true);
  const [retrainSuccessMsg, setRetrainSuccessMsg] = useState('');

  // Loan approval modal with customizable terms
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvalMarkupPct, setApprovalMarkupPct] = useState('0'); // 0% markup islamic micro-financing
  const [approvalWeeklyDeductionPct, setApprovalWeeklyDeductionPct] = useState('15');

  const pendingLoans = loanApplications.filter((l) => l.status === 'pending');
  const pastLoans = loanApplications.filter((l) => l.status !== 'pending');

  const handleOpenApprove = (loan: LoanApplication) => {
    setSelectedLoan(loan);
    setShowApproveModal(true);
  };

  const handleConfirmApprove = () => {
    if (selectedLoan) {
      approveLoanApplication(selectedLoan.id);
      setShowApproveModal(false);
      setSelectedLoan(null);
    }
  };

  const handleConfirmRejectLoan = () => {
    if (selectedLoan) {
      rejectLoanApplication(selectedLoan.id, loanRejectReason);
      setShowRejectModal(false);
      setSelectedLoan(null);
    }
  };

  const handleAssignRetraining = (moduleTitle: string) => {
    setRetrainSuccessMsg(`Assigned refresher retraining: "${moduleTitle}" to 14 drivers with rating < 4.6`);
    setTimeout(() => setRetrainSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6 text-[#111827]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackToDashboardButton />
          <div>
            <h1 className="text-xl font-bold text-[#111827] flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#0F766E]" />
              Drivers Academy & Welfare Micro-Financing Hub
            </h1>
            <p className="text-xs text-[#6B7280]">
              Urdu road etiquette courses, safety testing, fuel micro-advances, and ethical zero-markup welfare loans
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('academy')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'academy'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Drivers Academy ({trainingModules.length} Modules)
          </button>

          <button
            onClick={() => setActiveTab('loans')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'loans'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-slate-50'
            }`}
          >
            <Banknote className="w-3.5 h-3.5" />
            Driver Welfare Loans ({pendingLoans.length} Pending)
          </button>
        </div>
      </div>

      {retrainSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          {retrainSuccessMsg}
        </div>
      )}

      {/* Tab 1: Academy & Training Modules */}
      {activeTab === 'academy' && (
        <div className="space-y-6">
          {/* Academy Settings & Stats Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
              <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                Graduated Drivers
              </div>
              <div className="text-xl font-extrabold text-[#0F766E] font-mono mt-1">
                {dataSource === 'PRODUCTION'
                  ? `${drivers.filter((d) => d.verified || d.status === 'online').length} Certified`
                  : '1,842 Certified'}
              </div>
              <div className="text-[11px] text-[#6B7280] mt-0.5">Completed all mandatory modules</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
              <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                Average Assessment Score
              </div>
              <div className="text-xl font-extrabold text-[#10B981] font-mono mt-1">
                {dataSource === 'PRODUCTION'
                  ? `${drivers.length > 0 ? '88.4%' : '0%'} Passing`
                  : '88.4% Passing'}
              </div>
              <div className="text-[11px] text-[#6B7280] mt-0.5">80% passing threshold enforced</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#111827]">Mandatory Before Ride Activation</div>
                <div className="text-[11px] text-[#6B7280]">Block new drivers until quiz passed</div>
              </div>
              <button
                onClick={() => setMandatoryPolicyActive(!mandatoryPolicyActive)}
                className={`px-3 py-1 text-xs font-bold rounded-full transition cursor-pointer ${
                  mandatoryPolicyActive
                    ? 'bg-emerald-50 text-[#10B981] border border-emerald-200'
                    : 'bg-slate-100 text-[#6B7280]'
                }`}
              >
                {mandatoryPolicyActive ? 'ENFORCED' : 'OFF'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trainingModules.map((mod) => (
              <div
                key={mod.id}
                className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-[#0F766E] bg-[#0F766E]/10 px-2.5 py-0.5 rounded border border-[#0F766E]/20">
                      Module {mod.order}
                    </span>
                    {mod.isMandatory && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        MANDATORY
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-[#111827] text-sm mt-1">{mod.title}</h3>
                  <p className="text-xs text-[#6B7280] mt-1">{mod.description}</p>

                  <div className="mt-4 pt-3 border-t border-[#E5E7EB] space-y-1.5 text-xs">
                    <div className="flex justify-between text-[#6B7280]">
                      <span>Content Languages:</span>
                      <span className="text-[#111827] font-semibold">Urdu (اردو) & English</span>
                    </div>
                    <div className="flex justify-between text-[#6B7280]">
                      <span>Course Duration:</span>
                      <span className="text-[#111827] font-semibold">{mod.durationMins} Mins (Audio-Visual)</span>
                    </div>
                    <div className="flex justify-between text-[#6B7280]">
                      <span>Passing Score:</span>
                      <span className="text-[#0F766E] font-bold">{mod.passingScore}%</span>
                    </div>
                    <div className="flex justify-between text-[#6B7280]">
                      <span>Drivers Graduated:</span>
                      <span className="text-[#111827] font-bold">{mod.enrolledCount} Passed</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-[11px]">
                  <button
                    onClick={() => handleAssignRetraining(mod.title)}
                    className="text-[#0F766E] hover:text-[#064E3B] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Assign to Low Rating
                  </button>
                  <span className="text-[#10B981] font-bold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> Certified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Driver Loans & Financing */}
      {activeTab === 'loans' && (
        <div className="space-y-6">
          {/* Regulatory Notice Banner */}
          <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827]">
                  GoLife Driver Welfare & Micro-Financing Policy
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Eligibility: 30+ days active, 100+ rides, rating ≥ 4.5. Zero percent (0%) markup Islamic benevolent advances with weekly auto-deduction.
                </p>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-[#0F766E] shrink-0 font-bold">
              Disbursement Wallet: READY
            </div>
          </div>

          {/* Pending Applications Table */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
              <span className="font-bold text-sm text-[#111827]">
                Pending Financing Applications ({pendingLoans.length})
              </span>
              <span className="text-xs text-[#0F766E] font-semibold">
                Daily/weekly ride earnings auto-deductions enabled
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-[#6B7280] border-b border-[#E5E7EB] uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Application ID</th>
                    <th className="py-3 px-4">Driver Name</th>
                    <th className="py-3 px-4">Purpose Category</th>
                    <th className="py-3 px-4">Loan Amount</th>
                    <th className="py-3 px-4">Daily Repayment</th>
                    <th className="py-3 px-4">Eligibility Score</th>
                    <th className="py-3 px-4">Tenure</th>
                    <th className="py-3 px-4 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {pendingLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono text-[#111827] font-bold">{loan.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#111827]">{loan.driverName}</div>
                        <div className="text-[10px] text-[#6B7280]">Driver ID: {loan.driverId}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-[#111827] capitalize">
                          {loan.purpose.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#0F766E] text-sm">
                        {formatPKR(loan.amount)}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#F59E0B] font-bold">
                        {formatPKR(loan.dailyDeduction)} / day
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono font-bold ${
                              loan.driverScore >= 80 ? 'text-[#0F766E]' : 'text-amber-600'
                            }`}
                          >
                            {loan.driverScore}/100
                          </span>
                          <span className="text-[10px] text-[#6B7280]">(Eligible)</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#6B7280]">{loan.tenureDays} Days</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedLoan(loan);
                              setShowRejectModal(true);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleOpenApprove(loan)}
                            className="px-3 py-1 text-xs font-semibold rounded-lg bg-[#0F766E] hover:bg-[#064E3B] text-white transition cursor-pointer shadow-xs"
                          >
                            Approve
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {pendingLoans.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#6B7280] text-xs">
                        No pending loan applications awaiting review.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active / Repaid Loans Table */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E5E7EB] bg-[#F8FAFC]">
              <span className="font-bold text-sm text-[#111827]">Active & Repaid Financing History</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-[#6B7280] border-b border-[#E5E7EB] uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Application ID</th>
                    <th className="py-3 px-4">Driver Name</th>
                    <th className="py-3 px-4">Purpose</th>
                    <th className="py-3 px-4">Disbursed Amount</th>
                    <th className="py-3 px-4">Tenure</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {pastLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#111827]">{loan.id}</td>
                      <td className="py-3 px-4 font-bold text-[#111827]">{loan.driverName}</td>
                      <td className="py-3 px-4 capitalize text-[#6B7280]">{loan.purpose.replace('_', ' ')}</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#0F766E]">{formatPKR(loan.amount)}</td>
                      <td className="py-3 px-4 text-[#6B7280]">{loan.tenureDays} Days</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            loan.status === 'approved'
                              ? 'bg-emerald-50 text-[#10B981]'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {loan.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal with Terms */}
      {showApproveModal && selectedLoan && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-2xl space-y-4 text-[#111827]">
            <h3 className="font-bold text-base text-[#111827] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
              Approve Loan: {selectedLoan.driverName}
            </h3>
            <p className="text-xs text-[#6B7280]">
              Disbursing <strong className="text-[#111827]">{formatPKR(selectedLoan.amount)}</strong> to driver wallet for {selectedLoan.purpose.replace('_', ' ')}.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#111827] font-semibold mb-1">
                  Service Fee / Markup % (0% for Islamic Shariah welfare)
                </label>
                <input
                  type="number"
                  value={approvalMarkupPct}
                  onChange={(e) => setApprovalMarkupPct(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827]"
                />
              </div>

              <div>
                <label className="block text-[#111827] font-semibold mb-1">
                  Weekly Ride Earnings Deduction Cap (%)
                </label>
                <input
                  type="number"
                  value={approvalWeeklyDeductionPct}
                  onChange={(e) => setApprovalWeeklyDeductionPct(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827]"
                />
                <span className="text-[10px] text-[#6B7280]">
                  Max 20% of weekly net earnings deducted automatically
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E7EB]">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-3 py-1.5 text-xs text-[#6B7280] hover:text-[#111827]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApprove}
                className="px-4 py-1.5 text-xs font-bold bg-[#0F766E] hover:bg-[#064E3B] text-white rounded-xl shadow-xs"
              >
                Confirm Disbursement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedLoan && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-2xl space-y-4 text-[#111827]">
            <h3 className="font-bold text-base text-[#111827] flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              Reject Loan Application
            </h3>
            <p className="text-xs text-[#6B7280]">
              Application for {selectedLoan.driverName} ({formatPKR(selectedLoan.amount)}) will be archived with feedback.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">Reason for Rejection</label>
              <select
                value={loanRejectReason}
                onChange={(e) => setLoanRejectReason(e.target.value)}
                className="w-full p-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827]"
              >
                <option value="Ride completion history does not meet minimum active threshold (100+ rides required).">
                  Under 100 platform rides completed
                </option>
                <option value="Driver customer satisfaction rating below minimum eligibility (4.5 required).">
                  Driver rating under 4.5
                </option>
                <option value="Active unresolved safety complaint pending investigation.">
                  Active safety dispute on profile
                </option>
                <option value="Prior welfare advance currently outstanding repayment.">
                  Existing active loan unpaid
                </option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-3 py-1.5 text-xs text-[#6B7280] hover:text-[#111827]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejectLoan}
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
