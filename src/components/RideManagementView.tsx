import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Ride, RideStatus, RideCategory } from '../types';
import { formatPKR } from '../utils/i18n';
import { BackToDashboardButton } from './common/BackToDashboardButton';
import { canAdminViewPII, maskPhoneNumber } from '../utils/privacyUtils';
import {
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Receipt,
  FileText,
  MapPin,
  Calendar,
  X,
  CreditCard,
  RotateCcw,
  Sparkles,
  Navigation,
  MessageSquare,
  PhoneCall,
  Activity,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Lock,
  UserCheck,
  Ban,
  ExternalLink,
  ShieldAlert,
  Car
} from 'lucide-react';

export const RideManagementView: React.FC = () => {
  const {
    currentAdmin,
    rides = [],
    drivers = [],
    complaints = [],
    adjustPassengerWallet,
    cancelRide,
    reassignRideDriver,
    searchQuery: globalSearch,
    openUniversalDetail
  } = useAdmin();

  const isAuthorizedForPII = useMemo(() => canAdminViewPII(currentAdmin), [currentAdmin]);

  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const [cityFilter, setCityFilter] = useState<string>('All');
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Refund Modal State
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('250');
  const [refundNote, setRefundNote] = useState('Service dissatisfaction refund to passenger wallet');

  // Cancel Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelRideId, setCancelRideId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('Passenger requested cancellation via support');
  const [cancelAttribution, setCancelAttribution] = useState<'passenger' | 'driver' | 'admin' | 'system'>('admin');

  // Reassign Modal State
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignRideId, setReassignRideId] = useState<string | null>(null);
  const [selectedNewDriverId, setSelectedNewDriverId] = useState<string>('');
  const [reassignReason, setReassignReason] = useState('Current driver delayed/stalled');

  const effectiveSearch = localSearch || globalSearch;

  const filteredRides = useMemo(() => {
    return rides
      .filter((r) => {
        const matchesSearch =
          r.rideCode.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
          r.passengerName.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
          (r.passengerPhone && r.passengerPhone.includes(effectiveSearch)) ||
          (r.driverName && r.driverName.toLowerCase().includes(effectiveSearch.toLowerCase())) ||
          (r.driverPlate && r.driverPlate.toLowerCase().includes(effectiveSearch.toLowerCase())) ||
          r.city.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
          r.id.toLowerCase().includes(effectiveSearch.toLowerCase());

        const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
        const matchesCategory = categoryFilter === 'All' || r.category === categoryFilter;
        const matchesPayment = paymentFilter === 'All' || r.paymentMethod === paymentFilter;
        const matchesCity = cityFilter === 'All' || r.city.toLowerCase() === cityFilter.toLowerCase();

        return matchesSearch && matchesStatus && matchesCategory && matchesPayment && matchesCity;
      })
      .sort((a, b) => {
        // Most recent first
        return (b.id || '').localeCompare(a.id || '');
      });
  }, [rides, effectiveSearch, statusFilter, categoryFilter, paymentFilter, cityFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredRides.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedRides = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredRides.slice(start, start + pageSize);
  }, [filteredRides, safeCurrentPage, pageSize]);

  // Handle Refund
  const handleProcessRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRide && refundAmount) {
      adjustPassengerWallet(
        selectedRide.passengerId,
        Number(refundAmount),
        `${refundNote} (Ride: ${selectedRide.rideCode})`
      );
      setShowRefundModal(false);
      setSelectedRide({
        ...selectedRide,
        paymentStatus: 'refunded',
        disputeNote: `Refund of Rs. ${refundAmount} issued to wallet on ${new Date().toLocaleDateString()}`
      });
    }
  };

  // Handle Cancel Ride
  const handleConfirmCancel = () => {
    if (cancelRideId) {
      cancelRide(cancelRideId, cancelReason, cancelAttribution);
      setShowCancelModal(false);
      setCancelRideId(null);
      if (selectedRide && selectedRide.id === cancelRideId) {
        setSelectedRide({
          ...selectedRide,
          status: 'cancelled',
          cancellationReason: cancelReason,
          cancelledBy: cancelAttribution
        });
      }
    }
  };

  // Handle Reassign Driver
  const handleConfirmReassign = () => {
    if (reassignRideId && selectedNewDriverId) {
      reassignRideDriver(reassignRideId, selectedNewDriverId, reassignReason);
      setShowReassignModal(false);
      setReassignRideId(null);
      setSelectedNewDriverId('');
    }
  };

  // Candidate drivers for reassign
  const availableDrivers = useMemo(() => {
    return drivers.filter((d) => d.accountStatus === 'active');
  }, [drivers]);

  return (
    <div className="space-y-5 text-[#111827]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackToDashboardButton />
          <div>
            <h1 className="text-xl font-bold text-[#111827] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#0F766E]" />
              Ride Operations &amp; Ledger
            </h1>
            <p className="text-xs text-[#6B7280]">
              Real-time ride management, route telemetry, fare itemization, cancellation audit, and reassignments
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* City */}
          <select
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-xl bg-white border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0F766E] shadow-xs"
          >
            <option value="All">All Cities</option>
            <option value="Lahore">Lahore</option>
            <option value="Karachi">Karachi</option>
            <option value="Islamabad">Islamabad</option>
            <option value="Rawalpindi">Rawalpindi</option>
            <option value="Peshawar">Peshawar</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-xl bg-white border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0F766E] shadow-xs"
          >
            <option value="All">All Statuses</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="searching">Searching</option>
            <option value="driver_assigned">Driver Assigned</option>
          </select>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-xl bg-white border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0F766E] shadow-xs"
          >
            <option value="All">All Categories</option>
            <option value="GoMoto">GoMoto</option>
            <option value="GoAuto">GoAuto</option>
            <option value="GoMini">GoMini</option>
            <option value="GoRide">GoRide</option>
            <option value="GoComfort">GoComfort</option>
            <option value="GoFreight">GoFreight</option>
          </select>

          {/* Payment */}
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-xl bg-white border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0F766E] shadow-xs"
          >
            <option value="All">All Payment Methods</option>
            <option value="cash">Cash</option>
            <option value="wallet">GoLife Wallet</option>
            <option value="easypaisa">EasyPaisa</option>
            <option value="jazzcash">JazzCash</option>
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search code, driver, rider..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0F766E] w-48 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Rides Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#6B7280] border-b border-[#E5E7EB] uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Ride Code</th>
                <th className="py-3 px-4">Category &amp; City</th>
                <th className="py-3 px-4">Passenger</th>
                <th className="py-3 px-4">Driver</th>
                <th className="py-3 px-4">Total Fare</th>
                <th className="py-3 px-4">Commission</th>
                <th className="py-3 px-4">Driver Earned</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {paginatedRides.map((r) => {
                const hasComplaint = complaints.some(
                  (c) => c.rideId === r.id || c.rideCode === r.rideCode
                );

                return (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#111827]">
                      <div className="flex items-center gap-1.5">
                        <span>{r.rideCode}</span>
                        {hasComplaint && (
                          <span
                            title="Dispute ticket filed on this ride"
                            className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 text-[9px] font-bold"
                          >
                            DISPUTE
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#6B7280] font-sans font-normal">{r.startTime}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0F766E]/10 text-[#0F766E] border border-[#0F766E]/20">
                        {r.category}
                      </span>
                      <div className="text-[10px] text-[#6B7280] mt-0.5">{r.city}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#111827]">{r.passengerName}</div>
                      <div className="text-[10px] font-mono text-[#6B7280] flex items-center gap-1">
                        {maskPhoneNumber(r.passengerPhone, isAuthorizedForPII)}
                        {!isAuthorizedForPII && <Lock className="w-2.5 h-2.5 text-slate-400" />}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#111827]">{r.driverName || 'None'}</div>
                      <div className="text-[10px] font-mono text-[#6B7280]">
                        {r.driverPlate || 'Unassigned'}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#111827]">
                      {formatPKR(r.fare)}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#0F766E] font-bold">
                      {formatPKR(r.commission)}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#10B981] font-bold">
                      {formatPKR(r.driverEarnings)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="capitalize font-semibold text-[#111827]">{r.paymentMethod}</div>
                      <div
                        className={`text-[10px] font-bold uppercase ${
                          r.paymentStatus === 'paid'
                            ? 'text-[#10B981]'
                            : r.paymentStatus === 'refunded'
                            ? 'text-purple-600'
                            : 'text-[#F59E0B]'
                        }`}
                      >
                        {r.paymentStatus}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'completed'
                            ? 'bg-blue-50 text-blue-700'
                            : r.status === 'in_progress'
                            ? 'bg-[#10B981]/15 text-[#10B981]'
                            : r.status === 'cancelled'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedRide(r)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-xs transition cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openUniversalDetail('ride', r.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
                        >
                          Audit
                        </button>
                        {['searching', 'driver_assigned', 'in_progress'].includes(r.status) && (
                          <>
                            <button
                              onClick={() => {
                                setReassignRideId(r.id);
                                setShowReassignModal(true);
                              }}
                              className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-[11px] transition cursor-pointer"
                              title="Reassign to another driver"
                            >
                              Reassign
                            </button>
                            <button
                              onClick={() => {
                                setCancelRideId(r.id);
                                setShowCancelModal(true);
                              }}
                              className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[11px] transition cursor-pointer"
                              title="Cancel Ride"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredRides.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#6B7280]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Clock className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-slate-700">No rides matched your search or filter combination.</p>
                      <button
                        onClick={() => {
                          setLocalSearch('');
                          setStatusFilter('All');
                          setCategoryFilter('All');
                          setPaymentFilter('All');
                          setCityFilter('All');
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredRides.length > 0 && (
          <div className="p-4 border-t border-[#E5E7EB] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7280]">
            <div className="flex items-center gap-2">
              <span>
                Showing <strong className="text-slate-900">{(safeCurrentPage - 1) * pageSize + 1}</strong> to{' '}
                <strong className="text-slate-900">{Math.min(safeCurrentPage * pageSize, filteredRides.length)}</strong> of{' '}
                <strong className="text-slate-900">{filteredRides.length}</strong> total rides
              </span>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <span>Rows:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-0.5 rounded border border-[#E5E7EB] bg-white text-slate-900 text-xs"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 text-slate-700"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <span className="px-3 py-1 text-slate-700 font-semibold">
                Page {safeCurrentPage} of {totalPages}
              </span>
              <button
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 text-slate-700"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ride Details & Breakdown Modal */}
      {selectedRide && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white border border-[#E5E7EB] rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#111827]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F8FAFC]">
              <div>
                <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  Ride Audit: {selectedRide.rideCode}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#0F766E]/10 text-[#0F766E] border border-[#0F766E]/20">
                    {selectedRide.category}
                  </span>
                </h2>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {selectedRide.city} • Started: {selectedRide.startTime} • Status:{' '}
                  <span className="font-bold text-[#0F766E] uppercase">{selectedRide.status}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    openUniversalDetail('ride', selectedRide.id);
                    setSelectedRide(null);
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition"
                >
                  Open Full Audit
                </button>
                <button
                  onClick={() => setSelectedRide(null)}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Route Map Preview */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E5E7EB] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#111827] flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-[#0F766E]" />
                    Telemetry Route Map Preview
                  </span>
                  <span className="text-[11px] font-mono text-[#6B7280]">
                    GPS Live Tracking Vector
                  </span>
                </div>

                <div className="h-28 w-full rounded-xl bg-slate-100 border border-[#E5E7EB] relative overflow-hidden flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 500 120">
                    <defs>
                      <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0F766E" />
                        <stop offset="100%" stopColor="#10B981" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 50,70 Q 150,20 250,60 T 450,40"
                      fill="none"
                      stroke="url(#routeGrad)"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    <circle cx="50" cy="70" r="7" fill="#0F766E" />
                    <circle cx="50" cy="70" r="12" fill="#0F766E" fillOpacity="0.2" />
                    <circle cx="450" cy="40" r="7" fill="#10B981" />
                    <circle cx="450" cy="40" r="12" fill="#10B981" fillOpacity="0.2" />
                  </svg>
                  <div className="absolute top-2 left-4 text-[10px] font-bold text-[#0F766E] bg-white/90 px-2 py-0.5 rounded shadow-xs max-w-xs truncate">
                    Pickup: {selectedRide.pickup?.address || 'Pickup point'}
                  </div>
                  <div className="absolute bottom-2 right-4 text-[10px] font-bold text-[#10B981] bg-white/90 px-2 py-0.5 rounded shadow-xs max-w-xs truncate">
                    Drop: {selectedRide.destination?.address || 'Destination'}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#6B7280] pt-1">
                  <span>Distance: <strong className="text-[#111827]">{selectedRide.distanceKm} KM</strong></span>
                  <span>Trip Duration: <strong className="text-[#111827]">{selectedRide.durationMin} Mins</strong></span>
                  <span>Vehicle: <strong className="text-[#111827]">{selectedRide.driverPlate || 'N/A'}</strong></span>
                </div>
              </div>

              {/* Dynamic Operational Timeline */}
              <div className="p-4 rounded-xl bg-slate-50 border border-[#E5E7EB]">
                <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#0F766E]" />
                  Ride Lifecycle &amp; Telemetry Milestones
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 bg-white rounded-lg border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#6B7280] block font-semibold">1. Requested</span>
                    <span className="font-semibold text-[#111827]">
                      {selectedRide.startTime || 'Recorded at dispatch'}
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#6B7280] block font-semibold">2. Driver Assigned</span>
                    <span className="font-semibold text-[#111827]">
                      {selectedRide.driverId ? (selectedRide.startTime || 'Assigned') : 'Pending / Not assigned'}
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#6B7280] block font-semibold">3. Driver Arrived</span>
                    <span className="font-semibold text-[#111827]">
                      {['arrived', 'in_progress', 'completed'].includes(selectedRide.status) ? 'Arrived at pickup' : 'Unavailable / In transit'}
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#6B7280] block font-semibold">4. Completed / Settled</span>
                    <span className={`font-semibold ${selectedRide.status === 'completed' ? 'text-[#10B981]' : selectedRide.status === 'cancelled' ? 'text-rose-600' : 'text-slate-500'}`}>
                      {selectedRide.status === 'completed' ? 'Settled & Paid' : selectedRide.status === 'cancelled' ? 'Cancelled' : 'In Progress'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Complete Fare Breakdown */}
              <div className="p-4 rounded-xl bg-slate-50 border border-[#E5E7EB]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-[#0F766E]" />
                    Fare &amp; Commission Itemized Ledger (PKR)
                  </h3>
                  {selectedRide.ruleVersionId && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                      Rule {selectedRide.ruleVersionId}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-white p-3 rounded-lg border border-slate-200 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Base Flagdrop</span>
                    <span className="font-bold text-slate-800">{formatPKR(selectedRide.baseFare || Math.round(selectedRide.fare * 0.25))}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Distance Meter</span>
                    <span className="font-bold text-slate-800">{formatPKR(selectedRide.distanceFare || Math.round(selectedRide.fare * 0.55))}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Time / Wait</span>
                    <span className="font-bold text-slate-800">{formatPKR(selectedRide.timeFare || Math.round(selectedRide.fare * 0.1))}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Surge</span>
                    <span className="font-bold text-amber-600">{selectedRide.surgeMultiplier ? `${selectedRide.surgeMultiplier}x` : '1.0x'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Discounts</span>
                    <span className="font-bold text-emerald-600">{selectedRide.discount ? `-${formatPKR(selectedRide.discount)}` : 'Rs. 0'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Platform Fee</span>
                    <span className="font-bold text-blue-600">{formatPKR(selectedRide.commission)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Driver Payout</span>
                    <span className="font-bold text-emerald-600">{formatPKR(selectedRide.driverEarnings)}</span>
                  </div>
                  <div className="border-l border-slate-200 pl-2">
                    <span className="text-[10px] text-slate-500 block font-sans font-bold">Total Bill</span>
                    <span className="font-extrabold text-slate-900 text-sm">{formatPKR(selectedRide.fare)}</span>
                  </div>
                </div>
              </div>

              {/* Cancellation or Dispute Note */}
              {selectedRide.cancellationReason && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  <span className="font-bold flex items-center gap-1.5 mb-1">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Trip Cancellation (Attribution: {selectedRide.cancelledBy || 'System'})
                  </span>
                  <p>{selectedRide.cancellationReason}</p>
                </div>
              )}

              {selectedRide.disputeNote && (
                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs">
                  <span className="font-bold">Dispute / Refund Resolution Note:</span>
                  <p>{selectedRide.disputeNote}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E5E7EB] bg-[#F8FAFC] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRefundModal(true)}
                  disabled={selectedRide.paymentStatus === 'refunded'}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Issue Wallet Refund
                </button>
                {['searching', 'driver_assigned', 'in_progress'].includes(selectedRide.status) && (
                  <button
                    onClick={() => {
                      setCancelRideId(selectedRide.id);
                      setShowCancelModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    Cancel Ride
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedRide(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#111827] text-xs font-semibold transition"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedRide && (
        <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleProcessRefund}
            className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-2xl space-y-4 text-[#111827]"
          >
            <h3 className="font-bold text-sm text-[#111827] flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-purple-600" />
              Issue Ride Refund: {selectedRide.rideCode}
            </h3>
            <p className="text-xs text-[#6B7280]">
              Crediting passenger: <span className="text-[#111827] font-bold">{selectedRide.passengerName}</span>
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Refund Amount (PKR) — Max {formatPKR(selectedRide.fare)}
              </label>
              <input
                type="number"
                max={selectedRide.fare}
                required
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="w-full p-2 text-sm font-mono rounded-xl bg-slate-50 text-[#111827] border border-[#E5E7EB] focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Dispute Reason / Audit Log Note
              </label>
              <input
                type="text"
                required
                value={refundNote}
                onChange={(e) => setRefundNote(e.target.value)}
                className="w-full p-2 text-xs rounded-xl bg-slate-50 text-[#111827] border border-[#E5E7EB] focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRefundModal(false)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 text-[#6B7280] hover:text-[#111827]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
              >
                Approve &amp; Credit Wallet
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cancel Ride Modal */}
      {showCancelModal && cancelRideId && (
        <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-2xl space-y-4 text-[#111827]">
            <h3 className="font-bold text-sm text-[#111827] flex items-center gap-2">
              <Ban className="w-4 h-4 text-rose-600" />
              Cancel Live Trip (Admin Override)
            </h3>
            <p className="text-xs text-[#6B7280]">
              Terminating dispatch matching and releasing active driver lock.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Cancellation Attribution
              </label>
              <select
                value={cancelAttribution}
                onChange={(e) => setCancelAttribution(e.target.value as any)}
                className="w-full p-2 text-xs rounded-xl bg-slate-50 text-[#111827] border border-[#E5E7EB] focus:outline-none focus:border-rose-500"
              >
                <option value="admin">Admin Safety / Support Intervention</option>
                <option value="passenger">Passenger Requested</option>
                <option value="driver">Driver Unable to Complete</option>
                <option value="system">System Timeout / Auto-Cancellation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Reason Note (Recorded to Ledger)
              </label>
              <textarea
                rows={3}
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Specify exact cause for auditing..."
                className="w-full p-2 text-xs rounded-xl bg-slate-50 text-[#111827] border border-[#E5E7EB] focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelRideId(null);
                }}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 text-[#6B7280] hover:text-[#111827]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reassign Driver Modal */}
      {showReassignModal && reassignRideId && (
        <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-2xl space-y-4 text-[#111827]">
            <h3 className="font-bold text-sm text-[#111827] flex items-center gap-2">
              <Car className="w-4 h-4 text-amber-600" />
              Reassign Ride to New Driver
            </h3>
            <p className="text-xs text-[#6B7280]">
              Transfer the active booking to an available driver in the same operating region.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Select Available Driver
              </label>
              <select
                value={selectedNewDriverId}
                onChange={(e) => setSelectedNewDriverId(e.target.value)}
                className="w-full p-2 text-xs rounded-xl bg-slate-50 text-[#111827] border border-[#E5E7EB] focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Choose active driver --</option>
                {availableDrivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.vehicle.category} • {d.vehicle.plate} • {d.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Reassignment Reason
              </label>
              <input
                type="text"
                required
                value={reassignReason}
                onChange={(e) => setReassignReason(e.target.value)}
                className="w-full p-2 text-xs rounded-xl bg-slate-50 text-[#111827] border border-[#E5E7EB] focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowReassignModal(false);
                  setReassignRideId(null);
                  setSelectedNewDriverId('');
                }}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 text-[#6B7280] hover:text-[#111827]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedNewDriverId}
                onClick={handleConfirmReassign}
                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 cursor-pointer"
              >
                Confirm Reassignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
