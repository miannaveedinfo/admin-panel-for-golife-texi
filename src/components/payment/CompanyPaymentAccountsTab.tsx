import React, { useState } from 'react';
import { CompanyPaymentAccount, TopUpMethod } from '../../types/paymentArchitecture';
import { useAdmin } from '../../context/AdminContext';
import { isProductionDataSource } from '../../config/dataSourceMode';
import {
  Building2,
  Lock,
  CheckCircle2,
  XCircle,
  Edit2,
  ShieldCheck,
  Save,
  AlertCircle,
  Smartphone,
  PlusCircle,
  Trash2,
  Power,
  X,
  CreditCard,
  Building,
  Check,
  Calendar
} from 'lucide-react';

interface CompanyPaymentAccountsTabProps {
  accounts: CompanyPaymentAccount[];
  onUpdateAccount: (updatedAccount: CompanyPaymentAccount) => void;
  onAddAccount?: (newAccount: CompanyPaymentAccount) => void;
}

export const CompanyPaymentAccountsTab: React.FC<CompanyPaymentAccountsTabProps> = ({
  accounts,
  onUpdateAccount,
  onAddAccount
}) => {
  const { showToast, logAction, currentAdmin } = useAdmin();

  // Modal states
  const [editingAccount, setEditingAccount] = useState<CompanyPaymentAccount | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);
  const [deactivatingAccount, setDeactivatingAccount] = useState<CompanyPaymentAccount | null>(null);

  // New Account Template Form State
  const [formAccountName, setFormAccountName] = useState('GoLife Taxi Pakistan (Pvt) Ltd');
  const [formAccountNumber, setFormAccountNumber] = useState('');
  const [formMobileNumber, setFormMobileNumber] = useState('');
  const [formIban, setFormIban] = useState('');
  const [formBankName, setFormBankName] = useState('Habib Bank Limited (HBL)');
  const [formBranch, setFormBranch] = useState('Gulberg Main Boulevard, Lahore');
  const [formPaymentMethod, setFormPaymentMethod] = useState<TopUpMethod>('bank');
  const [formTillNumber, setFormTillNumber] = useState('');
  const [formEnvironment, setFormEnvironment] = useState<'demo' | 'production'>('demo');
  const [formInstructionsUrdu, setFormInstructionsUrdu] = useState('');
  const [formInstructionsEnglish, setFormInstructionsEnglish] = useState('');

  const currentMode = isProductionDataSource() ? 'PRODUCTION' : 'DEMO';

  // Toggle Account Active / Inactive Status
  const handleToggleStatus = (acc: CompanyPaymentAccount) => {
    const newStatus = acc.status === 'active' ? 'inactive' : 'active';
    const updated: CompanyPaymentAccount = {
      ...acc,
      status: newStatus,
      accountStatus: newStatus,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' PKT'
    };
    onUpdateAccount(updated);

    logAction(
      'COMPANY_ACCOUNT_STATUS_CHANGE',
      `companyPaymentAccounts/${acc.id}`,
      `Account ${acc.accountTitle || acc.accountName} (${acc.provider.toUpperCase()}) set to ${newStatus}.`,
      { previousStatus: acc.status, newStatus, adminId: currentAdmin?.id }
    );

    showToast(`Account #${acc.id} successfully ${newStatus === 'active' ? 'activated' : 'deactivated'}.`, 'success');
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' PKT';
    const updated: CompanyPaymentAccount = {
      ...editingAccount,
      accountTitle: editingAccount.accountTitle || editingAccount.accountName || 'Company Account',
      accountName: editingAccount.accountTitle || editingAccount.accountName || 'Company Account',
      updatedAt: now
    };
    onUpdateAccount(updated);

    logAction(
      'COMPANY_ACCOUNT_MODIFIED',
      `companyPaymentAccounts/${editingAccount.id}`,
      `Receiving account details updated by admin.`,
      { updatedFields: updated, adminId: currentAdmin?.id }
    );

    setEditingAccount(null);
    setSaveSuccessNotice('Company receiving account updated and persisted successfully.');
    setTimeout(() => setSaveSuccessNotice(null), 3500);
    showToast('Receiving account updated successfully', 'success');
  };

  // Add New Account
  const handleCreateNewAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' PKT';
    const newAcc: CompanyPaymentAccount = {
      id: `comp-${formPaymentMethod.slice(0, 2)}-${Date.now().toString().slice(-4)}`,
      provider: formPaymentMethod,
      accountTitle: formAccountName,
      accountName: formAccountName,
      accountNumber: formAccountNumber || formMobileNumber,
      mobileNumber: formMobileNumber,
      tillNumber: formTillNumber || undefined,
      iban: formIban || undefined,
      bankName: formBankName,
      branch: formBranch,
      merchantId: `GL-MERCHANT-${formPaymentMethod.toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      accountType:
        formPaymentMethod === 'bank'
          ? 'Corporate Bank Account'
          : 'Corporate Merchant Till',
      status: 'active',
      accountStatus: 'active',
      environment: formEnvironment,
      instructionsUrdu:
        formInstructionsUrdu ||
        `براہ کرم ${formPaymentMethod === 'jazzcash' ? 'جاز کیش' : formPaymentMethod === 'easypaisa' ? 'ایزی پیسہ' : 'بینک'} میں رقم جمع کروا کر رسید نمبر درج کریں۔`,
      instructionsEnglish:
        formInstructionsEnglish ||
        `Please transfer to ${formBankName} (${formAccountNumber}) and enter the reference number.`,
      secretStatus: 'Encrypted (AES-256 Vault / Backend Environment - Never exposed to client UI)',
      createdAt: now,
      updatedAt: now
    };

    if (onAddAccount) {
      onAddAccount(newAcc);
    } else {
      onUpdateAccount(newAcc);
    }

    logAction(
      'COMPANY_ACCOUNT_ADDED',
      `companyPaymentAccounts/${newAcc.id}`,
      `New company receiving account added: ${newAcc.accountTitle} (${newAcc.provider})`,
      { newAcc, adminId: currentAdmin?.id }
    );

    setIsAddingNew(false);
    showToast(`New ${formPaymentMethod.toUpperCase()} receiving account added successfully`, 'success');
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Informational Header */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <span className="p-2.5 rounded-xl bg-amber-400 text-slate-950 shrink-0">
            <Building2 className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-amber-950">
                Company Receiving Accounts (Payment Accounts)
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  currentMode === 'PRODUCTION'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-400 text-slate-950'
                }`}
              >
                {currentMode} MODE
              </span>
            </div>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              Receiving accounts configured here are displayed to drivers in the Driver App for Top-Up deposits.
              Admins can edit accounts, change receiving banks or till numbers, and activate/deactivate endpoints without modifying Driver App code.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setFormAccountName('GoLife Taxi Pakistan (Pvt) Ltd');
              setFormAccountNumber('');
              setFormMobileNumber('');
              setFormIban('');
              setFormBankName('Habib Bank Limited (HBL)');
              setFormBranch('Gulberg Main Boulevard, Lahore');
              setFormPaymentMethod('bank');
              setFormTillNumber('');
              setFormEnvironment(isProductionDataSource() ? 'production' : 'demo');
              setIsAddingNew(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Add Receiving Account</span>
          </button>
        </div>
      </div>

      {saveSuccessNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {/* Point 4: Accounts Grid (JazzCash, Easypaisa, Bank) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map((acc) => {
          const isEasypaisa = acc.provider === 'easypaisa';
          const isJazzcash = acc.provider === 'jazzcash';
          const isBank = acc.provider === 'bank';
          const isActive = acc.status === 'active';

          return (
            <div
              key={acc.id}
              className={`p-5 rounded-2xl bg-white border transition shadow-xs space-y-4 flex flex-col justify-between ${
                isActive ? 'border-slate-200 hover:border-amber-300' : 'border-slate-200 opacity-60 bg-slate-50'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`p-2.5 rounded-xl text-white font-black text-xs uppercase tracking-wider ${
                        isEasypaisa
                          ? 'bg-emerald-600'
                          : isJazzcash
                          ? 'bg-red-600'
                          : isBank
                          ? 'bg-blue-600'
                          : 'bg-slate-800'
                      }`}
                    >
                      {isEasypaisa ? 'EP' : isJazzcash ? 'JC' : isBank ? 'HBL' : 'CASH'}
                    </span>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 leading-tight">
                        {acc.accountTitle || acc.accountName}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500 capitalize">
                        {acc.provider.toUpperCase()} • {acc.accountType}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-300'
                      }`}
                    >
                      {acc.status}
                    </span>
                  </div>
                </div>

                {/* Point 4 Fields */}
                <div className="space-y-2 pt-3 font-mono text-[11px]">
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-sans">Account Number:</span>
                      <strong className="text-slate-900">{acc.accountNumber}</strong>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-sans">Mobile Number:</span>
                      <span className="text-slate-800">{acc.mobileNumber || acc.accountNumber || '—'}</span>
                    </div>

                    {acc.tillNumber && (
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase font-sans">Till Number:</span>
                        <strong className="text-amber-700">{acc.tillNumber}</strong>
                      </div>
                    )}

                    {acc.iban && (
                      <div className="col-span-2 truncate">
                        <span className="text-[9px] text-slate-400 block uppercase font-sans">IBAN:</span>
                        <span className="text-slate-700 text-[10px] font-bold">{acc.iban}</span>
                      </div>
                    )}

                    {acc.bankName && (
                      <div className="col-span-2">
                        <span className="text-[9px] text-slate-400 block uppercase font-sans">Bank &amp; Branch:</span>
                        <span className="text-slate-800 text-[10px] font-bold">
                          {acc.bankName} {acc.branch ? `(${acc.branch})` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Environment & Metadata */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>
                      Env: <strong>{acc.environment ? acc.environment.toUpperCase() : 'DEMO'}</strong>
                    </span>
                    <span>Updated: {acc.updatedAt ? acc.updatedAt.split(' ')[0] : '2026-09-14'}</span>
                  </div>
                </div>
              </div>

              {/* Actions: Edit, Activate / Deactivate */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggleStatus(acc)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    isActive
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}
                  title={isActive ? 'Deactivate this account' : 'Activate this account'}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                </button>

                <button
                  onClick={() => setEditingAccount({ ...acc })}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                  title="Edit account details"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Point 4: EDIT ACCOUNT MODAL */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-xs animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-amber-400 border-b border-amber-500/30 flex items-center justify-between text-slate-950">
              <h3 className="text-sm font-black flex items-center gap-1.5">
                <Edit2 className="w-4 h-4" /> Edit Receiving Account ({editingAccount.provider.toUpperCase()})
              </h3>
              <button
                onClick={() => setEditingAccount(null)}
                className="p-1 rounded-lg hover:bg-black/10 text-slate-950 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Name / Title</label>
                <input
                  type="text"
                  value={editingAccount.accountTitle || editingAccount.accountName || ''}
                  onChange={(e) =>
                    setEditingAccount({
                      ...editingAccount,
                      accountTitle: e.target.value,
                      accountName: e.target.value
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={editingAccount.accountNumber}
                    onChange={(e) =>
                      setEditingAccount({ ...editingAccount, accountNumber: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={editingAccount.mobileNumber || ''}
                    onChange={(e) =>
                      setEditingAccount({ ...editingAccount, mobileNumber: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="e.g. 03001234567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Till Number (If Mobile Wallet)</label>
                  <input
                    type="text"
                    value={editingAccount.tillNumber || ''}
                    onChange={(e) =>
                      setEditingAccount({ ...editingAccount, tillNumber: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="e.g. 773412"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">IBAN (If Bank)</label>
                  <input
                    type="text"
                    value={editingAccount.iban || ''}
                    onChange={(e) =>
                      setEditingAccount({ ...editingAccount, iban: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="PK45HABB..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={editingAccount.bankName || ''}
                    onChange={(e) =>
                      setEditingAccount({ ...editingAccount, bankName: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="e.g. Habib Bank Limited"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Branch Name</label>
                  <input
                    type="text"
                    value={editingAccount.branch || ''}
                    onChange={(e) =>
                      setEditingAccount({ ...editingAccount, branch: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="e.g. Gulberg Lahore"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={editingAccount.status}
                    onChange={(e) =>
                      setEditingAccount({
                        ...editingAccount,
                        status: e.target.value as 'active' | 'inactive',
                        accountStatus: e.target.value as 'active' | 'inactive'
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="active">Active (Receiving Deposits)</option>
                    <option value="inactive">Inactive (Disabled in Driver App)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Environment</label>
                  <select
                    value={editingAccount.environment || 'demo'}
                    onChange={(e) =>
                      setEditingAccount({
                        ...editingAccount,
                        environment: e.target.value as 'demo' | 'production'
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="demo">DEMO (Test Mode)</option>
                    <option value="production">PRODUCTION (Live Mode)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[10px] flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  API secrets and gateway integration certificates remain protected via backend Cloud KMS and are never exposed in browser state.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black transition cursor-pointer shadow-xs"
                >
                  Save Account Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Point 4: ADD NEW ACCOUNT MODAL */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-xs animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-amber-400 border-b border-amber-500/30 flex items-center justify-between text-slate-950">
              <h3 className="text-sm font-black flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4" /> Add New Company Receiving Account
              </h3>
              <button
                onClick={() => setIsAddingNew(false)}
                className="p-1 rounded-lg hover:bg-black/10 text-slate-950 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewAccount} className="p-5 space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={formPaymentMethod}
                  onChange={(e) => setFormPaymentMethod(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="bank">Bank Transfer (HBL / 1Link / Raast)</option>
                  <option value="jazzcash">JazzCash Mobile Till / Merchant</option>
                  <option value="easypaisa">Easypaisa Mobile Till / Merchant</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Title / Name</label>
                <input
                  type="text"
                  value={formAccountName}
                  onChange={(e) => setFormAccountName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={formAccountNumber}
                    onChange={(e) => setFormAccountNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="e.g. 00427991823401"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={formMobileNumber}
                    onChange={(e) => setFormMobileNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="03001234567"
                  />
                </div>
              </div>

              {formPaymentMethod === 'bank' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={formBankName}
                        onChange={(e) => setFormBankName(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Branch</label>
                      <input
                        type="text"
                        value={formBranch}
                        onChange={(e) => setFormBranch(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">IBAN</label>
                    <input
                      type="text"
                      value={formIban}
                      onChange={(e) => setFormIban(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="PK45HABB0000427991823401"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Merchant Till Number</label>
                  <input
                    type="text"
                    value={formTillNumber}
                    onChange={(e) => setFormTillNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="e.g. 882190"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Environment Target</label>
                <select
                  value={formEnvironment}
                  onChange={(e) => setFormEnvironment(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="demo">DEMO (Test Mode - Simulated accounts)</option>
                  <option value="production">PRODUCTION (Live Mode)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black transition cursor-pointer shadow-xs"
                >
                  Create &amp; Deploy Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
