import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { SafetyIncident, Complaint, AdminNotification } from '../types';
import { BackToDashboardButton } from './common/BackToDashboardButton';
import {
  ShieldAlert,
  MessageSquareWarning,
  Bell,
  AlertTriangle,
  Phone,
  Car,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Siren,
  UserX,
  FileText,
  PackageSearch,
  Volume2,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface LostFoundItem {
  id: string;
  itemDescription: string;
  rideId: string;
  passengerName: string;
  passengerPhone: string;
  driverName: string;
  driverPhone: string;
  reportedAt: string;
  status: 'reported' | 'found_with_driver' | 'delivered_to_hub' | 'returned';
}

export const SafetyComplaintsView: React.FC = () => {
  const {
    activeTab: globalTab,
    safetyIncidents,
    complaints,
    notifications,
    openUniversalDetail,
    resolveSafetyIncident,
    escalateSafetyIncident,
    resolveComplaint,
    sendNotification,
    updateDriverAccountStatus,
    updatePassengerStatus
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'safety' | 'complaints' | 'broadcast' | 'lost_found'>(() =>
    globalTab === 'complaints' ? 'complaints' : globalTab === 'notifications' ? 'broadcast' : 'safety'
  );

  React.useEffect(() => {
    if (globalTab === 'complaints') setActiveTab('complaints');
    else if (globalTab === 'notifications') setActiveTab('broadcast');
    else if (globalTab === 'safety') setActiveTab('safety');
  }, [globalTab]);

  // Safety escalation modal
  const [selectedIncident, setSelectedIncident] = useState<SafetyIncident | null>(null);
  const [escalationNote, setEscalationNote] = useState('Escalated to Punjab Safe City Authority / Rescue 15 & deployed ground dispatch patrol.');
  const [showEscalateModal, setShowEscalateModal] = useState(false);

  // Complaint resolution modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [complaintResolution, setComplaintResolution] = useState('');
  const [complaintAction, setComplaintAction] = useState<string>('warning');
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Broadcast creation
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'drivers' | 'passengers'>('all');
  const [targetCity, setTargetCity] = useState('All');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Lost & Found Items state
  const [lostItems, setLostItems] = useState<LostFoundItem[]>([
    {
      id: 'LF-101',
      itemDescription: 'Black Leather Wallet (contains CNIC & HBL Debit Card)',
      rideId: 'RIDE-9821',
      passengerName: 'Hamza Farooq',
      passengerPhone: '+92 300 1234567',
      driverName: 'Muhammad Tariq',
      driverPhone: '+92 321 9876543',
      reportedAt: 'Today, 02:15 PM',
      status: 'found_with_driver'
    },
    {
      id: 'LF-102',
      itemDescription: 'Samsung Galaxy A54 with clear protective cover',
      rideId: 'RIDE-9452',
      passengerName: 'Ayesha Bibi',
      passengerPhone: '+92 333 4567890',
      driverName: 'Zubair Khan',
      driverPhone: '+92 302 5551234',
      reportedAt: 'Yesterday, 07:40 PM',
      status: 'delivered_to_hub'
    },
    {
      id: 'LF-103',
      itemDescription: 'Navy Blue Laptop Bag (Lenovo ThinkPad)',
      rideId: 'RIDE-8901',
      passengerName: 'Bilal Ahmed',
      passengerPhone: '+92 305 7778899',
      driverName: 'Rashid Ali',
      driverPhone: '+92 345 6667788',
      reportedAt: 'Sep 10, 2026',
      status: 'returned'
    }
  ]);

  const activeIncidents = safetyIncidents.filter((s) => s.status === 'active');
  const openComplaints = complaints.filter((c) => c.status === 'open' || c.status === 'investigating');

  const handleEscalateConfirm = () => {
    if (selectedIncident) {
      escalateSafetyIncident(selectedIncident.id, escalationNote);
      setShowEscalateModal(false);
      setSelectedIncident(null);
    }
  };

  const handleComplaintResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedComplaint) {
      resolveComplaint(
        selectedComplaint.id,
        complaintResolution || 'Investigated by GoLife trust & safety desk. Action executed.',
        complaintAction
      );
      setShowComplaintModal(false);
      setSelectedComplaint(null);
    }
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastBody) return;

    sendNotification({
      title: broadcastTitle,
      body: broadcastBody,
      target: targetAudience,
      city: targetCity
    });

    setBroadcastTitle('');
    setBroadcastBody('');
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

  const handleApplyTemplate = (title: string, body: string) => {
    setBroadcastTitle(title);
    setBroadcastBody(body);
  };

  const updateItemStatus = (id: string, newStatus: LostFoundItem['status']) => {
    setLostItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  return (
    <div className="space-y-6 text-[#111827]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackToDashboardButton />
          <div>
            <h1 className="text-xl font-bold text-[#111827] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              Safety Emergency, Grievance Support & Broadcast Center
            </h1>
            <p className="text-xs text-[#6B7280]">
              Emergency SOS response, passenger/driver complaints investigation, and mass broadcast alerts
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('safety')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'safety'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-slate-50'
            }`}
          >
            <Siren className="w-3.5 h-3.5" />
            SOS Safety Alerts ({activeIncidents.length})
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'complaints'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-slate-50'
            }`}
          >
            <MessageSquareWarning className="w-3.5 h-3.5" />
            Complaints ({openComplaints.length})
          </button>

          <button
            onClick={() => setActiveTab('lost_found')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'lost_found'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-slate-50'
            }`}
          >
            <PackageSearch className="w-3.5 h-3.5" />
            Lost & Found ({lostItems.length})
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'broadcast'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-slate-50'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Broadcast Alerts
          </button>
        </div>
      </div>

      {/* Tab 1: Safety & SOS Monitoring */}
      {activeTab === 'safety' && (
        <div className="space-y-5">
          {/* Active Incidents Banner */}
          {activeIncidents.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-600 flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                  <Siren className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-rose-900">
                    CRITICAL EMERGENCY: {activeIncidents.length} LIVE SOS ALERTS ACTIVE
                  </h2>
                  <p className="text-xs text-rose-700">
                    Immediate coordination required with Pakistani Emergency Services (15 Police / 1122 Rescue)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Incidents Roster */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safetyIncidents.map((incident) => (
              <div
                key={incident.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between shadow-xs ${
                  incident.status === 'active'
                    ? 'bg-white border-rose-600 ring-2 ring-rose-200'
                    : incident.status === 'escalated'
                    ? 'bg-white border-amber-500'
                    : 'bg-white border-[#E5E7EB]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {incident.incidentCode}
                      </span>
                      <span className="text-xs font-bold uppercase text-[#111827]">
                        {incident.type.replace('_', ' ')}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        incident.status === 'active'
                          ? 'bg-rose-600 text-white animate-pulse'
                          : incident.status === 'escalated'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-emerald-50 text-[#10B981] border border-emerald-200'
                      }`}
                    >
                      {incident.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#111827] font-medium">{incident.notes}</p>

                  <div className="mt-4 pt-3 border-t border-[#E5E7EB] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B7280]">Triggered By:</span>
                      <span className="font-bold text-[#111827] capitalize">
                        {incident.triggeredBy} ({incident.reporterName})
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#6B7280]">Vehicle & Plate:</span>
                      <span className="font-mono text-[#0F766E] font-bold">
                        {incident.vehiclePlate}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#6B7280]">Live GPS Coordinates:</span>
                      <span className="font-mono text-[#111827]">
                        {incident.currentLocation.lat}, {incident.currentLocation.lng} ({incident.city})
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#6B7280]">Trigger Time (PKT):</span>
                      <span className="font-mono text-[#6B7280]">{incident.triggeredAt}</span>
                    </div>

                    {/* Emergency Relative Contact */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-[#E5E7EB] mt-2">
                      <div className="text-[10px] text-[#6B7280] font-bold uppercase mb-1">
                        Emergency Relative Contact:
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#111827] font-bold">
                          {incident.emergencyContact.name} ({incident.emergencyContact.relation})
                        </span>
                        <a
                          href={`tel:${incident.emergencyContact.phone}`}
                          className="font-mono text-[#0F766E] flex items-center gap-1 font-bold hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          {incident.emergencyContact.phone}
                        </a>
                      </div>
                    </div>

                    {incident.escalationNote && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                        <strong>Escalation Dispatch:</strong> {incident.escalationNote}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
                  <div className="text-[10px] text-[#6B7280]">Ride ID: {incident.rideId}</div>

                  {incident.status === 'active' && (
                    <div className="flex items-center gap-2">
                      <a
                        href="tel:15"
                        className="px-3 py-1.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Phone className="w-3 h-3" />
                        Call Police (15)
                      </a>
                      <button
                        onClick={() => {
                          setSelectedIncident(incident);
                          setShowEscalateModal(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                      >
                        Escalate
                      </button>
                      <button
                        onClick={() =>
                          resolveSafetyIncident(
                            incident.id,
                            'Resolved and verified safe with driver and passenger by phone check.'
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-[#0F766E] hover:bg-[#064E3B] text-white font-bold text-xs cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Complaints & Grievance Desk */}
      {activeTab === 'complaints' && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
            <span className="font-bold text-sm text-[#111827]">
              Customer & Driver Grievance Queue ({openComplaints.length} Pending)
            </span>
            <span className="text-xs text-[#6B7280]">
              Categories: Harassment, Overcharging, Route Deviation, Behavior, Vehicle Condition
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#6B7280] border-b border-[#E5E7EB] uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Filed By</th>
                  <th className="py-3 px-4">Target Person</th>
                  <th className="py-3 px-4">Complaint Description</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#111827]">
                      {c.complaintCode}
                      <div className="text-[10px] text-[#6B7280] font-sans">{c.createdAt}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-[#111827] capitalize">
                        {c.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.priority === 'critical'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : c.priority === 'high'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-[#6B7280]'
                        }`}
                      >
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#111827]">{c.reporterName}</div>
                      <div className="text-[10px] font-mono text-[#6B7280]">{c.reporterPhone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#111827]">{c.targetName}</div>
                      <div className="text-[10px] font-mono text-[#6B7280]">{c.targetPhone}</div>
                    </td>
                    <td className="py-3 px-4 text-[#6B7280] max-w-xs truncate">
                      {c.description}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.status === 'open'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : c.status === 'investigating'
                            ? 'bg-sky-50 text-sky-800 border border-sky-200'
                            : 'bg-emerald-50 text-[#10B981] border border-emerald-200'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openUniversalDetail('complaint', c.id)}
                          className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs"
                        >
                          Detail & Actions
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Lost & Found Tracker */}
      {activeTab === 'lost_found' && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
            <div>
              <span className="font-bold text-sm text-[#111827]">Lost & Found In-Ride Property Log</span>
              <p className="text-[11px] text-[#6B7280]">
                Track reported forgotten phones, wallets, keys and bags across GoLife fleets
              </p>
            </div>
            <span className="text-xs text-[#0F766E] font-semibold">City Hub Storage Available</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#6B7280] border-b border-[#E5E7EB] uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Item Ref</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Ride ID</th>
                  <th className="py-3 px-4">Passenger</th>
                  <th className="py-3 px-4">Driver</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {lostItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#111827]">{item.id}</td>
                    <td className="py-3 px-4 font-semibold text-[#111827]">{item.itemDescription}</td>
                    <td className="py-3 px-4 font-mono text-[#0F766E]">{item.rideId}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#111827]">{item.passengerName}</div>
                      <div className="text-[10px] font-mono text-[#6B7280]">{item.passengerPhone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#111827]">{item.driverName}</div>
                      <div className="text-[10px] font-mono text-[#6B7280]">{item.driverPhone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.status === 'reported'
                            ? 'bg-amber-50 text-amber-800'
                            : item.status === 'found_with_driver'
                            ? 'bg-blue-50 text-blue-700'
                            : item.status === 'delivered_to_hub'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-emerald-50 text-[#10B981]'
                        }`}
                      >
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={item.status}
                        onChange={(e) => updateItemStatus(item.id, e.target.value as any)}
                        className="p-1 text-xs rounded-lg bg-slate-50 border border-[#E5E7EB] text-[#111827]"
                      >
                        <option value="reported">Reported</option>
                        <option value="found_with_driver">Found with Driver</option>
                        <option value="delivered_to_hub">Delivered to Hub</option>
                        <option value="returned">Returned to Passenger</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Broadcast Notifications */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Broadcast Form */}
          <form
            onSubmit={handleSendBroadcast}
            className="lg:col-span-2 bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4"
          >
            <div className="border-b border-[#E5E7EB] pb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#0F766E]" />
                Dispatch In-App Push Notification & SMS Broadcast
              </h2>
              {broadcastSuccess && (
                <span className="text-[#10B981] text-xs font-bold animate-pulse">
                  Broadcast successfully queued!
                </span>
              )}
            </div>

            {/* Quick Templates */}
            <div>
              <span className="text-xs font-semibold text-[#6B7280] block mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
                Quick Message Templates:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  {
                    label: 'Monsoon Rain Alert',
                    title: 'Weather Advisory: Heavy Rain Forecast in Lahore',
                    body: 'Please drive cautiously with low beam headlights on. Surge pricing active to compensate drivers.'
                  },
                  {
                    label: 'Eid Mubarak Greeting',
                    title: 'Eid Mubarak from GoLife Taxi! 🌙',
                    body: 'Wishing you and your family safety and joy this Eid. Enjoy 20% off your holiday commutes with code EID2026.'
                  },
                  {
                    label: 'System Maintenance',
                    title: 'Scheduled System Optimization at 03:00 AM',
                    body: 'We will be conducting scheduled server upgrades between 03:00 AM and 03:30 AM PKT.'
                  },
                  {
                    label: 'Driver Fuel Subsidy',
                    title: 'Special Fuel Incentive Credit Credited',
                    body: 'Top active drivers have received PKR 500 fuel subsidy directly to their GoLife wallet balance.'
                  }
                ].map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => handleApplyTemplate(t.title, t.body)}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-50 hover:bg-slate-100 border border-[#E5E7EB] text-[#111827] font-medium transition cursor-pointer"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Notification Headline
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Traffic Alert: Heavy Rain in Karachi, Drive Safely"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 text-[#111827] border border-[#E5E7EB] focus:outline-none focus:border-[#0F766E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Message Body
              </label>
              <textarea
                rows={3}
                required
                placeholder="Compose announcement for mobile apps..."
                value={broadcastBody}
                onChange={(e) => setBroadcastBody(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 text-[#111827] border border-[#E5E7EB] focus:outline-none focus:border-[#0F766E]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[#111827] font-semibold mb-1">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full p-2 rounded-xl bg-slate-50 text-[#111827] border border-[#E5E7EB] focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="all">Everyone (All Drivers & Passengers)</option>
                  <option value="drivers">Registered Drivers Only</option>
                  <option value="passengers">Passengers Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[#111827] font-semibold mb-1">City Filter</label>
                <select
                  value={targetCity}
                  onChange={(e) => setTargetCity(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 text-[#111827] border border-[#E5E7EB] focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="All">All Cities in Pakistan</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Peshawar">Peshawar</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#064E3B] text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Transmit Announcement
              </button>
            </div>
          </form>

          {/* Past Broadcasts List */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-2">
              Broadcast Log History
            </h3>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-[#E5E7EB] text-xs">
                  <div className="font-bold text-[#111827]">{n.title}</div>
                  <p className="text-[#6B7280] text-[11px] mt-1">{n.body}</p>
                  <div className="mt-2 text-[10px] text-[#6B7280] flex items-center justify-between">
                    <span className="capitalize text-[#0F766E] font-bold">Target: {n.target} ({n.city})</span>
                    <span>{n.sentAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Escalate SOS Modal */}
      {showEscalateModal && selectedIncident && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-2xl space-y-4 text-[#111827]">
            <div className="flex items-center gap-2 text-rose-600">
              <Siren className="w-5 h-5" />
              <h3 className="font-bold text-sm text-[#111827]">
                Escalate Incident: {selectedIncident.incidentCode}
              </h3>
            </div>
            <p className="text-xs text-[#6B7280]">
              City: {selectedIncident.city} • Vehicle Plate: {selectedIncident.vehiclePlate}
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Emergency Escalate Notes (Shared with Police / Patrol)
              </label>
              <textarea
                rows={3}
                required
                value={escalationNote}
                onChange={(e) => setEscalationNote(e.target.value)}
                className="w-full p-2 text-xs rounded-xl bg-slate-50 text-[#111827] border border-[#E5E7EB] focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowEscalateModal(false)}
                className="px-3 py-1.5 text-xs text-[#6B7280] hover:text-[#111827]"
              >
                Cancel
              </button>
              <button
                onClick={handleEscalateConfirm}
                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                Dispatch Emergency Escalation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complaint Investigation Modal */}
      {showComplaintModal && selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleComplaintResolveSubmit}
            className="w-full max-w-lg bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-2xl space-y-4 text-[#111827]"
          >
            <h3 className="font-bold text-sm text-[#111827] flex items-center gap-2">
              <MessageSquareWarning className="w-4 h-4 text-[#0F766E]" />
              Resolve Ticket: {selectedComplaint.complaintCode}
            </h3>

            <div className="p-3 rounded-xl bg-slate-50 border border-[#E5E7EB] text-xs space-y-1">
              <div><strong className="text-[#111827]">Filed By:</strong> {selectedComplaint.reporterName} ({selectedComplaint.reporterPhone})</div>
              <div><strong className="text-[#111827]">Accused Party:</strong> {selectedComplaint.targetName} ({selectedComplaint.targetPhone})</div>
              <div><strong className="text-[#111827]">Complaint:</strong> {selectedComplaint.description}</div>
            </div>

            {/* In-Trip Audio Recording Indicator */}
            <div className="p-3 bg-slate-50 border border-[#E5E7EB] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#0F766E]" />
                <div>
                  <div className="text-xs font-bold text-[#111827]">In-Ride Encrypted Audio Log</div>
                  <div className="text-[10px] text-[#6B7280]">Duration: 14m 20s • Recorded with two-party consent</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAudioPlaying(!audioPlaying)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  audioPlaying ? 'bg-[#0F766E] text-white' : 'bg-slate-200 text-[#111827]'
                }`}
              >
                {audioPlaying ? 'Pause Audio' : 'Play Audio'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Action to Enforce Against Accused Party
              </label>
              <select
                value={complaintAction}
                onChange={(e) => setComplaintAction(e.target.value)}
                className="w-full p-2 text-xs rounded-xl bg-slate-50 text-[#111827] border border-[#E5E7EB] focus:outline-none focus:border-[#0F766E]"
              >
                <option value="warning">Issue In-App Formal Warning</option>
                <option value="fare_adjustment">Refund / Partial Fare Adjustment to Wallet</option>
                <option value="temporary_suspension">7-Day Account Suspension</option>
                <option value="permanent_ban">Permanent Ban / Blacklist</option>
                <option value="no_action">Dismiss as Unsubstantiated</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Resolution Summary & Communication Note
              </label>
              <textarea
                rows={3}
                required
                value={complaintResolution}
                onChange={(e) => setComplaintResolution(e.target.value)}
                placeholder="Explain the outcome recorded in user profile..."
                className="w-full p-2 text-xs rounded-xl bg-slate-50 text-[#111827] border border-[#E5E7EB] focus:outline-none focus:border-[#0F766E]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setShowComplaintModal(false)}
                className="px-3 py-1.5 text-xs text-[#6B7280] hover:text-[#111827]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-[#0F766E] hover:bg-[#064E3B] text-white cursor-pointer shadow-xs"
              >
                Submit Resolution
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
