/**
 * GoLife Taxi Enterprise Date Utilities
 * Unified date calculation, parsing, formatting, and calendar helper functions
 * Authoritative reporting timezone: Asia/Karachi (PKT, UTC+5)
 */

export const TIMEZONE_PKT = 'Asia/Karachi';

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Returns date formatted as YYYY-MM-DD in Asia/Karachi timezone
 */
export function getPktDateStr(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE_PKT }).format(date);
  } catch {
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    const pktDate = new Date(utc + (5 * 3600000));
    const year = pktDate.getFullYear();
    const month = String(pktDate.getMonth() + 1).padStart(2, '0');
    const day = String(pktDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

/**
 * Returns today's ISO date string (YYYY-MM-DD) in Pakistan Standard Time
 */
export function getTodayStr(): string {
  return getPktDateStr(new Date());
}

/**
 * Adds or subtracts days to a YYYY-MM-DD string
 */
export function addDaysToDateStr(dateStr: string, days: number): string {
  if (!dateStr || typeof dateStr !== 'string') return getTodayStr();
  const parts = dateStr.split('-');
  const y = parseInt(parts[0], 10) || 2026;
  const m = parseInt(parts[1], 10) || 1;
  const d = parseInt(parts[2], 10) || 1;
  const date = new Date(Date.UTC(y, m - 1, d + days));
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns yesterday's ISO date string (YYYY-MM-DD) in Pakistan Standard Time
 */
export function getYesterdayStr(): string {
  return addDaysToDateStr(getTodayStr(), -1);
}

/**
 * Returns past date string (YYYY-MM-DD) N days ago
 */
export function getPastDateStr(daysAgo: number): string {
  return addDaysToDateStr(getTodayStr(), -daysAgo);
}

/**
 * Returns This Week range (Monday to Today)
 */
export function getThisWeekRange(): { startDate: string; endDate: string } {
  const today = getTodayStr();
  const [y, m, d] = today.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const dayOfWeek = date.getUTCDay();
  // Monday is start of business week: (dayOfWeek + 6) % 7 gives days from Monday
  const diffToMonday = (dayOfWeek + 6) % 7;
  const startOfWeek = addDaysToDateStr(today, -diffToMonday);
  return { startDate: startOfWeek, endDate: today };
}

/**
 * Returns Last Week range (previous Monday to Sunday)
 */
export function getLastWeekRange(): { startDate: string; endDate: string } {
  const thisWeek = getThisWeekRange();
  const lastWeekStart = addDaysToDateStr(thisWeek.startDate, -7);
  const lastWeekEnd = addDaysToDateStr(thisWeek.startDate, -1);
  return { startDate: lastWeekStart, endDate: lastWeekEnd };
}

/**
 * Returns This Month range (1st of current month to Today)
 */
export function getThisMonthRange(): { startDate: string; endDate: string } {
  const today = getTodayStr();
  const [y, m] = today.split('-');
  return { startDate: `${y}-${m}-01`, endDate: today };
}

/**
 * Returns Last Month range (1st to last day of previous month)
 */
export function getLastMonthRange(): { startDate: string; endDate: string } {
  const today = getTodayStr();
  const [y, m] = today.split('-').map(Number);
  const lastMonthDate = new Date(Date.UTC(y, m - 2, 1));
  const lastYear = lastMonthDate.getUTCFullYear();
  const lastMonth = String(lastMonthDate.getUTCMonth() + 1).padStart(2, '0');
  const lastDay = new Date(Date.UTC(lastYear, lastMonthDate.getUTCMonth() + 1, 0)).getUTCDate();
  return {
    startDate: `${lastYear}-${lastMonth}-01`,
    endDate: `${lastYear}-${lastMonth}-${String(lastDay).padStart(2, '0')}`
  };
}

/**
 * Returns This Year range (Jan 1 to Today)
 */
export function getThisYearRange(): { startDate: string; endDate: string } {
  const today = getTodayStr();
  const year = today.split('-')[0];
  return { startDate: `${year}-01-01`, endDate: today };
}

/**
 * Returns Last Year range (Jan 1 to Dec 31 of last year)
 */
export function getLastYearRange(): { startDate: string; endDate: string } {
  const today = getTodayStr();
  const lastYear = String(Number(today.split('-')[0]) - 1);
  return { startDate: `${lastYear}-01-01`, endDate: `${lastYear}-12-31` };
}

/**
 * Normalizes any date string (ISO, timestamp, space-separated, etc.) to YYYY-MM-DD
 * interpreted in Asia/Karachi timezone
 */
export function parseDateToYYYYMMDD(dateVal?: string | null | number | Date): string | null {
  if (!dateVal) return null;

  if (dateVal instanceof Date) {
    if (isNaN(dateVal.getTime())) return null;
    return getPktDateStr(dateVal);
  }

  if (typeof dateVal === 'number') {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return null;
    return getPktDateStr(d);
  }

  if (typeof dateVal !== 'string') return null;
  const trimmed = dateVal.trim();
  if (!trimmed) return null;

  // Strict YYYY-MM-DD
  const matchIsoOnly = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (matchIsoOnly) {
    return `${matchIsoOnly[1]}-${matchIsoOnly[2]}-${matchIsoOnly[3]}`;
  }

  // ISO with timestamp (e.g. 2026-09-22T21:00:00Z)
  if (trimmed.includes('T') || trimmed.includes('Z')) {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return getPktDateStr(d);
    }
  }

  // Format: DD MMM YYYY, e.g. "18 Sep 2026" or "18 September 2026"
  const matchDdmmyyyy = trimmed.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})/);
  if (matchDdmmyyyy) {
    const day = matchDdmmyyyy[1].padStart(2, '0');
    const mStr = matchDdmmyyyy[2].slice(0, 3).toLowerCase();
    const monthIdx = MONTH_NAMES_SHORT.findIndex((m) => m.toLowerCase() === mStr);
    if (monthIdx !== -1) {
      const month = String(monthIdx + 1).padStart(2, '0');
      const year = matchDdmmyyyy[3];
      return `${year}-${month}-${day}`;
    }
  }

  // Format: DD/MM/YYYY or MM/DD/YYYY
  const matchSlash = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (matchSlash) {
    const part1 = parseInt(matchSlash[1], 10);
    const part2 = parseInt(matchSlash[2], 10);
    const year = matchSlash[3];
    // If part1 > 12, it is definitely DD/MM/YYYY
    if (part1 > 12) {
      return `${year}-${String(part2).padStart(2, '0')}-${String(part1).padStart(2, '0')}`;
    }
    // Standard Pakistan convention is DD/MM/YYYY
    return `${year}-${String(part2).padStart(2, '0')}-${String(part1).padStart(2, '0')}`;
  }

  // Attempt standard JS Date parse as fallback
  try {
    const cleaned = trimmed.replace(' PKT', '');
    const parsed = new Date(cleaned);
    if (!isNaN(parsed.getTime())) {
      return getPktDateStr(parsed);
    }
  } catch {
    // Ignore error
  }

  return null;
}

/**
 * Checks if a given date string falls within [startDate, endDate] (inclusive)
 */
export function isDateInRange(
  dateVal: string | null | undefined | Date,
  startDate: string,
  endDate: string
): boolean {
  if (!dateVal) return false;
  const dateOnly = parseDateToYYYYMMDD(dateVal);
  if (!dateOnly) return false;
  return dateOnly >= startDate && dateOnly <= endDate;
}

/**
 * Returns exact start and end date (YYYY-MM-DD) for any UnifiedTimeframePeriod
 */
export function getDateRangeForTimeframe(
  mode: string,
  selectedDate?: string,
  endDate?: string,
  selectedYear: number = 2026,
  selectedMonth: number | string = 'all'
): { startDate: string; endDate: string } {
  switch (mode) {
    case 'today': {
      const today = selectedDate ? (parseDateToYYYYMMDD(selectedDate) || getTodayStr()) : getTodayStr();
      return { startDate: today, endDate: today };
    }
    case 'yesterday': {
      const yesterday = getYesterdayStr();
      return { startDate: yesterday, endDate: yesterday };
    }
    case 'weekly': {
      return getThisWeekRange();
    }
    case 'last_week': {
      return getLastWeekRange();
    }
    case 'monthly': {
      if (typeof selectedMonth === 'number') {
        const y = selectedYear || 2026;
        const m = String(selectedMonth + 1).padStart(2, '0');
        const lastDay = getDaysInMonth(y, selectedMonth + 1);
        return {
          startDate: `${y}-${m}-01`,
          endDate: `${y}-${m}-${String(lastDay).padStart(2, '0')}`
        };
      }
      return getThisMonthRange();
    }
    case 'last_month': {
      return getLastMonthRange();
    }
    case 'yearly': {
      const y = selectedYear || (selectedDate && typeof selectedDate === 'string' ? parseInt(selectedDate.split('-')[0], 10) : 2026);
      if (typeof selectedMonth === 'number') {
        const m = String(selectedMonth + 1).padStart(2, '0');
        const lastDay = getDaysInMonth(y, selectedMonth + 1);
        return {
          startDate: `${y}-${m}-01`,
          endDate: `${y}-${m}-${String(lastDay).padStart(2, '0')}`
        };
      }
      return {
        startDate: `${y}-01-01`,
        endDate: `${y}-12-31`
      };
    }
    case 'last_year': {
      return getLastYearRange();
    }
    case 'custom_date': {
      const s = selectedDate ? (parseDateToYYYYMMDD(selectedDate) || selectedDate) : getTodayStr();
      return { startDate: s, endDate: s };
    }
    case 'custom_range': {
      const s = selectedDate ? (parseDateToYYYYMMDD(selectedDate) || selectedDate) : getTodayStr();
      const e = endDate ? (parseDateToYYYYMMDD(endDate) || endDate) : s;
      return s <= e ? { startDate: s, endDate: e } : { startDate: e, endDate: s };
    }
    default: {
      const today = getTodayStr();
      return { startDate: today, endDate: today };
    }
  }
}

/**
 * Formats YYYY-MM-DD to human readable string (e.g. "18 Sep 2026")
 */
export function formatDateDisplay(dateStr?: string | null): string {
  if (!dateStr || typeof dateStr !== 'string') return 'Selected Date';
  const normalized = parseDateToYYYYMMDD(dateStr);
  if (!normalized || typeof normalized !== 'string') return String(dateStr);
  
  const parts = normalized.split('-');
  const year = parseInt(parts[0], 10) || 2026;
  const monthIdx = (parseInt(parts[1], 10) || 1) - 1;
  const day = parseInt(parts[2], 10) || 1;

  const monthName = MONTH_NAMES_SHORT[monthIdx] || parts[1];
  return `${day} ${monthName} ${year}`;
}

/**
 * Formats date range for display (e.g. "01 Sep 2026 - 19 Sep 2026")
 */
export function formatDateRangeDisplay(startDate: string, endDate: string): string {
  if (startDate === endDate) {
    return formatDateDisplay(startDate);
  }
  return `${formatDateDisplay(startDate)} — ${formatDateDisplay(endDate)}`;
}

/**
 * Short date formatting alias
 */
export function formatDateShort(dateStr?: string | null): string {
  return formatDateDisplay(dateStr);
}

/**
 * Formats YYYY-MM-DD to full descriptive string (e.g. "September 18, 2026")
 */
export function formatDateFull(dateStr?: string | null): string {
  if (!dateStr || typeof dateStr !== 'string') return 'Selected Date';
  const normalized = parseDateToYYYYMMDD(dateStr);
  if (!normalized || typeof normalized !== 'string') return String(dateStr);
  
  const parts = normalized.split('-');
  const year = parseInt(parts[0], 10) || 2026;
  const monthIdx = (parseInt(parts[1], 10) || 1) - 1;
  const day = parseInt(parts[2], 10) || 1;

  const monthName = MONTH_NAMES_FULL[monthIdx] || parts[1];
  return `${monthName} ${day}, ${year}`;
}

/**
 * Checks if a given YYYY-MM-DD is today
 */
export function isDateToday(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  return parseDateToYYYYMMDD(dateStr) === getTodayStr();
}

/**
 * Checks if a given YYYY-MM-DD is in the past (historical)
 */
export function isDatePast(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  const normalized = parseDateToYYYYMMDD(dateStr);
  if (!normalized) return false;
  return normalized < getTodayStr();
}

/**
 * Number of days in a specific month (1-indexed month: 1 = Jan, 12 = Dec)
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Day of week of the first day of the month (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

