import React, { useState } from 'react';
import { PaymentFeeRule, TopUpMethod } from '../../types/paymentArchitecture';
import { DEFAULT_PAYMENT_FEE_RULES, calculatePaymentFee } from '../../services/centralPaymentService';
import { formatPKR } from '../../utils/i18n';
import { useAdmin } from '../../context/AdminContext';
import { isProductionDataSource } from '../../config/dataSourceMode';
import {
  Percent,
  Sliders,
  CheckCircle2,
  Lock,
  Save,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Calculator,
  ArrowRight
} from 'lucide-react';

interface PaymentFeeConfigTabProps {
  feeRules?: PaymentFeeRule[];
  onSaveFeeRules?: (updatedRules: PaymentFeeRule[]) => void;
}

export const PaymentFeeConfigTab: React.FC<PaymentFeeConfigTabProps> = ({
  feeRules = DEFAULT_PAYMENT_FEE_RULES,
  onSaveFeeRules
}) => {
  const { showToast, logAction, currentAdmin } = useAdmin();

  // Local state for fee rules
  const [rules, setRules] = useState<PaymentFeeRule[]>(() => {
    if (isProductionDataSource()) return feeRules;
    try {
      const saved = localStorage.getItem('GOLIFE_PAYMENT_FEE_RULES');
      return saved ? JSON.parse(saved) : feeRules;
    } catch {
      return feeRules;
    }
  });

  const [testAmount, setTestAmount] = useState('1000');
  const [testMethod, setTestMethod] = useState<TopUpMethod>('jazzcash');
  const [savedNotice, setSavedNotice] = useState(false);

  // Update a single rule
  const handleUpdateRule = (id: string, updates: Partial<PaymentFeeRule>) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              ...updates,
              updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' PKT'
            }
          : r
      )
    );
  };

  // Save all rules to state & persistence
  const handleSaveAll = () => {
    if (!isProductionDataSource()) {
      try {
        localStorage.setItem('GOLIFE_PAYMENT_FEE_RULES', JSON.stringify(rules));
      } catch {}
    }

    if (onSaveFeeRules) {
      onSaveFeeRules(rules);
    }

    logAction(
      'PAYMENT_FEE_RULES_UPDATED',
      'settings/payment_fees',
      'Payment processing fee configuration rules updated by admin.',
      { rules, adminId: currentAdmin?.id }
    );

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
    showToast('Payment fee configuration rules saved successfully.', 'success');
  };

  // Live preview calculator
  const preview = calculatePaymentFee(Number(testAmount) || 0, testMethod, rules);

  return (
    <div className="space-y-6 text-xs text-slate-900">
      {/* Informational Header */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <span className="p-2.5 rounded-xl bg-amber-400 text-slate-950 shrink-0">
            <Percent className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-amber-950">
              Payment Method Fee &amp; Cutting Management
            </h3>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              Configure transaction processing fees for JazzCash, Easypaisa, and Bank deposits.
              Fee calculations are executed server-side. Drivers clearly see Gross Amount, Fee Cutting, and Net Wallet Credit before confirming.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveAll}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>Save Fee Rules</span>
        </button>
      </div>

      {savedNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Fee configurations saved and applied across the backend calculation engine.</span>
        </div>
      )}

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {rules.map((rule) => {
          return (
            <div
              key={rule.id}
              className={`p-5 rounded-2xl bg-white border transition shadow-xs space-y-4 ${
                rule.active ? 'border-slate-200 hover:border-amber-400' : 'border-slate-200 opacity-60 bg-slate-50'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{rule.name}</h4>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">{rule.method}</span>
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rule.active}
                    onChange={(e) => handleUpdateRule(rule.id, { active: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-amber-400 h-4 w-4"
                  />
                  <span className="text-[11px] font-bold text-slate-700">
                    {rule.active ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>

              {/* Fee Type: Fixed vs Percentage */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Fee Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateRule(rule.id, { feeType: 'percentage' })}
                    className={`py-2 px-3 rounded-xl font-bold text-xs transition cursor-pointer text-center ${
                      rule.feeType === 'percentage'
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Percentage (%)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateRule(rule.id, { feeType: 'fixed' })}
                    className={`py-2 px-3 rounded-xl font-bold text-xs transition cursor-pointer text-center ${
                      rule.feeType === 'fixed'
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Fixed (PKR)
                  </button>
                </div>
              </div>

              {/* Fee Value */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Fee Value {rule.feeType === 'percentage' ? '(%)' : '(PKR)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max={rule.feeType === 'percentage' ? 20 : 500}
                    value={rule.feeValue}
                    onChange={(e) =>
                      handleUpdateRule(rule.id, { feeValue: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-xs font-bold">
                    {rule.feeType === 'percentage' ? '%' : 'PKR'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {rule.feeType === 'percentage'
                    ? `Deducts ${rule.feeValue}% on gross top-up amount`
                    : `Deducts flat Rs ${rule.feeValue} per transaction`}
                </span>
              </div>

              {/* Example calculation snippet */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-mono">
                <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">
                  Demo Example (Rs 1,000 Top-Up):
                </span>
                <div className="flex justify-between mt-1 text-slate-700">
                  <span>Fee Cut:</span>
                  <span className="font-bold text-rose-600">
                    -{formatPKR(rule.feeType === 'percentage' ? (1000 * rule.feeValue) / 100 : rule.feeValue)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1 mt-1">
                  <span>Net Credit:</span>
                  <span className="text-emerald-700">
                    {formatPKR(
                      1000 -
                        (rule.feeType === 'percentage'
                          ? (1000 * rule.feeValue) / 100
                          : rule.feeValue)
                    )}
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 text-right">
                Last Updated: {rule.updatedAt}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Fee Simulator & Verification Desk */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-amber-500" />
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Live Fee Calculation Simulator &amp; Driver Transparency Check
            </h4>
            <p className="text-[11px] text-slate-500">
              Verify how top-up amounts and fee cutting rules appear on driver screens in real-time
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Simulate Amount (PKR)</label>
            <input
              type="number"
              min="100"
              max="20000"
              value={testAmount}
              onChange={(e) => setTestAmount(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Simulate Payment Method</label>
            <select
              value={testMethod}
              onChange={(e) => setTestMethod(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="jazzcash">JazzCash (1% Default)</option>
              <option value="easypaisa">Easypaisa (1% Default)</option>
              <option value="bank">Bank Transfer (Fixed Rs 20 Default)</option>
            </select>
          </div>

          {/* Result Card */}
          <div className="p-3.5 rounded-xl bg-slate-900 text-white flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Driver Screen Preview
            </span>
            <div className="flex items-center justify-between text-xs font-mono pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block">Gross Top-Up</span>
                <span className="font-bold text-white">{formatPKR(Number(testAmount) || 0)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-rose-400 block">Fee Cut</span>
                <span className="font-bold text-rose-400">-{formatPKR(preview.fee)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-400 block">Net Wallet Credit</span>
                <span className="font-black text-amber-300 text-sm">+{formatPKR(preview.netCredit)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
