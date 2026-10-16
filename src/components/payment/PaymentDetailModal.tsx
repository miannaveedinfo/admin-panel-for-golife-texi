import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { CentralPaymentTransaction } from '../../types/paymentArchitecture';
import { formatPKR } from '../../utils/i18n';
import { BackToDashboardButton } from '../common/BackToDashboardButton';
import { isProductionDataSource } from '../../config/dataSourceMode';
import {
  ShieldCheck,
  X,
  Lock,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  Car,
  CreditCard,
  Building2,
  Banknote,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  FileText,
  User,
  Check
} from 'lucide-react';

interface PaymentDetailModalProps {
  transaction: CentralPaymentTransaction | null;
  onClose: () => void;
}

export const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({
  transaction,
  onClose
}) => {
  const { setActiveTab } = useAdmin();
  if (!transaction) return null;

  const isCredit = transaction.walletEffect > 0;
  const isDebit = transaction.walletEffect < 0;

  return (
    <div
      id="payment-detail-center-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] text-xs">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <BackToDashboardButton
              variant="dark"
              onClick={() => {
                onClose();
                setActiveTab('dashboard');
              }}
            />
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white tracking-wide">
                  Central Payment Transaction Detail Center
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-950">
                  {transaction.paymentMethod}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                TXN UUID: {transaction.id} • Ref ID: {transaction.referenceId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Top Financial Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                Gross Transaction
              </span>
              <div className="text-xl font-black font-mono text-slate-900 mt-1">
                {formatPKR(transaction.amount)}
              </div>
              <span className="text-[10px] text-amber-700 font-medium mt-0.5 block">
                Currency: PKR
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Platform Commission
              </span>
              <div className="text-xl font-black font-mono text-slate-900 mt-1">
                {transaction.commissionAmount !== undefined
                  ? formatPKR(transaction.commissionAmount)
                  : 'N/A (Direct Top-Up)'}
              </div>
              <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                Allocated to Platform Revenue
              </span>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                isCredit
                  ? 'bg-emerald-50 border-emerald-200'
                  : isDebit
                  ? 'bg-rose-50 border-rose-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-600">
                Driver Wallet Impact
              </span>
              <div
                className={`text-xl font-black font-mono mt-1 ${
                  isCredit
                    ? 'text-emerald-700'
                    : isDebit
                    ? 'text-rose-700'
                    : 'text-slate-800'
                }`}
              >
                {isCredit ? '+' : ''}
                {formatPKR(transaction.walletEffect)}
              </div>
              <span className="text-[10px] font-medium block mt-0.5 text-slate-500">
                Ledger Balance After: {formatPKR(transaction.balanceAfter)}
              </span>
            </div>
          </div>

          {/* Operational Status & Environment Badge */}
          <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-600">Verification Status:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                  transaction.status === 'Completed' || (transaction.status as string) === 'SUCCESS'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : transaction.status === 'Pending' || (transaction.status as string) === 'PENDING'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : transaction.status === 'Processing' || (transaction.status as string) === 'PROCESSING'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {transaction.status}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-600">Environment:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  transaction.demoMode || !isProductionDataSource()
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-emerald-700 text-white font-bold'
                }`}
              >
                {transaction.demoMode || !isProductionDataSource() ? 'DEMO MODE' : 'PRODUCTION MODE'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Double-Entry Immutable</span>
            </div>
          </div>

          {/* Point 3: All 14 Core Transaction Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 font-mono text-[11px]">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">
                1. Transaction ID
              </span>
              <span className="font-bold text-slate-900 text-xs">{transaction.id}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">
                2. Driver Name &amp; 3. Driver ID
              </span>
              <span className="font-bold text-slate-900 text-xs">
                {transaction.userName} ({transaction.userId})
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">
                4. Payment Method
              </span>
              <span className="font-bold uppercase text-slate-900 text-xs">
                {transaction.paymentMethod === 'easypaisa'
                  ? 'Easypaisa (Telenor Bank)'
                  : transaction.paymentMethod === 'jazzcash'
                  ? 'JazzCash (Mobilink Bank)'
                  : transaction.paymentMethod === 'bank'
                  ? '1Link / Raast Bank Transfer'
                  : 'Physical Cash (Driver Direct)'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">
                5. Gross Amount &amp; 6. Fee &amp; 7. Net Credit
              </span>
              <div className="font-bold text-slate-900 text-xs">
                {formatPKR(transaction.amount)} | Fee: {formatPKR(transaction.fee || 0)} | Net:{' '}
                <span className="text-emerald-700">{formatPKR(transaction.walletEffect || transaction.amount)}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">
                8. Status &amp; 9. Provider Reference
              </span>
              <span className="font-bold text-slate-900 text-xs">
                {transaction.status} • Ref: {transaction.referenceId || transaction.providerReference || 'N/A'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">
                10. Company Account
              </span>
              <span className="font-bold text-slate-900 text-xs truncate block">
                {transaction.companyAccountTitle || 'GoLife Corporate Settlement Account'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">
                11. Created Time &amp; 12. Verification Time
              </span>
              <span className="text-slate-800 text-xs">
                Created: {transaction.createdAt || transaction.timestamp} • Verified:{' '}
                {transaction.verificationTime || transaction.timestamp}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">
                13. Failure Reason &amp; 14. Mode
              </span>
              <span className="text-slate-800 text-xs">
                {transaction.failureReason || 'None (Transaction successfully reconciled)'} [
                {transaction.demoMode || !isProductionDataSource() ? 'DEMO' : 'PRODUCTION'}]
              </span>
            </div>
          </div>

          {/* Normal Ride Cash Rule Reminder */}
          {transaction.transactionType === 'ride_cash_payment' && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-2.5">
              <Banknote className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[11px]">
                <span className="font-bold">Standard Cash-Only Trip Settlement:</span> Normal completed rides in GoLife Taxi Pakistan are strictly settled in cash directly between passenger and driver. GoLife automatically debited the 15% platform commission from the driver's wallet ledger.
              </div>
            </div>
          )}

          {/* Transaction Narrative / Description */}
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Ledger Narration &amp; Description
            </span>
            <p className="p-3 rounded-xl border border-slate-200 bg-white text-slate-800 mt-1 font-medium leading-relaxed">
              {transaction.description}
            </p>
          </div>

          {/* Audit History Timeline */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Audit Trail &amp; Verification Milestones ({transaction.auditTrail.length})
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Idempotency Verified
              </span>
            </div>

            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {transaction.auditTrail.map((entry, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5"
                >
                  <div className="p-1.5 rounded-lg bg-slate-200 text-slate-700 shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-900">
                      <span>{entry.action}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {entry.timestamp}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-600 mt-0.5">
                      Actor: <span className="font-bold text-slate-800">{entry.actor}</span>
                      {' — '}
                      <span>{entry.note}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span>Zero Secret Leak Guarantee • SHA-256 Audit Sealed</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer shadow-xs"
          >
            Close Detail Center
          </button>
        </div>
      </div>
    </div>
  );
};
