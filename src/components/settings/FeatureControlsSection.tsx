import React, { useState, useMemo } from 'react';
import { FeatureControl, FeatureCategory } from '../../types';
import {
  ToggleLeft,
  ToggleRight,
  Search,
  Filter,
  Layers,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Lock,
  SlidersHorizontal,
  Info,
  Car,
  CreditCard,
  TrendingUp,
  ShieldCheck,
  Radio,
  Cpu
} from 'lucide-react';

interface FeatureControlsSectionProps {
  features: FeatureControl[];
  onToggleFeature: (featureId: string, newStatus: 'active' | 'inactive', reason: string) => void;
  onUpdateFeatureScope: (featureId: string, cityScope: string[], serviceCategoryScope: string[], adminNote: string) => void;
  canManageFeatures: boolean;
  availableCities: string[];
}

export const FeatureControlsSection: React.FC<FeatureControlsSectionProps> = ({
  features = [],
  onToggleFeature,
  onUpdateFeatureScope,
  canManageFeatures,
  availableCities
}) => {
  const safeFeatures = features || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FeatureCategory | 'all'>('all');
  const [selectedScopeFilter, setSelectedScopeFilter] = useState<'all' | 'global' | 'restricted'>('all');
  
  // Scope editor state
  const [editingFeature, setEditingFeature] = useState<FeatureControl | null>(null);
  const [scopeCityList, setScopeCityList] = useState<string[]>([]);
  const [scopeCategoryList, setScopeCategoryList] = useState<string[]>([]);
  const [scopeNote, setScopeNote] = useState('');

  // Confirmation for toggling
  const [confirmToggleTarget, setConfirmToggleTarget] = useState<{
    feature: FeatureControl;
    newStatus: 'active' | 'inactive';
  } | null>(null);
  const [toggleReason, setToggleReason] = useState('');

  const categories: { id: FeatureCategory | 'all'; label: string; icon: any }[] = [
    { id: 'all', label: 'All Modules', icon: Layers },
    { id: 'core_mobility', label: 'Core Mobility', icon: Car },
    { id: 'payments', label: 'Payments & Wallets', icon: CreditCard },
    { id: 'growth', label: 'Growth & Loyalty', icon: TrendingUp },
    { id: 'safety', label: 'Safety & Emergency', icon: ShieldCheck },
    { id: 'operations', label: 'Operations & Comms', icon: Radio },
    { id: 'automation', label: 'Automation & AI', icon: Cpu }
  ];

  const filteredFeatures = useMemo(() => {
    return safeFeatures.filter((feat) => {
      // Category filter
      if (selectedCategory !== 'all' && feat.category !== selectedCategory) {
        return false;
      }
      // Scope filter
      if (selectedScopeFilter === 'global' && feat.availabilityScope !== 'global') {
        return false;
      }
      if (selectedScopeFilter === 'restricted' && feat.availabilityScope === 'global') {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = feat.name.toLowerCase().includes(query);
        const matchUrdu = feat.nameUrdu?.toLowerCase().includes(query);
        const matchDesc = feat.description.toLowerCase().includes(query);
        const matchCities = feat.cityScope.some((c) => c.toLowerCase().includes(query));
        if (!matchName && !matchUrdu && !matchDesc && !matchCities) {
          return false;
        }
      }
      return true;
    });
  }, [safeFeatures, selectedCategory, selectedScopeFilter, searchQuery]);

  const activeCount = safeFeatures.filter((f) => f.status === 'active').length;
  const inactiveCount = safeFeatures.length - activeCount;

  const handleOpenScopeEditor = (feat: FeatureControl) => {
    setEditingFeature(feat);
    setScopeCityList([...feat.cityScope]);
    setScopeCategoryList([...feat.serviceCategoryScope]);
    setScopeNote(feat.adminNote || '');
  };

  const handleSaveScope = () => {
    if (!editingFeature) return;
    onUpdateFeatureScope(
      editingFeature.id,
      scopeCityList.length === 0 ? ['all'] : scopeCityList,
      scopeCategoryList.length === 0 ? ['all'] : scopeCategoryList,
      scopeNote
    );
    setEditingFeature(null);
  };

  const handleConfirmToggle = () => {
    if (!confirmToggleTarget) return;
    onToggleFeature(confirmToggleTarget.feature.id, confirmToggleTarget.newStatus, toggleReason || 'Feature toggle update');
    setConfirmToggleTarget(null);
    setToggleReason('');
  };

  const allServiceCategories = ['GoMoto', 'GoAuto', 'GoMini', 'GoRide', 'GoComfort', 'GoFreight', 'GoIntercity'];

  return (
    <div className="space-y-6">
      {/* 1. Feature Stats & Header Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs font-black text-slate-900">
              {activeCount} Active Modules
            </span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-400" />
            <span className="text-xs font-bold text-slate-500">
              {inactiveCount} Disabled
            </span>
          </div>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-500 font-medium">
            32 Total Controllable Features
          </span>
        </div>

        {/* Search & Scope Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by feature name, keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-400 w-52"
            />
          </div>

          <select
            value={selectedScopeFilter}
            onChange={(e) => setSelectedScopeFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
          >
            <option value="all">All Scopes</option>
            <option value="global">Global (All Cities)</option>
            <option value="restricted">City / Category Restricted</option>
          </select>
        </div>
      </div>

      {/* 2. Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFeatures.map((feat) => {
          const isActive = feat.status === 'active';
          const hasMissingDependency =
            isActive &&
            feat.dependencies &&
            feat.dependencies.some((depId) => {
              const dep = features.find((f) => f.id === depId);
              return !dep || dep.status !== 'active';
            });

          return (
            <div
              key={feat.id}
              className={`p-4 rounded-2xl border transition relative flex flex-col justify-between ${
                isActive
                  ? 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                  : 'bg-slate-50/70 border-slate-200 opacity-80'
              }`}
            >
              <div>
                {/* Card Header: Name + Toggle */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-black text-slate-950 truncate">{feat.name}</h4>
                      {feat.nameUrdu && (
                        <span className="text-[10px] font-semibold text-slate-500" dir="rtl">
                          ({feat.nameUrdu})
                        </span>
                      )}
                    </div>
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                      {feat.category.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Switch Toggle */}
                  <button
                    type="button"
                    disabled={!canManageFeatures}
                    onClick={() =>
                      setConfirmToggleTarget({
                        feature: feat,
                        newStatus: isActive ? 'inactive' : 'active'
                      })
                    }
                    className={`cursor-pointer transition p-1 rounded-xl shrink-0 ${
                      isActive
                        ? 'text-emerald-600 hover:text-emerald-700'
                        : 'text-slate-400 hover:text-slate-500'
                    } disabled:opacity-50`}
                    title={isActive ? 'Click to Disable Feature' : 'Click to Enable Feature'}
                  >
                    {isActive ? (
                      <ToggleRight className="w-7 h-7" />
                    ) : (
                      <ToggleLeft className="w-7 h-7" />
                    )}
                  </button>
                </div>

                {/* Description */}
                <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                  {feat.description}
                </p>

                {/* Dependency Warning */}
                {hasMissingDependency && (
                  <div className="mb-3 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                    <span>Prerequisite dependency is currently offline!</span>
                  </div>
                )}
              </div>

              {/* Card Footer: Scope Tag & Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-[10px]">
                <div className="flex items-center gap-1.5 text-slate-600 truncate">
                  <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                  <span className="truncate font-semibold">
                    {feat.cityScope.includes('all')
                      ? 'Global (All Cities)'
                      : feat.cityScope.join(', ')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenScopeEditor(feat)}
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-950 font-bold text-slate-700 transition cursor-pointer shrink-0 flex items-center gap-1"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Edit Scope</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scope Editor Modal */}
      {editingFeature && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-black text-slate-900 text-sm">
                  Configure Scope: {editingFeature.name}
                </h4>
                <p className="text-xs text-slate-500">
                  Control operational availability across cities and vehicle categories.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-950 border border-amber-300">
                {editingFeature.category.replace('_', ' ')}
              </span>
            </div>

            {/* City Scope Multi-Select */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                City Availability
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 rounded-xl border border-slate-200 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setScopeCityList(['all'])}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    scopeCityList.includes('all')
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  All Cities (Pakistan Global)
                </button>
                {availableCities.map((city) => {
                  const isChecked = !scopeCityList.includes('all') && scopeCityList.includes(city);
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        let next = scopeCityList.filter((c) => c !== 'all');
                        if (isChecked) {
                          next = next.filter((c) => c !== city);
                          if (next.length === 0) next = ['all'];
                        } else {
                          next.push(city);
                        }
                        setScopeCityList(next);
                      }}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        isChecked
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      {city}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vehicle Category Multi-Select */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Vehicle / Service Category Availability
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-slate-200 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setScopeCategoryList(['all'])}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    scopeCategoryList.includes('all')
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  All Vehicle Classes
                </button>
                {allServiceCategories.map((cat) => {
                  const isChecked = !scopeCategoryList.includes('all') && scopeCategoryList.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        let next = scopeCategoryList.filter((c) => c !== 'all');
                        if (isChecked) {
                          next = next.filter((c) => c !== cat);
                          if (next.length === 0) next = ['all'];
                        } else {
                          next.push(cat);
                        }
                        setScopeCategoryList(next);
                      }}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        isChecked
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Admin Note */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Operational Note / Rollout Stage
              </label>
              <input
                type="text"
                placeholder="e.g. Rolled out for Lahore and Islamabad pilot phase"
                value={scopeNote}
                onChange={(e) => setScopeNote(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingFeature(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveScope}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black shadow-xs"
              >
                Apply Scope Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Toggle */}
      {confirmToggleTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <span className={`p-2.5 rounded-xl ${confirmToggleTarget.newStatus === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                <Info className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-black text-slate-900 text-sm">
                  {confirmToggleTarget.newStatus === 'active' ? 'Enable' : 'Disable'} {confirmToggleTarget.feature.name}?
                </h4>
                <p className="text-xs text-slate-500">Super Admin Feature Switch</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {confirmToggleTarget.newStatus === 'active'
                ? `Activating this module will make it available to end users according to its configured city and vehicle class scope.`
                : `Disabling this module will immediately take it offline for all mobile clients. Any active user interactions may be gracefully terminated.`}
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for State Change <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Scheduled feature activation for Lahore pilot"
                value={toggleReason}
                onChange={(e) => setToggleReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmToggleTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmToggle}
                disabled={!toggleReason.trim()}
                className={`px-4 py-2 rounded-xl font-black text-xs shadow-xs disabled:opacity-50 ${
                  confirmToggleTarget.newStatus === 'active'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                Confirm {confirmToggleTarget.newStatus === 'active' ? 'Enable' : 'Disable'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
