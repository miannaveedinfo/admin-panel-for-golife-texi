import React, { useState } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { DateRangeOption } from '../types';
import { getTodayStr, getThisMonthRange } from '../utils/dateUtils';

export interface DateRangeState {
  range: DateRangeOption;
  selectedYear: number;
  selectedMonth: number | 'all'; // 0-11 or 'all'
  startDate?: string;
  endDate?: string;
}

interface DateRangeControlProps {
  value: DateRangeState;
  onChange: (newState: DateRangeState) => void;
  className?: string;
  showMonthlyGridOnYearly?: boolean;
  options?: { id: DateRangeOption; label: string }[];
}

export const DATE_RANGE_OPTIONS: { id: DateRangeOption; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'this_week', label: 'This Week' },
  { id: 'last_week', label: 'Last Week' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'this_year', label: 'This Year' },
  { id: 'last_year', label: 'Last Year' },
  { id: 'yearly', label: 'Yearly (All Months)' },
  { id: 'custom', label: 'Custom Date Range' }
];

export const DASHBOARD_DATE_OPTIONS: { id: DateRangeOption; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'this_week', label: 'Weekly' },
  { id: 'this_month', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' }
];

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const AVAILABLE_YEARS = [2026, 2025, 2024, 2023];

export const DateRangeControl: React.FC<DateRangeControlProps> = ({
  value,
  onChange,
  className = '',
  showMonthlyGridOnYearly = true,
  options
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeOptions = options || DATE_RANGE_OPTIONS;

  const currentOption = activeOptions.find((o) => o.id === value.range) || activeOptions[0] || DATE_RANGE_OPTIONS[0];

  const handleSelectRange = (range: DateRangeOption) => {
    onChange({
      ...value,
      range
    });
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Main Compact Dropdown Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl bg-white border border-slate-200 hover:border-amber-400 text-slate-800 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            title="Filter by Date Range"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate max-w-[150px]">{currentOption.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute right-0 sm:left-0 sm:right-auto mt-1.5 w-56 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 text-slate-800 text-xs">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Select Timeframe
                </div>
                <div className="py-1 max-h-64 overflow-y-auto">
                  {activeOptions.map((opt) => {
                    const isSelected = value.range === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectRange(opt.id)}
                        className={`w-full px-3 py-1.5 text-left flex items-center justify-between font-medium hover:bg-amber-50/70 hover:text-amber-950 transition cursor-pointer ${
                          isSelected ? 'bg-amber-50 text-amber-900 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* If Yearly is selected: render Year Selector */}
        {value.range === 'yearly' && (
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            {AVAILABLE_YEARS.map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => onChange({ ...value, selectedYear: yr })}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  value.selectedYear === yr
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        )}

        {/* If Custom Date Range is selected: render date pickers */}
        {value.range === 'custom' && (
          <div className="flex items-center gap-1.5 text-xs bg-slate-50 p-1 rounded-xl border border-slate-200">
            <input
              type="date"
              value={value.startDate || getThisMonthRange().startDate}
              onChange={(e) => onChange({ ...value, startDate: e.target.value })}
              className="px-2 py-1 rounded-lg border border-slate-200 text-slate-800 bg-white text-xs font-medium focus:ring-1 focus:ring-amber-400"
            />
            <span className="text-slate-400 font-bold">to</span>
            <input
              type="date"
              value={value.endDate || getTodayStr()}
              onChange={(e) => onChange({ ...value, endDate: e.target.value })}
              className="px-2 py-1 rounded-lg border border-slate-200 text-slate-800 bg-white text-xs font-medium focus:ring-1 focus:ring-amber-400"
            />
          </div>
        )}
      </div>

      {/* When Yearly is selected and monthly grid enabled: render the interactive 12-month selector */}
      {value.range === 'yearly' && showMonthlyGridOnYearly && (
        <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-100">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <span>{value.selectedYear} Monthly Matrix</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {value.selectedMonth === 'all'
                  ? 'Showing Full Year Totals'
                  : `Viewing: ${MONTH_NAMES_FULL[value.selectedMonth]} ${value.selectedYear}`}
              </span>
            </span>
            <button
              type="button"
              onClick={() => onChange({ ...value, selectedMonth: 'all' })}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                value.selectedMonth === 'all'
                  ? 'bg-amber-400 text-slate-950 font-black'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              All 12 Months
            </button>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
            {MONTH_NAMES_SHORT.map((mName, idx) => {
              const isCurrentMonth = value.selectedMonth === idx;
              return (
                <button
                  key={mName}
                  type="button"
                  onClick={() => onChange({ ...value, selectedMonth: idx })}
                  className={`py-1 text-center rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    isCurrentMonth
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-amber-50 hover:text-amber-950 border border-slate-200/60'
                  }`}
                >
                  {mName}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
