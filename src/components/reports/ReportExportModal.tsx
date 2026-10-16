import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  FileText,
  Printer,
  Download,
  CheckCircle2,
  Calendar,
  Layers,
  ShieldCheck
} from 'lucide-react';
import {
  MainReportMetrics,
  CityWiseReportItem,
  DriverWiseReportItem,
  ExportFormat
} from '../../types/reports';
import { exportReportData } from '../../services/reportsAnalyticsService';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: MainReportMetrics;
  cityReports: CityWiseReportItem[];
  driverReports: DriverWiseReportItem[];
  timeframe: string;
  selectedCity: string;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  metrics,
  cityReports,
  driverReports,
  timeframe,
  selectedCity
}) => {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [includeDriverDetails, setIncludeDriverDetails] = useState(true);
  const [includeCityBreakdown, setIncludeCityBreakdown] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      exportReportData(
        format,
        metrics,
        includeCityBreakdown ? cityReports : [],
        includeDriverDetails ? driverReports : [],
        timeframe,
        selectedCity
      );
      setIsExporting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight">Export Operations & Financial Report</h2>
              <p className="text-[11px] text-slate-400">One-click audited format generator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs text-slate-700">
          {/* Active Scope Summary */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-slate-900 capitalize">
                Period: {timeframe}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Scope:</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 font-black text-[11px] border border-amber-300">
                {selectedCity}
              </span>
            </div>
          </div>

          {/* Format selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
              Choose Document Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  format === 'csv'
                    ? 'border-amber-500 bg-amber-50/60 text-slate-950 font-black shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <FileSpreadsheet className={`w-5 h-5 ${format === 'csv' ? 'text-amber-600' : 'text-slate-400'}`} />
                <span className="text-xs font-bold">CSV Data</span>
                <span className="text-[10px] text-slate-400 font-normal">Fast .csv format</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('excel')}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  format === 'excel'
                    ? 'border-emerald-500 bg-emerald-50/60 text-slate-950 font-black shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <FileSpreadsheet className={`w-5 h-5 ${format === 'excel' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="text-xs font-bold">Excel (XLS)</span>
                <span className="text-[10px] text-slate-400 font-normal">Spreadsheet tables</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  format === 'pdf'
                    ? 'border-rose-500 bg-rose-50/60 text-slate-950 font-black shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Printer className={`w-5 h-5 ${format === 'pdf' ? 'text-rose-600' : 'text-slate-400'}`} />
                <span className="text-xs font-bold">PDF Print</span>
                <span className="text-[10px] text-slate-400 font-normal">Audited PDF view</span>
              </button>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
              Data Sections to Include
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeCityBreakdown}
                  onChange={(e) => setIncludeCityBreakdown(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                />
                <div>
                  <span className="font-bold text-slate-900 block">City-Wise Operational Breakdown</span>
                  <span className="text-[11px] text-slate-500">Includes rides, fares, commission & fines for all active cities</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeDriverDetails}
                  onChange={(e) => setIncludeDriverDetails(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Driver-Wise Performance & Balances</span>
                  <span className="text-[11px] text-slate-500">Includes 15 fields: trips, earnings, ratings, late pickups, balances</span>
                </div>
              </label>
            </div>
          </div>

          {/* Historical Data Protection Guarantee Notice */}
          <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-[11px] text-amber-950 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-black">Historical Data Protection Active:</strong>
              <span className="ml-1">
                Completed transactions are permanently locked to their original pricing and fine rule versions. Exports reflect true immutable records.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-2 shadow-2xs border border-amber-500/40 disabled:opacity-50"
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Export Downloaded!</span>
              </>
            ) : isExporting ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                <span>Compiling Data...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-slate-950" />
                <span>Download Report ({format.toUpperCase()})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
