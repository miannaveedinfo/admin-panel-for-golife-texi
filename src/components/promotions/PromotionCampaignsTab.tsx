import React, { useState } from 'react';
import { PromotionCampaign } from '../../types';
import { useAdmin } from '../../context/AdminContext';
import { formatPKR } from '../../utils/i18n';
import {
  Layers,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Users,
  Target,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  XCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  MapPin,
  Tag
} from 'lucide-react';

export const PromotionCampaignsTab: React.FC = () => {
  const {
    promotionCampaigns,
    createPromotionCampaign,
    updatePromotionCampaign,
    toggleCampaignStatus
  } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<PromotionCampaign | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [campaignType, setCampaignType] = useState<PromotionCampaign['campaignType']>('passenger_acquisition');
  const [targetAudience, setTargetAudience] = useState<PromotionCampaign['targetAudience']>('all_passengers');
  const [city, setCity] = useState('All');
  const [serviceCategories, setServiceCategories] = useState('All');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-10-31');
  const [totalBudget, setTotalBudget] = useState('500000');
  const [maxDiscountBudget, setMaxDiscountBudget] = useState('300000');
  const [maxRewardBudget, setMaxRewardBudget] = useState('200000');
  const [maxUsers, setMaxUsers] = useState('5000');
  const [maxUses, setMaxUses] = useState('10000');
  const [status, setStatus] = useState<PromotionCampaign['status']>('active');

  const handleOpenCreate = () => {
    setName('');
    setDescription('');
    setCampaignType('passenger_acquisition');
    setTargetAudience('all_passengers');
    setCity('All');
    setServiceCategories('All');
    setStartDate('2026-09-01');
    setEndDate('2026-10-31');
    setTotalBudget('500000');
    setMaxDiscountBudget('300000');
    setMaxRewardBudget('200000');
    setMaxUsers('5000');
    setMaxUses('10000');
    setStatus('active');
    setEditingCampaign(null);
    setShowCreateModal(true);
  };

  const handleOpenEdit = (camp: PromotionCampaign) => {
    setEditingCampaign(camp);
    setName(camp.name);
    setDescription(camp.description || '');
    setCampaignType(camp.campaignType);
    setTargetAudience(camp.targetAudience);
    setCity(camp.city);
    setServiceCategories(camp.serviceCategories.join(', '));
    setStartDate(camp.startDate);
    setEndDate(camp.endDate);
    setTotalBudget(String(camp.totalBudget));
    setMaxDiscountBudget(String(camp.maxDiscountBudget || 0));
    setMaxRewardBudget(String(camp.maxRewardBudget || 0));
    setMaxUsers(String(camp.maxUsers || 0));
    setMaxUses(String(camp.maxUses || 0));
    setStatus(camp.status);
    setShowCreateModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      description: description.trim(),
      campaignType,
      targetAudience,
      city,
      serviceCategories: serviceCategories.split(',').map((s) => s.trim()),
      startDate,
      endDate,
      totalBudget: Number(totalBudget),
      maxDiscountBudget: Number(maxDiscountBudget),
      maxRewardBudget: Number(maxRewardBudget),
      maxUsers: Number(maxUsers),
      maxUses: Number(maxUses),
      status
    };

    if (editingCampaign) {
      updatePromotionCampaign(editingCampaign.id, payload, 'Admin modified campaign');
    } else {
      createPromotionCampaign(payload, 'Admin launched campaign');
    }

    setShowCreateModal(false);
  };

  const filteredCampaigns = promotionCampaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCity = filterCity === 'All' || c.city === filterCity || c.city === 'All';
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;

    return matchesSearch && matchesCity && matchesStatus;
  });

  const totalBudgetAgg = promotionCampaigns.reduce((sum, c) => sum + c.totalBudget, 0);
  const totalSpentAgg = promotionCampaigns.reduce((sum, c) => sum + c.spentBudget, 0);
  const activeCount = promotionCampaigns.filter((c) => c.status === 'active').length;

  return (
    <div id="section-promotion-campaigns" className="space-y-5">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" />
            Promotional Campaigns & Budget Governance
          </h2>
          <p className="text-xs text-[#6B7280]">
            Track multi-channel growth programs, target audiences, and live budget burn pacing
          </p>
        </div>

        <button
          id="btn-create-campaign-modal"
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Launch New Campaign
        </button>
      </div>

      {/* Aggregate KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
            Total Allocated Budget
          </div>
          <div className="text-lg font-extrabold text-[#111827] font-mono mt-1">
            {formatPKR(totalBudgetAgg)}
          </div>
          <div className="text-[11px] text-[#6B7280] mt-0.5">Approved growth spend</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
            Disbursed / Spent
          </div>
          <div className="text-lg font-extrabold text-amber-700 font-mono mt-1">
            {formatPKR(totalSpentAgg)}
          </div>
          <div className="text-[11px] text-[#6B7280] mt-0.5">
            {Math.round((totalSpentAgg / (totalBudgetAgg || 1)) * 100)}% budget utilized
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
            Remaining Growth Pool
          </div>
          <div className="text-lg font-extrabold text-emerald-700 font-mono mt-1">
            {formatPKR(Math.max(0, totalBudgetAgg - totalSpentAgg))}
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Available for redemptions</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
            Active Campaigns
          </div>
          <div className="text-lg font-extrabold text-blue-700 font-mono mt-1">
            {activeCount} Running
          </div>
          <div className="text-[11px] text-[#6B7280] mt-0.5">Across Pakistan territory</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E5E7EB]">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              id="input-search-campaigns"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search campaign name..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            id="select-campaign-city"
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Cities</option>
            <option value="Lahore">Lahore</option>
            <option value="Karachi">Karachi</option>
            <option value="Islamabad">Islamabad</option>
            <option value="Rawalpindi">Rawalpindi</option>
            <option value="Multan">Multan</option>
            <option value="Faisalabad">Faisalabad</option>
          </select>

          <select
            id="select-campaign-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="scheduled">Scheduled</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <span className="text-xs text-[#6B7280]">
          Showing {filteredCampaigns.length} campaigns
        </span>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCampaigns.map((camp) => {
          const spent = camp.spentBudget || 0;
          const total = camp.totalBudget || 1;
          const percent = Math.min(Math.round((spent / total) * 100), 100);
          const remaining = Math.max(0, total - spent);

          return (
            <div
              key={camp.id}
              id={`campaign-card-${camp.id}`}
              className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition space-y-4"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-[#4B5563]">
                      {(camp.campaignType || (camp as any).type || 'Campaign').replace(/_/g, ' ')}
                    </span>
                    <h3 className="text-sm font-bold text-[#111827] mt-1.5">{camp.name}</h3>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      camp.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : camp.status === 'paused'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : camp.status === 'scheduled'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-[#6B7280] border border-slate-200'
                    }`}
                  >
                    {camp.status}
                  </span>
                </div>

                <p className="text-xs text-[#6B7280] line-clamp-2">{camp.description}</p>

                {/* Scope & Metadata Tags */}
                <div className="flex flex-wrap gap-2 text-[11px] text-[#4B5563]">
                  <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                    <MapPin className="w-3 h-3 text-amber-600" />
                    {camp.city}
                  </span>
                  <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                    <Target className="w-3 h-3 text-blue-600" />
                    {(camp.targetAudience || (camp as any).audience || 'all').replace(/_/g, ' ')}
                  </span>
                  <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {camp.startDate} to {camp.endDate}
                  </span>
                </div>

                {/* Budget Pacing Progress */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#374151]">Budget Pacing</span>
                    <span className="font-bold text-[#111827] font-mono">
                      {formatPKR(spent)} / {formatPKR(total)} ({percent}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        percent >= 90
                          ? 'bg-rose-500'
                          : percent >= 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-1 text-[11px]">
                    <div>
                      <div className="text-[#6B7280]">Remaining</div>
                      <div className="font-bold text-[#111827] font-mono mt-0.5">
                        {formatPKR(remaining)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#6B7280]">Reach / Users</div>
                      <div className="font-bold text-[#111827] font-mono mt-0.5">
                        {camp.currentUsersCount.toLocaleString()} / {camp.maxUsers?.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#6B7280]">Redemptions</div>
                      <div className="font-bold text-[#111827] font-mono mt-0.5">
                        {camp.currentUsesCount.toLocaleString()} / {camp.maxUses?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {camp.status === 'active' ? (
                    <button
                      id={`btn-pause-campaign-${camp.id}`}
                      onClick={() => toggleCampaignStatus(camp.id, 'paused', 'Admin paused campaign')}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <PauseCircle className="w-3.5 h-3.5" />
                      Pause
                    </button>
                  ) : (
                    <button
                      id={`btn-resume-campaign-${camp.id}`}
                      onClick={() => toggleCampaignStatus(camp.id, 'active', 'Admin resumed campaign')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      Activate
                    </button>
                  )}

                  {camp.status !== 'completed' && camp.status !== 'cancelled' && (
                    <button
                      id={`btn-end-campaign-${camp.id}`}
                      onClick={() => toggleCampaignStatus(camp.id, 'completed', 'Admin ended campaign')}
                      className="px-2.5 py-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition text-xs cursor-pointer"
                    >
                      End
                    </button>
                  )}
                </div>

                <button
                  id={`btn-edit-campaign-${camp.id}`}
                  onClick={() => handleOpenEdit(camp)}
                  className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#374151] font-semibold text-xs transition cursor-pointer"
                >
                  Configure
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Campaign Modal */}
      {showCreateModal && (
        <div
          id="modal-campaign-create"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#E5E7EB] space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-[#111827]">
                  {editingCampaign ? 'Configure Campaign' : 'Launch New Promotional Campaign'}
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-[#6B7280] hover:text-[#111827]"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#374151] mb-1">Campaign Title*</label>
                <input
                  id="input-campaign-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Autumn City Expansion 2026"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1">Description</label>
                <textarea
                  id="input-campaign-desc"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Campaign marketing goals and target metrics..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Campaign Type</label>
                  <select
                    id="select-campaign-type"
                    value={campaignType}
                    onChange={(e) => setCampaignType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827] focus:outline-none focus:border-amber-500"
                  >
                    <option value="passenger_acquisition">Passenger Acquisition</option>
                    <option value="driver_incentive">Captain Incentive</option>
                    <option value="city_launch">City Launch Blitz</option>
                    <option value="festival_special">Festival & Holiday Special</option>
                    <option value="seasonal_retention">Seasonal Retention</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Audience Target</label>
                  <select
                    id="select-campaign-audience"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827] focus:outline-none focus:border-amber-500"
                  >
                    <option value="all_passengers">All Passengers</option>
                    <option value="new_passengers">New Passengers (0 rides)</option>
                    <option value="inactive_passengers">Inactive / Churned (30+ days)</option>
                    <option value="high_frequency_passengers">GoLife VIP Riders</option>
                    <option value="all_drivers">All Verified Captains</option>
                    <option value="new_drivers">Newly Onboarded Captains</option>
                    <option value="high_performing_drivers">Top Rated Captains (&gt;4.8)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">City</label>
                  <select
                    id="select-campaign-form-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827] focus:outline-none focus:border-amber-500"
                  >
                    <option value="All">All Pakistan</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Multan">Multan</option>
                    <option value="Faisalabad">Faisalabad</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Start Date</label>
                  <input
                    id="input-campaign-start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827] focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">End Date</label>
                  <input
                    id="input-campaign-end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827] focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Budget Allocation Controls (Section 15) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Total Budget (PKR)*
                  </label>
                  <input
                    id="input-campaign-total-budget"
                    type="number"
                    min="10000"
                    required
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827] font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Max Discount Pool
                  </label>
                  <input
                    id="input-campaign-discount-pool"
                    type="number"
                    value={maxDiscountBudget}
                    onChange={(e) => setMaxDiscountBudget(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827] font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Max Reward Pool
                  </label>
                  <input
                    id="input-campaign-reward-pool"
                    type="number"
                    value={maxRewardBudget}
                    onChange={(e) => setMaxRewardBudget(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827] font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Max Users Cap</label>
                  <input
                    id="input-campaign-max-users"
                    type="number"
                    value={maxUsers}
                    onChange={(e) => setMaxUsers(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827] font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Max Total Uses</label>
                  <input
                    id="input-campaign-max-uses"
                    type="number"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827] font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#374151] font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-campaign"
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  {editingCampaign ? 'Save Campaign' : 'Publish Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
