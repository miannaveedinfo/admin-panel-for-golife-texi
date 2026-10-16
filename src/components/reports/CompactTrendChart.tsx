import React, { useState } from 'react';
import { AnalyticsTrendPoint } from '../../types/reports';
import { formatPKR } from '../../utils/i18n';
import {
  TrendingUp,
  DollarSign,
  Car,
  Percent,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Coins,
  Wallet
} from 'lucide-react';

interface CompactTrendChartProps {
  data: AnalyticsTrendPoint[];
  initialMetric?:
    | 'revenue'
    | 'rides'
    | 'commission'
    | 'driverEarnings'
    | 'cancellations'
    | 'fines'
    | 'refunds'
    | 'payouts';
}

export const CompactTrendChart: React.FC<CompactTrendChartProps> = ({
  data,
  initialMetric = 'revenue'
}) => {
  const [selectedMetric, setSelectedMetric] = useState<
    'revenue' | 'rides' | 'commission' | 'driverEarnings' | 'cancellations' | 'fines' | 'refunds' | 'payouts'
  >(initialMetric);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const metricConfigs = {
    revenue: {
      label: 'Gross Revenue',
      unit: 'PKR',
      icon: DollarSign,
      color: '#020617', // slate-950
      lineColor: '#f59e0b', // amber-500
      fillColor: 'rgba(245, 158, 11, 0.12)',
      isCurrency: true
    },
    rides: {
      label: 'Ride Volume',
      unit: 'Trips',
      icon: Car,
      color: '#0284c7', // sky-600
      lineColor: '#0284c7',
      fillColor: 'rgba(2, 132, 199, 0.12)',
      isCurrency: false
    },
    commission: {
      label: 'Platform Commission',
      unit: 'PKR',
      icon: Percent,
      color: '#059669', // emerald-600
      lineColor: '#059669',
      fillColor: 'rgba(5, 150, 105, 0.12)',
      isCurrency: true
    },
    driverEarnings: {
      label: 'Driver Earnings',
      unit: 'PKR',
      icon: Coins,
      color: '#7c3aed', // violet-600
      lineColor: '#7c3aed',
      fillColor: 'rgba(124, 58, 237, 0.12)',
      isCurrency: true
    },
    cancellations: {
      label: 'Cancellations',
      unit: 'Rides',
      icon: XCircle,
      color: '#e11d48', // rose-600
      lineColor: '#e11d48',
      fillColor: 'rgba(225, 29, 72, 0.12)',
      isCurrency: false
    },
    fines: {
      label: 'Fines Charged',
      unit: 'PKR',
      icon: AlertTriangle,
      color: '#ea580c', // orange-600
      lineColor: '#ea580c',
      fillColor: 'rgba(234, 88, 12, 0.12)',
      isCurrency: true
    },
    refunds: {
      label: 'Refunds Disbursed',
      unit: 'PKR',
      icon: RotateCcw,
      color: '#d97706', // amber-600
      lineColor: '#d97706',
      fillColor: 'rgba(217, 119, 6, 0.12)',
      isCurrency: true
    },
    payouts: {
      label: 'Driver Payouts',
      unit: 'PKR',
      icon: Wallet,
      color: '#0d9488', // teal-600
      lineColor: '#0d9488',
      fillColor: 'rgba(13, 148, 136, 0.12)',
      isCurrency: true
    }
  };

  const currentCfg = metricConfigs[selectedMetric];
  const values = data.map((d) => d[selectedMetric]);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);

  // SVG dimensions
  const width = 640;
  const height = 170;
  const paddingX = 36;
  const paddingY = 24;

  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  // Generate coordinates
  const points = data.map((item, index) => {
    const val = item[selectedMetric];
    const x = paddingX + (index / (data.length - 1 || 1)) * chartW;
    const norm = (val - minValue) / ((maxValue - minValue) || 1);
    const y = height - paddingY - norm * chartH;
    return { x, y, item, val };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  const totalCurrentValue = values.reduce((sum, v) => sum + v, 0);
  const activeItem = hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
      {/* Metric Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Analytics Trend Watch
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-950 border border-amber-300">
              8 Core Streams
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-lg font-black text-slate-950">
              {currentCfg.label}
            </h3>
            <span className="text-sm font-black font-mono" style={{ color: currentCfg.lineColor }}>
              {activeItem
                ? currentCfg.isCurrency
                  ? formatPKR(activeItem.val)
                  : `${activeItem.val.toLocaleString()} ${currentCfg.unit}`
                : 0}
            </span>
            {activeItem && (
              <span className="text-[11px] text-slate-500 font-medium">
                ({activeItem.item.label})
              </span>
            )}
          </div>
        </div>

        {/* 8 Metric Buttons - Compact Wrap */}
        <div className="flex items-center gap-1 flex-wrap">
          {(
            [
              { key: 'revenue', label: 'Revenue' },
              { key: 'rides', label: 'Rides' },
              { key: 'commission', label: 'Commission' },
              { key: 'driverEarnings', label: 'Driver Share' },
              { key: 'cancellations', label: 'Cancellations' },
              { key: 'fines', label: 'Fines' },
              { key: 'refunds', label: 'Refunds' },
              { key: 'payouts', label: 'Payouts' }
            ] as const
          ).map((m) => {
            const isSelected = selectedMetric === m.key;
            return (
              <button
                key={m.key}
                onClick={() => {
                  setSelectedMetric(m.key);
                  setHoveredIndex(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 shadow-2xs font-black border border-amber-500/40'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 select-none"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id={`grad-${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={currentCfg.lineColor} stopOpacity="0.32" />
              <stop offset="100%" stopColor={currentCfg.lineColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#f1f5f9"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height / 2}
            x2={width - paddingX}
            y2={height / 2}
            stroke="#f1f5f9"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#e2e8f0"
            strokeWidth="1"
          />

          {/* Area under curve */}
          <path d={areaD} fill={`url(#grad-${selectedMetric})`} />

          {/* Main trend line */}
          <path
            d={pathD}
            fill="none"
            stroke={currentCfg.lineColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive nodes */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredIndex(idx)}>
                {/* Invisible hover hotspot */}
                <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />

                {/* Visible dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? '5' : '3.5'}
                  fill={isHovered ? currentCfg.lineColor : '#ffffff'}
                  stroke={currentCfg.lineColor}
                  strokeWidth={isHovered ? '2.5' : '2'}
                  className="transition-all duration-150"
                />

                {/* X axis labels */}
                <text
                  x={pt.x}
                  y={height - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight={isHovered ? '700' : '500'}
                  fill={isHovered ? '#020617' : '#94a3b8'}
                >
                  {pt.item.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip if hovered */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute top-2 bg-slate-950 text-white px-3 py-1.5 rounded-xl shadow-lg text-xs pointer-events-none transform -translate-x-1/2 flex items-center gap-2 border border-slate-800"
            style={{
              left: `${(points[hoveredIndex].x / width) * 100}%`
            }}
          >
            <span className="text-[10px] text-amber-300 font-bold uppercase">
              {points[hoveredIndex].item.label}:
            </span>
            <span className="font-mono font-black">
              {currentCfg.isCurrency
                ? formatPKR(points[hoveredIndex].val)
                : `${points[hoveredIndex].val.toLocaleString()} ${currentCfg.unit}`}
            </span>
          </div>
        )}
      </div>

      {/* Metric summary footer bar */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time aggregated telemetry across all fleet dispatch nodes</span>
        </div>
        <div className="font-mono font-bold text-slate-800">
          Period Total: {currentCfg.isCurrency ? formatPKR(totalCurrentValue) : totalCurrentValue.toLocaleString()}
        </div>
      </div>
    </div>
  );
};
