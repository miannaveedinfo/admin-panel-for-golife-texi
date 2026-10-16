import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { VerificationItem, DriverDocument, VerificationReviewStatus } from '../types';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Eye,
  Calendar,
  Phone,
  MapPin,
  Car,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ZoomIn,
  RotateCcw,
  Sparkles,
  Award,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Send,
  History,
  Layers,
  Info
} from 'lucide-react';
import {
  MANDATORY_DOCUMENT_REQUIREMENTS,
  REJECTION_REASONS_CATALOG,
  calculateDocumentExpiryStatus,
  calculateDriverEligibility
} from '../services/driverVerificationService';
import { BackToDashboardButton } from './common/BackToDashboardButton';

export const DriverVerificationView: React.FC = () => {
  const {
    verifications,
    drivers,
    approveDriverVerification,
    rejectDriverVerification,
    updateDriverDocumentStatus,
    updateVerificationReviewStatus,
    hasPermission,
    checkSensitiveAction,
    currentAdmin,
    showToast
  } = useAdmin();

  const canViewDocs = hasPermission('drivers', 'view');
  const canApprove = hasPermission('drivers', 'approve');
  const canReject = hasPermission('drivers', 'reject');
  const canEdit = hasPermission('drivers', 'edit');

  // Selected Verification for Full Inspector Modal
  const [selectedVerification, setSelectedVerification] = useState<VerificationItem | null>(null);
  const [activeDocTab, setActiveDocTab] = useState<number>(0);
  const [showVersionDiff, setShowVersionDiff] = useState<boolean>(false);

  // Inspector Modal Subtabs: 'driver_vehicle' | 'document_review' | 'eligibility' | 'history'
  const [inspectorSubTab, setInspectorSubTab] = useState<'driver_vehicle' | 'document_review' | 'eligibility' | 'history'>('document_review');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dateFilterStart, setDateFilterStart] = useState('');
  const [dateFilterEnd, setDateFilterEnd] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'under_review' | 'expiring_soon' | 'approved' | 'rejected'
  >('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals for Rejection and Resubmission
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [selectedPresetCategory, setSelectedPresetCategory] = useState<string>('Image Quality');
  const [selectedPresetReason, setSelectedPresetReason] = useState<string>(
    REJECTION_REASONS_CATALOG[0].reasons[0]
  );
  const [customAdminNotes, setCustomAdminNotes] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Active items counts
  const counts = useMemo(() => {
    let pending = 0;
    let underReview = 0;
    let approved = 0;
    let rejected = 0;
    let expiringSoon = 0;

    verifications.forEach((v) => {
      if (v.status === 'pending') pending++;
      if (v.reviewStatus === 'under_review') underReview++;
      if (v.status === 'approved') approved++;
      if (v.status === 'rejected') rejected++;
      if (v.hasExpiredDocs || (v.documents || []).some((d) => {
        const exp = calculateDocumentExpiryStatus(d.expiresAt);
        return exp.status === 'expiring_soon' || exp.status === 'expired';
      })) {
        expiringSoon++;
      }
    });

    return { total: verifications.length, pending, underReview, approved, rejected, expiringSoon };
  }, [verifications]);

  // Filtered List
  const filteredVerifications = useMemo(() => {
    return verifications.filter((v) => {
      // City Filter
      if (cityFilter !== 'All' && v.city.toLowerCase() !== cityFilter.toLowerCase()) return false;

      // Category Filter
      if (categoryFilter !== 'All' && v.category?.toLowerCase() !== categoryFilter.toLowerCase()) return false;

      // Date Range Filter (submittedAt)
      if (dateFilterStart && v.submittedAt) {
        const subDate = new Date(v.submittedAt);
        const startDate = new Date(dateFilterStart);
        if (!isNaN(subDate.getTime()) && !isNaN(startDate.getTime()) && subDate < startDate) {
          return false;
        }
      }
      if (dateFilterEnd && v.submittedAt) {
        const subDate = new Date(v.submittedAt);
        const endDate = new Date(dateFilterEnd);
        endDate.setHours(23, 59, 59, 999);
        if (!isNaN(subDate.getTime()) && !isNaN(endDate.getTime()) && subDate > endDate) {
          return false;
        }
      }

      // Status Filter
      if (statusFilter === 'pending' && v.status !== 'pending') return false;
      if (statusFilter === 'under_review' && v.reviewStatus !== 'under_review') return false;
      if (statusFilter === 'approved' && v.status !== 'approved') return false;
      if (statusFilter === 'rejected' && v.status !== 'rejected') return false;
      if (statusFilter === 'expiring_soon') {
        const hasExp = v.hasExpiredDocs || (v.documents || []).some((d) => {
          const exp = calculateDocumentExpiryStatus(d.expiresAt);
          return exp.status === 'expiring_soon' || exp.status === 'expired';
        });
        if (!hasExp) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          v.driverName.toLowerCase().includes(q) ||
          v.driverPhone.includes(q) ||
          v.driverId.toLowerCase().includes(q) ||
          v.city.toLowerCase().includes(q) ||
          (v.category && v.category.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [verifications, cityFilter, categoryFilter, dateFilterStart, dateFilterEnd, statusFilter, searchQuery]);

  // Paginated List
  const totalPages = Math.max(1, Math.ceil(filteredVerifications.length / pageSize));
  const paginatedVerifications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVerifications.slice(start, start + pageSize);
  }, [filteredVerifications, currentPage, pageSize]);

  // Find Driver corresponding to selected verification
  const currentDriver = useMemo(() => {
    if (!selectedVerification) return null;
    return drivers.find((d) => d.id === selectedVerification.driverId) || null;
  }, [selectedVerification, drivers]);

  // Current Driver Eligibility Assessment
  const driverEligibility = useMemo(() => {
    if (!currentDriver && !selectedVerification) return null;
    const dummyDriver = currentDriver || {
      id: selectedVerification!.driverId,
      name: selectedVerification!.driverName,
      documents: selectedVerification!.documents
    } as any;
    return calculateDriverEligibility(dummyDriver);
  }, [currentDriver, selectedVerification]);

  const handleOpenReview = (ver: VerificationItem) => {
    setSelectedVerification(ver);
    setActiveDocTab(0);
    setShowVersionDiff(false);
    setInspectorSubTab('document_review');
    setApprovalNotes('Verified in full compliance with GoLife Pakistan licensing & road safety standards.');
    
    // Mark under review if currently pending
    if (ver.status === 'pending' && (!ver.reviewStatus || ver.reviewStatus === 'new')) {
      updateVerificationReviewStatus(ver.id, 'under_review', undefined, 'Admin opened document for compliance review');
    }
  };

  const handleApproveAll = () => {
    if (!canApprove) {
      showToast('Access Denied: You do not have permission to approve driver verifications.', 'error');
      return;
    }
    if (selectedVerification) {
      if (driverEligibility && !driverEligibility.eligibleToDrive) {
        showToast(`Notice: Driver has restrictions (${driverEligibility.restrictionReasons[0]}). Approval will record document checks but dispatches will remain restricted.`, 'warning');
      }
      approveDriverVerification(selectedVerification.id, approvalNotes);
      setSelectedVerification(null);
    }
  };

  const handleRejectFull = () => {
    if (!canReject) {
      showToast('Access Denied: You do not have permission to reject driver verifications.', 'error');
      return;
    }
    if (selectedVerification) {
      const reason = customAdminNotes ? `${selectedPresetReason}: ${customAdminNotes}` : selectedPresetReason;
      rejectDriverVerification(selectedVerification.id, reason);
      setShowRejectModal(false);
      setSelectedVerification(null);
    }
  };

  const handleRequestResubmit = () => {
    if (!canReject && !canEdit) {
      showToast('Access Denied: You do not have permission to request document resubmission.', 'error');
      return;
    }
    if (selectedVerification) {
      const reason = `RESUBMISSION REQUEST [${selectedPresetCategory}]: ${selectedPresetReason}${
        customAdminNotes ? ` — ${customAdminNotes}` : ''
      }`;
      rejectDriverVerification(selectedVerification.id, reason);
      setShowResubmitModal(false);
      setSelectedVerification(null);
    }
  };

  const handleIndividualDocApprove = (doc: DriverDocument) => {
    if (!selectedVerification) return;
    if (!canApprove && !canEdit) {
      showToast('Access Denied: You do not have permission to verify individual documents.', 'error');
      return;
    }
    updateDriverDocumentStatus(selectedVerification.driverId, doc.type, 'verified', 'Approved by verification compliance officer');
  };

  const handleIndividualDocReject = (doc: DriverDocument) => {
    if (!selectedVerification) return;
    if (!canReject && !canEdit) {
      showToast('Access Denied: You do not have permission to reject individual documents.', 'error');
      return;
    }
    updateDriverDocumentStatus(selectedVerification.driverId, doc.type, 'rejected', selectedPresetReason);
  };

  return (
    <div className="space-y-6">
      
      {/* ===================================================
          1. HEADER & METRICS STRIP
         =================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackToDashboardButton />
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Driver Verification & Document Management Center
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold border border-amber-300">
                  PHASE 46
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Full lifecycle KYC, Pakistani document verification, expiry alerts, versioning & eligibility tracking
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>5 Mandatory Documents Required</span>
          </span>
        </div>
      </div>

      {/* ===================================================
          2. SUMMARY KPI STATS
         =================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border shadow-xs transition cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[10px] uppercase font-bold text-slate-500">Total In Queue</div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">{counts.total}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Registered drivers</div>
        </div>

        <div
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-2xl border shadow-xs transition cursor-pointer ${
            statusFilter === 'pending'
              ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[10px] uppercase font-bold text-amber-700">Awaiting Review</div>
          <div className="text-2xl font-black font-mono text-amber-600 mt-1">{counts.pending}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Fresh submissions</div>
        </div>

        <div
          onClick={() => setStatusFilter('under_review')}
          className={`p-4 rounded-2xl border shadow-xs transition cursor-pointer ${
            statusFilter === 'under_review'
              ? 'bg-blue-50/50 border-blue-300 ring-2 ring-blue-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[10px] uppercase font-bold text-blue-700">Under Review</div>
          <div className="text-2xl font-black font-mono text-blue-600 mt-1">{counts.underReview}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Being processed</div>
        </div>

        <div
          onClick={() => setStatusFilter('expiring_soon')}
          className={`p-4 rounded-2xl border shadow-xs transition cursor-pointer ${
            statusFilter === 'expiring_soon'
              ? 'bg-rose-50/50 border-rose-300 ring-2 ring-rose-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[10px] uppercase font-bold text-rose-700">Expiring / Expired</div>
          <div className="text-2xl font-black font-mono text-rose-600 mt-1">{counts.expiringSoon}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Urgent compliance</div>
        </div>

        <div
          onClick={() => setStatusFilter('approved')}
          className={`p-4 rounded-2xl border shadow-xs transition cursor-pointer ${
            statusFilter === 'approved'
              ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[10px] uppercase font-bold text-emerald-700">Approved (Active)</div>
          <div className="text-2xl font-black font-mono text-emerald-600 mt-1">{counts.approved}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Dispatch eligible</div>
        </div>
      </div>

      {/* ===================================================
          3. FILTER BAR & SEARCH
         =================================================== */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search driver name, phone, ID, or city..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
          {/* Status Chips */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              aria-label="Filter by Status"
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Verification Statuses</option>
              <option value="pending">Awaiting Review</option>
              <option value="under_review">Under Review</option>
              <option value="expiring_soon">Expiring Soon / Expired</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected / Resubmission</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium text-[11px]">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by Category"
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="GoRide">GoRide</option>
              <option value="GoMini">GoMini</option>
              <option value="GoComfort">GoComfort</option>
              <option value="CityFreight">CityFreight</option>
              <option value="GoBike">GoBike</option>
            </select>
          </div>

          {/* City Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium text-[11px]">City:</span>
            <select
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by City"
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Cities</option>
              <option value="Karachi">Karachi</option>
              <option value="Lahore">Lahore</option>
              <option value="Islamabad">Islamabad</option>
              <option value="Rawalpindi">Rawalpindi</option>
              <option value="Peshawar">Peshawar</option>
              <option value="Faisalabad">Faisalabad</option>
            </select>
          </div>

          {/* Submission Date Range */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium text-[11px]">Dates:</span>
            <input
              type="date"
              value={dateFilterStart}
              onChange={(e) => {
                setDateFilterStart(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by Start Date"
              className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs font-medium text-slate-800 focus:outline-none"
            />
            <span className="text-slate-400 text-xs">-</span>
            <input
              type="date"
              value={dateFilterEnd}
              onChange={(e) => {
                setDateFilterEnd(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by End Date"
              className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs font-medium text-slate-800 focus:outline-none"
            />
          </div>

          {(statusFilter !== 'all' || cityFilter !== 'All' || categoryFilter !== 'All' || dateFilterStart || dateFilterEnd || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setCityFilter('All');
                setCategoryFilter('All');
                setDateFilterStart('');
                setDateFilterEnd('');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="px-2.5 py-1 text-xs text-rose-600 font-bold hover:bg-rose-50 rounded-xl border border-rose-200 transition cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ===================================================
          4. VERIFICATIONS QUEUE TABLE
         =================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Driver Profile</th>
                <th className="py-3 px-3">City & Category</th>
                <th className="py-3 px-3">Verification Status</th>
                <th className="py-3 px-3">Uploaded Documents (5 Mandatory)</th>
                <th className="py-3 px-3">Expiry Compliance</th>
                <th className="py-3 px-3">Submitted / Reviewed</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredVerifications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <UserCheck className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-700">No driver verifications found</p>
                      <p className="text-xs text-slate-500">No verification applications match your current filter criteria.</p>
                      <button
                        onClick={() => {
                          setStatusFilter('all');
                          setCityFilter('All');
                          setCategoryFilter('All');
                          setDateFilterStart('');
                          setDateFilterEnd('');
                          setSearchQuery('');
                          setCurrentPage(1);
                        }}
                        className="mt-2 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-xl transition cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedVerifications.map((ver) => {
                const docs = ver.documents || [];
                const verifiedCount = docs.filter((d) => d.status === 'verified' || d.verified).length;
                const hasExpired = ver.hasExpiredDocs || docs.some((d) => {
                  const exp = calculateDocumentExpiryStatus(d.expiresAt);
                  return exp.status === 'expired';
                });
                const hasExpiringSoon = docs.some((d) => {
                  const exp = calculateDocumentExpiryStatus(d.expiresAt);
                  return exp.status === 'expiring_soon';
                });

                return (
                  <tr key={ver.id} className="hover:bg-slate-50/80 transition">
                    {/* Driver Profile */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-2xs">
                          {ver.driverName[0]}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-950 text-xs block">
                            {ver.driverName}
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                            <span className="font-bold text-slate-700">{ver.driverId}</span>
                            <span>•</span>
                            <span>{ver.driverPhone}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* City & Category */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{ver.city}</div>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 font-bold mt-0.5 inline-block">
                        {ver.category}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          ver.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : ver.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : ver.reviewStatus === 'under_review'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {ver.reviewStatus === 'under_review' ? 'Under Review' : ver.status}
                      </span>
                      {ver.rejectionReason && (
                        <span className="text-[10px] text-rose-600 block mt-0.5 truncate max-w-[150px]" title={ver.rejectionReason}>
                          {ver.rejectionReason}
                        </span>
                      )}
                    </td>

                    {/* Uploaded Documents */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <span className="font-mono font-bold text-slate-900">{verifiedCount} / {docs.length}</span>
                        <span className="text-[10px] text-slate-500">verified</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {docs.map((d, i) => (
                          <span
                            key={i}
                            title={`${d.title} (${d.status || (d.verified ? 'verified' : 'pending')})`}
                            className={`w-2.5 h-2.5 rounded-full ${
                              d.status === 'verified' || d.verified
                                ? 'bg-emerald-500'
                                : d.status === 'rejected'
                                ? 'bg-rose-500'
                                : 'bg-amber-400'
                            }`}
                          />
                        ))}
                      </div>
                    </td>

                    {/* Expiry Compliance */}
                    <td className="py-3 px-3">
                      {hasExpired ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">
                          <AlertTriangle className="w-3 h-3" /> Expired Document
                        </span>
                      ) : hasExpiringSoon ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                          <Clock className="w-3 h-3" /> Expiring &lt; 30d
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Documents Valid
                        </span>
                      )}
                    </td>

                    {/* Submitted / Reviewed */}
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      <div>{ver.submittedAt}</div>
                      {ver.reviewedBy && (
                        <div className="text-[10px] text-slate-400">By: {ver.reviewedBy}</div>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenReview(ver)}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 mx-auto shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect & Review</span>
                      </button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {filteredVerifications.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <span>
                Showing <strong className="text-slate-900">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
                <strong className="text-slate-900">{Math.min(currentPage * pageSize, filteredVerifications.length)}</strong> of{' '}
                <strong className="text-slate-900">{filteredVerifications.length}</strong> drivers
              </span>
              <span className="text-slate-300">|</span>
              <label className="flex items-center gap-1 text-[11px] text-slate-500">
                <span>Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </label>
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = Math.min(totalPages - 4 + i, currentPage - 2 + i);
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-amber-400 text-slate-950 shadow-2xs font-black'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================
          5. DETAILED VERIFICATION INSPECTOR MODAL
         =================================================== */}
      {selectedVerification && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shadow-xs">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    Reviewing KYC: {selectedVerification.driverName}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 font-mono text-slate-800">
                      {selectedVerification.driverId}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    {selectedVerification.city} • {selectedVerification.category} • Phone: {selectedVerification.driverPhone} • Submitted: {selectedVerification.submittedAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedVerification(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Sub-navigation Bar */}
            <div className="px-5 border-b border-slate-200 bg-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-bold overflow-x-auto">
                <button
                  onClick={() => setInspectorSubTab('driver_vehicle')}
                  className={`py-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    inspectorSubTab === 'driver_vehicle'
                      ? 'border-amber-500 text-slate-950 bg-amber-500/5'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Driver & Vehicle Profile</span>
                </button>
                <button
                  onClick={() => setInspectorSubTab('document_review')}
                  className={`py-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    inspectorSubTab === 'document_review'
                      ? 'border-amber-500 text-slate-950 bg-amber-500/5'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Document Inspector ({selectedVerification.documents?.length || 0})</span>
                </button>
                <button
                  onClick={() => setInspectorSubTab('eligibility')}
                  className={`py-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    inspectorSubTab === 'eligibility'
                      ? 'border-amber-500 text-slate-950 bg-amber-500/5'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Mandatory Requirements & Eligibility</span>
                </button>
                <button
                  onClick={() => setInspectorSubTab('history')}
                  className={`py-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    inspectorSubTab === 'history'
                      ? 'border-amber-500 text-slate-950 bg-amber-500/5'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Audit Trail ({selectedVerification.history?.length || 0})</span>
                </button>
              </div>

              {/* Quick Document Approval Status */}
              <div className="hidden sm:flex items-center gap-2 text-xs">
                <span className="text-slate-500">Standing:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-black text-[11px] uppercase ${
                    selectedVerification.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedVerification.status === 'rejected'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {selectedVerification.status}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">

              {/* SUBTAB 0: DRIVER & VEHICLE IDENTITY */}
              {inspectorSubTab === 'driver_vehicle' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Driver Identity Card */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                          <UserCheck className="w-4 h-4 text-amber-600" />
                          <span>Driver Identity & KYC Record</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          (currentDriver?.accountStatus || 'active') === 'active'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          {currentDriver?.accountStatus || 'Pending Active'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">Full Name</div>
                          <div className="font-bold text-slate-900 mt-0.5">{selectedVerification.driverName}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">Driver ID</div>
                          <div className="font-mono text-slate-800 mt-0.5">{selectedVerification.driverId}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">Contact Phone</div>
                          <div className="font-medium text-slate-800 mt-0.5">{selectedVerification.driverPhone}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">CNIC Number</div>
                          <div className="font-mono font-bold text-slate-900 mt-0.5">
                            {currentDriver?.cnic || selectedVerification.documents.find(d => d.type === 'cnic_front')?.documentNumber || '35201-XXXXXXX-X'}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">Operating City</div>
                          <div className="font-medium text-slate-800 mt-0.5">{selectedVerification.city}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">Registered On</div>
                          <div className="font-medium text-slate-800 mt-0.5">{currentDriver?.registeredDate || selectedVerification.submittedAt}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">Overall Rating</div>
                          <div className="font-bold text-amber-600 mt-0.5">★ {currentDriver?.rating || '5.0'} / 5.0</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">Completed Trips</div>
                          <div className="font-bold font-mono text-slate-900 mt-0.5">{currentDriver?.totalTrips || 0} rides</div>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Information Card */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                          <Car className="w-4 h-4 text-amber-600" />
                          <span>Registered Vehicle Details</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800">
                          {selectedVerification.category || currentDriver?.vehicle?.category || 'GoRide'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">Make & Model</div>
                          <div className="font-bold text-slate-900 mt-0.5">
                            {currentDriver?.vehicle?.make ? `${currentDriver.vehicle.make} ${currentDriver.vehicle.model}` : 'Suzuki Alto VXR'}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">Model Year</div>
                          <div className="font-bold text-slate-900 mt-0.5">{currentDriver?.vehicle?.year || 2022}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">License Plate</div>
                          <div className="font-mono font-black text-slate-900 mt-0.5 bg-amber-50 px-2 py-0.5 rounded inline-block border border-amber-200">
                            {currentDriver?.vehicle?.plate || 'LEA-22-4891'}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">Exterior Color</div>
                          <div className="font-medium text-slate-800 mt-0.5">{currentDriver?.vehicle?.color || 'White'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">Category / Tier</div>
                          <div className="font-bold text-amber-700 mt-0.5">{selectedVerification.category || 'GoRide'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">Vehicle Fitness Certificate</div>
                          <div className="font-medium text-emerald-700 mt-0.5">
                            {selectedVerification.documents.find(d => d.type === 'vehicle_fitness')?.status === 'verified'
                              ? 'Verified Active'
                              : 'Inspection In Progress'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Document Compliance Quick Summary */}
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
                      <div>
                        <div className="font-black text-amber-950">Pakistani KYC Compliance Readiness</div>
                        <div className="text-amber-900 text-[11px] mt-0.5">
                          {selectedVerification.documents.filter(d => d.status === 'verified' || d.verified).length} of {selectedVerification.documents.length} documents officially verified.
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setInspectorSubTab('document_review')}
                      className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Review Documents Now</span>
                    </button>
                  </div>
                </div>
              )}
              
              {/* SUBTAB 1: DOCUMENT REVIEW */}
              {inspectorSubTab === 'document_review' && (
                <div className="space-y-4">
                  {/* Document Selectors Strip */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {(selectedVerification.documents || []).map((doc, idx) => {
                      const exp = calculateDocumentExpiryStatus(doc.expiresAt);
                      const isSelected = activeDocTab === idx;

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setActiveDocTab(idx);
                            setShowVersionDiff(false);
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border flex items-center gap-2 ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{doc.title}</span>
                          {doc.version && doc.version > 1 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black">
                              v{doc.version}
                            </span>
                          )}
                          {exp.status === 'expired' && (
                            <span className="w-2 h-2 rounded-full bg-rose-500" title="Expired" />
                          )}
                          {doc.status === 'verified' && (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Document View & Metadata Grid */}
                  {selectedVerification.documents && selectedVerification.documents[activeDocTab] ? (
                    (() => {
                      const currentDoc = selectedVerification.documents[activeDocTab];
                      const exp = calculateDocumentExpiryStatus(currentDoc.expiresAt);

                      return (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          
                          {/* Left: Image / Preview Display */}
                          <div className="lg:col-span-2 space-y-3">
                            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video flex items-center justify-center group shadow-2xs">
                              {canViewDocs ? (
                                <img
                                  src={
                                    showVersionDiff && currentDoc.previousVersionUrl
                                      ? currentDoc.previousVersionUrl
                                      : currentDoc.url
                                  }
                                  alt={currentDoc.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
                                  <ShieldAlert className="w-12 h-12 text-rose-500" />
                                  <h4 className="text-sm font-bold text-slate-800">Private Identity Document Protected</h4>
                                  <p className="text-xs text-slate-500 max-w-sm">
                                    Pakistani identity and vehicle documents contain private PII. Viewing raw document scans requires compliance clearance.
                                  </p>
                                </div>
                              )}

                              {canViewDocs && (
                                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                                  <button
                                    onClick={() =>
                                      setZoomImage(
                                        showVersionDiff && currentDoc.previousVersionUrl
                                          ? currentDoc.previousVersionUrl
                                          : currentDoc.url
                                      )
                                    }
                                    className="px-3.5 py-2 rounded-xl bg-white text-slate-950 font-bold text-xs shadow-lg flex items-center gap-1.5 cursor-pointer hover:bg-slate-100"
                                  >
                                    <ZoomIn className="w-4 h-4" />
                                    <span>Inspect High-Res Zoom</span>
                                  </button>
                                </div>
                              )}

                              {/* Version Tag on Top Corner */}
                              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1">
                                <Layers className="w-3.5 h-3.5 text-amber-400" />
                                <span>
                                  {showVersionDiff ? 'Previous Version (v1)' : `Active Version (v${currentDoc.version || 1})`}
                                </span>
                              </div>
                            </div>

                            {/* Version Diff Switcher (if re-submitted) */}
                            {currentDoc.previousVersionUrl && (
                              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <RotateCcw className="w-4 h-4 text-amber-600" />
                                  <span className="font-bold text-amber-950">
                                    Re-submission Detected:
                                  </span>
                                  <span className="text-amber-800">
                                    Previous document was rejected on {currentDoc.previousRejectionDate || 'earlier review'}.
                                  </span>
                                </div>
                                <button
                                  onClick={() => setShowVersionDiff(!showVersionDiff)}
                                  className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-black transition cursor-pointer"
                                >
                                  {showVersionDiff ? 'View New Version' : 'Compare Previous Version'}
                                </button>
                              </div>
                            )}

                            {/* Document Action Buttons */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-600">Per-Document Action:</span>
                                <span
                                  className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${
                                    currentDoc.status === 'verified'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : currentDoc.status === 'rejected'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-amber-100 text-amber-900'
                                  }`}
                                >
                                  Status: {currentDoc.status || 'Pending'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleIndividualDocApprove(currentDoc)}
                                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer flex items-center gap-1 shadow-2xs"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Approve Document</span>
                                </button>
                                <button
                                  onClick={() => handleIndividualDocReject(currentDoc)}
                                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer flex items-center gap-1 shadow-2xs"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Reject Document</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Right: Document Metadata & Expiry Details */}
                          <div className="space-y-3">
                            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                                Document Metadata
                              </h4>

                              <div className="space-y-2 text-xs">
                                <div>
                                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Document Type</span>
                                  <span className="font-extrabold text-slate-900">{currentDoc.title}</span>
                                </div>

                                {currentDoc.documentNumber && (
                                  <div>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Document Number</span>
                                    <span className="font-mono font-bold text-slate-900">{currentDoc.documentNumber}</span>
                                  </div>
                                )}

                                <div>
                                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Upload Date</span>
                                  <span className="font-mono text-slate-700">{currentDoc.uploadedAt || selectedVerification.submittedAt}</span>
                                </div>

                                {/* Expiration Status */}
                                {currentDoc.expiresAt ? (
                                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Official Expiration Date</span>
                                    <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                                      <span>{currentDoc.expiresAt}</span>
                                    </div>
                                    <div className="pt-1">
                                      {exp.status === 'expired' ? (
                                        <span className="text-rose-600 font-bold text-[11px] flex items-center gap-1">
                                          <AlertTriangle className="w-3.5 h-3.5" /> Expired ({Math.abs(exp.daysRemaining || 0)} days ago)
                                        </span>
                                      ) : exp.status === 'expiring_soon' ? (
                                        <span className="text-amber-700 font-bold text-[11px] flex items-center gap-1">
                                          <Clock className="w-3.5 h-3.5" /> Expires in {exp.daysRemaining} days
                                        </span>
                                      ) : (
                                        <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                                          <CheckCircle2 className="w-3.5 h-3.5" /> Valid for {exp.daysRemaining} days
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-slate-400">No expiration date required for this document.</div>
                                )}

                                {currentDoc.notes && (
                                  <div>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Admin Review Note</span>
                                    <p className="text-slate-600 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200 mt-1">
                                      {currentDoc.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Rejection Preset Quick Selector */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                Pakistani Compliance Presets
                              </h4>
                              <p className="text-[11px] text-slate-500">
                                Select preset rejection category for SMS/app notification to driver:
                              </p>
                              <select
                                value={selectedPresetCategory}
                                onChange={(e) => {
                                  setSelectedPresetCategory(e.target.value);
                                  const cat = REJECTION_REASONS_CATALOG.find((c) => c.category === e.target.value);
                                  if (cat && cat.reasons.length > 0) setSelectedPresetReason(cat.reasons[0]);
                                }}
                                aria-label="Preset Rejection Category"
                                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                              >
                                {REJECTION_REASONS_CATALOG.map((c) => (
                                  <option key={c.category} value={c.category}>
                                    {c.category}
                                  </option>
                                ))}
                              </select>

                              <select
                                value={selectedPresetReason}
                                onChange={(e) => setSelectedPresetReason(e.target.value)}
                                aria-label="Preset Reason Detail"
                                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none cursor-pointer"
                              >
                                {REJECTION_REASONS_CATALOG.find((c) => c.category === selectedPresetCategory)?.reasons.map((r, i) => (
                                  <option key={i} value={r}>
                                    {r}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                        </div>
                      );
                    })()
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400">No documents found for this driver.</div>
                  )}
                </div>
              )}

              {/* SUBTAB 2: MANDATORY REQUIREMENTS & ELIGIBILITY */}
              {inspectorSubTab === 'eligibility' && (
                <div className="space-y-4">
                  {driverEligibility && (
                    <div
                      className={`p-4 rounded-2xl border flex items-start gap-3 ${
                        driverEligibility.isEligible
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-rose-50 border-rose-200'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          driverEligibility.isEligible ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                        }`}
                      >
                        {driverEligibility.isEligible ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h3
                          className={`text-xs font-black uppercase tracking-wider ${
                            driverEligibility.isEligible ? 'text-emerald-950' : 'text-rose-950'
                          }`}
                        >
                          {driverEligibility.isEligible
                            ? 'Driver Is Eligible for Dispatch Matching'
                            : 'Driver Is Ineligible — Outstanding KYC Deficiencies'}
                        </h3>
                        <p
                          className={`text-xs mt-1 leading-relaxed ${
                            driverEligibility.isEligible ? 'text-emerald-800' : 'text-rose-800'
                          }`}
                        >
                          {driverEligibility.reasons.join(' • ')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Mandatory Pakistani Checklist */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Mandatory Document Checklist (5 Essential Documents)
                    </h4>

                    <div className="space-y-3">
                      {MANDATORY_DOCUMENT_REQUIREMENTS.map((req) => {
                        const uploadedDoc = (selectedVerification.documents || []).find((d) => d.type === req.type);
                        const isVerified = uploadedDoc && (uploadedDoc.status === 'verified' || uploadedDoc.verified);
                        const isExpired = uploadedDoc && uploadedDoc.expiresAt && new Date(uploadedDoc.expiresAt) < new Date();

                        return (
                          <div
                            key={req.type}
                            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isVerified && !isExpired
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : uploadedDoc
                                    ? 'bg-amber-100 text-amber-900'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {isVerified && !isExpired ? '✓' : uploadedDoc ? '!' : '✕'}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-900">{req.title}</div>
                                <p className="text-[11px] text-slate-500">{req.description}</p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              {isVerified && !isExpired ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                                  Verified
                                </span>
                              ) : isExpired ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase">
                                  Expired
                                </span>
                              ) : uploadedDoc ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase">
                                  Pending Review
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase">
                                  Missing
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 3: AUDIT TRAIL */}
              {inspectorSubTab === 'history' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Verification Action History & Log
                    </h4>

                    {(selectedVerification.history || []).length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400">
                        No previous review actions recorded yet.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {(selectedVerification.history || []).map((h) => (
                          <div key={h.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                            <div>
                              <div className="font-bold text-slate-900">{h.action}</div>
                              {h.reason && (
                                <p className="text-[11px] text-rose-600 mt-0.5">
                                  <strong>Reason:</strong> {h.reason}
                                </p>
                              )}
                              {h.notes && (
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  <strong>Note:</strong> {h.notes}
                                </p>
                              )}
                            </div>
                            <div className="text-right shrink-0 text-slate-400 font-mono text-[11px]">
                              <div>{h.timestamp}</div>
                              <div className="text-[10px] text-slate-500">By: {h.adminName}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Bottom Action Bar */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 font-medium">
                Admin review permanently logged to compliance audit trail.
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setShowResubmitModal(true)}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 transition cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Request Re-submission</span>
                </button>

                <button
                  onClick={() => setShowRejectModal(true)}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject Entire KYC</span>
                </button>

                <button
                  onClick={handleApproveAll}
                  className="px-4 py-2 text-xs font-black rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve & Grant Ride Eligibility</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================
          6. RE-SUBMISSION REQUEST MODAL
         =================================================== */}
      {showResubmitModal && selectedVerification && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 bg-amber-50 flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-xs text-amber-950 uppercase tracking-wider">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>Request Document Re-submission</span>
              </div>
              <button onClick={() => setShowResubmitModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                The driver will receive a push notification and SMS prompting them to upload a corrected document via the GoLife Driver App.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Rejection Reason Category
                </label>
                <select
                  value={selectedPresetCategory}
                  onChange={(e) => {
                    setSelectedPresetCategory(e.target.value);
                    const cat = REJECTION_REASONS_CATALOG.find((c) => c.category === e.target.value);
                    if (cat) setSelectedPresetReason(cat.reasons[0]);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  {REJECTION_REASONS_CATALOG.map((c) => (
                    <option key={c.category} value={c.category}>
                      {c.category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Specific Reason Notice
                </label>
                <select
                  value={selectedPresetReason}
                  onChange={(e) => setSelectedPresetReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                >
                  {REJECTION_REASONS_CATALOG.find((c) => c.category === selectedPresetCategory)?.reasons.map((r, i) => (
                    <option key={i} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Additional Admin Instructions for Driver
                </label>
                <textarea
                  value={customAdminNotes}
                  onChange={(e) => setCustomAdminNotes(e.target.value)}
                  placeholder="e.g. Please capture the back of your CNIC with clear visibility of the barcode and expiry date..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* Preview Notice */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  SMS / In-App Driver Preview
                </span>
                <p className="text-[11px] text-slate-800 font-mono">
                  GoLife: Your {selectedVerification.documents[activeDocTab]?.title || 'document'} requires re-upload. Reason: {selectedPresetReason}. {customAdminNotes}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowResubmitModal(false)}
                className="px-3.5 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestResubmit}
                className="px-4 py-2 text-xs font-black rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Re-submission Request</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          7. REJECTION MODAL
         =================================================== */}
      {showRejectModal && selectedVerification && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 bg-rose-50 flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-xs text-rose-950 uppercase tracking-wider">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Reject Driver KYC Application</span>
              </div>
              <button onClick={() => setShowRejectModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Rejecting this application will disable driver account activation. Specify the official compliance reason:
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Primary Rejection Reason
                </label>
                <select
                  value={selectedPresetReason}
                  onChange={(e) => setSelectedPresetReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                >
                  {REJECTION_REASONS_CATALOG.flatMap((c) => c.reasons).map((r, i) => (
                    <option key={i} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Custom Internal Justification
                </label>
                <textarea
                  value={customAdminNotes}
                  onChange={(e) => setCustomAdminNotes(e.target.value)}
                  placeholder="Record mandatory rationale for administrative compliance logs..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-3.5 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectFull}
                className="px-4 py-2 text-xs font-black rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Confirm Final Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          8. HIGH-RES ZOOM MODAL
         =================================================== */}
      {zoomImage && (
        <div
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-2">
            <img src={zoomImage} alt="Zoomed Document" className="w-full h-auto max-h-[85vh] object-contain rounded-xl" />
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 bg-slate-950/80 text-white p-2 rounded-xl text-xs font-bold"
            >
              ✕ Close Zoom
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
