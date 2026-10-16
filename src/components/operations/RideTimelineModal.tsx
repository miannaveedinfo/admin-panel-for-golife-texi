import React from 'react';
import { Ride } from '../../types';
import { generateRideTimeline } from '../../services/operationsData';
import {
  X,
  History,
  CheckCircle,
  Clock,
  Car,
  MapPin,
  Navigation,
  CreditCard,
  Star,
  Radio,
  FileText
} from 'lucide-react';
import { formatPKR } from '../../utils/i18n';

interface RideTimelineModalProps {
  ride: Ride;
  onClose: () => void;
}

export const RideTimelineModal: React.FC<RideTimelineModalProps> = ({ ride, onClose }) => {
  const steps = generateRideTimeline(ride);

  const getStepIcon = (key: string, status: string) => {
    const isCompleted = status === 'completed';
    const isInProgress = status === 'in_progress';

    const colorClass = isCompleted
      ? 'text-emerald-600'
      : isInProgress
      ? 'text-[#0F766E]'
      : 'text-slate-400';

    switch (key) {
      case 'ride_requested':
        return <FileText className={`w-4 h-4 ${colorClass}`} />;
      case 'matching_drivers':
        return <Radio className={`w-4 h-4 ${colorClass} ${isInProgress ? 'animate-spin' : ''}`} />;
      case 'driver_accepted':
      case 'ride_completed':
        return <CheckCircle className={`w-4 h-4 ${colorClass}`} />;
      case 'going_to_pickup':
        return <Car className={`w-4 h-4 ${colorClass}`} />;
      case 'driver_arrived':
        return <MapPin className={`w-4 h-4 ${colorClass}`} />;
      case 'ride_started':
        return <Navigation className={`w-4 h-4 ${colorClass}`} />;
      case 'payment_settled':
        return <CreditCard className={`w-4 h-4 ${colorClass}`} />;
      case 'rating_feedback':
        return <Star className={`w-4 h-4 ${colorClass}`} />;
      default:
        return <Clock className={`w-4 h-4 ${colorClass}`} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl border border-[#E5E7EB] space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#0F766E]" />
              <h3 className="text-sm font-bold text-[#111827]">
                Ride Lifecycle Audit: {ride.rideCode}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0F766E]/10 text-[#0F766E]">
                {ride.category}
              </span>
            </div>
            <p className="text-xs text-[#6B7280]">
              Full 10-stage sequential telemetry trail and audit milestones
            </p>
          </div>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#111827] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Header Bar */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 border border-[#E5E7EB] rounded-xl text-center text-xs shrink-0">
          <div>
            <div className="text-[10px] text-[#6B7280]">PASSENGER</div>
            <div className="font-bold text-[#111827] truncate">{ride.passengerName}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#6B7280]">DRIVER</div>
            <div className="font-bold text-[#111827] truncate">{ride.driverName || 'Matching...'}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#6B7280]">FARE</div>
            <div className="font-mono font-bold text-[#0F766E]">{formatPKR(ride.fare)}</div>
          </div>
        </div>

        {/* Timeline Steps List */}
        <div className="space-y-4 overflow-y-auto pr-2 flex-1 pl-2">
          {steps.map((step, idx) => {
            const isCompleted = step.status === 'completed';
            const isInProgress = step.status === 'in_progress';
            const isLast = idx === steps.length - 1;

            return (
              <div key={step.key} className="relative flex items-start gap-3 group">
                {/* Vertical connecting line */}
                {!isLast && (
                  <div
                    className={`absolute left-4 top-8 -bottom-4 w-0.5 ${
                      isCompleted ? 'bg-emerald-500' : isInProgress ? 'bg-[#0F766E]' : 'bg-slate-200'
                    }`}
                  />
                )}

                {/* Step Circle Indicator */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 z-10 ${
                    isCompleted
                      ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                      : isInProgress
                      ? 'bg-teal-50 border-[#0F766E] ring-4 ring-teal-100 shadow-xs'
                      : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  {getStepIcon(step.key, step.status)}
                </div>

                {/* Step Content Card */}
                <div
                  className={`flex-1 p-3 rounded-xl border text-xs space-y-1 transition ${
                    isCompleted
                      ? 'bg-white border-[#E5E7EB]'
                      : isInProgress
                      ? 'bg-teal-50/40 border-[#0F766E] shadow-2xs'
                      : 'bg-slate-50/60 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-[#111827] flex items-center gap-1.5">
                      <span>{step.step}. {step.title}</span>
                      {isInProgress && (
                        <span className="px-1.5 py-0.2 bg-[#0F766E] text-white text-[9px] font-bold rounded-full animate-pulse">
                          Current Stage
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-[#6B7280]">
                      {step.timestamp}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#4B5563] font-urdu" dir="rtl">
                    {step.titleUrdu}
                  </div>

                  <p className="text-[11px] text-[#6B7280] leading-tight pt-0.5">
                    {step.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-[#6B7280]">
            Audit integrity verified • Pakistan Standard Time (PKT)
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#111827] text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
