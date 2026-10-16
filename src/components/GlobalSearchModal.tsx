import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Search,
  X,
  Users,
  Car,
  Clock,
  LifeBuoy,
  Truck,
  MapPin,
  ArrowRight,
  Shield,
  ShieldAlert,
  CreditCard
} from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    passengers,
    drivers,
    rides,
    complaints,
    transactions,
    supportTickets,
    freightOrders,
    cities,
    openUniversalDetail,
    setActiveTab,
    setSearchQuery: setAdminSearchQuery
  } = useAdmin();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce input to avoid thrashing CPU/data queries on every keystroke
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim().toLowerCase());
      setIsSearching(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (isGlobalSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setDebouncedQuery('');
    }
  }, [isGlobalSearchOpen]);

  // Keyboard shortcut Ctrl/Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(!isGlobalSearchOpen);
      }
      if (e.key === 'Escape' && isGlobalSearchOpen) {
        setIsGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGlobalSearchOpen, setIsGlobalSearchOpen]);

  if (!isGlobalSearchOpen) return null;

  // Minimum length check (at least 2 characters)
  const q = debouncedQuery.length >= 2 ? debouncedQuery : '';

  // Filtered categories
  const matchedPassengers = q
    ? passengers
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.phone.includes(q) ||
            (p.cnic && p.cnic.includes(q))
        )
        .slice(0, 3)
    : [];

  const matchedDrivers = q
    ? drivers
        .filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.phone.includes(q) ||
            d.vehiclePlate.toLowerCase().includes(q) ||
            (d.cnic && d.cnic.includes(q))
        )
        .slice(0, 3)
    : [];

  const matchedRides = q
    ? rides
        .filter(
          (r) =>
            r.id.toLowerCase().includes(q) ||
            (r.rideCode && r.rideCode.toLowerCase().includes(q)) ||
            r.passengerName.toLowerCase().includes(q) ||
            r.pickupAddress.toLowerCase().includes(q) ||
            r.dropoffAddress.toLowerCase().includes(q)
        )
        .slice(0, 3)
    : [];

  const matchedComplaints = q
    ? complaints
        .filter(
          (c) =>
            c.id.toLowerCase().includes(q) ||
            (c.complaintCode && c.complaintCode.toLowerCase().includes(q)) ||
            c.description.toLowerCase().includes(q) ||
            (c.passengerName && c.passengerName.toLowerCase().includes(q)) ||
            (c.driverName && c.driverName.toLowerCase().includes(q))
        )
        .slice(0, 3)
    : [];

  const matchedPayments = q
    ? transactions
        .filter(
          (t) =>
            t.id.toLowerCase().includes(q) ||
            (t.reference && t.reference.toLowerCase().includes(q)) ||
            t.description.toLowerCase().includes(q) ||
            (t.userName && t.userName.toLowerCase().includes(q))
        )
        .slice(0, 3)
    : [];

  const matchedTickets = q
    ? supportTickets
        .filter(
          (t) =>
            t.ticketNumber.toLowerCase().includes(q) ||
            t.subject.toLowerCase().includes(q) ||
            t.userName.toLowerCase().includes(q)
        )
        .slice(0, 3)
    : [];

  const matchedFreight = q
    ? freightOrders
        .filter(
          (f) =>
            f.orderCode.toLowerCase().includes(q) ||
            f.cargoType.toLowerCase().includes(q) ||
            f.customerName.toLowerCase().includes(q)
        )
        .slice(0, 3)
    : [];

  const matchedCities = q
    ? cities
        .filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.province.toLowerCase().includes(q)
        )
        .slice(0, 3)
    : [];

  const hasAnyResults =
    matchedPassengers.length > 0 ||
    matchedDrivers.length > 0 ||
    matchedRides.length > 0 ||
    matchedComplaints.length > 0 ||
    matchedPayments.length > 0 ||
    matchedTickets.length > 0 ||
    matchedFreight.length > 0 ||
    matchedCities.length > 0;

  const handleOpenDetail = (type: any, id: string) => {
    openUniversalDetail(type, id);
    setIsGlobalSearchOpen(false);
  };

  const handleNavigate = (tab: any, searchQueryParam?: string) => {
    setActiveTab(tab);
    if (searchQueryParam) {
      setAdminSearchQuery(searchQueryParam);
    }
    setIsGlobalSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 pt-20 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#0F766E] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search passengers, drivers, rides, tickets, freight, plates, CNIC..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 rounded border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-[480px] overflow-y-auto p-4 space-y-4">
          {!q && (
            <div className="py-8 text-center text-slate-400 text-xs">
              <p className="font-medium text-slate-600 mb-1">Global GoLife Operational Search</p>
              <p>Type any keyword, Pakistani CNIC, vehicle registration plate, or phone number.</p>
            </div>
          )}

          {q && !hasAnyResults && (
            <div className="py-8 text-center text-slate-400 text-xs">
              No matching records found for "{query}".
            </div>
          )}

          {/* Passengers */}
          {matchedPassengers.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                Passengers ({matchedPassengers.length})
              </div>
              <div className="space-y-1.5">
                {matchedPassengers.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleOpenDetail('passenger', p.id)}
                    className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-900">{p.name}</span>
                      <span className="text-slate-500 font-mono ml-2">{p.phone}</span>
                      {p.cnic && <span className="text-slate-400 font-mono ml-2">CNIC: {p.cnic}</span>}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drivers */}
          {matchedDrivers.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-blue-600" />
                Drivers & Vehicles ({matchedDrivers.length})
              </div>
              <div className="space-y-1.5">
                {matchedDrivers.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => handleOpenDetail('driver', d.id)}
                    className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-900">{d.name}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-mono font-bold text-slate-700 ml-2">
                        {d.vehiclePlate}
                      </span>
                      <span className="text-slate-500 font-mono ml-2">{d.phone}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rides */}
          {matchedRides.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                Rides ({matchedRides.length})
              </div>
              <div className="space-y-1.5">
                {matchedRides.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => handleOpenDetail('ride', r.id)}
                    className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-900">{r.rideCode || r.id}</span>
                      <span className="text-slate-700 ml-2">{r.pickupAddress} ➔ {r.dropoffAddress}</span>
                      <span className="text-slate-400 ml-2">Rs. {r.fare}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complaints */}
          {matchedComplaints.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                Complaints & Disciplinary Cases ({matchedComplaints.length})
              </div>
              <div className="space-y-1.5">
                {matchedComplaints.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleOpenDetail('complaint', c.id)}
                    className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-900">{c.complaintCode || c.id}</span>
                      <span className="text-slate-700 ml-2 font-medium">{c.category || c.type}</span>
                      <span className="text-slate-400 ml-2">({c.passengerName || c.driverName})</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payments / Transactions */}
          {matchedPayments.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                Payments & Wallet Ledger ({matchedPayments.length})
              </div>
              <div className="space-y-1.5">
                {matchedPayments.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleOpenDetail('payment', t.id)}
                    className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-900">{t.reference || t.id}</span>
                      <span className="text-slate-700 ml-2 font-medium">{t.description}</span>
                      <span className="text-emerald-600 font-bold ml-2">Rs. {t.amount}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Support Tickets */}
          {matchedTickets.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <LifeBuoy className="w-3.5 h-3.5 text-teal-600" />
                Support Tickets ({matchedTickets.length})
              </div>
              <div className="space-y-1.5">
                {matchedTickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleNavigate('support', t.ticketNumber)}
                    className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-900">{t.ticketNumber}</span>
                      <span className="text-slate-700 ml-2 font-medium">{t.subject}</span>
                      <span className="text-slate-400 ml-2">({t.userName})</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Freight Orders */}
          {matchedFreight.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-600" />
                Freight Dispatches ({matchedFreight.length})
              </div>
              <div className="space-y-1.5">
                {matchedFreight.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => handleNavigate('freight', f.orderCode)}
                    className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-900">{f.orderCode}</span>
                      <span className="text-slate-700 ml-2">{f.cargoType} ({f.vehicleType})</span>
                      <span className="text-slate-400 ml-2">{f.pickupCity} ➔ {f.destinationCity}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cities */}
          {matchedCities.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                Operational Cities ({matchedCities.length})
              </div>
              <div className="space-y-1.5">
                {matchedCities.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleNavigate('cities', c.name)}
                    className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{c.name}</span>
                      <span className="text-slate-500 ml-2">{c.province}</span>
                      <span className="text-slate-400 ml-2">{c.categories.length} categories active</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Use Cmd/Ctrl + K to open search anytime</span>
          <button
            onClick={() => setIsGlobalSearchOpen(false)}
            className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
