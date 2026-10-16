import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  Check,
  RotateCcw,
  Clock,
  ArrowRight,
  CalendarRange
} from 'lucide-react';
import {
  MONTH_NAMES_SHORT,
  MONTH_NAMES_FULL,
  DAY_NAMES_SHORT,
  getTodayStr,
  getYesterdayStr,
  getThisWeekRange,
  getLastWeekRange,
  getThisMonthRange,
  getLastMonthRange,
  getThisYearRange,
  getLastYearRange,
  getDateRangeForTimeframe,
  parseDateToYYYYMMDD,
  formatDateDisplay,
  formatDateRangeDisplay,
  isDateToday,
  isDatePast,
  getDaysInMonth,
  getFirstDayOfMonth
} from '../../utils/dateUtils';
import { UnifiedTimeframePeriod } from '../../services/commissionService';

export interface DashboardCalendarPickerProps {
  mode: UnifiedTimeframePeriod;
  selectedDate: string; // YYYY-MM-DD
  endDate?: string;     // YYYY-MM-DD
  selectedYear?: number;
  selectedMonth?: number | string;
  onChange: (filter: {
    mode: UnifiedTimeframePeriod;
    selectedDate: string;
    endDate?: string;
    selectedYear: number;
    selectedMonth: number | string;
  }) => void;
  className?: string;
  compact?: boolean;
}

export const DashboardCalendarPicker: React.FC<DashboardCalendarPickerProps> = ({
  mode,
  selectedDate,
  endDate,
  selectedYear = 2026,
  selectedMonth = 'all',
  onChange,
  className = '',
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Local draft state while calendar is open
  const todayStr = getTodayStr();
  const initialStartDate = selectedDate ? (parseDateToYYYYMMDD(selectedDate) || selectedDate) : todayStr;
  const initialEndDate = endDate ? (parseDateToYYYYMMDD(endDate) || endDate) : initialStartDate;

  const [draftStartDate, setDraftStartDate] = useState<string>(initialStartDate);
  const [draftEndDate, setDraftEndDate] = useState<string>(initialEndDate);
  const [draftMode, setDraftMode] = useState<UnifiedTimeframePeriod>(mode);
  const [rangeSelectStep, setRangeSelectStep] = useState<'start' | 'end'>('start');

  // Month & year being browsed in the calendar grid
  const [browseYear, setBrowseYear] = useState<number>(() => {
    const parts = (initialStartDate || todayStr).split('-');
    return parseInt(parts[0], 10) || new Date().getFullYear();
  });
  const [browseMonth, setBrowseMonth] = useState<number>(() => {
    const parts = (initialStartDate || todayStr).split('-');
    return (parseInt(parts[1], 10) || (new Date().getMonth() + 1)) - 1; // 0-indexed
  });

  // Sync draft state when props change
  useEffect(() => {
    const cleanStart = selectedDate ? (parseDateToYYYYMMDD(selectedDate) || selectedDate) : todayStr;
    const cleanEnd = endDate ? (parseDateToYYYYMMDD(endDate) || endDate) : cleanStart;
    setDraftStartDate(cleanStart);
    setDraftEndDate(cleanEnd);
    setDraftMode(mode);
    const parts = (cleanStart || todayStr).split('-');
    setBrowseYear(parseInt(parts[0], 10) || new Date().getFullYear());
    setBrowseMonth((parseInt(parts[1], 10) || (new Date().getMonth() + 1)) - 1);
  }, [selectedDate, endDate, mode, todayStr]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Navigate browse month/year
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (browseMonth === 0) {
      setBrowseMonth(11);
      setBrowseYear((y) => y - 1);
    } else {
      setBrowseMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (browseMonth === 11) {
      setBrowseMonth(0);
      setBrowseYear((y) => y + 1);
    } else {
      setBrowseMonth((m) => m + 1);
    }
  };

  const handlePrevYear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBrowseYear((y) => y - 1);
  };

  const handleNextYear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBrowseYear((y) => y + 1);
  };

  // Day selection handling (single date vs range)
  const handleSelectDay = (day: number) => {
    const mStr = String(browseMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const formatted = `${browseYear}-${mStr}-${dStr}`;

    if (draftMode === 'custom_range') {
      if (rangeSelectStep === 'start') {
        setDraftStartDate(formatted);
        setDraftEndDate(formatted);
        setRangeSelectStep('end');
      } else {
        // Finishing range
        let start = draftStartDate;
        let end = formatted;
        if (formatted < start) {
          start = formatted;
          end = draftStartDate;
        }
        setDraftStartDate(start);
        setDraftEndDate(end);
        setRangeSelectStep('start');
        onChange({
          mode: 'custom_range',
          selectedDate: start,
          endDate: end,
          selectedYear: browseYear,
          selectedMonth: browseMonth
        });
      }
      return;
    }

    const newMode = formatted === todayStr ? 'today' : 'custom_date';
    setDraftStartDate(formatted);
    setDraftEndDate(formatted);
    setDraftMode(newMode);

    onChange({
      mode: newMode,
      selectedDate: formatted,
      endDate: formatted,
      selectedYear: browseYear,
      selectedMonth: browseMonth
    });
  };

  // Quick preset click
  const handlePresetClick = (presetMode: UnifiedTimeframePeriod) => {
    setDraftMode(presetMode);
    const range = getDateRangeForTimeframe(presetMode, draftStartDate, draftEndDate, browseYear, browseMonth);
    setDraftStartDate(range.startDate);
    setDraftEndDate(range.endDate);

    const startStr = range.startDate || todayStr;
    const parts = startStr.split('-');
    const newYear = parseInt(parts[0], 10) || new Date().getFullYear();
    const newMonth = (parseInt(parts[1], 10) || 1) - 1;
    setBrowseYear(newYear);
    setBrowseMonth(newMonth);

    onChange({
      mode: presetMode,
      selectedDate: range.startDate,
      endDate: range.endDate,
      selectedYear: newYear,
      selectedMonth: presetMode === 'monthly' ? newMonth : 'all'
    });

    if (presetMode !== 'custom_range') {
      setIsOpen(false);
    } else {
      setRangeSelectStep('start');
    }
  };

  // Jump to Today button inside calendar
  const handleJumpToToday = () => {
    const now = new Date();
    const nowStr = todayStr;
    setDraftStartDate(nowStr);
    setDraftEndDate(nowStr);
    setDraftMode('today');
    setBrowseYear(now.getFullYear());
    setBrowseMonth(now.getMonth());
    onChange({
      mode: 'today',
      selectedDate: nowStr,
      endDate: nowStr,
      selectedYear: now.getFullYear(),
      selectedMonth: 'all'
    });
    setIsOpen(false);
  };

  // Apply / View Date action button
  const handleApply = () => {
    let finalMode = draftMode;
    let s = draftStartDate;
    let e = draftEndDate;
    if (s > e) {
      const temp = s;
      s = e;
      e = temp;
    }

    if (finalMode === 'today' && s !== todayStr) {
      finalMode = 'custom_date';
    }

    onChange({
      mode: finalMode,
      selectedDate: s,
      endDate: e,
      selectedYear: browseYear,
      selectedMonth: finalMode === 'monthly' ? browseMonth : 'all'
    });
    setIsOpen(false);
  };

  // Compute calendar grid days
  const daysInMonth = getDaysInMonth(browseYear, browseMonth + 1);
  const firstDayOfWeek = getFirstDayOfMonth(browseYear, browseMonth + 1);
  const prevMonthDays = getDaysInMonth(
    browseMonth === 0 ? browseYear - 1 : browseYear,
    browseMonth === 0 ? 12 : browseMonth
  );

  // Trigger button label
  const getTriggerLabel = () => {
    const range = getDateRangeForTimeframe(mode, selectedDate, endDate, selectedYear, selectedMonth);
    const startStr = range.startDate || todayStr;
    const endStr = range.endDate || startStr;

    switch (mode) {
      case 'today':
        return `Today (${formatDateDisplay(startStr)})`;
      case 'yesterday':
        return `Yesterday (${formatDateDisplay(startStr)})`;
      case 'weekly':
        return `This Week (${formatDateDisplay(startStr).slice(0, 6)} - ${formatDateDisplay(endStr)})`;
      case 'last_week':
        return `Last Week (${formatDateDisplay(startStr).slice(0, 6)} - ${formatDateDisplay(endStr)})`;
      case 'monthly': {
        const mIdx = typeof selectedMonth === 'number' ? selectedMonth : browseMonth;
        return `This Month (${MONTH_NAMES_SHORT[mIdx]} ${selectedYear || browseYear})`;
      }
      case 'last_month': {
        const parts = startStr.split('-');
        const mIdx = (parseInt(parts[1], 10) || 1) - 1;
        return `Last Month (${MONTH_NAMES_SHORT[mIdx] || ''} ${parts[0] || ''})`;
      }
      case 'yearly':
        return `This Year (${selectedYear || browseYear})`;
      case 'last_year':
        return `Last Year (${startStr.slice(0, 4)})`;
      case 'custom_date':
        return formatDateDisplay(startStr);
      case 'custom_range':
        return formatDateRangeDisplay(startStr, endStr);
      default:
        return formatDateDisplay(startStr);
    }
  };

  const isHistorical = mode !== 'today' || (selectedDate && selectedDate < todayStr);

  // Year options for dropdown (supports historical years back to 2020)
  const yearOptions = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        id="dashboard-calendar-picker-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 rounded-lg border transition-all cursor-pointer select-none ${
          isOpen
            ? 'bg-amber-50/80 border-amber-400 text-slate-900 ring-2 ring-amber-400/20 shadow-sm'
            : 'bg-white border-slate-200 hover:border-amber-400 hover:bg-slate-50/80 text-slate-800 shadow-2xs'
        } ${compact ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-xs sm:text-sm font-semibold'}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <CalendarIcon className={`w-4 h-4 shrink-0 ${isOpen || isHistorical ? 'text-amber-600' : 'text-slate-500'}`} />
        <span className="truncate max-w-[210px] sm:max-w-[280px]">{getTriggerLabel()}</span>
        {isHistorical && (
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 shrink-0">
            {mode === 'yesterday' ? 'Yesterday' : (typeof mode === 'string' && mode.includes('last')) ? 'Previous' : 'Historical'}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-600' : ''}`} />
      </button>

      {/* Popover Calendar Modal */}
      {isOpen && (
        <div
          id="dashboard-calendar-popover"
          className="absolute right-0 top-full mt-1.5 z-50 w-[340px] sm:w-[390px] max-w-[calc(100vw-1.5rem)] bg-white border border-slate-200 rounded-xl shadow-2xl p-4 text-slate-900 animate-in fade-in zoom-in-95 duration-150"
          style={{ transformOrigin: 'top right' }}
        >
          {/* 1. Quick Presets (Two compact rows covering all requirements) */}
          <div className="space-y-1.5 mb-3.5">
            <div className="flex items-center justify-between gap-1 p-1 bg-slate-100/90 rounded-lg text-xs font-semibold">
              <button
                type="button"
                id="preset-btn-today"
                onClick={() => handlePresetClick('today')}
                className={`flex-1 py-1.5 px-1.5 rounded-md transition cursor-pointer text-center text-[11px] ${
                  draftMode === 'today'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                id="preset-btn-yesterday"
                onClick={() => handlePresetClick('yesterday')}
                className={`flex-1 py-1.5 px-1.5 rounded-md transition cursor-pointer text-center text-[11px] ${
                  draftMode === 'yesterday'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                Yesterday
              </button>
              <button
                type="button"
                id="preset-btn-weekly"
                onClick={() => handlePresetClick('weekly')}
                className={`flex-1 py-1.5 px-1.5 rounded-md transition cursor-pointer text-center text-[11px] ${
                  draftMode === 'weekly'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                This Week
              </button>
              <button
                type="button"
                id="preset-btn-last-week"
                onClick={() => handlePresetClick('last_week')}
                className={`flex-1 py-1.5 px-1.5 rounded-md transition cursor-pointer text-center text-[11px] ${
                  draftMode === 'last_week'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                Last Week
              </button>
            </div>

            <div className="flex items-center justify-between gap-1 p-1 bg-slate-100/90 rounded-lg text-xs font-semibold">
              <button
                type="button"
                id="preset-btn-monthly"
                onClick={() => handlePresetClick('monthly')}
                className={`flex-1 py-1.5 px-1.5 rounded-md transition cursor-pointer text-center text-[11px] ${
                  draftMode === 'monthly'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                This Month
              </button>
              <button
                type="button"
                id="preset-btn-last-month"
                onClick={() => handlePresetClick('last_month')}
                className={`flex-1 py-1.5 px-1.5 rounded-md transition cursor-pointer text-center text-[11px] ${
                  draftMode === 'last_month'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                Last Month
              </button>
              <button
                type="button"
                id="preset-btn-yearly"
                onClick={() => handlePresetClick('yearly')}
                className={`flex-1 py-1.5 px-1.5 rounded-md transition cursor-pointer text-center text-[11px] ${
                  draftMode === 'yearly'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                This Year
              </button>
              <button
                type="button"
                id="preset-btn-last-year"
                onClick={() => handlePresetClick('last_year')}
                className={`flex-1 py-1.5 px-1.5 rounded-md transition cursor-pointer text-center text-[11px] ${
                  draftMode === 'last_year'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                Last Year
              </button>
              <button
                type="button"
                id="preset-btn-custom-range"
                onClick={() => handlePresetClick('custom_range')}
                className={`flex-1 py-1.5 px-1.5 rounded-md transition cursor-pointer text-center text-[11px] flex items-center justify-center gap-0.5 ${
                  draftMode === 'custom_range'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <CalendarRange className="w-3 h-3" />
                Range
              </button>
            </div>
          </div>

          {draftMode === 'custom_range' && (
            <div className="mb-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center justify-between">
              <span>
                {rangeSelectStep === 'start' ? 'Click start date on calendar' : 'Click end date on calendar'}
              </span>
              <span className="font-bold font-mono">
                {draftStartDate} ➔ {draftEndDate}
              </span>
            </div>
          )}

          {/* 2. Month & Year Navigation Bar */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                id="cal-prev-year"
                title="Previous Year"
                onClick={handlePrevYear}
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                id="cal-prev-month"
                title="Previous Month"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Month & Year Selectors */}
            <div className="flex items-center gap-1.5">
              <select
                id="cal-select-month"
                value={browseMonth}
                onChange={(e) => setBrowseMonth(parseInt(e.target.value, 10))}
                className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-md py-1 px-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
              >
                {MONTH_NAMES_FULL.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                id="cal-select-year"
                value={browseYear}
                onChange={(e) => setBrowseYear(parseInt(e.target.value, 10))}
                className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-md py-1 px-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                id="cal-next-month"
                title="Next Month"
                onClick={handleNextMonth}
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                id="cal-next-year"
                title="Next Year"
                onClick={handleNextYear}
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3. Calendar Grid */}
          <div className="mb-3.5">
            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {DAY_NAMES_SHORT.map((day) => (
                <div key={day} className="text-[11px] font-bold text-slate-400 py-1 uppercase">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Matrix */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Previous month leading days */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => {
                const dayNum = prevMonthDays - firstDayOfWeek + i + 1;
                return (
                  <div
                    key={`prev-${i}`}
                    className="h-8 flex items-center justify-center text-slate-300 text-xs select-none"
                  >
                    {dayNum}
                  </div>
                );
              })}

              {/* Current month days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const mStr = String(browseMonth + 1).padStart(2, '0');
                const dStr = String(day).padStart(2, '0');
                const cellDate = `${browseYear}-${mStr}-${dStr}`;

                const isStart = draftStartDate === cellDate;
                const isEnd = draftEndDate === cellDate;
                const isInRange =
                  draftMode === 'custom_range' &&
                  cellDate >= draftStartDate &&
                  cellDate <= draftEndDate;
                const isTodayCell = cellDate === todayStr;

                let cellStyle = 'text-slate-700 hover:bg-slate-100 hover:text-slate-950';
                if (isStart || isEnd) {
                  cellStyle = 'bg-amber-400 text-slate-950 font-black shadow-sm ring-2 ring-amber-400/30';
                } else if (isInRange) {
                  cellStyle = 'bg-amber-100 text-amber-950 font-semibold';
                } else if (isTodayCell) {
                  cellStyle = 'bg-amber-50 text-amber-900 font-bold border border-amber-300 hover:bg-amber-100';
                }

                return (
                  <button
                    key={cellDate}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={`h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer flex flex-col items-center justify-center relative select-none ${cellStyle}`}
                  >
                    <span>{day}</span>
                    {isTodayCell && !isStart && !isEnd && (
                      <span className="w-1 h-1 rounded-full bg-amber-500 absolute bottom-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Footer & Action Buttons */}
          <div className="pt-3 border-t border-slate-200/80 flex flex-col gap-2.5">
            {/* Selected Date indicator */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 truncate max-w-[200px]">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="shrink-0">Active:</span>
                <span className="font-bold text-slate-800 truncate font-mono text-[11px]">
                  {draftMode === 'custom_range'
                    ? `${draftStartDate} ➔ ${draftEndDate}`
                    : formatDateDisplay(draftStartDate)}
                </span>
              </div>
              <button
                type="button"
                id="cal-jump-today"
                onClick={handleJumpToToday}
                className="text-amber-600 hover:text-amber-700 font-bold hover:underline transition cursor-pointer text-xs flex items-center gap-1 shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                Reset to Today
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="cal-apply-btn"
                onClick={handleApply}
                className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                Apply Date
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

