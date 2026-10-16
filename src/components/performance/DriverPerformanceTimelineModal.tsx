import React, { useState, useMemo } from 'react';
import {
  X,
  History,
  Search,
  Filter,
  Car,
  Clock,
  AlertTriangle,
  FileText,
  ShieldAlert,
  CheckCircle2,
  DollarSign,
  Award,
  Calendar
} from 'lucide-react';
import {
  DriverPerformanceTimelineEvent,
  PerformanceTimelineEventType
} from '../../types';

interface DriverPerformanceTimelineModalProps {
  driverId: string;
  driverName: string;
  events: DriverPerformanceTimelineEvent[];
  onClose: () => void;
  onOpenControl?: () => void;
}

export const DriverPerformanceTimelineModal: React.FC<DriverPerformanceTimelineModalProps> = ({
  driverId,
  driverName,
  events = [],
  onClose,
  onOpenControl
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const safeEvents = events || [];

  const filterChips: { id: string; label: string; count: number }[] = useMemo(() => {
    const counts: Record<string, number> = { all: safeEvents.length };
    safeEvents.forEach((e) => {
      counts[e.eventType] = (counts[e.eventType] || 0) + 1;
    });

    return [
      { id: 'all', label: 'All Events', count: counts.all || 0 },
      { id: 'ride_completed', label: 'Rides', count: counts.ride_completed || 0 },
      { id: 'late_pickup', label: 'Late Pickups', count: counts.late_pickup || 0 },
      { id: 'late_dropoff', label: 'Late Drop-offs', count: counts.late_dropoff || 0 },
      { id: 'cancellation', label: 'Cancellations', count: counts.cancellation || 0 },
      { id: 'complaint', label: 'Complaints', count: counts.complaint || 0 },
      { id: 'fine', label: 'Fines', count: counts.fine || 0 },
      { id: 'suspension', label: 'Suspensions', count: counts.suspension || 0 },
      { id: 'reinstatement', label: 'Reinstatements', count: counts.reinstatement || 0 },
      { id: 'safety_incident', label: 'Safety', count: counts.safety_incident || 0 }
    ].filter((chip) => chip.id === 'all' || chip.count > 0);
  }, [safeEvents]);

  const filteredEvents = useMemo(() => {
    return safeEvents.filter((e) => {
      if (selectedType !== 'all' && e.eventType !== selectedType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          (e.relatedRideId && e.relatedRideId.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [events, selectedType, searchQuery]);

  const getEventIcon = (type: PerformanceTimelineEventType) => {
    switch (type) {
      case 'ride_completed':
        return Car;
      case 'late_pickup':
      case 'late_dropoff':
        return Clock;
      case 'cancellation':
      case 'complaint':
        return AlertTriangle;
      case 'fine':
        return DollarSign;
      case 'suspension':
        return ShieldAlert;
      case 'reinstatement':
        return CheckCircle2;
      case 'verification_change':
        return Award;
      default:
        return FileText;
    }
  };

  const getEventBadge = (severity: 'info' | 'warning' | 'danger' | 'success') => {
    switch (severity) {
      case 'danger':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'warning':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'success':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                Driver Chronological Performance Timeline
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-mono">
                  {driverId}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {driverName} • Complete audit log of rides, delays, complaints, fines & actions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onOpenControl && (
              <button
                onClick={() => {
                  onClose();
                  onOpenControl();
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs transition cursor-pointer"
              >
                Control Driver
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search timeline by keyword, ride ID, or issue..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 flex items-center gap-1 shrink-0 text-[11px] font-bold mr-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {filterChips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => setSelectedType(chip.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                  selectedType === chip.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                }`}
              >
                <span>{chip.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedType === chip.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {chip.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Events Feed */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <History className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-600">No events matched the selected filters</p>
              <p className="text-xs text-slate-400 mt-1">Try switching the event category or clearing your search.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
              {filteredEvents.map((evt) => {
                const Icon = getEventIcon(evt.eventType);
                const badgeClass = getEventBadge(evt.severity);

                return (
                  <div key={evt.id} className="relative pl-6">
                    {/* Node Dot */}
                    <div
                      className={`absolute -left-[17px] top-1 w-8 h-8 rounded-xl border flex items-center justify-center shadow-2xs ${
                        evt.severity === 'danger'
                          ? 'bg-rose-50 border-rose-300 text-rose-700'
                          : evt.severity === 'warning'
                          ? 'bg-amber-50 border-amber-300 text-amber-800'
                          : evt.severity === 'success'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'bg-blue-50 border-blue-300 text-blue-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Event Card */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md border ${badgeClass}`}>
                            {evt.eventType.replace('_', ' ')}
                          </span>
                          <h3 className="text-xs font-bold text-slate-900">{evt.title}</h3>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono shrink-0">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{evt.timestamp}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{evt.description}</p>

                      {/* Related IDs or Meta */}
                      {(evt.relatedRideId || evt.relatedCaseId) && (
                        <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                          {evt.relatedRideId && (
                            <span>Ride: <strong className="text-slate-800">{evt.relatedRideId}</strong></span>
                          )}
                          {evt.relatedCaseId && (
                            <span>Case Ref: <strong className="text-slate-800">{evt.relatedCaseId}</strong></span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredEvents.length} of {events.length} logged events</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            Close Timeline
          </button>
        </div>

      </div>
    </div>
  );
};
