import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Ride, Passenger, Driver, RideAdminNote } from '../../types';
import { formatPKR } from '../../utils/i18n';
import {
  Car,
  Clock,
  MapPin,
  Navigation,
  Phone,
  MessageSquare,
  Flag,
  Ban,
  Eye,
  FileText,
  User,
  ShieldAlert,
  Send,
  CheckCircle,
  AlertTriangle,
  X,
  History,
  Info
} from 'lucide-react';

interface LiveRideMonitorProps {
  selectedCity?: string;
  selectedCategory?: string;
  searchQuery?: string;
  selectedRideId?: string | null;
  onSelectRide?: (rideId: string) => void;
  onOpenTimeline?: (ride: Ride) => void;
  onOpenDispatch?: (ride: Ride) => void;
  onViewPassenger?: (passenger: Passenger) => void;
  onViewDriver?: (driver: Driver) => void;
}

export const LiveRideMonitor: React.FC<LiveRideMonitorProps> = ({
  selectedCity = 'All',
  selectedCategory = 'All',
  searchQuery = '',
  selectedRideId = null,
  onSelectRide = (_id: string) => {},
  onOpenTimeline = (_ride: Ride) => {},
  onOpenDispatch = (_ride: Ride) => {},
  onViewPassenger = (_p: Passenger) => {},
  onViewDriver = (_d: Driver) => {}
}) => {
  const {
    rides,
    passengers,
    drivers,
    flagRide,
    unflagRide,
    cancelRide,
    addRideAdminNote
  } = useAdmin();

  // Modals inside component
  const [cancelModalRide, setCancelModalRide] = useState<Ride | null>(null);
  const [cancelReason, setCancelReason] = useState('Driver unreachable / delayed');
  const [customCancelReason, setCustomCancelReason] = useState('');

  const [flagModalRide, setFlagModalRide] = useState<Ride | null>(null);
  const [flagReason, setFlagReason] = useState('Suspicious route deviation / stationary vehicle');

  const [notesModalRide, setNotesModalRide] = useState<Ride | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  // Filter rides
  const filteredRides = (rides || []).filter((ride) => {
    // City
    const normCity = (selectedCity || 'All').toLowerCase();
    if (normCity !== 'all' && (ride.city || '').toLowerCase() !== normCity) {
      return false;
    }
    // Category
    if (selectedCategory !== 'All' && ride.category !== selectedCategory) {
      return false;
    }
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = ride.rideCode.toLowerCase().includes(q);
      const matchPass = ride.passengerName.toLowerCase().includes(q) || ride.passengerPhone.includes(q);
      const matchDriver = (ride.driverName || '').toLowerCase().includes(q) || (ride.driverPlate || '').toLowerCase().includes(q);
      const matchLoc = ride.pickup.address.toLowerCase().includes(q) || ride.destination.address.toLowerCase().includes(q);
      if (!matchCode && !matchPass && !matchDriver && !matchLoc) {
        return false;
      }
    }
    return true;
  });

  const getStatusBadge = (status: Ride['status']) => {
    switch (status) {
      case 'searching':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">Searching / Bidding</span>;
      case 'driver_assigned':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">Driver En Route</span>;
      case 'arrived':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">Driver at Pickup</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Trip In Progress</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Completed</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Cancelled</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const handleConfirmCancel = () => {
    if (!cancelModalRide) return;
    const finalReason = cancelReason === 'Other' ? (customCancelReason || 'Admin operational cancellation') : cancelReason;
    cancelRide(cancelModalRide.id, finalReason, 'admin');
    setCancelModalRide(null);
    setCustomCancelReason('');
  };

  const handleConfirmFlag = () => {
    if (!flagModalRide) return;
    flagRide(flagModalRide.id, flagReason);
    setFlagModalRide(null);
  };

  const handleAddNote = () => {
    if (!notesModalRide || !newNoteText.trim()) return;
    addRideAdminNote(notesModalRide.id, newNoteText.trim());
    setNewNoteText('');
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#111827] flex items-center gap-2">
            <Car className="w-4 h-4 text-[#0F766E]" />
            <span>Live Ride Monitor ({filteredRides.length} Trips Listed)</span>
          </h2>
          <p className="text-xs text-[#6B7280]">
            Detailed telemetry inspection, lifecycle tracking, live interventions, and security auditing
          </p>
        </div>
      </div>

      {/* Ride Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredRides.map((ride) => {
          const isSelected = ride.id === selectedRideId;
          const matchedPassenger = passengers.find((p) => p.id === ride.passengerId);
          const matchedDriver = drivers.find((d) => d.id === ride.driverId);

          return (
            <div
              key={ride.id}
              onClick={() => onSelectRide(ride.id)}
              className={`bg-white border rounded-2xl p-4 shadow-xs transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-[#0F766E] ring-2 ring-[#0F766E]/20'
                  : 'border-[#E5E7EB] hover:border-slate-300'
              } ${ride.flagged ? 'bg-rose-50/30' : ''}`}
            >
              {/* Card Top Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#111827]">{ride.rideCode}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0F766E]/10 text-[#0F766E]">
                        {ride.category}
                      </span>
                      <span className="text-[11px] font-medium text-[#6B7280]">{ride.city}</span>
                    </div>
                    <div className="text-[11px] text-[#6B7280] mt-0.5 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Started: {ride.startTime}</span>
                      {ride.etaMinutes !== undefined && ride.status === 'in_progress' && (
                        <span className="font-bold text-[#0F766E]">• {ride.etaMinutes}m ETA</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {getStatusBadge(ride.status)}
                    {ride.flagged && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Flagged
                      </span>
                    )}
                  </div>
                </div>

                {/* Pickup & Destination */}
                <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-50 border border-[#E5E7EB] text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                    <div className="truncate">
                      <span className="text-[10px] font-bold text-[#6B7280] block">PICKUP</span>
                      <span className="text-[#111827] font-medium">{ride.pickup.address}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 pt-1 border-t border-slate-200/60">
                    <Navigation className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="truncate">
                      <span className="text-[10px] font-bold text-[#6B7280] block">DESTINATION</span>
                      <span className="text-[#111827] font-medium">{ride.destination.address}</span>
                    </div>
                  </div>
                </div>

                {/* Passenger & Driver Quick Profile Tiles */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Passenger Tile */}
                  <div className="p-2 rounded-xl border border-[#E5E7EB] bg-white flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-[#6B7280] flex items-center justify-between">
                        <span>PASSENGER</span>
                        <span className="text-amber-500 font-bold">{ride.passengerRating || 5.0} ★</span>
                      </div>
                      <div className="font-bold text-[#111827] truncate mt-0.5">{ride.passengerName}</div>
                      <div className="font-mono text-[10px] text-[#6B7280] truncate">{ride.passengerPhone}</div>
                    </div>
                    {matchedPassenger && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewPassenger(matchedPassenger);
                        }}
                        className="mt-2 text-[10px] text-[#0F766E] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <User className="w-3 h-3" /> View Profile
                      </button>
                    )}
                  </div>

                  {/* Driver Tile */}
                  <div className="p-2 rounded-xl border border-[#E5E7EB] bg-white flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-[#6B7280] flex items-center justify-between">
                        <span>DRIVER</span>
                        <span className="text-amber-500 font-bold">{ride.driverRating || '—'} ★</span>
                      </div>
                      <div className="font-bold text-[#111827] truncate mt-0.5">
                        {ride.driverName || 'No Driver Assigned'}
                      </div>
                      <div className="font-mono text-[10px] text-[#0F766E] font-bold truncate">
                        {ride.driverPlate || 'Awaiting Match'}
                      </div>
                    </div>
                    {matchedDriver ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDriver(matchedDriver);
                        }}
                        className="mt-2 text-[10px] text-[#0F766E] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Car className="w-3 h-3" /> View Driver
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDispatch(ride);
                        }}
                        className="mt-2 text-[10px] text-amber-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3 h-3" /> Dispatch Now
                      </button>
                    )}
                  </div>
                </div>

                {/* Financial & Status Metas */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-[#E5E7EB] text-[11px]">
                  <div>
                    <span className="text-[#6B7280]">Est. Fare:</span>{' '}
                    <strong className="font-mono text-[#0F766E] text-xs">{formatPKR(ride.fare)}</strong>
                    <span className="text-[#6B7280] text-[10px] ml-1.5">({ride.paymentMethod.toUpperCase()})</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Distance:</span>{' '}
                    <strong className="text-[#111827]">{ride.distanceKm} km</strong>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Duration:</span>{' '}
                    <strong className="text-[#111827]">{ride.durationMin}m</strong>
                  </div>
                </div>

                {/* Admin notes preview if exists */}
                {ride.adminNotesList && ride.adminNotesList.length > 0 && (
                  <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <div className="truncate">
                      <strong>Latest Note:</strong> {ride.adminNotesList[ride.adminNotesList.length - 1].text}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Bar */}
              <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenTimeline(ride);
                    }}
                    title="View 10-stage lifecycle timeline"
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#111827] font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5 text-[#0F766E]" />
                    <span>Timeline</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDispatch(ride);
                    }}
                    title="Intervene or assign/reassign driver"
                    className="px-2.5 py-1.5 rounded-xl bg-[#0F766E]/10 hover:bg-[#0F766E]/20 text-[#0F766E] font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNotesModalRide(ride);
                    }}
                    title="View / Add Admin internal notes"
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {ride.flagged ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        unflagRide(ride.id);
                      }}
                      title="Clear flag"
                      className="px-2.5 py-1 rounded-xl bg-rose-600 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer hover:bg-rose-700"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>Unflag</span>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFlagModalRide(ride);
                      }}
                      title="Flag ride for security audit"
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 transition cursor-pointer"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {ride.status !== 'cancelled' && ride.status !== 'completed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCancelModalRide(ride);
                      }}
                      title="Cancel ride with formal audit reason"
                      className="px-2 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                    >
                      <Ban className="w-3 h-3" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredRides.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white border border-[#E5E7EB] rounded-2xl p-6">
            <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <div className="text-sm font-bold text-[#111827]">No active rides match your current filters</div>
            <p className="text-xs text-[#6B7280] mt-1">Try selecting 'All' cities or clearing the search box.</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal: Cancel Ride */}
      {cancelModalRide && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-[#E5E7EB] space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827]">
                  Cancel Ride #{cancelModalRide.rideCode}?
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  This action will terminate the live trip immediately, notify both passenger and driver, and document the cancellation in the Security & Audit Log.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-[#111827] block">Select Cancellation Reason:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-rose-600"
              >
                <option value="Driver unreachable / delayed">Driver unreachable / delayed (&gt;10 mins)</option>
                <option value="Passenger requested admin cancellation">Passenger requested admin cancellation</option>
                <option value="Vehicle breakdown / mechanical fault">Vehicle breakdown / mechanical fault</option>
                <option value="Severe safety breach or misconduct">Severe safety breach or misconduct</option>
                <option value="Suspected fraudulent booking">Suspected fraudulent booking</option>
                <option value="Other">Other Reason (Specify below)</option>
              </select>

              {cancelReason === 'Other' && (
                <input
                  type="text"
                  placeholder="Provide precise cancellation notes..."
                  value={customCancelReason}
                  onChange={(e) => setCustomCancelReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-rose-600 text-xs"
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
              <button
                onClick={() => setCancelModalRide(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#6B7280] hover:bg-slate-100 transition cursor-pointer"
              >
                Nevermind
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Flag Ride */}
      {flagModalRide && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-[#E5E7EB] space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827]">
                  Flag Ride #{flagModalRide.rideCode} for Audit
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Flagging highlights this trip across all operator dispatch boards and alerts the Safety & SOS unit.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-[#111827] block">Reason for Flagging:</label>
              <textarea
                rows={3}
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="Explain the security concern, route deviation, or customer complaint..."
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-600 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
              <button
                onClick={() => setFlagModalRide(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#6B7280] hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmFlag}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition cursor-pointer"
              >
                Flag Trip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Notes Modal */}
      {notesModalRide && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-[#E5E7EB] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0F766E]" />
                  <span>Admin Internal Notes: {notesModalRide.rideCode}</span>
                </h3>
                <p className="text-xs text-[#6B7280]">Internal audit records visible only to authorized dispatch personnel</p>
              </div>
              <button
                onClick={() => setNotesModalRide(null)}
                className="text-[#6B7280] hover:text-[#111827] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Existing Notes List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {notesModalRide.adminNotesList && notesModalRide.adminNotesList.length > 0 ? (
                notesModalRide.adminNotesList.map((note) => (
                  <div key={note.id} className="p-2.5 rounded-xl bg-slate-50 border border-[#E5E7EB] text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-[#6B7280]">
                      <strong className="text-[#111827]">{note.author}</strong>
                      <span>{note.timestamp}</span>
                    </div>
                    <div className="text-[#111827]">{note.text}</div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-[#6B7280]">
                  No internal notes recorded for this ride yet.
                </div>
              )}
            </div>

            {/* Add New Note */}
            <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
              <label className="text-xs font-bold text-[#111827]">Add Internal Note</label>
              <textarea
                rows={2}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Type dispatch comment, phone verification log, or follow-up note..."
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0F766E] text-xs"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setNotesModalRide(null)}
                  className="px-3 py-1.5 text-xs text-[#6B7280] hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={!newNoteText.trim()}
                  className="px-4 py-1.5 bg-[#0F766E] hover:bg-[#0d645e] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
