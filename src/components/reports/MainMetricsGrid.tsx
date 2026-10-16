import React from 'react';
import { MainReportMetrics } from '../../types/reports';
import { formatPKR } from '../../utils/i18n';
import {
  Car,
  CheckCircle2,
  XCircle,
  Radio,
  Users,
  UserCheck,
  UserPlus,
  Coins,
  DollarSign,
  Percent,
  Sliders,
  Landmark,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Scale,
  Wallet,
  ShieldCheck,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';

interface MainMetricsGridProps {
  metrics: MainReportMetrics;
  onMetricClick?: (metricKey: keyof MainReportMetrics) => void;
}

export const MainMetricsGrid: React.FC<MainMetricsGridProps> = ({
  metrics,
  onMetricClick
}) => {
  const cards: {
    key: keyof MainReportMetrics;
    label: string;
    value: string | number;
    subtext: string;
    icon: React.ElementType;
    color: string;
    isCurrency?: boolean;
    badge?: string;
    badgeColor?: string;
    highlight?: boolean;
  }[] = [
    // Top Row: Core Volume & Rides
    {
      key: 'totalRides',
      label: 'Total Rides',
      value: (metrics?.totalRides ?? 0).toLocaleString(),
      subtext: 'Completed, active & cancelled',
      icon: Car,
      color: 'text-slate-900',
      badge: 'Demand'
    },
    {
      key: 'completedRides',
      label: 'Completed Rides',
      value: (metrics?.completedRides ?? 0).toLocaleString(),
      subtext: 'Fares successfully collected',
      icon: CheckCircle2,
      color: 'text-emerald-700',
      badge: '94% SLA',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      key: 'cancelledRides',
      label: 'Cancelled Rides',
      value: (metrics?.cancelledRides ?? 0).toLocaleString(),
      subtext: 'Driver/passenger cancellations',
      icon: XCircle,
      color: 'text-rose-600',
      badge: 'Click to Audit',
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-200'
    },
    {
      key: 'activeRides',
      label: 'Active Rides',
      value: (metrics?.activeRides ?? 0).toLocaleString(),
      subtext: 'Live trips moving on roads',
      icon: Radio,
      color: 'text-amber-600',
      badge: 'Live',
      badgeColor: 'bg-amber-100 text-amber-950 border-amber-300 animate-pulse'
    },

    // Row 2: Fleet & Passengers
    {
      key: 'totalDrivers',
      label: 'Total Fleet Drivers',
      value: (metrics?.totalDrivers ?? 0).toLocaleString(),
      subtext: 'Registered & onboarded drivers',
      icon: Users,
      color: 'text-slate-800'
    },
    {
      key: 'onlineDrivers',
      label: 'Online / On Trip',
      value: (metrics?.onlineDrivers ?? 0).toLocaleString(),
      subtext: 'Ready for instant dispatch',
      icon: UserCheck,
      color: 'text-emerald-600',
      badge: 'Active Now'
    },
    {
      key: 'newDrivers',
      label: 'New Drivers Onboarded',
      value: (metrics?.newDrivers ?? 0).toLocaleString(),
      subtext: 'Joined this reporting period',
      icon: UserPlus,
      color: 'text-blue-600'
    },
    {
      key: 'totalPassengers',
      label: 'Total Passengers',
      value: (metrics?.totalPassengers ?? 0).toLocaleString(),
      subtext: 'Registered user base',
      icon: Users,
      color: 'text-slate-800'
    },
    {
      key: 'newPassengers',
      label: 'New Passengers Joined',
      value: (metrics?.newPassengers ?? 0).toLocaleString(),
      subtext: 'New signups in scope',
      icon: UserPlus,
      color: 'text-sky-600'
    },

    // Row 3: Revenue & Platform Financials
    {
      key: 'grossRevenue',
      label: 'Gross Revenue (GBV)',
      value: formatPKR(metrics.grossRevenue),
      subtext: 'Total passenger ride billings',
      icon: DollarSign,
      color: 'text-slate-950',
      highlight: true,
      badge: 'Gross Fare'
    },
    {
      key: 'netPlatformRevenue',
      label: 'Net Platform Revenue',
      value: formatPKR(metrics.netPlatformRevenue),
      subtext: 'Net retained earnings formula',
      icon: ShieldCheck,
      color: 'text-emerald-700',
      highlight: true,
      badge: 'Final Take'
    },
    {
      key: 'platformCommission',
      label: 'Platform Commission',
      value: formatPKR(metrics.platformCommission),
      subtext: 'Nominal 15% standard take rate',
      icon: Percent,
      color: 'text-amber-600'
    },
    {
      key: 'driverEarnings',
      label: 'Driver Earnings Share',
      value: formatPKR(metrics.driverEarnings),
      subtext: 'Accrued to driver balances',
      icon: Coins,
      color: 'text-violet-700'
    },
    {
      key: 'serviceCharges',
      label: 'Service & Booking Fees',
      value: formatPKR(metrics.serviceCharges),
      subtext: 'Fixed passenger/driver fees',
      icon: Sliders,
      color: 'text-blue-700'
    },

    // Row 4: Compliance, Deductions, and Payouts
    {
      key: 'taxes',
      label: 'Provincial Sales Tax',
      value: formatPKR(metrics.taxes),
      subtext: 'PRA 5% / SRB statutory filing',
      icon: Landmark,
      color: 'text-slate-600'
    },
    {
      key: 'fines',
      label: 'Fines & Penalties',
      value: formatPKR(metrics.fines),
      subtext: 'Late pickups & cancellation penalties',
      icon: AlertTriangle,
      color: 'text-orange-600',
      badge: 'Audited'
    },
    {
      key: 'refunds',
      label: 'Passenger Refunds',
      value: formatPKR(metrics.refunds),
      subtext: 'Disbursed courtesy compensations',
      icon: RotateCcw,
      color: 'text-amber-700'
    },
    {
      key: 'reimbursements',
      label: 'Driver Reimbursements',
      value: formatPKR(metrics.reimbursements),
      subtext: 'Approved toll & fee repayments',
      icon: RefreshCw,
      color: 'text-teal-700'
    },
    {
      key: 'adjustments',
      label: 'Financial Adjustments',
      value: formatPKR(metrics.adjustments),
      subtext: 'Net manual reconciliations',
      icon: Scale,
      color: 'text-indigo-700'
    },
    {
      key: 'payouts',
      label: 'Completed Payouts',
      value: formatPKR(metrics.payouts),
      subtext: 'Disbursed via JazzCash/EasyPaisa',
      icon: Wallet,
      color: 'text-emerald-800',
      badge: 'Settled'
    }
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wider text-slate-500">
          Executive Operations &amp; Financial Ledger (20 Standard Metrics)
        </span>
        <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
          <span>Click any card to inspect related records</span>
          <ArrowUpRight className="w-3 h-3 text-amber-500" />
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.key}
              onClick={() => onMetricClick && onMetricClick(c.key)}
              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between group relative shadow-2xs hover:shadow-sm ${
                c.highlight
                  ? 'bg-amber-50/50 border-amber-300/80 hover:border-amber-400'
                  : 'bg-white border-slate-200 hover:border-amber-400/80'
              }`}
            >
              {/* Card top */}
              <div className="flex items-start justify-between gap-1 mb-2">
                <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-900 transition leading-tight line-clamp-1">
                  {c.label}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <Icon className={`w-3.5 h-3.5 ${c.color}`} />
                </div>
              </div>

              {/* Value & subtext */}
              <div>
                <div className="text-base sm:text-lg font-black text-slate-950 tracking-tight font-mono">
                  {c.value}
                </div>
                <div className="flex items-center justify-between gap-1 mt-1">
                  <span className="text-[10px] text-slate-500 truncate">
                    {c.subtext}
                  </span>
                  {c.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border shrink-0 ${
                        c.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {c.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Hover indicator */}
              <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
