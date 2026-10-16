import React from 'react';
import { Passenger, Driver } from '../../types';
import {
  User,
  Car,
  X,
  Phone,
  Mail,
  MapPin,
  Star,
  ShieldCheck,
  Calendar,
  Wallet,
  Clock,
  CheckCircle,
  Award
} from 'lucide-react';
import { formatPKR } from '../../utils/i18n';

interface OperationsProfileModalProps {
  type: 'passenger' | 'driver';
  data: Passenger | Driver;
  onClose: () => void;
}

export const OperationsProfileModal: React.FC<OperationsProfileModalProps> = ({
  type,
  data,
  onClose
}) => {
  if (!data) return null;
  const isDriver = type === 'driver';
  const driver = isDriver ? (data as Driver) : null;
  const passenger = !isDriver ? (data as Passenger) : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-[#E5E7EB] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base ${
                isDriver ? 'bg-teal-100 text-[#0F766E]' : 'bg-sky-100 text-sky-700'
              }`}
            >
              {isDriver ? <Car className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111827] flex items-center gap-1.5">
                <span>{data.name}</span>
                <span className="text-amber-500 font-bold text-xs">★ {data.rating}</span>
              </h3>
              <p className="text-xs text-[#6B7280]">
                {isDriver ? 'Registered GoLife Driver Partner' : 'Registered GoLife Passenger'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#111827] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 text-xs">
          <div className="p-3 bg-slate-50 border border-[#E5E7EB] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#6B7280] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone
              </span>
              <strong className="font-mono text-[#111827]">{data.phone}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6B7280] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
              </span>
              <span className="text-[#111827] truncate max-w-[200px]">{data.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6B7280] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> City
              </span>
              <span className="text-[#111827] font-bold">{data.city}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6B7280] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Joined
              </span>
              <span className="text-[#111827]">{data.joinedDate}</span>
            </div>
          </div>

          {/* Driver Specific Info */}
          {driver && (
            <div className="p-3 bg-teal-50/50 border border-teal-200 rounded-xl space-y-2">
              <div className="text-[11px] font-bold text-[#0F766E] uppercase tracking-wider">
                Vehicle & Fleet Telemetry
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280]">Vehicle:</span>
                <strong className="text-[#111827]">
                  {driver.vehicle.year} {driver.vehicle.model} ({driver.vehicle.color})
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280]">License Plate:</span>
                <strong className="font-mono text-[#0F766E]">{driver.vehicle.plate}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280]">Category:</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0F766E]/10 text-[#0F766E]">
                  {driver.vehicle.category}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280]">Operational Status:</span>
                <strong className="text-emerald-700 capitalize">
                  {driver.operationalStatus || driver.status}
                </strong>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-teal-200/60">
                <span className="text-[#6B7280]">Total Trips Completed:</span>
                <strong className="font-mono text-[#111827]">{driver.totalRides} trips</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280]">Driver Wallet Balance:</span>
                <strong className="font-mono text-[#0F766E]">{formatPKR(driver.walletBalance)}</strong>
              </div>
            </div>
          )}

          {/* Passenger Specific Info */}
          {passenger && (
            <div className="p-3 bg-sky-50/50 border border-sky-200 rounded-xl space-y-2">
              <div className="text-[11px] font-bold text-sky-800 uppercase tracking-wider">
                Passenger Profile & Wallet
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280]">Total Rides Taken:</span>
                <strong className="font-mono text-[#111827]">{passenger.totalRides} trips</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280]">Wallet Balance:</span>
                <strong className="font-mono text-sky-800">{formatPKR(passenger.walletBalance)}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280]">Status:</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {passenger.status.toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#E5E7EB] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#111827] text-xs font-bold transition cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
