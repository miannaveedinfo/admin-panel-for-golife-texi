import React from 'react';
import {
  X,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Percent,
  Clock,
  Car,
  Star,
  FileText
} from 'lucide-react';
import { DriverPerformanceAggregate } from '../../types';

interface PerformanceScoreBreakdownModalProps {
  driver: DriverPerformanceAggregate;
  onClose: () => void;
  onOpenControl?: () => void;
}

export const PerformanceScoreBreakdownModal: React.FC<PerformanceScoreBreakdownModalProps> = ({
  driver,
  onClose,
  onOpenControl
}) => {
  const safeDriver = (driver || {}) as any;
  const rawFactors = safeDriver.factors;
  const factors = {
    rideCompletion: rawFactors?.rideCompletion ?? Math.round((safeDriver.acceptanceRate || 95) * 0.98),
    cancellationBehavior: rawFactors?.cancellationBehavior ?? (safeDriver.accountStatus === 'suspended' ? 35 : 94),
    pickupPunctuality: rawFactors?.pickupPunctuality ?? 92,
    passengerRatings: rawFactors?.passengerRatings ?? Math.round(((safeDriver.rating || 4.8) / 5.0) * 100),
    acceptanceBehavior: rawFactors?.acceptanceBehavior ?? (safeDriver.acceptanceRate || 92),
    dropoffPunctuality: rawFactors?.dropoffPunctuality ?? 95,
    complaints: rawFactors?.complaints ?? (safeDriver.complaintsCount > 0 ? 70 : 96),
    safetyIncidents: rawFactors?.safetyIncidents ?? (safeDriver.safetyIncidentsCount > 0 ? 60 : 98),
    verificationStatus: rawFactors?.verificationStatus ?? (safeDriver.verificationStatus === 'verified' ? 100 : 50),
    policyViolations: rawFactors?.policyViolations ?? (safeDriver.warnings?.length > 0 ? 65 : 95)
  };

  const performanceScore = safeDriver.performanceScore ?? safeDriver.overallScore ?? 88;
  const performanceLevel = safeDriver.performanceLevel ?? 'Good';
  const trend = safeDriver.trend ?? 'stable';
  const riskLevel = safeDriver.riskLevel ?? 'Low';
  const driverId = safeDriver.driverId || safeDriver.id || 'DRV-001';
  const driverName = safeDriver.driverName || safeDriver.name || 'Driver';
  const city = safeDriver.city || 'Lahore';
  const plate = safeDriver.driverPlate || safeDriver.vehicle?.plate || 'LE-2024';
  const category = safeDriver.category || safeDriver.vehicle?.category || 'Ride';

  const factorItems = [
    {
      key: 'rideCompletion',
      name: 'Ride Completion Rate',
      weight: '15%',
      score: factors.rideCompletion,
      icon: Car,
      desc: 'Completed rides ratio vs assigned rides without unexcused drops.'
    },
    {
      key: 'cancellationBehavior',
      name: 'Driver Cancellation Policy',
      weight: '15%',
      score: factors.cancellationBehavior,
      icon: AlertTriangle,
      desc: 'Post-acceptance cancellation frequency and off-app cancellation requests.'
    },
    {
      key: 'pickupPunctuality',
      name: 'Pickup Punctuality',
      weight: '15%',
      score: factors.pickupPunctuality,
      icon: Clock,
      desc: 'Arrival at passenger pickup pin vs ETA. Excludes verified road blocks.'
    },
    {
      key: 'passengerRatings',
      name: 'Passenger Star Ratings',
      weight: '15%',
      score: factors.passengerRatings,
      icon: Star,
      desc: 'Average passenger rating normalized against 5.0 quality benchmark.'
    },
    {
      key: 'acceptanceBehavior',
      name: 'Dispatch Acceptance Rate',
      weight: '10%',
      score: factors.acceptanceBehavior,
      icon: Percent,
      desc: 'Percentage of dispatched ride offers accepted within timeout.'
    },
    {
      key: 'dropoffPunctuality',
      name: 'Drop-off Route Adherence',
      weight: '10%',
      score: factors.dropoffPunctuality,
      icon: Clock,
      desc: 'Direct travel without unauthorized stops or unjustified deviations.'
    },
    {
      key: 'complaints',
      name: 'Customer Complaints Record',
      weight: '10%',
      score: factors.complaints,
      icon: FileText,
      desc: 'Absence of unresolved passenger fare, conduct, or vehicle complaints.'
    },
    {
      key: 'safetyIncidents',
      name: 'Safety & Emergency Record',
      weight: '5%',
      score: factors.safetyIncidents,
      icon: ShieldCheck,
      desc: 'Absence of SOS activations, critical incidents, or speeding alerts.'
    },
    {
      key: 'verificationStatus',
      name: 'KYC & Document Validity',
      weight: '5%',
      score: factors.verificationStatus,
      icon: Award,
      desc: 'Up-to-date CNIC, active driving license, and approved vehicle card.'
    },
    {
      key: 'policyViolations',
      name: 'Regulatory & Fines Compliance',
      weight: '5%',
      score: factors.policyViolations,
      icon: CheckCircle2,
      desc: 'Clean record without punitive deductions or conduct warnings.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                Driver Performance Score Breakdown
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-mono">
                  {driverId}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {driverName} • {city} • {plate} ({category})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Hero Score Badge */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-amber-400 text-slate-950 flex flex-col items-center justify-center font-black shrink-0 shadow-md">
                <span className="text-2xl font-mono leading-none">{performanceScore}</span>
                <span className="text-[9px] uppercase tracking-wider font-bold">/ 100</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                    Score Evaluation
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-bold">
                    {performanceLevel}
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-200 mt-0.5 flex items-center gap-2">
                  <span>Trend:</span>
                  {trend === 'improving' ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-bold text-xs">
                      <TrendingUp className="w-3.5 h-3.5" /> Improving
                    </span>
                  ) : trend === 'declining' ? (
                    <span className="text-rose-400 flex items-center gap-1 font-bold text-xs">
                      <TrendingDown className="w-3.5 h-3.5" /> Declining
                    </span>
                  ) : (
                    <span className="text-slate-300 flex items-center gap-1 font-medium text-xs">
                      <Minus className="w-3.5 h-3.5" /> Stable
                    </span>
                  )}
                  <span>•</span>
                  <span>Risk Level:</span>
                  <span
                    className={`text-xs font-black px-2 py-0.2 rounded-full ${
                      riskLevel === 'Critical'
                        ? 'bg-rose-600 text-white'
                        : riskLevel === 'High'
                        ? 'bg-orange-500 text-white'
                        : riskLevel === 'Medium'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {riskLevel}
                  </span>
                </div>
              </div>
            </div>

            {onOpenControl && (
              <button
                onClick={() => {
                  onClose();
                  onOpenControl();
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs transition cursor-pointer shrink-0"
              >
                Control Driver
              </button>
            )}
          </div>

          {/* Mathematical Multi-Factor Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Transparent Multi-Factor Breakdown (10 Factors)
              </h3>
              <span className="text-[11px] text-slate-500">Total Weighted = 100%</span>
            </div>

            <div className="space-y-2.5">
              {factorItems.map((item) => {
                const IconComponent = item.icon;
                const scoreVal = item.score;
                const barColor =
                  scoreVal >= 85
                    ? 'bg-emerald-500'
                    : scoreVal >= 65
                    ? 'bg-amber-500'
                    : 'bg-rose-500';

                return (
                  <div key={item.key} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-900">{item.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                          Weight {item.weight}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-black text-xs text-slate-900">
                          {scoreVal} / 100
                        </span>
                      </div>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full ${barColor} transition-all duration-300 rounded-full`}
                        style={{ width: `${Math.max(5, scoreVal)}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Driver Coaching Recommendations */}
          {driver.coachingRecommendations && driver.coachingRecommendations.length > 0 && (
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
              <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider mb-2">
                Operational Coaching Recommendations
              </h4>
              <ul className="space-y-1 text-xs text-blue-900 list-disc list-inside">
                {driver.coachingRecommendations.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            Close Breakdown
          </button>
        </div>

      </div>
    </div>
  );
};
