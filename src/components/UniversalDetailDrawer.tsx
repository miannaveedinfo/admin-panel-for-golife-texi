import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Driver,
  Passenger,
  Ride,
  Complaint,
  WalletTransaction,
  UniversalDetailType,
  AuditLog,
  DriverDocument
} from '../types';
import { formatPKR } from '../utils/i18n';
import { DriverControlModal } from './DriverControlModal';
import { BackToDashboardButton } from './common/BackToDashboardButton';
import { calculateSmartComplaintPattern } from '../services/feedbackAndCaseService';
import { PREDEFINED_SUSPENSION_REASONS } from '../services/driverComplianceService';
import {
  X,
  User,
  Car,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Star,
  Tag,
  Banknote,
  CreditCard,
  Wallet,
  FileText,
  Check,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Send,
  ShieldCheck,
  HelpCircle,
  Navigation,
  Info,
  Eye,
  Download,
  Printer,
  UserMinus,
  UserCheck,
  MessageSquare,
  AlertCircle,
  Ban,
  DollarSign,
  Share2,
  Sliders,
  History,
  Activity,
  Lock
} from 'lucide-react';
import { canAdminViewPII, maskPhoneNumber, maskCNIC, maskEmail } from '../utils/privacyUtils';

export const UniversalDetailDrawer: React.FC = () => {
  const {
    universalDetail,
    closeUniversalDetail,
    openUniversalDetail,
    currentAdmin,
    drivers = [],
    passengers = [],
    rides = [],
    complaints = [],
    transactions = [],
    feedbacks = [],
    auditLogs = [],
    suspendDriver,
    reinstateDriver,
    issueDriverWarning,
    toggleDriverRideEligibility,
    updateDriverDocumentStatus,
    updatePassengerStatus,
    adjustPassengerWallet,
    cancelRide,
    reassignRideDriver,
    resolveComplaint,
    rejectComplaint,
    reopenComplaint,
    addComplaintNote,
    refundTransaction,
    recordAdminAudit,
    setActiveTab,
    setOperationsInitialFilter,
    showToast
  } = useAdmin();

  // Control Modal Sub-State for Drivers
  const [isDriverControlOpen, setIsDriverControlOpen] = useState(false);
  const [driverControlInitialTab, setDriverControlInitialTab] = useState<any>('actions');

  // Inline Action Modals / Prompts
  const [activeActionModal, setActiveActionModal] = useState<
    | null
    | 'suspend_driver'
    | 'warn_driver'
    | 'passenger_wallet'
    | 'passenger_status'
    | 'cancel_ride'
    | 'reassign_ride'
    | 'refund_ride'
    | 'resolve_complaint'
    | 'reject_complaint'
    | 'add_complaint_note'
    | 'refund_payment'
  >(null);

  // Form states for modals
  const [suspendReason, setSuspendReason] = useState<string>('Passenger complaint');
  const [suspendDurationHours, setSuspendDurationHours] = useState<number>(12);
  const [suspendNotes, setSuspendNotes] = useState<string>('');

  const [warningReason, setWarningReason] = useState<string>('Performance / Conduct Warning');
  const [warningNotes, setWarningNotes] = useState<string>('');

  const [walletDelta, setWalletDelta] = useState<number>(250);
  const [walletNote, setWalletNote] = useState<string>('Courtesy credit per admin review');

  const [cancelRideReason, setCancelRideReason] = useState<string>('Cancelled by Admin (Operational Issue)');
  const [selectedNewDriverId, setSelectedNewDriverId] = useState<string>('');

  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState<string>('Service complaint compensation');

  const [complaintResolutionNotes, setComplaintResolutionNotes] = useState<string>('');
  const [complaintActionType, setComplaintActionType] = useState<'resolved' | 'warning' | 'suspension' | 'refund'>('resolved');
  const [complaintRejectionReason, setComplaintRejectionReason] = useState<string>('');
  const [newComplaintNote, setNewComplaintNote] = useState<string>('');

  // Selected tab within the drawer
  const [activeSubTab, setActiveSubTab] = useState<string>('overview');

  const isAuthorizedForPII = useMemo(() => canAdminViewPII(currentAdmin), [currentAdmin]);

  // Synchronize initialTab if provided
  React.useEffect(() => {
    if (universalDetail?.initialTab) {
      setActiveSubTab(universalDetail.initialTab);
    } else {
      setActiveSubTab('overview');
    }
  }, [universalDetail?.type, universalDetail?.id, universalDetail?.initialTab]);

  if (!universalDetail) return null;

  const { type, id } = universalDetail;

  // Retrieve current entity
  const driver = type === 'driver' ? drivers.find((d) => d.id === id) : null;
  const passenger = type === 'passenger' ? passengers.find((p) => p.id === id) : null;
  const ride = type === 'ride' ? rides.find((r) => r.id === id) : null;
  const complaint = type === 'complaint' ? complaints.find((c) => c.id === id) : null;
  const payment = type === 'payment' ? transactions.find((t) => t.id === id) : null;

  const entityExists = !!(driver || passenger || ride || complaint || payment);

  // Helper to open related entity
  const handleOpenRelated = (relType: UniversalDetailType, relId: string, tab = 'overview') => {
    openUniversalDetail(relType, relId, tab);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="w-full max-w-3xl sm:w-[680px] lg:w-[740px] bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden">
        {/* TOP HEADER */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <BackToDashboardButton
              variant="dark"
              onClick={() => {
                closeUniversalDetail();
                setActiveTab('dashboard');
              }}
            />
            <span
              className={`px-2.5 py-1 text-[11px] font-bold rounded uppercase tracking-wider ${
                type === 'driver'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : type === 'passenger'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : type === 'ride'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : type === 'complaint'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              }`}
            >
              {type.toUpperCase()}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {driver?.name ||
                    passenger?.name ||
                    ride?.rideCode ||
                    complaint?.complaintCode ||
                    payment?.id ||
                    'Record Details'}
                </h2>
                <span className="text-xs text-slate-400 font-mono">#{id}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                GoLife Universal Detail Center • Single Task Operational View
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={closeUniversalDetail}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!entityExists ? (
          <div className="p-12 text-center text-slate-500 flex-1 flex flex-col items-center justify-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="font-semibold text-slate-800">Record Not Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              The requested {type} record with identifier "{id}" was not found or has been removed.
            </p>
            <button
              onClick={closeUniversalDetail}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
            >
              Close Drawer
            </button>
          </div>
        ) : (
          <>
            {/* TAB NAVIGATION BAR */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
              {type === 'driver' && (
                <>
                  {[
                    { key: 'overview', label: 'Overview' },
                    { key: 'activity', label: 'Live Activity' },
                    { key: 'history', label: 'Ride History' },
                    { key: 'documents', label: 'Documents' },
                    { key: 'complaints', label: 'Complaints & Patterns' },
                    { key: 'actions', label: 'Admin Actions' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveSubTab(tab.key)}
                      className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                        activeSubTab === tab.key
                          ? 'border-amber-500 text-slate-900 bg-white'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </>
              )}

              {type === 'passenger' && (
                <>
                  {[
                    { key: 'overview', label: 'Overview' },
                    { key: 'history', label: 'Rides & Spend' },
                    { key: 'complaints', label: 'Complaints' },
                    { key: 'actions', label: 'Admin Actions' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveSubTab(tab.key)}
                      className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                        activeSubTab === tab.key
                          ? 'border-emerald-500 text-slate-900 bg-white'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </>
              )}

              {type === 'ride' && (
                <>
                  {[
                    { key: 'overview', label: 'Overview' },
                    { key: 'route', label: 'Route & Map' },
                    { key: 'participants', label: 'Driver & Rider' },
                    { key: 'timeline', label: 'Live Timeline' },
                    { key: 'feedback', label: 'Reviews & Feedback' },
                    { key: 'actions', label: 'Actions' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveSubTab(tab.key)}
                      className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                        activeSubTab === tab.key
                          ? 'border-blue-500 text-slate-900 bg-white'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </>
              )}

              {type === 'complaint' && (
                <>
                  {[
                    { key: 'overview', label: 'Overview' },
                    { key: 'evidence', label: 'Evidence & Notes' },
                    { key: 'related_ride', label: 'Related Ride' },
                    { key: 'smart_pattern', label: 'Smart Pattern Check' },
                    { key: 'actions', label: 'Case Control' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveSubTab(tab.key)}
                      className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                        activeSubTab === tab.key
                          ? 'border-rose-500 text-slate-900 bg-white'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </>
              )}

              {type === 'payment' && (
                <>
                  {[
                    { key: 'overview', label: 'Overview' },
                    { key: 'breakdown', label: 'Fare Breakdown' },
                    { key: 'related', label: 'Related Records' },
                    { key: 'actions', label: 'Refund & Actions' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveSubTab(tab.key)}
                      className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                        activeSubTab === tab.key
                          ? 'border-purple-500 text-slate-900 bg-white'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* DRAWER BODY (SCROLLABLE CONTENT) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* ========================================================================= */}
              {/* 1. DRIVER DETAILS */}
              {/* ========================================================================= */}
              {type === 'driver' && driver && (
                <div>
                  {activeSubTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Driver Banner Card */}
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-amber-50/40 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={
                              driver.photoUrl ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                            }
                            alt={driver.name}
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-slate-900">{driver.name}</h3>
                              <span
                                className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                                  driver.accountStatus === 'active'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : driver.accountStatus === 'suspended'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {driver.accountStatus || 'active'}
                              </span>
                              {driver.operationalStatus && (
                                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {driver.operationalStatus.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1 font-mono">
                              <span className="flex items-center gap-1" title={isAuthorizedForPII ? 'Verified Driver Contact' : 'PII Protected'}>
                                <Phone className="w-3.5 h-3.5 text-slate-400" /> {maskPhoneNumber(driver.phone, isAuthorizedForPII)}
                              </span>
                              {driver.cnic && (
                                <span className="flex items-center gap-1" title={isAuthorizedForPII ? 'Verified NADRA CNIC' : 'PII Protected'}>
                                  <FileText className="w-3.5 h-3.5 text-slate-400" /> CNIC: {maskCNIC(driver.cnic, isAuthorizedForPII)}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {driver.city || 'Islamabad'}
                              </span>
                              {!isAuthorizedForPII && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                  <Lock className="w-2.5 h-2.5" /> PII Protected
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-end gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => setIsDriverControlOpen(true)}
                            className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Sliders className="w-3.5 h-3.5" /> CONTROL DRIVER
                          </button>
                        </div>
                      </div>

                      {/* Metric Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[11px] text-slate-500 font-medium">Rating</span>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="text-base font-bold text-slate-900">
                              {driver.rating ? driver.rating.toFixed(2) : '4.85'}
                            </span>
                            <span className="text-[10px] text-slate-400">/ 5.0</span>
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[11px] text-slate-500 font-medium">Acceptance Rate</span>
                          <div className="text-base font-bold text-emerald-600 mt-1">
                            {driver.acceptanceRate ? `${driver.acceptanceRate}%` : '94%'}
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[11px] text-slate-500 font-medium">Cancellation Rate</span>
                          <div className="text-base font-bold text-rose-600 mt-1">
                            {driver.cancellationRate ? `${driver.cancellationRate}%` : '3.2%'}
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[11px] text-slate-500 font-medium">Total Rides</span>
                          <div className="text-base font-bold text-slate-900 mt-1">
                            {driver.totalRides || 342}
                          </div>
                        </div>
                      </div>

                      {/* Vehicle & Service Info */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Car className="w-4 h-4 text-amber-600" /> Registered Vehicle & Category
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 uppercase">
                            {driver.serviceCategory || driver.category || 'Mini / Ride'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                          <div>
                            <span className="text-slate-400 text-[11px] block">Make & Model</span>
                            <span className="font-semibold text-slate-800">
                              {driver.vehicle?.make || 'Toyota'} {driver.vehicle?.model || 'Corolla'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[11px] block">Year & Color</span>
                            <span className="font-semibold text-slate-800">
                              {driver.vehicle?.year || '2021'} • {driver.vehicle?.color || 'White'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[11px] block">Registration Plate</span>
                            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                              {driver.vehicle?.plate || driver.vehiclePlate || 'ICT-9921'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[11px] block">Ride Eligibility</span>
                            <span
                              className={`font-semibold ${
                                (driver as any).rideEligibility === 'disabled'
                                  ? 'text-rose-600'
                                  : 'text-emerald-600'
                              }`}
                            >
                              {(driver as any).rideEligibility === 'disabled' ? 'Paused' : 'Eligible'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Active Suspension Alert if currently suspended */}
                      {driver.accountStatus === 'suspended' && (
                        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                          <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                          <div className="text-xs text-rose-900 flex-1">
                            <h5 className="font-bold">Account Currently Suspended</h5>
                            <p className="mt-0.5">
                              Driver is locked out of dispatch. Reason: {driver.activeSuspension?.reason || 'Compliance Review'}.
                              Expires: {driver.activeSuspension?.expiryTime || 'Pending Operator Review'}.
                            </p>
                            <button
                              onClick={() => {
                                reinstateDriver(driver.id);
                                showToast(`Driver ${driver.name} reinstated`, 'success');
                              }}
                              className="mt-2 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-md text-[11px] transition"
                            >
                              Reinstate Driver Now
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeSubTab === 'activity' && (
                    <div className="space-y-4 text-xs">
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                        <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-blue-600" /> Current Telemetry Status
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="p-3 bg-white rounded-lg border border-slate-200">
                            <span className="text-slate-400 text-[11px] block">Operational State</span>
                            <span className="font-bold text-slate-800 text-sm capitalize">
                              {driver.operationalStatus || driver.status || 'Offline'}
                            </span>
                          </div>
                          <div className="p-3 bg-white rounded-lg border border-slate-200">
                            <span className="text-slate-400 text-[11px] block">Today's Completed Rides</span>
                            <span className="font-bold text-slate-800 text-sm">
                              {driver.todayRidesCount || 7} rides
                            </span>
                          </div>
                          <div className="p-3 bg-white rounded-lg border border-slate-200">
                            <span className="text-slate-400 text-[11px] block">Today's Net Earnings</span>
                            <span className="font-bold text-emerald-600 text-sm">
                              {formatPKR(driver.todayEarnings || 4850)}
                            </span>
                          </div>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="text-slate-400 text-[11px] block">Last GPS Ping / Location</span>
                            <span className="font-mono text-slate-700">
                              {driver.location?.lat ? `${driver.location.lat.toFixed(4)}, ${driver.location.lng.toFixed(4)}` : '33.6844, 73.0479'} (±2m live GPS)
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              closeUniversalDetail();
                              setActiveTab('live_rides');
                              setOperationsInitialFilter({ mode: 'driver', query: driver.name });
                            }}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                          >
                            <MapPin className="w-3 h-3 text-amber-400" /> Locate on Live Map
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSubTab === 'history' && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Driver Completed Rides & Incident History
                      </h4>
                      <div className="space-y-2">
                        {(rides || [])
                          .filter((r) => r.driverId === driver.id)
                          .slice(0, 6)
                          .map((r) => (
                            <div
                              key={r.id}
                              onClick={() => handleOpenRelated('ride', r.id)}
                              className="p-3 rounded-xl border border-slate-200 bg-white hover:border-amber-400 transition cursor-pointer flex items-center justify-between text-xs"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900">{r.rideCode}</span>
                                  <span className="text-slate-400 font-mono text-[11px]">{r.date || 'Today'}</span>
                                  <span className="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 font-semibold text-slate-700">
                                    {r.category}
                                  </span>
                                </div>
                                <p className="text-slate-500 mt-1 truncate max-w-md">
                                  {r.pickupAddress} ➔ {r.dropoffAddress}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-slate-900 block">{formatPKR(r.fare)}</span>
                                <span className="text-[10px] text-emerald-600 font-semibold uppercase">
                                  {r.status.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          ))}
                        {(rides || []).filter((r) => r.driverId === driver.id).length === 0 && (
                          <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                            No ride records found for this driver.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeSubTab === 'documents' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Compliance Documents Verification
                        </h4>
                        <span className="text-xs text-slate-400">Pakistani NADRA & Driving Authority Checks</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { name: 'CNIC (Front & Back)', type: 'cnic', status: 'verified', preview: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=300&auto=format&fit=crop&q=80' },
                          { name: 'Driving License', type: 'license', status: 'verified', preview: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80' },
                          { name: 'Vehicle Registration', type: 'registration', status: 'verified', preview: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&auto=format&fit=crop&q=80' },
                          { name: 'Police Verification / Character Certificate', type: 'police_check', status: 'verified', preview: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=300&auto=format&fit=crop&q=80' }
                        ].map((doc, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-xs text-slate-900">{doc.name}</span>
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
                                Verified
                              </span>
                            </div>
                            <img
                              src={doc.preview}
                              alt={doc.name}
                              className="w-full h-28 object-cover rounded-lg border border-slate-100"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => {
                                  updateDriverDocumentStatus(driver.id, idx, 'verified', 'Verified by Admin');
                                  showToast(`${doc.name} marked verified`, 'success');
                                }}
                                className="flex-1 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[11px] font-semibold"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  updateDriverDocumentStatus(driver.id, idx, 'rejected', 'Document invalid or unclear');
                                  showToast(`${doc.name} rejected`, 'warning');
                                }}
                                className="flex-1 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded text-[11px] font-semibold"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeSubTab === 'complaints' && (
                    <div className="space-y-4">
                      {/* Smart Pattern Check Box */}
                      {(() => {
                        const pattern = calculateSmartComplaintPattern('driver', driver.id, complaints);
                        return (
                          <div className={`p-4 rounded-xl border ${pattern.requiresAction ? 'bg-amber-50/80 border-amber-300' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                            <div className="flex items-center justify-between">
                              <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                <ShieldAlert className="w-4 h-4 text-amber-600" /> Smart Complaint Pattern Analysis
                              </h5>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-white border border-slate-200">
                                Risk: {pattern.severity}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700">{pattern.summaryText}</p>
                            {pattern.requiresAction && (
                              <div className="p-2.5 rounded-lg bg-white border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                                <span>{pattern.actionReason}</span>
                                <button
                                  onClick={() => {
                                    setSuspendReason(pattern.repeatedCategory || 'Multiple complaints');
                                    setActiveActionModal('suspend_driver');
                                  }}
                                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-[10px]"
                                >
                                  Take Action
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Complaint List */}
                      <div className="space-y-2">
                        {(complaints || [])
                          .filter((c) => c.driverId === driver.id || c.targetId === driver.id)
                          .map((c) => (
                            <div
                              key={c.id}
                              onClick={() => handleOpenRelated('complaint', c.id)}
                              className="p-3 rounded-xl border border-slate-200 bg-white hover:border-rose-400 transition cursor-pointer flex items-center justify-between text-xs"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900">{c.complaintCode || c.id}</span>
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                    {c.category || c.type}
                                  </span>
                                  <span className="text-slate-400 font-mono text-[11px]">{c.createdAt}</span>
                                </div>
                                <p className="text-slate-600 mt-1 line-clamp-1">{c.description}</p>
                              </div>
                              <div className="text-right">
                                <span className="font-semibold text-slate-700 capitalize">{c.status}</span>
                                <ChevronRight className="w-4 h-4 text-slate-400 inline ml-1" />
                              </div>
                            </div>
                          ))}
                        {(complaints || []).filter((c) => c.driverId === driver.id || c.targetId === driver.id).length === 0 && (
                          <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                            No active complaints registered against this driver.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeSubTab === 'actions' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Instant Operations Shortcuts
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            onClick={() => setIsDriverControlOpen(true)}
                            className="p-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-between transition shadow-xs"
                          >
                            <span className="flex items-center gap-2">
                              <Sliders className="w-4 h-4" /> Comprehensive Control Modal
                            </span>
                            <ArrowRight className="w-4 h-4" />
                          </button>

                          {driver.accountStatus === 'suspended' ? (
                            <button
                              onClick={() => {
                                reinstateDriver(driver.id);
                                showToast(`Driver ${driver.name} reinstated`, 'success');
                              }}
                              className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-between transition"
                            >
                              <span className="flex items-center gap-2">
                                <RotateCcw className="w-4 h-4" /> Reinstate Driver to Active
                              </span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setActiveActionModal('suspend_driver')}
                              className="p-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-between transition"
                            >
                              <span className="flex items-center gap-2">
                                <Ban className="w-4 h-4" /> Suspend Driver Account
                              </span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => setActiveActionModal('warn_driver')}
                            className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-between transition"
                          >
                            <span className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-600" /> Issue Official Caution / Warning
                            </span>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                          </button>

                          <button
                            onClick={() => {
                              const isPaused = (driver as any).rideEligibility === 'disabled';
                              toggleDriverRideEligibility(driver.id, isPaused);
                              showToast(
                                `Ride eligibility ${isPaused ? 'restored' : 'temporarily paused'} for ${driver.name}`,
                                'info'
                              );
                            }}
                            className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-between transition"
                          >
                            <span className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-blue-600" /> Toggle Ride Eligibility
                            </span>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* 2. PASSENGER DETAILS */}
              {/* ========================================================================= */}
              {type === 'passenger' && passenger && (
                <div className="space-y-6">
                  {activeSubTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-2xl border-2 border-emerald-400">
                            {passenger.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-slate-900">{passenger.name}</h3>
                              <span
                                className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                                  passenger.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {passenger.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1 font-mono">
                              <span className="flex items-center gap-1" title={isAuthorizedForPII ? 'Verified Passenger Contact' : 'PII Protected'}>
                                <Phone className="w-3.5 h-3.5 text-slate-400" /> {maskPhoneNumber(passenger.phone, isAuthorizedForPII)}
                              </span>
                              {passenger.email && (
                                <span className="flex items-center gap-1" title={isAuthorizedForPII ? 'Passenger Email' : 'PII Protected'}>
                                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {maskEmail(passenger.email, isAuthorizedForPII)}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Member since {passenger.memberSince || '2025'}
                              </span>
                              {!isAuthorizedForPII && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                  <Lock className="w-2.5 h-2.5" /> PII Protected
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-end gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => setActiveActionModal('passenger_wallet')}
                            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition"
                          >
                            <Wallet className="w-3.5 h-3.5" /> Adjust Wallet
                          </button>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[11px] text-slate-500 font-medium">Wallet Balance</span>
                          <div className="text-base font-bold text-emerald-600 mt-1">
                            {formatPKR(passenger.walletBalance ?? 350)}
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[11px] text-slate-500 font-medium">Passenger Rating</span>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="text-base font-bold text-slate-900">
                              {passenger.rating ? passenger.rating.toFixed(1) : '4.9'}
                            </span>
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[11px] text-slate-500 font-medium">Total Completed</span>
                          <div className="text-base font-bold text-slate-900 mt-1">
                            {passenger.totalRides || 28} rides
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[11px] text-slate-500 font-medium">Total Spend</span>
                          <div className="text-base font-bold text-slate-900 mt-1">
                            {formatPKR(passenger.totalSpend || 18450)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSubTab === 'history' && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Ride History & Spending Records
                      </h4>
                      <div className="space-y-2">
                        {(rides || [])
                          .filter((r) => r.passengerId === passenger.id || r.passengerPhone === passenger.phone)
                          .map((r) => (
                            <div
                              key={r.id}
                              onClick={() => handleOpenRelated('ride', r.id)}
                              className="p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 transition cursor-pointer flex items-center justify-between text-xs"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900">{r.rideCode}</span>
                                  <span className="text-slate-400 font-mono text-[11px]">{r.date || 'Recent'}</span>
                                  <span className="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 font-semibold text-slate-700">
                                    {r.category}
                                  </span>
                                </div>
                                <p className="text-slate-500 mt-1 truncate max-w-md">
                                  {r.pickupAddress} ➔ {r.dropoffAddress}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-slate-900 block">{formatPKR(r.fare)}</span>
                                <span className="text-[10px] text-emerald-600 font-semibold uppercase">
                                  {r.status.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {activeSubTab === 'complaints' && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Complaints Filed by or against Passenger
                      </h4>
                      <div className="space-y-2">
                        {(complaints || [])
                          .filter((c) => c.passengerId === passenger.id || c.reporterId === passenger.id)
                          .map((c) => (
                            <div
                              key={c.id}
                              onClick={() => handleOpenRelated('complaint', c.id)}
                              className="p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 transition cursor-pointer flex items-center justify-between text-xs"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900">{c.complaintCode || c.id}</span>
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                    {c.category}
                                  </span>
                                </div>
                                <p className="text-slate-600 mt-1">{c.description}</p>
                              </div>
                              <span className="text-xs font-semibold text-slate-700 capitalize">{c.status}</span>
                            </div>
                          ))}
                        {(complaints || []).filter((c) => c.passengerId === passenger.id || c.reporterId === passenger.id).length === 0 && (
                          <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                            No complaints on file for this passenger.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeSubTab === 'actions' && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Passenger Account Actions
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            onClick={() => setActiveActionModal('passenger_wallet')}
                            className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-between transition"
                          >
                            <span className="flex items-center gap-2">
                              <Wallet className="w-4 h-4" /> Credit / Debit Wallet
                            </span>
                            <ArrowRight className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              adjustPassengerWallet(passenger.id, 250, 'Courtesy apology credit issued by admin');
                              recordAdminAudit(
                                'COURTESY_CREDIT',
                                `Passenger: ${passenger.name}`,
                                'Customer Satisfaction',
                                'Rs. 250 courtesy credit',
                                'Manual',
                                'passenger',
                                passenger.id
                              );
                              showToast(`Rs. 250 courtesy credit added to ${passenger.name}`, 'success');
                            }}
                            className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center justify-between transition"
                          >
                            <span className="flex items-center gap-2">
                              <Banknote className="w-4 h-4" /> Issue Rs. 250 Courtesy Credit
                            </span>
                            <ArrowRight className="w-4 h-4 text-emerald-600" />
                          </button>

                          <button
                            onClick={() => {
                              const newStatus = passenger.status === 'active' ? 'suspended' : 'active';
                              updatePassengerStatus(passenger.id, newStatus, 'Status changed via Universal Detail');
                              recordAdminAudit(
                                'PASSENGER_STATUS_TOGGLED',
                                `Passenger: ${passenger.name}`,
                                'Administrative Review',
                                `Updated status to ${newStatus}`,
                                'Manual',
                                'passenger',
                                passenger.id
                              );
                              showToast(`Passenger account ${newStatus}`, 'info');
                            }}
                            className={`p-3 rounded-xl font-bold text-xs flex items-center justify-between transition ${
                              passenger.status === 'active'
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <Ban className="w-4 h-4" />
                              {passenger.status === 'active' ? 'Suspend Passenger Account' : 'Unblock Passenger'}
                            </span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* 3. RIDE DETAILS */}
              {/* ========================================================================= */}
              {type === 'ride' && ride && (
                <div className="space-y-6">
                  {activeSubTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-900">{ride.rideCode || ride.id}</h3>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                                ride.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ride.status === 'in_progress' || ride.status === 'arrived'
                                  ? 'bg-blue-100 text-blue-800'
                                  : ride.status === 'cancelled'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {ride.status.replace('_', ' ')}
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-800 uppercase">
                              {ride.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 font-mono">
                            Booked at {ride.date || ride.time || 'Today'} • Fare: {formatPKR(ride.fare)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {ride.status === 'in_progress' || ride.status === 'driver_assigned' || ride.status === 'searching' ? (
                            <button
                              onClick={() => setActiveActionModal('cancel_ride')}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs"
                            >
                              Cancel Ride
                            </button>
                          ) : null}
                          <button
                            onClick={() => setActiveActionModal('refund_ride')}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl border border-slate-200"
                          >
                            Fare / Refund
                          </button>
                        </div>
                      </div>

                      {/* Route Summary */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 text-xs">
                        <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <Navigation className="w-3.5 h-3.5 text-blue-600" /> Route & Trajectory
                        </h4>
                        <div className="space-y-3 pl-2 border-l-2 border-slate-200">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-700 uppercase block">Pickup</span>
                            <p className="font-medium text-slate-900">{ride.pickupAddress}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-rose-700 uppercase block">Dropoff</span>
                            <p className="font-medium text-slate-900">{ride.dropoffAddress}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
                          <div>
                            <span className="text-slate-400 text-[10px] block">Distance</span>
                            <span className="font-bold text-slate-800">{ride.distanceKm || 8.4} km</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">Duration</span>
                            <span className="font-bold text-slate-800">{ride.durationMinutes || 24} mins</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">Payment Method</span>
                            <span className="font-bold text-slate-800 capitalize">{ride.paymentMethod || 'Cash'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">Payment Status</span>
                            <span className="font-bold text-emerald-600 uppercase text-[11px]">{ride.paymentStatus || 'Paid'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Complete Pricing Breakdown */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 text-xs">
                        <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <Banknote className="w-3.5 h-3.5 text-emerald-600" /> Complete Pricing & Commission Itemization
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-[11px]">
                          <div>
                            <span className="text-slate-500 text-[10px] block">Base Fare</span>
                            <span className="font-bold text-slate-800">{formatPKR((ride as any).baseFare || Math.round(ride.fare * 0.25))}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block">Distance Fare</span>
                            <span className="font-bold text-slate-800">{formatPKR((ride as any).distanceFare || Math.round(ride.fare * 0.55))}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block">Time / Wait</span>
                            <span className="font-bold text-slate-800">{formatPKR((ride as any).timeFare || Math.round(ride.fare * 0.1))}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block">Peak / Surge</span>
                            <span className="font-bold text-slate-800">{(ride as any).surgeMultiplier ? `${(ride as any).surgeMultiplier}x` : '1.0x (Standard)'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block">Promo / Discount</span>
                            <span className="font-bold text-purple-600">{(ride as any).discount ? `-${formatPKR((ride as any).discount)}` : 'Rs. 0'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block">Platform Fee</span>
                            <span className="font-bold text-blue-600">{formatPKR(ride.commission || Math.round(ride.fare * 0.15))}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block">Driver Net Payout</span>
                            <span className="font-bold text-emerald-600">{formatPKR(ride.driverEarnings || (ride.fare - (ride.commission || 0)))}</span>
                          </div>
                          <div className="border-l border-slate-200 pl-2">
                            <span className="text-slate-500 text-[10px] block font-sans font-semibold">Total Fare</span>
                            <span className="font-extrabold text-slate-900 text-sm">{formatPKR(ride.fare)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Support & Dispute Status */}
                      {(() => {
                        const relatedComplaint = complaints.find((c) => c.rideId === ride.id || c.rideCode === ride.rideCode);
                        if (!relatedComplaint) return null;
                        return (
                          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 text-xs flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                              <div>
                                <span className="font-bold text-rose-900">
                                  Support Dispute Filed (#{relatedComplaint.complaintCode})
                                </span>
                                <p className="text-[11px] text-rose-700">
                                  Category: {relatedComplaint.category} • Status: <span className="font-bold uppercase">{relatedComplaint.status}</span>
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleOpenRelated('complaint', relatedComplaint.id)}
                              className="px-3 py-1 bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-[11px] rounded-lg transition"
                            >
                              View Dispute
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {activeSubTab === 'participants' && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Assigned Driver & Passenger Records
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Driver Box */}
                        <div
                          onClick={() => ride.driverId && handleOpenRelated('driver', ride.driverId)}
                          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-amber-400 transition cursor-pointer space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                              Driver
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                              {ride.driverName?.charAt(0) || 'D'}
                            </div>
                            <div>
                              <h5 className="font-bold text-slate-900">{ride.driverName || 'Unassigned'}</h5>
                              <p className="text-slate-500 font-mono text-[11px]" title={isAuthorizedForPII ? 'Driver Contact' : 'PII Protected'}>
                                {maskPhoneNumber(ride.driverPhone, isAuthorizedForPII)}
                              </p>
                            </div>
                          </div>
                          <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-100 flex items-center justify-between">
                            <span>Vehicle: {ride.driverPlate || 'RWP-9921'}</span>
                            <span className="font-bold text-amber-600">★ {ride.driverRating || 4.8}</span>
                          </div>
                        </div>

                        {/* Passenger Box */}
                        <div
                          onClick={() => ride.passengerId && handleOpenRelated('passenger', ride.passengerId)}
                          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 transition cursor-pointer space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              Passenger
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                              {ride.passengerName?.charAt(0) || 'P'}
                            </div>
                            <div>
                              <h5 className="font-bold text-slate-900">{ride.passengerName}</h5>
                              <p className="text-slate-500 font-mono text-[11px]" title={isAuthorizedForPII ? 'Passenger Contact' : 'PII Protected'}>
                                {maskPhoneNumber(ride.passengerPhone, isAuthorizedForPII)}
                              </p>
                            </div>
                          </div>
                          <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-100 flex items-center justify-between">
                            <span>City: {ride.city}</span>
                            <span className="font-bold text-emerald-600">★ {ride.passengerRating || 4.9}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSubTab === 'timeline' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Telemetry & Operational Milestones
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Real Telemetry Audit
                        </span>
                      </div>
                      
                      <div className="space-y-4 pl-4 border-l-2 border-blue-400 ml-2">
                        {/* 1. Requested */}
                        <div className="relative">
                          <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${ride.startTime || (ride as any).createdAt ? 'bg-blue-600' : 'bg-slate-300'}`} />
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">Ride Requested & Dispatched</span>
                            <span className="text-slate-500 font-mono text-[10px]">
                              {ride.startTime || (ride as any).createdAt || (ride as any).requestTime || 'Historical timestamp unrecorded'}
                            </span>
                          </div>
                          <span className="text-slate-400 text-[10px] block">
                            Pickup at {ride.pickupAddress || 'Requested location'}
                          </span>
                        </div>

                        {/* 2. Assigned */}
                        <div className="relative">
                          <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${ride.driverId || (ride as any).assignedAt ? 'bg-blue-600' : 'bg-slate-300'}`} />
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">Driver Accepted & Assigned</span>
                            <span className="text-slate-500 font-mono text-[10px]">
                              {(ride as any).assignedAt || (ride.driverId ? (ride.startTime || 'Assigned') : 'Pending driver assignment')}
                            </span>
                          </div>
                          <span className="text-slate-400 text-[10px] block">
                            {ride.driverName ? `Assigned to ${ride.driverName} (${ride.driverPlate || 'Vehicle'})` : 'No driver assigned yet'}
                          </span>
                        </div>

                        {/* 3. Arrived */}
                        <div className="relative">
                          <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${['arrived', 'in_progress', 'completed'].includes(ride.status) || (ride as any).arrivedAt ? 'bg-blue-600' : 'bg-slate-300'}`} />
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">Driver Arrived at Pickup Location</span>
                            <span className="text-slate-500 font-mono text-[10px]">
                              {(ride as any).arrivedAt || (['arrived', 'in_progress', 'completed'].includes(ride.status) ? 'Arrived (timestamp unrecorded)' : 'Not recorded / en route')}
                            </span>
                          </div>
                          <span className="text-slate-400 text-[10px] block">
                            {['arrived', 'in_progress', 'completed'].includes(ride.status) ? 'Driver reached pickup coordinate' : 'En route to pickup location'}
                          </span>
                        </div>

                        {/* 4. Started */}
                        <div className="relative">
                          <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${['in_progress', 'completed'].includes(ride.status) || (ride as any).startedAt ? 'bg-blue-600' : 'bg-slate-300'}`} />
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">Trip Commenced (In Transit)</span>
                            <span className="text-slate-500 font-mono text-[10px]">
                              {(ride as any).startedAt || (['in_progress', 'completed'].includes(ride.status) ? (ride.startTime || 'In progress') : 'Not started')}
                            </span>
                          </div>
                          <span className="text-slate-400 text-[10px] block">
                            {['in_progress', 'completed'].includes(ride.status) ? 'Passenger on board, meter active' : 'Awaiting passenger pickup'}
                          </span>
                        </div>

                        {/* 5. Completed / Cancelled */}
                        {ride.status === 'cancelled' ? (
                          <div className="relative">
                            <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-rose-600" />
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-rose-700">Trip Cancelled</span>
                              <span className="text-rose-600 font-mono text-[10px]">
                                {(ride as any).cancelledAt || 'Timestamp unrecorded'}
                              </span>
                            </div>
                            <span className="text-rose-500 text-[10px] block">
                              Reason: {(ride as any).cancellationReason || 'Cancelled by admin/user'} (By: {(ride as any).cancelledBy || 'System'})
                            </span>
                          </div>
                        ) : (
                          <div className="relative">
                            <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${ride.status === 'completed' ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">Trip Completed & Settled</span>
                              <span className="text-slate-500 font-mono text-[10px]">
                                {ride.status === 'completed' ? ((ride as any).completedAt || (ride as any).endTime || ride.startTime || 'Completed') : 'Pending trip completion'}
                              </span>
                            </div>
                            <span className="text-slate-400 text-[10px] block">
                              {ride.status === 'completed' ? `Settled fare of PKR ${ride.fare} via ${ride.paymentMethod || 'Cash'}` : 'Trip is currently open or in-progress'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeSubTab === 'feedback' && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Ride Feedback & Rating Audit
                      </h4>
                      {(() => {
                        const fb = feedbacks.find((f) => f.rideId === ride.id || f.rideCode === ride.rideCode);
                        if (!fb) {
                          return (
                            <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                              No written review filed for this completed ride.
                            </div>
                          );
                        }
                        return (
                          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 text-xs">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < fb.passengerRating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'
                                    }`}
                                  />
                                ))}
                                <span className="font-bold text-slate-900 ml-2">{fb.passengerRating} / 5</span>
                              </div>
                              <span className="text-slate-400 font-mono text-[11px]">{fb.date}</span>
                            </div>

                            <div>
                              <span className="text-slate-400 text-[10px] uppercase font-bold block">Passenger Comment</span>
                              <p className="text-slate-800 mt-1 italic">"{fb.passengerFeedback}"</p>
                            </div>

                            {fb.tags && fb.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {fb.tags.map((t, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                                  >
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}

                            {fb.driverFeedback && (
                              <div className="pt-2 border-t border-slate-100">
                                <span className="text-slate-400 text-[10px] uppercase font-bold block">Driver Feedback</span>
                                <p className="text-slate-700 mt-1">"{fb.driverFeedback}"</p>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {activeSubTab === 'actions' && (
                    <div className="space-y-3 text-xs">
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                        <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                          Ride Operational Actions
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            onClick={() => setActiveActionModal('refund_ride')}
                            className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-between transition"
                          >
                            <span className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" /> Issue Passenger Fare Refund
                            </span>
                            <ArrowRight className="w-4 h-4" />
                          </button>

                          {ride.status === 'in_progress' || ride.status === 'driver_assigned' || ride.status === 'searching' ? (
                            <button
                              onClick={() => setActiveActionModal('cancel_ride')}
                              className="p-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center justify-between transition"
                            >
                              <span className="flex items-center gap-2">
                                <Ban className="w-4 h-4" /> Force Cancel Active Ride
                              </span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          ) : null}

                          {complaints.some((c) => c.rideId === ride.id) && (
                            <button
                              onClick={() => {
                                const linked = complaints.find((c) => c.rideId === ride.id);
                                if (linked) handleOpenRelated('complaint', linked.id);
                              }}
                              className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold flex items-center justify-between transition"
                            >
                              <span className="flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-amber-600" /> Open Linked Complaint
                              </span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* 4. COMPLAINT DETAILS */}
              {/* ========================================================================= */}
              {type === 'complaint' && complaint && (
                <div className="space-y-6">
                  {activeSubTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-rose-50/40 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-900">
                              {complaint.complaintCode || complaint.id}
                            </h3>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                                complaint.status === 'resolved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : complaint.status === 'investigating'
                                  ? 'bg-blue-100 text-blue-800'
                                  : complaint.status === 'rejected'
                                  ? 'bg-slate-100 text-slate-700'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {complaint.status}
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-900 uppercase">
                              Severity: {complaint.severity || 'Normal'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 font-mono">
                            Filed on {complaint.createdAt} • Category: {complaint.category || complaint.type}
                          </p>
                        </div>

                        <button
                          onClick={() => setActiveActionModal('resolve_complaint')}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" /> CASE CONTROL
                        </button>
                      </div>

                      {/* Complaint Description & Statement */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                        <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                          Complainant Statement & Incident Details
                        </h4>
                        <p className="text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                          {complaint.description}
                        </p>
                      </div>

                      {/* Parties Involved Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div
                          onClick={() => complaint.passengerId && handleOpenRelated('passenger', complaint.passengerId)}
                          className="p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 transition cursor-pointer"
                        >
                          <span className="text-[10px] font-bold uppercase text-emerald-700 block mb-1">
                            Complainant (Passenger)
                          </span>
                          <span className="font-bold text-slate-900 block">{complaint.passengerName || 'Passenger'}</span>
                          <span className="text-slate-500 font-mono text-[11px]">{complaint.passengerPhone || 'N/A'}</span>
                        </div>

                        <div
                          onClick={() => complaint.driverId && handleOpenRelated('driver', complaint.driverId)}
                          className="p-3 rounded-xl border border-slate-200 bg-white hover:border-amber-400 transition cursor-pointer"
                        >
                          <span className="text-[10px] font-bold uppercase text-amber-700 block mb-1">
                            Reported Party (Driver)
                          </span>
                          <span className="font-bold text-slate-900 block">{complaint.driverName || 'Driver'}</span>
                          <span className="text-slate-500 font-mono text-[11px]">{complaint.driverPhone || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSubTab === 'evidence' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                          Internal Admin Notes & Case Audit
                        </h4>
                        <button
                          onClick={() => setActiveActionModal('add_complaint_note')}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-semibold"
                        >
                          + Add Note
                        </button>
                      </div>

                      {/* Notes list */}
                      <div className="space-y-2">
                        {complaint.caseNotes && complaint.caseNotes.length > 0 ? (
                          complaint.caseNotes.map((note, i) => (
                            <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                <span className="font-semibold text-slate-700">{note.author}</span>
                                <span>{note.date}</span>
                              </div>
                              <p className="text-slate-800 text-xs">{note.text}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 text-xs">
                            No internal case notes logged yet.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeSubTab === 'related_ride' && (
                    <div className="space-y-4 text-xs">
                      <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                        Related Ride Record
                      </h4>
                      {(() => {
                        const targetRide = rides.find((r) => r.id === complaint.rideId || r.rideCode === complaint.rideCode);
                        if (!targetRide) {
                          return (
                            <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                              No direct ride association registered for this ticket.
                            </div>
                          );
                        }
                        return (
                          <div
                            onClick={() => handleOpenRelated('ride', targetRide.id)}
                            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 transition cursor-pointer space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{targetRide.rideCode}</span>
                              <span className="font-bold text-emerald-600">{formatPKR(targetRide.fare)}</span>
                            </div>
                            <div className="text-slate-600 space-y-1">
                              <p>Pickup: {targetRide.pickupAddress}</p>
                              <p>Dropoff: {targetRide.dropoffAddress}</p>
                            </div>
                            <div className="flex items-center justify-between text-blue-600 font-semibold pt-1 border-t border-slate-100">
                              <span>Open Complete Ride Details</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {activeSubTab === 'smart_pattern' && (
                    <div className="space-y-4 text-xs">
                      {(() => {
                        const driverId = complaint.driverId || complaint.targetId;
                        const pattern = driverId
                          ? calculateSmartComplaintPattern('driver', driverId, complaints)
                          : null;

                        if (!pattern) {
                          return (
                            <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl">
                              Driver ID not linked to this complaint.
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-2">
                              <div className="flex items-center justify-between">
                                <h5 className="font-bold text-amber-900 flex items-center gap-1.5">
                                  <ShieldAlert className="w-4 h-4 text-amber-600" /> Driver Complaint Intelligence
                                </h5>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 uppercase">
                                  {pattern.severity}
                                </span>
                              </div>
                              <p className="text-slate-800">{pattern.summaryText}</p>
                            </div>

                            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                              <h5 className="font-bold text-slate-900">Recommended Next Admin Step</h5>
                              <p className="text-slate-600">
                                {pattern.totalCount >= 5
                                  ? 'Driver has 5+ recorded complaints: Recommended 24h or permanent suspension review.'
                                  : pattern.totalCount >= 2
                                  ? 'Driver has repeated complaints (2-3): Recommended 12-hour suspension with policy refresher.'
                                  : 'First recorded incident: Recommended official caution notice with driver counseling.'}
                              </p>

                              <button
                                onClick={() => {
                                  setSuspendReason(complaint.category || 'Passenger complaint');
                                  setSuspendNotes(`Auto-linked to complaint ${complaint.complaintCode || complaint.id}`);
                                  setActiveActionModal('suspend_driver');
                                }}
                                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs"
                              >
                                Pre-fill & Launch Suspension Flow
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {activeSubTab === 'actions' && (
                    <div className="space-y-3 text-xs">
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                        <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                          Case Resolution Shortcuts
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            onClick={() => {
                              resolveComplaint(complaint.id, 'Resolved with passenger refund', 250);
                              recordAdminAudit(
                                'COMPLAINT_RESOLVED_REFUND',
                                `Complaint: ${complaint.complaintCode || complaint.id}`,
                                complaint.category,
                                'Resolved ticket with Rs. 250 wallet refund',
                                'Manual',
                                'complaint',
                                complaint.id
                              );
                              showToast('Complaint resolved with Rs. 250 refund', 'success');
                            }}
                            className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-between transition"
                          >
                            <span className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" /> Resolve with Rs. 250 Refund
                            </span>
                            <ArrowRight className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (complaint.driverId) {
                                setSuspendReason(complaint.category || 'Passenger complaint');
                                setSuspendNotes(`Suspension resolved from complaint ${complaint.complaintCode || complaint.id}`);
                                setActiveActionModal('suspend_driver');
                              } else {
                                showToast('No driver linked to suspend', 'error');
                              }
                            }}
                            className="p-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center justify-between transition"
                          >
                            <span className="flex items-center gap-2">
                              <Ban className="w-4 h-4" /> Resolve with Suspension
                            </span>
                            <ArrowRight className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setActiveActionModal('reject_complaint')}
                            className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold flex items-center justify-between transition"
                          >
                            <span className="flex items-center gap-2">
                              <XCircle className="w-4 h-4 text-rose-600" /> Reject / Close Invalid Complaint
                            </span>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                          </button>

                          <button
                            onClick={() => setActiveActionModal('add_complaint_note')}
                            className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold flex items-center justify-between transition"
                          >
                            <span className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-blue-600" /> Add Internal Case Note
                            </span>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* 5. PAYMENT / TRANSACTION DETAILS */}
              {/* ========================================================================= */}
              {type === 'payment' && payment && (
                <div className="space-y-6">
                  {activeSubTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-purple-50/40 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-900">{payment.id}</h3>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                                payment.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : payment.status === 'refunded'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {payment.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 font-mono">
                            {payment.date || payment.timestamp} • Gateway: {payment.paymentMethod || 'Wallet'}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-xl font-bold text-purple-700 block">
                            {formatPKR(payment.amount)}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">
                            {payment.type}
                          </span>
                        </div>
                      </div>

                      {/* Detail List */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                        <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500">Transaction Reference</span>
                          <span className="font-mono font-bold text-slate-900">{payment.reference || payment.id}</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500">Description</span>
                          <span className="font-medium text-slate-800">{payment.description}</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500">Beneficiary / User</span>
                          <span className="font-medium text-slate-800">{payment.userName || 'Account User'}</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5">
                          <span className="text-slate-500">Channel / Gateway</span>
                          <span className="font-semibold text-slate-900">{payment.paymentMethod || 'JazzCash / Easypaisa'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSubTab === 'breakdown' && (
                    <div className="space-y-4 text-xs">
                      <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                        Tariff & Settlement Breakdown
                      </h4>
                      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                        <div className="flex items-center justify-between py-1">
                          <span className="text-slate-600">Gross Total</span>
                          <span className="font-bold text-slate-900">{formatPKR(payment.amount)}</span>
                        </div>
                        <div className="flex items-center justify-between py-1 text-slate-500">
                          <span>Platform Service Commission (20%)</span>
                          <span>- {formatPKR(payment.amount * 0.2)}</span>
                        </div>
                        <div className="flex items-center justify-between py-1 text-slate-500">
                          <span>Provincial Sales Tax (PST 5%)</span>
                          <span>- {formatPKR(payment.amount * 0.05)}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-t border-slate-200 font-bold text-emerald-700">
                          <span>Driver Net Disbursed</span>
                          <span>{formatPKR(payment.amount * 0.75)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSubTab === 'actions' && (
                    <div className="space-y-3 text-xs">
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                        <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                          Payment Management
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {payment.status !== 'refunded' && (
                            <button
                              onClick={() => {
                                refundTransaction(payment.id, 'Customer satisfaction refund per Universal Detail');
                                recordAdminAudit(
                                  'PAYMENT_REFUNDED',
                                  `Payment ${payment.id}`,
                                  'Refund Request',
                                  `Refunded Rs. ${payment.amount}`,
                                  'Manual',
                                  'system',
                                  payment.id
                                );
                                showToast('Transaction marked refunded', 'success');
                              }}
                              className="p-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center justify-between transition"
                            >
                              <span className="flex items-center gap-2">
                                <RotateCcw className="w-4 h-4" /> Issue Full Refund
                              </span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              showToast('Payment receipt generated for download', 'info');
                            }}
                            className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold flex items-center justify-between transition"
                          >
                            <span className="flex items-center gap-2">
                              <Printer className="w-4 h-4 text-slate-600" /> Print Audit Receipt
                            </span>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* BOTTOM FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>GoLife Secured Audit Trail Active</span>
          </div>
          <button
            onClick={closeUniversalDetail}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition cursor-pointer"
          >
            Close Detail
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* DRIVER CONTROL MODAL (When triggered from Universal Drawer)  */}
      {/* ------------------------------------------------------------- */}
      {isDriverControlOpen && driver && (
        <DriverControlModal
          driver={driver}
          initialTab={driverControlInitialTab}
          onClose={() => setIsDriverControlOpen(false)}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* INLINE ACTION MODALS                                          */}
      {/* ------------------------------------------------------------- */}

      {/* Suspend Driver Modal */}
      {activeActionModal === 'suspend_driver' && driver && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <Ban className="w-4 h-4 text-rose-600" /> Suspend Driver: {driver.name}
              </h3>
              <button
                onClick={() => setActiveActionModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Standardized Suspension Reason</label>
                <select
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:border-rose-500"
                >
                  {PREDEFINED_SUSPENSION_REASONS.map((r, i) => (
                    <option key={i} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Duration (Hours)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[6, 12, 24, 72].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setSuspendDurationHours(hrs)}
                      className={`py-2 rounded-lg font-bold text-xs border ${
                        suspendDurationHours === hrs
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {hrs} hrs
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Internal Admin Note / Case ID</label>
                <textarea
                  rows={3}
                  value={suspendNotes}
                  onChange={(e) => setSuspendNotes(e.target.value)}
                  placeholder="Provide reference or additional justification..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveActionModal(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  suspendDriver(driver.id, {
                    reason: suspendReason,
                    reasonCategory: 'Universal Compliance Review',
                    durationHours: suspendDurationHours,
                    notes: suspendNotes
                  });
                  setActiveActionModal(null);
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Passenger Wallet Modal */}
      {activeActionModal === 'passenger_wallet' && passenger && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <Wallet className="w-4 h-4 text-emerald-600" /> Adjust Wallet: {passenger.name}
              </h3>
              <button
                onClick={() => setActiveActionModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Adjustment Amount (PKR)</label>
                <input
                  type="number"
                  value={walletDelta}
                  onChange={(e) => setWalletDelta(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Positive values credit wallet balance; negative numbers deduct.
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reason / Note</label>
                <input
                  type="text"
                  value={walletNote}
                  onChange={(e) => setWalletNote(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveActionModal(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  adjustPassengerWallet(passenger.id, walletDelta, walletNote);
                  recordAdminAudit(
                    'PASSENGER_WALLET_ADJUSTED',
                    `Passenger: ${passenger.name}`,
                    walletNote,
                    `Adjusted PKR ${walletDelta}`,
                    'Manual',
                    'passenger',
                    passenger.id
                  );
                  setActiveActionModal(null);
                  showToast(`Wallet adjusted by PKR ${walletDelta}`, 'success');
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
              >
                Apply Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Ride Modal */}
      {activeActionModal === 'cancel_ride' && ride && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <Ban className="w-4 h-4 text-rose-600" /> Cancel Ride: {ride.rideCode}
              </h3>
              <button
                onClick={() => setActiveActionModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reason for Admin Cancellation</label>
                <textarea
                  rows={3}
                  value={cancelRideReason}
                  onChange={(e) => setCancelRideReason(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveActionModal(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  cancelRide(ride.id, cancelRideReason, 'admin');
                  recordAdminAudit(
                    'RIDE_CANCELLED',
                    `Ride: ${ride.rideCode}`,
                    cancelRideReason,
                    'Cancelled via Universal Detail Drawer',
                    'Manual',
                    'ride',
                    ride.id
                  );
                  setActiveActionModal(null);
                  showToast('Ride cancelled by admin', 'warning');
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Complaint Note Modal */}
      {activeActionModal === 'add_complaint_note' && complaint && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <MessageSquare className="w-4 h-4 text-blue-600" /> Add Internal Case Note
              </h3>
              <button
                onClick={() => setActiveActionModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <textarea
                rows={3}
                value={newComplaintNote}
                onChange={(e) => setNewComplaintNote(e.target.value)}
                placeholder="Type internal investigation findings or instructions..."
                className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveActionModal(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!newComplaintNote.trim()}
                onClick={() => {
                  addComplaintNote(complaint.id, newComplaintNote.trim());
                  recordAdminAudit(
                    'COMPLAINT_NOTE_ADDED',
                    `Complaint: ${complaint.complaintCode || complaint.id}`,
                    'Investigation update',
                    newComplaintNote.trim(),
                    'Manual',
                    'complaint',
                    complaint.id
                  );
                  setNewComplaintNote('');
                  setActiveActionModal(null);
                  showToast('Case note added', 'success');
                }}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold shadow-xs"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
