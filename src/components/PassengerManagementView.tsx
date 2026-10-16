import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Passenger } from '../types';
import { formatPKR } from '../utils/i18n';
import { BackToDashboardButton } from './common/BackToDashboardButton';
import { canAdminViewPII, maskPhoneNumber, maskEmail } from '../utils/privacyUtils';
import {
  Users,
  Search,
  Filter,
  Star,
  ShieldAlert,
  ShieldCheck,
  Wallet,
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronRight,
  ChevronLeft,
  X,
  AlertTriangle,
  PlusCircle,
  Car,
  Edit3,
  CreditCard,
  MessageSquare,
  Lock,
  FileText,
  Ban,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  History
} from 'lucide-react';

export const PassengerManagementView: React.FC = () => {
  const {
    currentAdmin,
    passengers = [],
    rides = [],
    complaints = [],
    transactions = [],
    updatePassengerStatus,
    adjustPassengerWallet,
    editPassenger,
    searchQuery: globalSearch,
    openUniversalDetail
  } = useAdmin();

  const isAuthorizedForPII = useMemo(() => canAdminViewPII(currentAdmin), [currentAdmin]);

  const [localSearch, setLocalSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'default' | 'rating' | 'rides' | 'wallet' | 'name'>('default');
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
  const [drawerTab, setDrawerTab] = useState<'completed_rides' | 'cancelled_rides' | 'payments' | 'complaints'>('completed_rides');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Edit Passenger Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editEmergencyName, setEditEmergencyName] = useState('');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState('');
  const [editEmergencyRelation, setEditEmergencyRelation] = useState('');

  // Modal / action states
  const [suspensionReason, setSuspensionReason] = useState('');
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletAmount, setWalletAmount] = useState('500');
  const [walletNote, setWalletNote] = useState('Promotional courtesy credit');

  const effectiveSearch = localSearch || globalSearch;

  const filteredPassengers = useMemo(() => {
    return passengers
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
          p.phone.includes(effectiveSearch) ||
          p.email.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
          p.city.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
          p.id.toLowerCase().includes(effectiveSearch.toLowerCase());

        const matchesCity = cityFilter === 'All' || p.city.toLowerCase() === cityFilter.toLowerCase();
        const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

        return matchesSearch && matchesCity && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'rides') return b.totalRides - a.totalRides;
        if (sortBy === 'wallet') return b.walletBalance - a.walletBalance;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [passengers, effectiveSearch, cityFilter, statusFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredPassengers.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedPassengers = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredPassengers.slice(start, start + pageSize);
  }, [filteredPassengers, safeCurrentPage, pageSize]);

  // Selected passenger's related entities
  const allPassengerRides = useMemo(() => {
    if (!selectedPassenger) return [];
    return rides.filter((r) => r.passengerId === selectedPassenger.id || r.passengerPhone === selectedPassenger.phone);
  }, [selectedPassenger, rides]);

  const completedRides = useMemo(() => {
    return allPassengerRides.filter((r) => r.status === 'completed');
  }, [allPassengerRides]);

  const cancelledRides = useMemo(() => {
    return allPassengerRides.filter((r) => r.status === 'cancelled');
  }, [allPassengerRides]);

  const passengerComplaints = useMemo(() => {
    if (!selectedPassenger) return [];
    return complaints.filter(
      (c) => c.reporterPhone === selectedPassenger.phone || c.targetPhone === selectedPassenger.phone || (c as any).passengerId === selectedPassenger.id
    );
  }, [selectedPassenger, complaints]);

  const passengerTransactions = useMemo(() => {
    if (!selectedPassenger) return [];
    return transactions.filter(
      (t) => t.userId === selectedPassenger.id || t.userName.toLowerCase().includes(selectedPassenger.name.toLowerCase())
    );
  }, [selectedPassenger, transactions]);

  // Calculated stats for selected passenger
  const computedTotalSpent = useMemo(() => {
    if (!selectedPassenger) return 0;
    const ridesSpent = completedRides.reduce((sum, r) => sum + (r.fare || 0), 0);
    return Math.max(selectedPassenger.totalSpent || 0, ridesSpent);
  }, [selectedPassenger, completedRides]);

  const handleOpenEdit = (p: Passenger) => {
    setSelectedPassenger(p);
    setEditName(p.name);
    setEditPhone(p.phone);
    setEditEmail(p.email);
    setEditCity(p.city);
    setEditEmergencyName(p.emergencyContact?.name || '');
    setEditEmergencyPhone(p.emergencyContact?.phone || '');
    setEditEmergencyRelation(p.emergencyContact?.relation || 'Family');
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPassenger) {
      editPassenger(selectedPassenger.id, {
        name: editName,
        phone: editPhone,
        email: editEmail,
        city: editCity,
        emergencyContact: {
          name: editEmergencyName,
          phone: editEmergencyPhone,
          relation: editEmergencyRelation
        }
      });
      setSelectedPassenger({
        ...selectedPassenger,
        name: editName,
        phone: editPhone,
        email: editEmail,
        city: editCity,
        emergencyContact: {
          name: editEmergencyName,
          phone: editEmergencyPhone,
          relation: editEmergencyRelation
        }
      });
      setShowEditModal(false);
    }
  };

  const handleToggleStatus = (p: Passenger) => {
    setSelectedPassenger(p);
    if (p.status === 'active') {
      setSuspensionReason('');
      setShowSuspendModal(true);
    } else {
      updatePassengerStatus(p.id, 'active', 'Reactivated by admin after review');
    }
  };

  const confirmSuspension = () => {
    if (selectedPassenger) {
      updatePassengerStatus(
        selectedPassenger.id,
        'suspended',
        suspensionReason || 'Violation of GoLife safety & conduct policy'
      );
      setShowSuspendModal(false);
    }
  };

  const handleAdjustWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPassenger && walletAmount) {
      adjustPassengerWallet(selectedPassenger.id, Number(walletAmount), walletNote);
      setShowWalletModal(false);
    }
  };

  return (
    <div className="space-y-5 text-[#111827]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackToDashboardButton />
          <div>
            <h1 className="text-xl font-bold text-[#111827] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0F766E]" />
              Passenger Management
            </h1>
            <p className="text-xs text-[#6B7280]">
              Real customer profiles, completed trip history, wallet credits, and privacy protection
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* City Filter */}
          <select
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-xl bg-white border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0F766E] shadow-xs"
          >
            <option value="All">All Pakistani Cities</option>
            <option value="Lahore">Lahore</option>
            <option value="Karachi">Karachi</option>
            <option value="Islamabad">Islamabad</option>
            <option value="Rawalpindi">Rawalpindi</option>
            <option value="Peshawar">Peshawar</option>
            <option value="Faisalabad">Faisalabad</option>
            <option value="Multan">Multan</option>
            <option value="Quetta">Quetta</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-xl bg-white border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0F766E] shadow-xs"
          >
            <option value="All">All Account Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="blocked">Blocked</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 text-xs rounded-xl bg-white border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0F766E] shadow-xs"
          >
            <option value="default">Sort: Default</option>
            <option value="rating">Sort by Rating</option>
            <option value="rides">Sort by Total Rides</option>
            <option value="wallet">Sort by Wallet Balance</option>
            <option value="name">Sort by Name</option>
          </select>

          {/* Local Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search name, phone, city..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0F766E] w-48 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Passengers Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#6B7280] border-b border-[#E5E7EB] uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Passenger Details</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Total Trips</th>
                <th className="py-3 px-4">Wallet Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {paginatedPassengers.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-8 h-8 rounded-full object-cover border border-[#E5E7EB]"
                      />
                      <div>
                        <div className="font-bold text-[#111827] flex items-center gap-1.5">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-[#6B7280]">ID: {p.id} • Joined: {p.joinedDate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-mono text-[#111827] font-semibold flex items-center gap-1.5">
                      {maskPhoneNumber(p.phone, isAuthorizedForPII)}
                      {!isAuthorizedForPII && (
                        <span title="Contact protected by RBAC" className="text-slate-400">
                          <Lock className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#6B7280] truncate max-w-[140px]">
                      {maskEmail(p.email, isAuthorizedForPII)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[#111827]">
                      <MapPin className="w-3 h-3 text-[#0F766E]" />
                      {p.city}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 font-bold text-[#F59E0B]">
                      <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
                      <span>{p.rating ? p.rating.toFixed(1) : '5.0'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#111827]">
                    {p.totalRides} trips
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#0F766E]">
                    {formatPKR(p.walletBalance)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'active'
                          ? 'bg-[#10B981]/15 text-[#10B981]'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {p.status === 'active' ? (
                        <ShieldCheck className="w-3 h-3" />
                      ) : (
                        <ShieldAlert className="w-3 h-3" />
                      )}
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedPassenger(p)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer"
                      >
                        Profile & Trips
                      </button>
                      <button
                        onClick={() => openUniversalDetail('passenger', p.id)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer"
                        title="Open in Universal Operational Drawer"
                      >
                        Audit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(p)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                          p.status === 'active'
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-[#10B981]'
                        }`}
                      >
                        {p.status === 'active' ? 'Suspend' : 'Reactivate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPassengers.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#6B7280]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-slate-700">No passengers match search criteria</p>
                      <button
                        onClick={() => {
                          setLocalSearch('');
                          setCityFilter('All');
                          setStatusFilter('All');
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
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
        {filteredPassengers.length > 0 && (
          <div className="p-4 border-t border-[#E5E7EB] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7280]">
            <div className="flex items-center gap-2">
              <span>
                Showing <strong className="text-slate-900">{(safeCurrentPage - 1) * pageSize + 1}</strong> to{' '}
                <strong className="text-slate-900">{Math.min(safeCurrentPage * pageSize, filteredPassengers.length)}</strong> of{' '}
                <strong className="text-slate-900">{filteredPassengers.length}</strong> passengers
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

      {/* Passenger Profile Drawer/Modal */}
      {selectedPassenger && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white border border-[#E5E7EB] rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#111827]">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <img
                  src={selectedPassenger.avatar}
                  alt={selectedPassenger.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#0F766E]"
                />
                <div>
                  <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
                    {selectedPassenger.name}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        selectedPassenger.status === 'active'
                          ? 'bg-[#10B981]/15 text-[#10B981]'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {selectedPassenger.status}
                    </span>
                  </h2>
                  <p className="text-xs text-[#6B7280]">
                    {selectedPassenger.city} • Rating: ⭐ {selectedPassenger.rating ? selectedPassenger.rating.toFixed(2) : '5.00'} • Joined {selectedPassenger.joinedDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(selectedPassenger)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                  title="Edit Passenger Record"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedPassenger(null)}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Quick Stat Blocks */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E5E7EB]">
                  <div className="text-[10px] text-[#6B7280] uppercase font-bold">Total Trips</div>
                  <div className="text-base font-extrabold text-[#111827] mt-0.5">
                    {selectedPassenger.totalRides} trips
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E5E7EB]">
                  <div className="text-[10px] text-[#6B7280] uppercase font-bold">Wallet Balance</div>
                  <div className="text-base font-extrabold text-[#0F766E] font-mono mt-0.5">
                    {formatPKR(selectedPassenger.walletBalance)}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E5E7EB]">
                  <div className="text-[10px] text-[#6B7280] uppercase font-bold">Total Spent</div>
                  <div className="text-base font-extrabold text-[#111827] font-mono mt-0.5">
                    {formatPKR(computedTotalSpent)}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E5E7EB]">
                  <div className="text-[10px] text-[#6B7280] uppercase font-bold">Complaints Filed</div>
                  <div className="text-base font-extrabold text-[#F59E0B] mt-0.5">
                    {passengerComplaints.length} cases
                  </div>
                </div>
              </div>

              {/* Contact Details & Emergency Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-[#E5E7EB]">
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                      Passenger Contact
                    </h3>
                    {!isAuthorizedForPII && (
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Masked
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-[#111827]">
                      <Phone className="w-3.5 h-3.5 text-[#0F766E]" />
                      <span className="font-mono font-semibold">
                        {maskPhoneNumber(selectedPassenger.phone, isAuthorizedForPII)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[#111827]">
                      <Mail className="w-3.5 h-3.5 text-[#0F766E]" />
                      <span>{maskEmail(selectedPassenger.email, isAuthorizedForPII)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#111827]">
                      <MapPin className="w-3.5 h-3.5 text-[#0F766E]" />
                      <span>City Base: {selectedPassenger.city}, Pakistan</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-[#E5E7EB]">
                  <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-2.5">
                    Verified Emergency Contact (SOS)
                  </h3>
                  <div className="space-y-1.5 text-xs text-[#111827]">
                    <div className="font-semibold text-sm">{selectedPassenger.emergencyContact?.name || 'Not provided'}</div>
                    <div className="text-[#6B7280]">Relation: {selectedPassenger.emergencyContact?.relation || 'Family'}</div>
                    <div className="font-mono text-[#0F766E] font-bold">
                      {maskPhoneNumber(selectedPassenger.emergencyContact?.phone, isAuthorizedForPII)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-Tabs: Completed Rides, Cancelled Rides, Wallet History, Complaints */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-2 text-xs font-semibold">
                  <button
                    onClick={() => setDrawerTab('completed_rides')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      drawerTab === 'completed_rides'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Completed Trips ({completedRides.length})
                  </button>
                  <button
                    onClick={() => setDrawerTab('cancelled_rides')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      drawerTab === 'cancelled_rides'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Cancelled Trips ({cancelledRides.length})
                  </button>
                  <button
                    onClick={() => setDrawerTab('payments')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      drawerTab === 'payments'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Wallet History ({passengerTransactions.length})
                  </button>
                  <button
                    onClick={() => setDrawerTab('complaints')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      drawerTab === 'complaints'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Complaints ({passengerComplaints.length})
                  </button>
                </div>

                {/* SubTab 1: Completed Rides */}
                {drawerTab === 'completed_rides' && (
                  <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-[#6B7280] border-b border-[#E5E7EB] text-[10px] uppercase font-bold">
                        <tr>
                          <th className="py-2.5 px-3">Ride Code</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Driver</th>
                          <th className="py-2.5 px-3">Fare</th>
                          <th className="py-2.5 px-3">Payment</th>
                          <th className="py-2.5 px-3">Time</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        {completedRides.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono font-bold text-[#111827]">{r.rideCode}</td>
                            <td className="py-2.5 px-3 text-[#111827]">{r.category}</td>
                            <td className="py-2.5 px-3 text-[#111827]">{r.driverName || 'Assigned Driver'}</td>
                            <td className="py-2.5 px-3 font-bold text-[#0F766E]">{formatPKR(r.fare)}</td>
                            <td className="py-2.5 px-3 capitalize">{r.paymentMethod}</td>
                            <td className="py-2.5 px-3 text-[#6B7280]">{r.startTime}</td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => openUniversalDetail('ride', r.id)}
                                className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded transition"
                              >
                                Audit
                              </button>
                            </td>
                          </tr>
                        ))}
                        {completedRides.length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-6 text-center text-slate-500">
                              No completed rides on record for this passenger.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* SubTab 2: Cancelled Rides */}
                {drawerTab === 'cancelled_rides' && (
                  <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-[#6B7280] border-b border-[#E5E7EB] text-[10px] uppercase font-bold">
                        <tr>
                          <th className="py-2.5 px-3">Ride Code</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Driver</th>
                          <th className="py-2.5 px-3">Cancellation Reason</th>
                          <th className="py-2.5 px-3">Time</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        {cancelledRides.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono font-bold text-rose-700">{r.rideCode}</td>
                            <td className="py-2.5 px-3 text-[#111827]">{r.category}</td>
                            <td className="py-2.5 px-3 text-[#111827]">{r.driverName || 'None'}</td>
                            <td className="py-2.5 px-3 text-rose-600 font-medium">
                              {(r as any).cancellationReason || 'Cancelled by user/driver'}
                            </td>
                            <td className="py-2.5 px-3 text-[#6B7280]">{r.startTime}</td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => openUniversalDetail('ride', r.id)}
                                className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded transition"
                              >
                                Audit
                              </button>
                            </td>
                          </tr>
                        ))}
                        {cancelledRides.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-slate-500">
                              No cancelled rides recorded.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* SubTab 3: Payment / Wallet History */}
                {drawerTab === 'payments' && (
                  <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-[#6B7280] border-b border-[#E5E7EB] text-[10px] uppercase font-bold">
                        <tr>
                          <th className="py-2.5 px-3">Reference</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Amount</th>
                          <th className="py-2.5 px-3">Note</th>
                          <th className="py-2.5 px-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        {passengerTransactions.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{t.id}</td>
                            <td className="py-2.5 px-3 uppercase text-[10px] font-bold text-slate-700">{t.type}</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-[#0F766E]">{formatPKR(t.amount)}</td>
                            <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">{t.note}</td>
                            <td className="py-2.5 px-3 text-[#6B7280]">{t.timestamp}</td>
                          </tr>
                        ))}
                        {passengerTransactions.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-slate-500">
                              No wallet transactions recorded for this passenger.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* SubTab 4: Complaints */}
                {drawerTab === 'complaints' && (
                  <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-[#6B7280] border-b border-[#E5E7EB] text-[10px] uppercase font-bold">
                        <tr>
                          <th className="py-2.5 px-3">Complaint Code</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Description</th>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        {passengerComplaints.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono font-bold text-rose-700">{c.complaintCode}</td>
                            <td className="py-2.5 px-3 text-slate-900">{c.category}</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 uppercase">
                                {c.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">{c.description}</td>
                            <td className="py-2.5 px-3 text-[#6B7280]">{c.timestamp}</td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => openUniversalDetail('complaint', c.id)}
                                className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded transition"
                              >
                                View Case
                              </button>
                            </td>
                          </tr>
                        ))}
                        {passengerComplaints.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-slate-500">
                              No customer dispute or complaint tickets filed.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Actions Footer inside Drawer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E5E7EB]">
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="px-3 py-2 bg-[#0F766E] hover:bg-[#064E3B] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  Issue Courtesy Credit / Adjust Wallet
                </button>

                <button
                  onClick={() => handleToggleStatus(selectedPassenger)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                    selectedPassenger.status === 'active'
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-[#10B981] hover:bg-[#059669] text-white'
                  }`}
                >
                  {selectedPassenger.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Confirmation Modal */}
      {showSuspendModal && selectedPassenger && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-[#111827]">
                Suspend Passenger Account: {selectedPassenger.name}
              </h3>
            </div>
            <p className="text-xs text-[#6B7280]">
              This will immediately revoke ride booking access, cancel active dispatch matching, and notify the customer.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Reason for Suspension (Logged to Audit Log)
              </label>
              <textarea
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="Repeated abusive behavior, payment dispute, safety violation..."
                rows={3}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowSuspendModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#111827]"
              >
                Cancel
              </button>
              <button
                onClick={confirmSuspension}
                className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl cursor-pointer"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Wallet Modal */}
      {showWalletModal && selectedPassenger && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#0F766E]">
              <Wallet className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-[#111827]">
                Adjust Passenger Wallet Balance
              </h3>
            </div>
            <p className="text-xs text-[#6B7280]">
              Add promotional courtesy credits or refund adjustments directly to passenger wallet.
            </p>

            <form onSubmit={handleAdjustWallet} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">Amount (PKR)</label>
                <input
                  type="number"
                  required
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(e.target.value)}
                  placeholder="500"
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">Audit Note</label>
                <input
                  type="text"
                  required
                  value={walletNote}
                  onChange={(e) => setWalletNote(e.target.value)}
                  placeholder="Courtesy apology credit for delayed dispatch"
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWalletModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#111827]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-[#0F766E] hover:bg-[#064E3B] text-white rounded-xl cursor-pointer"
                >
                  Credit Wallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Passenger Details Modal */}
      {showEditModal && selectedPassenger && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#0F766E]" /> Edit Passenger Information
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Operating City</label>
                  <select
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0F766E]"
                  >
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Peshawar">Peshawar</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Multan">Multan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Phone (+92)</label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block mb-2">
                  Emergency Contact (SOS)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={editEmergencyName}
                      onChange={(e) => setEditEmergencyName(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0F766E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Emergency Phone</label>
                    <input
                      type="text"
                      value={editEmergencyPhone}
                      onChange={(e) => setEditEmergencyPhone(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0F766E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Relation</label>
                    <input
                      type="text"
                      value={editEmergencyRelation}
                      onChange={(e) => setEditEmergencyRelation(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0F766E]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-[#0F766E] hover:bg-[#064E3B] text-white rounded-lg cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
