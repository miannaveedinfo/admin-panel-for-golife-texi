import React, { useMemo, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { SelectedEntity } from './LiveOperationsMap';
import { Ride, Driver, Passenger, OperationsAlert, LocationFreshness, PickupDelayStatus } from '../../types';
import {
  X,
  Car,
  User,
  Navigation,
  AlertTriangle,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  Radio,
  Sliders,
  DollarSign,
  Flag,
  Battery,
  Gauge,
  Compass,
  CheckCircle,
  FileText,
  Lock,
  Eye
} from 'lucide-react';
import { formatPKR } from '../../utils/i18n';
import { canAdminViewPII, maskPhoneNumber } from '../../utils/privacyUtils';

interface LiveDetailDrawerProps {
  selectedEntity: SelectedEntity | null;
  onClose: () => void;
  onOpenDriverControl: (driver: Driver) => void;
  onOpenRideControl: (ride: Ride) => void;
  onCenterLocation: (type: 'driver' | 'ride' | 'passenger', id: string) => void;
  onSelectEntity: (entity: SelectedEntity) => void;
}

export const LiveDetailDrawer: React.FC<LiveDetailDrawerProps> = ({
  selectedEntity,
  onClose,
  onOpenDriverControl,
  onOpenRideControl,
  onCenterLocation,
  onSelectEntity
}) => {
  const {
    currentAdmin,
    drivers = [],
    rides = [],
    passengers = [],
    operationsAlerts = [],
    driverDailySummaries = [],
    driverSuspensions = [],
    latePickupIncidents = [],
    latePickupConfig,
    setActiveTab,
    resolveOperationsAlert,
    addDriverFine,
    showToast
  } = useAdmin();

  const isAuthorizedForPII = useMemo(() => canAdminViewPII(currentAdmin), [currentAdmin]);

  // Resolution tracking for late pickup interventions (fine vs fair exemption)
  const [pickupResolution, setPickupResolution] = useState<Record<string, { action: 'fine' | 'exempt'; reason?: string }>>({});

  if (!selectedEntity) return null;

  // Resolve target entity data
  const driver = selectedEntity.type === 'driver' ? drivers.find((d) => d.id === selectedEntity.id) : null;
  const ride = selectedEntity.type === 'ride' ? rides.find((r) => r.id === selectedEntity.id) : null;
  const passenger = selectedEntity.type === 'passenger' ? passengers.find((p) => p.id === selectedEntity.id) : null;
  const alert = selectedEntity.type === 'alert' ? operationsAlerts.find((a) => a.id === selectedEntity.id) : null;

  // Calculate Driver Performance Score (0 - 100)
  const calculateDriverPerformance = (d: Driver) => {
    const onTimeRate = d.latePickupCount ? Math.max(50, 100 - d.latePickupCount * 10) : 96;
    const ratingScore = Math.min(100, (d.rating / 5) * 100);
    const cancelRateScore = 92; // default high
    const complaintsScore = d.complaintsCount ? Math.max(40, 100 - d.complaintsCount * 15) : 98;
    const acceptanceScore = d.acceptanceRate || 95;
    const overallScore = Math.round(
      onTimeRate * 0.25 + ratingScore * 0.25 + cancelRateScore * 0.15 + complaintsScore * 0.2 + acceptanceScore * 0.15
    );

    return {
      overallScore,
      onTimeRate,
      ratingScore: Math.round(ratingScore),
      complaintsScore,
      acceptanceScore
    };
  };

  // Pickup Monitoring Qualification Helper
  const getPickupMonitoring = (r: Ride): {
    expectedPickup: string;
    actualArrival: string;
    delayMinutes: number;
    status: PickupDelayStatus;
    isQualifying: boolean;
    qualificationReason: string;
  } => {
    const delay = r.status === 'in_progress' ? 4 : r.status === 'arrived' ? 8 : 2;
    let status: PickupDelayStatus = 'On Time';
    if (delay <= 3) status = 'On Time';
    else if (delay <= 6) status = 'Slightly Late';
    else if (delay <= 10) status = 'Late';
    else status = 'Critical Delay';

    return {
      expectedPickup: r.startTime || '18:00 PKT',
      actualArrival: '18:04 PKT',
      delayMinutes: delay,
      status,
      isQualifying: delay > 5,
      qualificationReason: delay > 5 ? 'Exceeds 5m baseline without passenger-requested delay' : 'Within allowable traffic grace period'
    };
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl flex flex-col h-full shadow-lg overflow-hidden animate-in slide-in-from-right-3 duration-200">
      {/* Header Bar */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {selectedEntity.type === 'driver' && <Car className="w-4 h-4" />}
            {selectedEntity.type === 'ride' && <Navigation className="w-4 h-4" />}
            {selectedEntity.type === 'passenger' && <User className="w-4 h-4" />}
            {selectedEntity.type === 'alert' && <AlertTriangle className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              {selectedEntity.type.toUpperCase()} TELEMETRY DOSSIER
            </span>
            <h3 className="text-sm font-black text-slate-950 truncate">
              {driver?.name || ride?.rideCode || passenger?.name || alert?.title}
            </h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition cursor-pointer"
          title="Close details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-900 text-xs">
        {/* ===================================================================
            VIEW 1: DRIVER DETAIL DRAWER
           =================================================================== */}
        {driver && (
          <div className="space-y-4">
            {/* ACTION REQUIRED BANNER IF LATE PICKUP THRESHOLD REACHED */}
            {(driver.latePickupCount && driver.latePickupCount >= (latePickupConfig?.maxIncidentsBeforeSuspension || 5)) ? (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 flex items-start justify-between gap-2 shadow-xs">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-rose-900 font-extrabold block">ACTION REQUIRED: Late Pickup Limit Reached</strong>
                    <span className="text-[11px] text-rose-700">
                      Driver reached {driver.latePickupCount} / {latePickupConfig?.maxIncidentsBeforeSuspension || 5} late pickups today. Operational intervention required.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onOpenDriverControl(driver)}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] whitespace-nowrap cursor-pointer transition shadow-xs"
                >
                  OPEN DRIVER CONTROL
                </button>
              </div>
            ) : null}

            {/* Profile Overview Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <img
                src={driver.avatar}
                alt={driver.name}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-300 shadow-xs shrink-0"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-sm font-bold text-slate-950 truncate">{driver.name}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {driver.verificationStatus === 'verified' ? 'Verified' : 'Unverified'}
                  </span>
                </div>

                <div className="text-slate-600 flex items-center gap-2">
                  <span className="font-mono text-[11px]">{driver.id}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    {maskPhoneNumber(driver.phone, isAuthorizedForPII)}
                    {!isAuthorizedForPII && <Lock className="w-2.5 h-2.5 text-slate-400" />}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <span className="font-bold text-amber-500">★ {driver.rating}</span>
                  <span>•</span>
                  <span className="font-semibold text-slate-900">{driver.city}</span>
                </div>
              </div>
            </div>

            {/* Vehicle & Operational Status */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Assigned Vehicle</span>
                <div className="font-bold text-slate-900 truncate">
                  {driver.vehicle.make} {driver.vehicle.model}
                </div>
                <div className="font-mono text-[11px] text-amber-700 font-bold">
                  {driver.vehicle.plate} ({driver.vehicle.category})
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Telemetry Status</span>
                <div className="font-bold text-emerald-700 flex items-center gap-1.5 uppercase">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {driver.operationalStatus || driver.status}
                </div>
                <div className="text-[11px] text-slate-500">
                  Speed: <strong className="text-slate-800">38 km/h</strong> • GPS: ±4m
                </div>
              </div>
            </div>

            {/* Current Active Ride If Any */}
            {driver.activeRideId && (
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block">
                    Current Assigned Trip
                  </span>
                  <div className="font-bold text-sky-950 font-mono">
                    Ride #{driver.activeRideId}
                  </div>
                </div>
                <button
                  onClick={() => onSelectEntity({ type: 'ride', id: driver.activeRideId! })}
                  className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs cursor-pointer transition shadow-2xs"
                >
                  View Trip
                </button>
              </div>
            )}

            {/* Driver Performance Score (0 - 100) */}
            {(() => {
              const perf = calculateDriverPerformance(driver);
              return (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500" />
                      Performance Score
                    </span>
                    <span className="text-sm font-black font-mono text-slate-950">
                      {perf.overallScore} / 100
                    </span>
                  </div>

                  {/* Progress Meter */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        perf.overallScore >= 90
                          ? 'bg-emerald-500'
                          : perf.overallScore >= 75
                          ? 'bg-amber-400'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${perf.overallScore}%` }}
                    />
                  </div>

                  {/* Breakdown Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 block">On-Time</span>
                      <strong className="text-slate-900">{perf.onTimeRate}%</strong>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 block">Late Today</span>
                      <strong className={driver.latePickupCount && driver.latePickupCount >= 3 ? 'text-rose-600' : 'text-slate-900'}>
                        {driver.latePickupCount || 0} / 5
                      </strong>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 block">Acceptance</span>
                      <strong className="text-slate-900">{perf.acceptanceScore}%</strong>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Today's Rides & Earnings */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Today's Completed</span>
                <div className="text-base font-black text-slate-950 font-mono mt-0.5">
                  {driver.totalRides ? Math.min(driver.totalRides, 8) : 0} Trips
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Today's Earnings</span>
                <div className="text-base font-black text-amber-700 font-mono mt-0.5">
                  {formatPKR(Math.round((driver.earnings || 12000) * 0.05))}
                </div>
              </div>
            </div>

            {/* Location History Timeline */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Live Location History Timeline
              </span>
              <div className="space-y-2 pl-2 border-l-2 border-slate-200 text-[11px] text-slate-600">
                <div className="relative pl-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -left-[17px] top-1" />
                  <strong className="text-slate-900">Just Now:</strong> Moving along central road sector (38 km/h)
                </div>
                <div className="relative pl-3">
                  <span className="w-2 h-2 rounded-full bg-slate-400 absolute -left-[17px] top-1" />
                  <strong className="text-slate-900">3 mins ago:</strong> Ping at Main Boulevard Interchange
                </div>
                <div className="relative pl-3">
                  <span className="w-2 h-2 rounded-full bg-slate-400 absolute -left-[17px] top-1" />
                  <strong className="text-slate-900">8 mins ago:</strong> Dispatched from pickup cluster
                </div>
              </div>
            </div>

            {/* PRIMARY BUTTON: ONE TASK = ONE MAIN OPTION */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => onOpenDriverControl(driver)}
                className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition cursor-pointer shadow-md flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <Sliders className="w-4 h-4" />
                CONTROL DRIVER
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onCenterLocation('driver', driver.id)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  View Location
                </button>
                <button
                  onClick={() => setActiveTab('wallets')}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  View Earnings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            VIEW 2: ACTIVE RIDE DETAIL DRAWER
           =================================================================== */}
        {ride && (
          <div className="space-y-4">
            {/* Status Header */}
            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-sky-700">Trip Identifier</span>
                <div className="text-base font-black text-sky-950 font-mono">{ride.rideCode}</div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-sky-600 text-white">
                {ride.status.replace('_', ' ')}
              </span>
            </div>

            {/* Passenger & Driver Overview */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Passenger</span>
                <div className="font-bold text-slate-900 truncate">{ride.passengerName}</div>
                <div className="text-[11px] text-slate-600 font-mono flex items-center gap-1">
                  {maskPhoneNumber(ride.passengerPhone, isAuthorizedForPII)}
                  {!isAuthorizedForPII && <Lock className="w-2.5 h-2.5 text-slate-400" />}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Assigned Driver</span>
                <div className="font-bold text-slate-900 truncate">{ride.driverName || 'Matching...'}</div>
                <div className="text-[11px] text-amber-700 font-mono font-bold">{ride.driverPlate || 'Pending'}</div>
              </div>
            </div>

            {/* Addresses (Pickup & Destination) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  P
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Pickup Location</span>
                  <p className="text-slate-900 font-medium text-xs">{ride.pickup.address}</p>
                </div>
              </div>

              <div className="border-l-2 border-dashed border-slate-300 ml-2.5 h-3" />

              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  D
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Destination Location</span>
                  <p className="text-slate-900 font-medium text-xs">{ride.destination.address}</p>
                </div>
              </div>
            </div>

            {/* Ride Stage Timeline */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Live Dispatch Stage Progress
              </span>
              <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-semibold">
                <div className={`p-1.5 rounded-lg border ${
                  ride.status === 'searching' || ride.status === 'driver_assigned' || ride.status === 'in_progress' || ride.status === 'completed'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  1. Match
                </div>
                <div className={`p-1.5 rounded-lg border ${
                  ride.status === 'driver_assigned' || ride.status === 'in_progress' || ride.status === 'completed'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  2. En Route
                </div>
                <div className={`p-1.5 rounded-lg border ${
                  ride.status === 'arrived' || ride.status === 'in_progress' || ride.status === 'completed'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  3. At Pickup
                </div>
                <div className={`p-1.5 rounded-lg border ${
                  ride.status === 'in_progress' || ride.status === 'completed'
                    ? 'bg-sky-50 border-sky-300 text-sky-800'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  4. On Trip
                </div>
              </div>
            </div>

            {/* Pickup Monitoring & Compliance */}
            {(() => {
              const mon = getPickupMonitoring(ride);
              const resolution = pickupResolution[ride.id];

              const handleIssueFine = () => {
                if (!ride.driverId) return;
                addDriverFine({
                  driverId: ride.driverId,
                  reasonId: 'late_pickup',
                  amount: 300,
                  relatedRideId: ride.id,
                  relatedRideCode: ride.rideCode,
                  note: `Late pickup breach: ${mon.delayMinutes} min delay on ${ride.rideCode}`
                });
                setPickupResolution((prev) => ({ ...prev, [ride.id]: { action: 'fine' } }));
                showToast(`Late pickup penalty of PKR 300 issued via Central Fine Engine for trip ${ride.rideCode}`, 'success');
              };

              const handleExempt = (reason: string) => {
                setPickupResolution((prev) => ({ ...prev, [ride.id]: { action: 'exempt', reason } }));
                showToast(`Fair exception applied: ${reason}. Violation waived without penalty.`, 'info');
              };

              return (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-slate-500" />
                      Pickup Monitoring (GPS Audited)
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      mon.status === 'On Time'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : mon.status === 'Slightly Late'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {mon.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="text-slate-600">
                      Expected Pickup: <strong className="text-slate-900">{mon.expectedPickup}</strong>
                    </div>
                    <div className="text-slate-600">
                      Arrival Delay: <strong className="text-slate-900">{mon.delayMinutes} mins</strong>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                    Audit Status: <span className="font-semibold text-slate-700">{mon.qualificationReason}</span>
                  </div>

                  {/* Resolution Status or Action Buttons for Qualifying Violations */}
                  {resolution ? (
                    <div className="p-2 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between">
                      {resolution.action === 'fine' ? (
                        <span className="text-rose-600 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Fine of PKR 300 Issued to Driver
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Waived: {resolution.reason}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-400">Resolved</span>
                    </div>
                  ) : mon.isQualifying && ride.driverId ? (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Qualifies for Late Pickup Review ({mon.delayMinutes}m delay)</span>
                      </div>
                      <p className="text-[10px] text-amber-800 leading-tight">
                        Exempt passenger delays, road closures, or network/GPS jitter before issuing penalty.
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <button
                          onClick={handleIssueFine}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition cursor-pointer shadow-xs"
                        >
                          Issue Fine (PKR 300)
                        </button>
                        <button
                          onClick={() => handleExempt('Road closure / severe traffic')}
                          className="px-2 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-[10px] transition cursor-pointer"
                        >
                          Exempt: Traffic
                        </button>
                        <button
                          onClick={() => handleExempt('Passenger delay')}
                          className="px-2 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-[10px] transition cursor-pointer"
                        >
                          Exempt: Passenger
                        </button>
                        <button
                          onClick={() => handleExempt('GPS / cellular network glitch')}
                          className="px-2 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-[10px] transition cursor-pointer"
                        >
                          Exempt: GPS Jitter
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })()}

            {/* Fare & Payment Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Total Fare</span>
                <span className="font-mono font-black text-slate-950 text-xs">{formatPKR(ride.fare)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Distance</span>
                <span className="font-mono font-bold text-slate-900 text-xs">{ride.distanceKm} km</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Payment</span>
                <span className="font-bold text-emerald-700 text-xs uppercase">{ride.paymentMethod}</span>
              </div>
            </div>

            {/* PRIMARY BUTTON: ONE TASK = ONE MAIN OPTION */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => onOpenRideControl(ride)}
                className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition cursor-pointer shadow-md flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <Navigation className="w-4 h-4" />
                RIDE CONTROL
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onCenterLocation('ride', ride.id)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Center Route
                </button>
                {ride.driverId && (
                  <button
                    onClick={() => {
                      const d = drivers.find((x) => x.id === ride.driverId);
                      if (d) onOpenDriverControl(d);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Car className="w-3.5 h-3.5" />
                    Driver Control
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            VIEW 3: PASSENGER DETAIL DRAWER
           =================================================================== */}
        {passenger && (
          <div className="space-y-4">
            {/* Passenger Profile Overview */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <img
                src={passenger.avatar}
                alt={passenger.name}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-300 shadow-xs shrink-0"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-sm font-bold text-slate-950 truncate">{passenger.name}</h4>
                  <span className="font-bold text-amber-500">★ {passenger.rating}</span>
                </div>

                <div className="text-slate-600 flex items-center gap-2">
                  <span className="font-mono text-[11px]">{passenger.id}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    {maskPhoneNumber(passenger.phone, isAuthorizedForPII)}
                    {!isAuthorizedForPII && <Lock className="w-2.5 h-2.5 text-slate-400" />}
                  </span>
                </div>

                <div className="text-slate-700 font-semibold">{passenger.city}</div>
              </div>
            </div>

            {/* Privacy Compliance Indicator */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-[11px] text-slate-600">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block">Universal Tracking Privacy Protected</strong>
                <span>Precise live location is only broadcast while this passenger has an active engaged ride in progress.</span>
              </div>
            </div>

            {/* Active Ride if Any */}
            {(() => {
              const activeRide = rides.find(
                (r) => r.passengerId === passenger.id && (r.status === 'in_progress' || r.status === 'driver_assigned' || r.status === 'arrived')
              );
              if (activeRide) {
                return (
                  <div className="p-3.5 rounded-2xl bg-violet-50 border border-violet-200 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-violet-700 block">
                      Active In-Progress Trip
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-violet-950">{activeRide.rideCode}</span>
                      <span className="text-[10px] font-bold uppercase text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
                        {activeRide.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 truncate">
                      Destination: {activeRide.destination.address}
                    </p>
                    <button
                      onClick={() => onSelectEntity({ type: 'ride', id: activeRide.id })}
                      className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition cursor-pointer shadow-2xs"
                    >
                      Open Trip Details
                    </button>
                  </div>
                );
              }
              return (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-center text-[11px]">
                  No active ride in transit currently.
                </div>
              );
            })()}

            {/* Lifetime Trip & Spent Statistics */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Total Rides</span>
                <div className="text-base font-black text-slate-950 font-mono mt-0.5">
                  {passenger.totalRides} Trips
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Total Spent</span>
                <div className="text-base font-black text-amber-700 font-mono mt-0.5">
                  {formatPKR(passenger.totalSpent)}
                </div>
              </div>
            </div>

            {/* PRIMARY ACTION: ONE TASK = ONE MAIN OPTION */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => setActiveTab('passengers')}
                className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition cursor-pointer shadow-md flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <User className="w-4 h-4" />
                PASSENGER CONTROL
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('passengers')}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  View Profile
                </button>
                <button
                  onClick={() => setActiveTab('safety')}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Support Desk
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            VIEW 4: ALERT DETAIL DRAWER
           =================================================================== */}
        {alert && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-rose-800">
                  {alert.code}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  alert.priority === 'critical' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {alert.priority} Priority
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-950">{alert.title}</h4>
              <p className="text-[11px] text-slate-600">{alert.description}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-[11px]">
              <div className="text-slate-500">
                City: <strong className="text-slate-800">{alert.city}</strong>
              </div>
              <div className="text-slate-500">
                Timestamp: <strong className="text-slate-800">{alert.createdAt}</strong>
              </div>
              <div className="text-slate-500">
                Location: <strong className="text-slate-800">{alert.location.address}</strong>
              </div>
            </div>

            {/* ONE ACTION: REVIEW */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  if (alert.relatedDriverId) {
                    const d = drivers.find((x) => x.id === alert.relatedDriverId);
                    if (d) onOpenDriverControl(d);
                  } else if (alert.relatedRideId) {
                    const r = rides.find((x) => x.id === alert.relatedRideId);
                    if (r) onOpenRideControl(r);
                  } else {
                    setActiveTab('safety');
                  }
                }}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm transition cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                REVIEW & RESOLVE CASE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
