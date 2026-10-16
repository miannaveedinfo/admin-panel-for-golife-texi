import React, { useState, useMemo } from 'react';
import {
  DriverWallet,
  CentralPaymentTransaction,
  TopUpRequest,
  WalletLedgerEntry,
  PaymentFeeRule
} from '../../types/paymentArchitecture';
import { formatPKR } from '../../utils/i18n';
import { useAdmin } from '../../context/AdminContext';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Receipt,
  Wallet,
  Percent,
  XCircle,
  Building2,
  Table,
  CheckCircle2
} from 'lucide-react';

interface WalletReportsTabProps {
  wallets: DriverWallet[];
  transactions: CentralPaymentTransaction[];
  topUps: TopUpRequest[];
}

export type WalletReportType =
  | 'top_up_report'
  | 'wallet_ledger_report'
  | 'payment_method_report'
  | 'fee_report'
  | 'failed_payment_report'
  | 'driver_wallet_report';

export const WalletReportsTab: React.FC<WalletReportsTabProps> = ({
  wallets,
  transactions,
  topUps
}) => {
  const { showToast } = useAdmin();
  const [selectedReport, setSelectedReport] = useState<WalletReportType>('top_up_report');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  // Generate Report Data dynamically
  const reportData = useMemo(() => {
    switch (selectedReport) {
      case 'top_up_report':
        return topUps.map((t) => ({
          'Transaction ID': t.id,
          'Driver Name': t.driverName,
          'Driver ID': t.driverId,
          'Payment Method': t.paymentMethod.toUpperCase(),
          'Amount (PKR)': t.amount,
          'Fee (PKR)': t.fee ?? (t.paymentMethod === 'bank' ? 20 : Math.round(t.amount * 0.01)),
          'Net Credit (PKR)': t.netCredit ?? Math.max(0, t.amount - (t.fee || 0)),
          'Status': t.status,
          'Provider Reference': t.referenceId,
          'Company Account': t.companyAccountTitle,
          'Requested At': t.requestedAt || t.createdAt || ''
        }));

      case 'wallet_ledger_report':
        return transactions.map((tx) => ({
          'Ledger UUID': tx.id,
          'Reference ID': tx.referenceId,
          'User Name': tx.userName,
          'User ID': tx.userId,
          'Transaction Type': tx.transactionType,
          'Payment Method': tx.paymentMethod.toUpperCase(),
          'Gross Amount (PKR)': tx.amount,
          'Fee/Commission (PKR)': tx.fee || tx.commissionAmount || 0,
          'Wallet Effect (PKR)': tx.walletEffect,
          'Balance After (PKR)': tx.balanceAfter,
          'Status': tx.status,
          'Timestamp': tx.timestamp
        }));

      case 'payment_method_report': {
        const methods = ['jazzcash', 'easypaisa', 'bank', 'cash'];
        return methods.map((m) => {
          const mTopups = topUps.filter((t) => t.paymentMethod === m);
          const mTx = transactions.filter((t) => t.paymentMethod === m);
          const volume = mTopups.reduce((sum, t) => sum + t.amount, 0);
          const successful = mTopups.filter(
            (t) => t.status === 'Completed' || t.status === 'SUCCESS' || t.status === 'Approved'
          ).length;
          const fees = mTopups.reduce((sum, t) => {
            return sum + (t.fee ?? (t.paymentMethod === 'bank' ? 20 : Math.round(t.amount * 0.01)));
          }, 0);

          return {
            'Payment Method': m.toUpperCase(),
            'Total Transactions': mTopups.length + mTx.length,
            'Total Top-Up Volume (PKR)': volume,
            'Successful Count': successful,
            'Failed Count': mTopups.filter((t) => t.status === 'Failed' || t.status === 'Rejected').length,
            'Processing Fees Collected (PKR)': fees
          };
        });
      }

      case 'fee_report':
        return topUps.map((t) => {
          const fee = t.fee ?? (t.paymentMethod === 'bank' ? 20 : Math.round(t.amount * 0.01));
          const net = t.netCredit ?? Math.max(0, t.amount - fee);
          return {
            'TopUp ID': t.id,
            'Driver Name': t.driverName,
            'Payment Method': t.paymentMethod.toUpperCase(),
            'Gross Amount (PKR)': t.amount,
            'Processing Fee (PKR)': fee,
            'Net Credited (PKR)': net,
            'Status': t.status,
            'Date': t.requestedAt || ''
          };
        });

      case 'failed_payment_report':
        return topUps
          .filter(
            (t) =>
              t.status === 'Failed' ||
              t.status === 'FAILED' ||
              t.status === 'Rejected' ||
              t.status === 'DECLINED' ||
              t.isSuspicious
          )
          .map((t) => ({
            'Transaction ID': t.id,
            'Driver Name': t.driverName,
            'Driver ID': t.driverId,
            'Driver Phone': t.driverPhone,
            'Method': t.paymentMethod.toUpperCase(),
            'Amount (PKR)': t.amount,
            'Status': t.status,
            'Failure Reason': t.failedReason || t.rejectedReason || (t.isSuspicious ? t.suspiciousReason : 'Provider Decline'),
            'Reference Attempted': t.referenceId,
            'Timestamp': t.requestedAt || ''
          }));

      case 'driver_wallet_report':
        return wallets.map((w) => ({
          'Driver ID': w.driverId,
          'Driver Name': w.driverName,
          'Phone': w.driverPhone,
          'Vehicle Plate': w.driverPlate,
          'City': w.driverCity,
          'Current Balance (PKR)': w.balance,
          'Payable Balance (PKR)': w.payableBalance,
          'Pending Balance (PKR)': w.pendingBalance,
          'Outstanding Dues (PKR)': w.outstandingDeductions,
          'Total Top Ups Credited (PKR)': w.totalTopUps,
          'Total Earnings (PKR)': w.totalEarnings,
          'Wallet Status': w.status,
          'Updated At': w.updatedAt
        }));

      default:
        return [];
    }
  }, [selectedReport, topUps, transactions, wallets]);

  // Export functions (CSV & JSON)
  const handleExport = () => {
    if (reportData.length === 0) {
      showToast('No data available to export for this report.', 'error');
      return;
    }

    const reportFileName = `GoLife_${selectedReport}_${new Date().toISOString().slice(0, 10)}`;

    if (exportFormat === 'json') {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(reportData, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `${reportFileName}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast(`Exported ${reportData.length} records as JSON.`, 'success');
      return;
    }

    // CSV format
    const headers = Object.keys(reportData[0]);
    const csvRows = [
      headers.join(','),
      ...reportData.map((row: any) =>
        headers
          .map((fieldName) => {
            const val = row[fieldName] !== undefined ? String(row[fieldName]) : '';
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(',')
      )
    ];

    const csvString = `data:text/csv;charset=utf-8,${encodeURIComponent(csvRows.join('\n'))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvString);
    downloadAnchor.setAttribute('download', `${reportFileName}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported ${reportData.length} records as CSV.`, 'success');
  };

  return (
    <div className="space-y-6 text-xs text-slate-900">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <span className="p-2.5 rounded-xl bg-amber-400 text-slate-950 shrink-0">
            <FileText className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-amber-950">
              Driver Wallet &amp; Payment Financial Reports Center
            </h3>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              Export comprehensive financial audits, top-up logs, double-entry wallet ledgers, payment method summaries, fee reports, and failure logs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-xs"
          >
            <option value="csv">CSV (Excel Compatible)</option>
            <option value="json">JSON (Data Interchange)</option>
          </select>

          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Point 18: Report Type Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'top_up_report', label: 'Top Up Report', icon: Receipt },
          { key: 'wallet_ledger_report', label: 'Wallet Ledger Report', icon: Table },
          { key: 'payment_method_report', label: 'Payment Method Report', icon: Building2 },
          { key: 'fee_report', label: 'Fee Report', icon: Percent },
          { key: 'failed_payment_report', label: 'Failed Payment Report', icon: XCircle },
          { key: 'driver_wallet_report', label: 'Driver Wallet Report', icon: Wallet }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedReport === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedReport(tab.key as WalletReportType)}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-amber-400 text-slate-950 shadow-xs ring-2 ring-amber-400/50'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Preview Table */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Report Data Preview ({reportData.length} records)
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Showing top {Math.min(reportData.length, 25)} rows
          </span>
        </div>

        {reportData.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            No report data generated for the selected report category.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100 max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                <tr>
                  {Object.keys(reportData[0]).map((h) => (
                    <th key={h} className="py-2.5 px-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {reportData.slice(0, 25).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition font-mono text-[11px]">
                    {Object.keys(row).map((k) => (
                      <td key={k} className="py-2 px-3 whitespace-nowrap">
                        {String(row[k])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
