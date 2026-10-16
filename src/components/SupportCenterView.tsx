import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { SupportTicket } from '../types';
import { BackToDashboardButton } from './common/BackToDashboardButton';
import {
  LifeBuoy,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  User,
  Car,
  Send,
  Phone,
  Mail,
  MapPin,
  Tag,
  ShieldAlert,
  Wallet,
  X,
  FileText,
  UserCheck
} from 'lucide-react';

export const SupportCenterView: React.FC = () => {
  const {
    supportTickets,
    addTicketReply,
    addTicketNote,
    updateTicketStatus,
    assignTicket,
    createSupportTicket,
    adminUsers,
    currentAdmin,
    adjustPassengerWallet,
    adjustDriverWallet,
    processPassengerRefund,
    processDriverReimbursement,
    hasPermission,
    checkSensitiveAction,
    showToast
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');

  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    supportTickets[0]?.id || ''
  );

  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('250');
  const [refundReason, setRefundReason] = useState('Fare discrepancy resolution');

  // New Ticket Form State
  const [newTicketForm, setNewTicketForm] = useState({
    ticketNumber: '',
    userId: 'p-new',
    userName: '',
    userPhone: '+92 300 0000000',
    userType: 'passenger' as 'passenger' | 'driver',
    subject: '',
    description: '',
    category: 'fare' as SupportTicket['category'],
    priority: 'medium' as SupportTicket['priority'],
    status: 'open' as SupportTicket['status'],
    city: 'Lahore'
  });

  const selectedTicket = supportTickets.find((t) => t.id === selectedTicketId) || supportTickets[0];

  const filteredTickets = supportTickets.filter((t) => {
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userPhone.includes(searchQuery) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchesType = userTypeFilter === 'all' || t.userType === userTypeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesType;
  });

  // Fast canned response templates
  const cannedResponses = [
    {
      title: 'Fare Adjustment Credit',
      text: 'Respected user, we have investigated your trip. The extra charged amount has been credited directly to your GoLife wallet balance. We regret any inconvenience.'
    },
    {
      title: 'Driver Investigation',
      text: 'Thank you for reporting this incident. Our safety compliance team has issued a formal warning to the driver and placed a temporary review flag on their vehicle profile.'
    },
    {
      title: 'Lost Item Recovery',
      text: 'We have initiated contact with your driver. If the item was recovered in the vehicle, the driver will coordinate handover at the nearest safe hub or drop-off location.'
    },
    {
      title: 'NADRA Verification Clarification',
      text: 'Dear driver partner, please ensure your original CNIC photo is clearly readable without glare. Please upload a clear capture to proceed with verification.'
    }
  ];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket || isSubmittingReply) return;

    if (!hasPermission('support', 'edit')) {
      showToast('Access Denied: You do not have permission to reply or add notes to tickets.', 'error');
      return;
    }

    setIsSubmittingReply(true);
    try {
      if (isInternalNote) {
        addTicketNote(selectedTicket.id, replyText.trim());
        showToast('Internal note saved to ticket audit trail', 'info');
      } else {
        addTicketReply(selectedTicket.id, replyText.trim());
        showToast('Reply dispatched to user mobile notification', 'success');
      }
      setReplyText('');
      setIsInternalNote(false);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketForm.userName.trim() || !newTicketForm.subject.trim() || !newTicketForm.description.trim()) {
      showToast('Please fill all required ticket fields', 'error');
      return;
    }
    createSupportTicket({
      userId: `usr-${Date.now().toString().slice(-4)}`,
      userName: newTicketForm.userName.trim(),
      userPhone: newTicketForm.userPhone.trim(),
      userType: newTicketForm.userType,
      subject: newTicketForm.subject.trim(),
      description: newTicketForm.description.trim(),
      category: newTicketForm.category,
      priority: newTicketForm.priority,
      status: 'open',
      city: newTicketForm.city,
      assignedAdmin: currentAdmin?.name || 'Unassigned'
    });
    setShowCreateModal(false);
    setNewTicketForm({
      ticketNumber: '',
      userId: 'p-new',
      userName: '',
      userPhone: '+92 300 0000000',
      userType: 'passenger',
      subject: '',
      description: '',
      category: 'fare',
      priority: 'medium',
      status: 'open',
      city: 'Lahore'
    });
  };

  const handleProcessRefund = () => {
    if (!selectedTicket) return;
    const amountNum = parseFloat(refundAmount) || 0;
    if (amountNum <= 0) {
      showToast('Please enter a valid refund amount', 'error');
      return;
    }

    if (selectedTicket.userType === 'passenger') {
      if (!checkSensitiveAction('refund_approval', `Ticket ${selectedTicket.ticketNumber} Passenger Refund of PKR ${amountNum}`)) {
        return;
      }
      processPassengerRefund({
        passengerId: selectedTicket.userId,
        passengerName: selectedTicket.userName,
        passengerPhone: selectedTicket.userPhone,
        rideId: selectedTicket.rideId,
        rideCode: selectedTicket.rideId ? `RD-${selectedTicket.rideId.slice(-4)}` : 'N/A',
        originalFare: amountNum,
        paidAmount: amountNum,
        previousRefunds: 0,
        refundType: 'partial',
        amount: amountNum,
        paymentMethod: 'wallet',
        refundDestination: 'wallet_credit',
        reason: `Ticket #${selectedTicket.ticketNumber}: ${refundReason}`,
        note: `Disbursed from Support Desk for ${selectedTicket.userName}`
      });
    } else {
      if (!checkSensitiveAction('reimbursement_approval', `Ticket ${selectedTicket.ticketNumber} Driver Reimbursement of PKR ${amountNum}`)) {
        return;
      }
      processDriverReimbursement({
        driverId: selectedTicket.userId,
        driverName: selectedTicket.userName,
        driverPhone: selectedTicket.userPhone,
        driverPlate: 'ABC-123',
        rideId: selectedTicket.rideId,
        rideCode: selectedTicket.rideId ? `RD-${selectedTicket.rideId.slice(-4)}` : 'N/A',
        amount: amountNum,
        reason: refundReason,
        note: `Support ticket #${selectedTicket.ticketNumber}: ${refundReason}`,
        paymentDestination: 'driver_wallet'
      });
    }

    addTicketNote(selectedTicket.id, `Financial action recorded: Rs. ${amountNum} (${refundReason}) via Ledger`);
    addTicketReply(
      selectedTicket.id,
      `A wallet credit of Rs. ${amountNum} has been processed for your GoLife account balance regarding: ${refundReason}.`
    );
    setShowRefundModal(false);
    showToast(`Rs. ${amountNum} processed to ${selectedTicket.userName} via Ledger`, 'success');
  };

  const getPriorityBadge = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-rose-50 text-rose-700 border-rose-300 font-bold animate-pulse';
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-300 font-bold';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'closed':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-300';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <BackToDashboardButton variant="dark" />
              <span className="p-2.5 bg-[#0F766E]/30 border border-[#0F766E]/50 rounded-xl text-teal-300">
                <LifeBuoy className="w-6 h-6 text-[#0F766E]" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Support Center & Helpdesk Operations</h1>
                <p className="text-slate-400 text-sm">
                  Resolve passenger and driver grievances, lost items, fare disputes, and live conversation threads.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0d655e] text-white text-sm font-semibold transition shadow-md shadow-[#0F766E]/20"
            >
              <Plus className="w-4 h-4" />
              Create Support Ticket
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="mt-6 pt-5 border-t border-slate-700/60 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-xs">
            <span className="text-slate-400 block">Total Tickets</span>
            <span className="text-lg font-bold text-white">{supportTickets.length}</span>
          </div>
          <div className="text-xs">
            <span className="text-slate-400 block">Open Tickets</span>
            <span className="text-lg font-bold text-amber-400">
              {supportTickets.filter((t) => t.status === 'open').length}
            </span>
          </div>
          <div className="text-xs">
            <span className="text-slate-400 block">In Progress</span>
            <span className="text-lg font-bold text-blue-400">
              {supportTickets.filter((t) => t.status === 'in_progress').length}
            </span>
          </div>
          <div className="text-xs">
            <span className="text-slate-400 block">Resolved</span>
            <span className="text-lg font-bold text-emerald-400">
              {supportTickets.filter((t) => t.status === 'resolved').length}
            </span>
          </div>
          <div className="text-xs">
            <span className="text-slate-400 block">High / Critical Priority</span>
            <span className="text-lg font-bold text-rose-400">
              {supportTickets.filter((t) => t.priority === 'critical' || t.priority === 'high').length}
            </span>
          </div>
        </div>
      </div>

      {/* Split-Screen Helpdesk Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Ticket List & Search (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search and Filters */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search ticket #, subject, customer, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white"
              >
                <option value="all">All Categories</option>
                <option value="fare">Fare Dispute</option>
                <option value="driver_behavior">Driver Behavior</option>
                <option value="lost_item">Lost Item</option>
                <option value="safety">Safety & Harassment</option>
                <option value="payout">Payout & Banking</option>
                <option value="app_issue">App Issue / Bug</option>
                <option value="general">General Inquiry</option>
              </select>

              <select
                value={userTypeFilter}
                onChange={(e) => setUserTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white"
              >
                <option value="all">Passenger & Driver</option>
                <option value="passenger">Passengers Only</option>
                <option value="driver">Drivers Only</option>
              </select>
            </div>
          </div>

          {/* Ticket Cards List */}
          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                No support tickets found matching criteria.
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer text-left ${
                      isSelected
                        ? 'bg-teal-50/50 border-[#0F766E] shadow-sm'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-slate-900">{t.ticketNumber}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${getPriorityBadge(
                            t.priority
                          )}`}
                        >
                          {t.priority}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${getStatusBadge(
                          t.status
                        )}`}
                      >
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mb-1">{t.subject}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2.5">{t.description}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1 font-medium text-slate-700">
                        {t.userType === 'driver' ? (
                          <Car className="w-3 h-3 text-blue-600" />
                        ) : (
                          <User className="w-3 h-3 text-emerald-600" />
                        )}
                        <span>{t.userName}</span>
                        <span className="text-slate-400">• {t.city || 'Pakistan'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{(t.createdAt || '').split(' ')[0] || 'Today'}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Ticket Conversation & Controls (7 cols) */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col min-h-[720px]">
              {/* Ticket Top Action Bar */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-slate-900">{selectedTicket.ticketNumber}</span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getPriorityBadge(
                          selectedTicket.priority
                        )}`}
                      >
                        {selectedTicket.priority.toUpperCase()}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getStatusBadge(
                          selectedTicket.status
                        )}`}
                      >
                        {selectedTicket.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900">{selectedTicket.subject}</h2>
                  </div>

                  {/* Status Change Dropdown & Quick Actions */}
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value as any)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white shadow-xs focus:ring-2 focus:ring-[#0F766E]"
                    >
                      <option value="open">Status: Open</option>
                      <option value="in_progress">Status: In Progress</option>
                      <option value="resolved">Status: Resolved</option>
                      <option value="closed">Status: Closed</option>
                    </select>

                    <button
                      onClick={() => setShowRefundModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1 transition"
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      Issue Refund
                    </button>
                  </div>
                </div>

                {/* Customer Meta Row */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Customer / Partner</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      {selectedTicket.userType === 'driver' ? (
                        <Car className="w-3 h-3 text-blue-600" />
                      ) : (
                        <User className="w-3 h-3 text-emerald-600" />
                      )}
                      {selectedTicket.userName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Phone</span>
                    <span className="font-mono text-slate-800 font-semibold">{selectedTicket.userPhone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">City Region</span>
                    <span className="text-slate-800 font-semibold">{selectedTicket.city || 'Pakistan'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Agent</span>
                    <select
                      value={selectedTicket.assignedAdmin || ''}
                      onChange={(e) => assignTicket(selectedTicket.id, e.target.value)}
                      className="text-xs font-semibold text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:outline-none"
                    >
                      <option value="Unassigned">Unassigned</option>
                      {adminUsers.map((a) => (
                        <option key={a.id} value={a.name}>
                          {a.name} ({a.roleTitle || a.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Internal Staff Notes Area (if any) */}
              {selectedTicket.adminNotes && selectedTicket.adminNotes.length > 0 && (
                <div className="mx-5 mt-4 p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-700" />
                    Internal Staff Notes (Staff Eyes Only):
                  </div>
                  <ul className="space-y-1 text-amber-800 font-mono text-[11px]">
                    {selectedTicket.adminNotes.map((note, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span>•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Conversation Timeline */}
              <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[460px]">
                {/* Initial Description */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                    {selectedTicket.userName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="max-w-md bg-slate-100 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-800 shadow-xs">
                    <div className="flex items-center justify-between gap-4 font-semibold text-slate-900 mb-1">
                      <span>{selectedTicket.userName}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{selectedTicket.createdAt}</span>
                    </div>
                    <p className="leading-relaxed">{selectedTicket.description}</p>
                  </div>
                </div>

                {/* Replies Thread */}
                {selectedTicket.replies?.map((rep) => {
                  const isAdmin = rep.sender === 'admin';

                  return (
                    <div
                      key={rep.id}
                      className={`flex items-start gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isAdmin ? 'bg-[#0F766E] text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isAdmin ? 'HQ' : rep.senderName.slice(0, 2).toUpperCase()}
                      </div>

                      <div
                        className={`max-w-md rounded-2xl p-3.5 text-xs shadow-xs ${
                          isAdmin
                            ? 'bg-[#0F766E] text-white rounded-tr-none'
                            : 'bg-slate-100 text-slate-800 rounded-tl-none'
                        }`}
                      >
                        <div
                          className={`flex items-center justify-between gap-4 font-semibold mb-1 ${
                            isAdmin ? 'text-teal-100' : 'text-slate-900'
                          }`}
                        >
                          <span>{rep.senderName}</span>
                          <span className={`text-[10px] ${isAdmin ? 'text-teal-200' : 'text-slate-400'}`}>
                            {rep.timestamp}
                          </span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-line">{rep.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Fast Canned Templates Pills */}
              <div className="px-5 pt-3 border-t border-slate-100 bg-slate-50/40">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                    Quick Templates:
                  </span>
                  {cannedResponses.map((cr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setReplyText(cr.text)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] text-slate-700 whitespace-nowrap transition shadow-2xs font-medium"
                    >
                      {cr.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reply Input Box */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-slate-100 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isInternalNote}
                        onChange={(e) => setIsInternalNote(e.target.checked)}
                        className="rounded text-[#0F766E] focus:ring-[#0F766E]"
                      />
                      <span className={isInternalNote ? 'font-bold text-amber-700' : ''}>
                        Save as Internal Note (Customer will NOT see)
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex items-end gap-3">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={
                      isInternalNote
                        ? 'Type staff internal audit note (visible to administrators only)...'
                        : 'Type reply to customer in Urdu / English...'
                    }
                    className={`w-full p-3 rounded-xl border text-xs focus:outline-none focus:ring-2 resize-none transition ${
                      isInternalNote
                        ? 'border-amber-300 bg-amber-50/30 focus:ring-amber-500'
                        : 'border-slate-300 focus:ring-[#0F766E]'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className={`px-5 py-3 rounded-xl text-white font-semibold text-xs flex items-center gap-1.5 transition shrink-0 ${
                      isInternalNote
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-[#0F766E] hover:bg-[#0d655e]'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isInternalNote ? 'Save Note' : 'Send Reply'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
              Select a ticket on the left to view the conversation and support tools.
            </div>
          )}
        </div>
      </div>

      {/* Create Support Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-teal-50 text-[#0F766E]">
                  <LifeBuoy className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-bold text-slate-900">Create Helpdesk Ticket</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-4 mt-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    User Type
                  </label>
                  <select
                    value={newTicketForm.userType}
                    onChange={(e) =>
                      setNewTicketForm({ ...newTicketForm, userType: e.target.value as 'passenger' | 'driver' })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] bg-white"
                  >
                    <option value="passenger">Passenger</option>
                    <option value="driver">Driver Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    City
                  </label>
                  <select
                    value={newTicketForm.city}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] bg-white"
                  >
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Multan">Multan</option>
                    <option value="Peshawar">Peshawar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tariq Jamil"
                    value={newTicketForm.userName}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, userName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Number (PK)
                  </label>
                  <input
                    type="text"
                    placeholder="+92 300 1234567"
                    value={newTicketForm.userPhone}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, userPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={newTicketForm.category}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] bg-white"
                  >
                    <option value="fare">Fare Dispute</option>
                    <option value="driver_behavior">Driver Misconduct</option>
                    <option value="lost_item">Lost Item in Ride</option>
                    <option value="safety">Safety / Harassment</option>
                    <option value="payout">Payout / Banking</option>
                    <option value="app_issue">App Issue</option>
                    <option value="general">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Priority Level
                  </label>
                  <select
                    value={newTicketForm.priority}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Overcharged on route from DHA Phase 5 to Gulberg"
                  value={newTicketForm.subject}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Incident Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide complete narrative of customer grievance..."
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0d655e] text-white text-sm font-semibold transition"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Instant Wallet Compensation / Refund Modal */}
      {showRefundModal && selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Issue Goodwill Wallet Credit</h3>
                <p className="text-xs text-slate-500">Credited to {selectedTicket.userName}'s GoLife Wallet</p>
              </div>
            </div>

            <div className="space-y-4 py-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Compensation Amount (PKR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Rs.</span>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reason for Adjustment
                </label>
                <input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-200">
                This transaction immediately updates the customer's wallet ledger and adds an automated notification to their ticket timeline.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRefundModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessRefund}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition"
              >
                Disburse Rs. {refundAmount}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
