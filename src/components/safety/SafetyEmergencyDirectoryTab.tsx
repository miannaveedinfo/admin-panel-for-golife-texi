import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { SafetyEmergencyContactConfig } from '../../types';
import {
  PhoneCall,
  Shield,
  Plus,
  Edit2,
  Check,
  Building2,
  MapPin,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  AlertCircle
} from 'lucide-react';

export const SafetyEmergencyDirectoryTab: React.FC = () => {
  const {
    safetyEmergencyContacts = [],
    updateEmergencyContact,
    addEmergencyContact,
    showToast
  } = useAdmin();

  const safeContacts = safetyEmergencyContacts || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState('all');
  const [editingContactId, setEditingContactId] = useState<string | null>(null);

  // Form states for edit
  const [editServiceName, setEditServiceName] = useState('');
  const [editContactNumber, setEditContactNumber] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editActive, setEditActive] = useState(true);

  // New Contact Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCity, setNewCity] = useState('Lahore');
  const [newServiceName, setNewServiceName] = useState('');
  const [newContactNumber, setNewContactNumber] = useState('');
  const [newServiceType, setNewServiceType] = useState<
    'police' | 'ambulance' | 'traffic' | 'internal_dispatch' | 'women_helpline'
  >('police');
  const [newNotes, setNewNotes] = useState('');

  const cities = ['all', 'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta'];

  const filteredContacts = safeContacts.filter((c) => {
    const matchCity = selectedCityFilter === 'all' || c.city.toLowerCase() === selectedCityFilter.toLowerCase() || c.city.toLowerCase() === 'all';
    const query = searchQuery.toLowerCase();
    const matchSearch =
      !searchQuery ||
      c.serviceName.toLowerCase().includes(query) ||
      (c.name && c.name.toLowerCase().includes(query)) ||
      c.contactNumber.includes(query) ||
      (c.dialNumber && c.dialNumber.includes(query)) ||
      c.notes.toLowerCase().includes(query);
    return matchCity && matchSearch;
  });

  const handleStartEdit = (c: SafetyEmergencyContactConfig) => {
    setEditingContactId(c.id);
    setEditServiceName(c.serviceName || c.name || '');
    setEditContactNumber(c.contactNumber || c.dialNumber || '');
    setEditNotes(c.notes || '');
    setEditActive(c.active !== false);
  };

  const handleSaveEdit = (contactId: string) => {
    updateEmergencyContact(contactId, {
      serviceName: editServiceName,
      contactNumber: editContactNumber,
      notes: editNotes,
      active: editActive
    });
    setEditingContactId(null);
  };

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim() || !newContactNumber.trim()) {
      showToast('Please fill in service title and contact number', 'warning');
      return;
    }

    addEmergencyContact({
      city: newCity,
      serviceName: newServiceName.trim(),
      name: newServiceName.trim(),
      contactNumber: newContactNumber.trim(),
      dialNumber: newContactNumber.trim(),
      serviceType: newServiceType,
      active: true,
      notes: newNotes.trim() || 'Verified regional emergency agency'
    });

    setShowAddModal(false);
    setNewServiceName('');
    setNewContactNumber('');
    setNewNotes('');
  };

  const getServiceTypeBadge = (type: string) => {
    switch (type) {
      case 'police':
        return { label: 'Law Enforcement', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'ambulance':
        return { label: 'Medical / Rescue', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'traffic':
        return { label: 'Traffic & Highway', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'women_helpline':
        return { label: 'Women Protection', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      default:
        return { label: 'Internal Ops', color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>Emergency Services Directory & Regional Agency Hotlines</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configured emergency services, Rescue 1122 medical integration, Police 15 control rooms, and PSCA links.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Emergency Service</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search emergency services, hotlines, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-amber-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
          {cities.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCityFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCityFilter === c
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {c === 'all' ? 'All Jurisdictions' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => {
          const typeBadge = getServiceTypeBadge(contact.serviceType);
          const isEditing = editingContactId === contact.id;

          return (
            <div
              key={contact.id}
              className={`bg-white border rounded-xl p-4 shadow-xs transition ${
                contact.active ? 'border-slate-200 hover:border-slate-300' : 'border-slate-200 opacity-60 bg-slate-50'
              }`}
            >
              {isEditing ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Service Title</label>
                    <input
                      type="text"
                      value={editServiceName}
                      onChange={(e) => setEditServiceName(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Direct Dial Hotline</label>
                    <input
                      type="text"
                      value={editContactNumber}
                      onChange={(e) => setEditContactNumber(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Agency Notes / Protocol</label>
                    <input
                      type="text"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`active-${contact.id}`}
                      checked={editActive}
                      onChange={(e) => setEditActive(e.target.checked)}
                      className="rounded text-amber-600"
                    />
                    <label htmlFor={`active-${contact.id}`} className="text-xs text-slate-700 font-medium">
                      Active Hotline in Directory
                    </label>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setEditingContactId(null)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(contact.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${typeBadge.color}`}>
                        {typeBadge.label}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{contact.city === 'all' ? 'Nationwide' : contact.city}</span>
                        </span>
                        <button
                          onClick={() => handleStartEdit(contact)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition"
                          title="Edit Service"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {contact.serviceName || contact.name}
                    </h4>

                    <div className="mt-2.5 flex items-baseline gap-2">
                      <div className="text-lg font-mono font-bold text-slate-900 flex items-center gap-1.5">
                        <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{contact.contactNumber || contact.dialNumber}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {contact.notes || 'Official government emergency dispatch contact.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      {contact.active ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-medium text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Operational</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400 font-medium text-[11px]">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => showToast(`Initiating direct dispatch protocol to ${contact.serviceName || contact.name} (${contact.contactNumber || contact.dialNumber})`, 'info')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px] transition"
                    >
                      Quick Dial
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ADD EMERGENCY SERVICE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-5 animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-600" />
              <span>Register Emergency Agency Service</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add verified emergency hotlines for Rescue 1122, Police 15, or provincial authorities.
            </p>

            <form onSubmit={handleCreateContact} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Jurisdiction City</label>
                <select
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="all">Nationwide / All Cities</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Multan">Multan</option>
                  <option value="Peshawar">Peshawar</option>
                  <option value="Quetta">Quetta</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Service Name / Agency</label>
                <input
                  type="text"
                  placeholder="e.g., Sindh Police Madadgar 15"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Hotline Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 15 or 042-99000000"
                    value={newContactNumber}
                    onChange={(e) => setNewContactNumber(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Service Type</label>
                  <select
                    value={newServiceType}
                    onChange={(e: any) => setNewServiceType(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="police">Police 15</option>
                    <option value="ambulance">Rescue / Ambulance 1122</option>
                    <option value="traffic">Traffic / Highway 130</option>
                    <option value="women_helpline">Women Protection</option>
                    <option value="internal_dispatch">Internal Ops Dispatch</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Operating Protocol & Dispatch Notes</label>
                <textarea
                  rows={2}
                  placeholder="Provide dispatch protocol, local station notes, or desk contact..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow-xs transition"
                >
                  Register Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
