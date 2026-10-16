import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Ride, Driver } from '../../types';
import {
  Send,
  UserCheck,
  X,
  Car,
  Clock,
  MapPin,
  Navigation,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  Phone,
  Search
} from 'lucide-react';
import { formatPKR } from '../../utils/i18n';

interface DispatchControlModalProps {
  ride: Ride;
  onClose: () => void;
}

export const DispatchControlModal: React.FC<DispatchControlModalProps> = ({ ride, onClose }) => {
  const {
    drivers,
    assignRideDriver,
    reassignRideDriver,
    cancelRideAssignment
  } = useAdmin();

  const [driverSearch, setDriverSearch] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [reassignReason, setReassignReason] = useState('Driver stuck in traffic (>15 min delay)');
  const [customReassignReason, setCustomReassignReason] = useState('');
  const [notes, setNotes] = useState('');

  // Cancel assignment confirmation
  const [isConfirmingCancelAssignment, setIsConfirmingCancelAssignment] = useState(false);
  const [cancelAssignmentReason, setCancelAssignmentReason] = useState('Driver requested re-matching');

  // Eligible drivers in the same city (or online anywhere if testing)
  const availableDrivers = drivers.filter((d) => {
    // City check: prioritize same city
    const sameCity = d.city.toLowerCase() === ride.city.toLowerCase();
    // Status check
    const isOnline = d.status === 'online' || d.status === 'available';

    if (driverSearch.trim()) {
      const q = driverSearch.toLowerCase();
      const matchName = d.name.toLowerCase().includes(q);
      const matchPlate = d.vehicle.plate.toLowerCase().includes(q);
      const matchCat = d.vehicle.category.toLowerCase().includes(q);
      return (matchName || matchPlate || matchCat) && d.id !== ride.driverId;
    }

    return sameCity && d.id !== ride.driverId;
  });

  const handleExecuteDispatch = () => {
    if (!selectedDriverId) return;

    if (ride.driverId) {
      // Reassignment
      const finalReason = reassignReason === 'Other' ? (customReassignReason || 'Manual dispatch') : reassignReason;
      reassignRideDriver(ride.id, selectedDriverId, finalReason);
    } else {
      // Direct new assignment
      assignRideDriver(ride.id, selectedDriverId, notes);
    }
    onClose();
  };

  const handleCancelAssignment = () => {
    cancelRideAssignment(ride.id, cancelAssignmentReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 shadow-2xl border border-[#E5E7EB] space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
              <Send className="w-4 h-4 text-[#0F766E]" />
              <span>Dispatch & Fleet Intervention: {ride.rideCode}</span>
            </h3>
            <p className="text-xs text-[#6B7280]">
              Manual driver assignment and tactical fleet rerouting for {ride.city} ({ride.category})
            </p>
          </div>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#111827] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Ride Summary Header */}
        <div className="p-3 bg-slate-50 border border-[#E5E7EB] rounded-xl text-xs space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-[#111827]">{ride.passengerName}</span>
              <span className="text-[#6B7280] text-[11px] ml-1.5 font-mono">({ride.passengerPhone})</span>
            </div>
            <div className="font-mono font-bold text-[#0F766E]">{formatPKR(ride.fare)}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#6B7280]">
            <div className="truncate">
              <strong className="text-[#111827]">Pickup:</strong> {ride.pickup.address}
            </div>
            <div className="truncate">
              <strong className="text-[#111827]">Dest:</strong> {ride.destination.address}
            </div>
          </div>
          {ride.driverName && (
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
              <span className="text-amber-800">
                Currently Assigned: <strong>{ride.driverName}</strong> ({ride.driverPlate})
              </span>
              <button
                onClick={() => setIsConfirmingCancelAssignment(true)}
                className="text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer"
              >
                Unassign Current Driver
              </button>
            </div>
          )}
        </div>

        {/* Cancel Assignment Subview */}
        {isConfirmingCancelAssignment ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-3 shrink-0">
            <div className="font-bold text-rose-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Confirm Driver Assignment Cancellation</span>
            </div>
            <p className="text-rose-700 text-[11px]">
              This will remove {ride.driverName} from this ride and return the passenger to the live matching pool.
            </p>
            <div className="space-y-1">
              <label className="font-bold text-rose-900">Reason for Unassigning:</label>
              <select
                value={cancelAssignmentReason}
                onChange={(e) => setCancelAssignmentReason(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-[#111827] focus:outline-none"
              >
                <option value="Driver requested re-matching">Driver requested re-matching</option>
                <option value="Driver vehicle broke down">Driver vehicle broke down</option>
                <option value="Driver offline / unresponsive">Driver offline / unresponsive</option>
                <option value="Passenger requested different vehicle category">Passenger requested different vehicle category</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setIsConfirmingCancelAssignment(false)}
                className="px-3 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelAssignment}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs"
              >
                Confirm Unassignment
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* If Reassigning, reason selector */}
            {ride.driverId && (
              <div className="space-y-1.5 shrink-0 text-xs">
                <label className="font-bold text-[#111827]">Reassignment Reason (Mandatory Audit):</label>
                <select
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="Driver stuck in traffic (>15 min delay)">Driver stuck in traffic (&gt;15 min delay)</option>
                  <option value="Driver unresponsive to dispatch calls">Driver unresponsive to dispatch calls</option>
                  <option value="Driver headed in wrong direction">Driver headed in wrong direction</option>
                  <option value="Passenger requested vehicle upgrade">Passenger requested vehicle upgrade</option>
                  <option value="Other">Other Specific Reason</option>
                </select>
                {reassignReason === 'Other' && (
                  <input
                    type="text"
                    placeholder="Describe specific justification..."
                    value={customReassignReason}
                    onChange={(e) => setCustomReassignReason(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5E7EB] text-[#111827] text-xs focus:outline-none"
                  />
                )}
              </div>
            )}

            {/* Candidate Drivers List */}
            <div className="space-y-2 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between shrink-0">
                <span className="text-xs font-bold text-[#111827]">
                  Available Nearby Fleet ({availableDrivers.length} Candidates)
                </span>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search candidate..."
                    value={driverSearch}
                    onChange={(e) => setDriverSearch(e.target.value)}
                    className="pl-7 pr-3 py-1 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none w-40"
                  />
                </div>
              </div>

              <div className="space-y-2 overflow-y-auto pr-1 flex-1">
                {availableDrivers.map((driver, idx) => {
                  const isSelected = selectedDriverId === driver.id;
                  const estimatedEta = 4 + (idx * 2);

                  return (
                    <div
                      key={driver.id}
                      onClick={() => setSelectedDriverId(driver.id)}
                      className={`p-3 rounded-xl border transition cursor-pointer text-xs flex items-center justify-between ${
                        isSelected
                          ? 'border-[#0F766E] bg-teal-50/50 ring-2 ring-[#0F766E]/20'
                          : 'border-[#E5E7EB] hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
                          {driver.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-[#111827] flex items-center gap-2">
                            <span>{driver.name}</span>
                            <span className="text-amber-500 font-bold text-[11px]">★ {driver.rating}</span>
                            {driver.vehicle.category === ride.category && (
                              <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">
                                Exact Match
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#6B7280]">
                            {driver.vehicle.model} • <strong className="font-mono text-[#0F766E]">{driver.vehicle.plate}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-[#111827] flex items-center gap-1 justify-end">
                          <Clock className="w-3.5 h-3.5 text-[#0F766E]" />
                          <span>~{estimatedEta} min away</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-bold">
                          {driver.city} • Available
                        </span>
                      </div>
                    </div>
                  );
                })}

                {availableDrivers.length === 0 && (
                  <div className="py-8 text-center text-xs text-[#6B7280]">
                    No available drivers in this sector right now. Try clearing filters.
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between shrink-0">
              <div className="text-xs text-[#6B7280]">
                {selectedDriverId ? '1 driver selected for dispatch' : 'Select a driver above'}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#6B7280] hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteDispatch}
                  disabled={!selectedDriverId}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0F766E] hover:bg-[#0d645e] disabled:opacity-50 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{ride.driverId ? 'Execute Reassignment' : 'Dispatch Selected Driver'}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
