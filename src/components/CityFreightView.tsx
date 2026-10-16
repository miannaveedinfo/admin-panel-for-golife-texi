import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { CityConfig, FreightOrder, RideCategory } from '../types';
import { formatPKR } from '../utils/i18n';
import { BackToDashboardButton } from './common/BackToDashboardButton';
import {
  MapPin,
  Truck,
  Building2,
  CheckCircle2,
  XCircle,
  Plus,
  Scale,
  Package,
  Layers,
  Phone,
  Calendar,
  AlertTriangle,
  ArrowRight,
  FileText,
  Printer,
  Users,
  ShieldCheck,
  Clock,
  QrCode
} from 'lucide-react';

export const CityFreightView: React.FC<{ initialTab?: 'cities' | 'freight' }> = ({ initialTab }) => {
  const { activeTab: globalTab, cities, freightOrders, toggleCityStatus, addCity } = useAdmin();

  const [activeTab, setActiveTab] = useState<'cities' | 'freight'>(() =>
    initialTab || (globalTab === 'freight' ? 'freight' : 'cities')
  );

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    } else if (globalTab === 'freight' || globalTab === 'cities') {
      setActiveTab(globalTab);
    }
  }, [globalTab, initialTab]);

  // Modal for Add City
  const [showAddCityModal, setShowAddCityModal] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [newCityProvince, setNewCityProvince] = useState('Punjab');
  const [newCityRadius, setNewCityRadius] = useState('30');
  const [newCityFareAdj, setNewCityFareAdj] = useState('0');
  const [newCityLat, setNewCityLat] = useState('31.5204');
  const [newCityLng, setNewCityLng] = useState('74.3587');

  // Modal for Bilty / Waybill Generation
  const [selectedWaybillOrder, setSelectedWaybillOrder] = useState<FreightOrder | null>(null);

  const handleCreateCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName) return;

    const newCity: CityConfig = {
      id: `city-${Date.now()}`,
      name: newCityName,
      province: newCityProvince,
      active: true,
      allowedCategories: ['GoMoto', 'GoRide', 'GoMini', 'GoAuto', 'GoComfort', 'GoFreight'],
      geofenceRadiusKm: Number(newCityRadius),
      baseFareAdjustment: Number(newCityFareAdj),
      centerCoords: {
        lat: Number(newCityLat),
        lng: Number(newCityLng)
      }
    };

    addCity(newCity);
    setShowAddCityModal(false);
    setNewCityName('');
  };

  return (
    <div className="space-y-6 text-[#111827]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackToDashboardButton />
          <div>
            <h1 className="text-xl font-bold text-[#111827] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#0F766E]" />
              Cities, Geo-Fencing & Freight Logistics
            </h1>
            <p className="text-xs text-[#6B7280]">
              Configure operational territories, category boundaries and heavy commercial freight logistics across Pakistan
            </p>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('cities')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'cities'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-slate-50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Operational Cities ({cities.length})
          </button>

          <button
            onClick={() => setActiveTab('freight')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'freight'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-slate-50'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Freight & Cargo Hub ({freightOrders.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Cities & Geo-Fencing Configuration */}
      {activeTab === 'cities' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-3.5 rounded-2xl border border-[#E5E7EB]">
            <div>
              <span className="font-bold text-xs text-[#111827]">All Pakistan Metropolitan Hubs</span>
              <p className="text-[11px] text-[#6B7280]">Manage boundary geofencing, radius caps and category allowances</p>
            </div>
            <button
              onClick={() => setShowAddCityModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#0F766E] hover:bg-[#064E3B] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Operational City
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cities.map((city) => (
              <div
                key={city.id}
                className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#0F766E]/10 text-[#0F766E] border border-[#0F766E]/20 flex items-center justify-center font-bold text-xs">
                        {city.name.slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="font-bold text-[#111827] text-base">{city.name}</h2>
                        <span className="text-[11px] text-[#6B7280]">{city.province} Province</span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleCityStatus(city.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                        city.active
                          ? 'bg-emerald-50 text-[#10B981] border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {city.active ? 'ACTIVE' : 'DISABLED'}
                    </button>
                  </div>

                  <div className="space-y-2 text-xs pt-2">
                    <div className="flex justify-between text-[#6B7280]">
                      <span>Base Fare Adjustment:</span>
                      <span className="font-mono text-[#0F766E] font-bold">
                        +{city.baseFareAdjustment} PKR
                      </span>
                    </div>

                    <div className="flex justify-between text-[#6B7280]">
                      <span>Geo-Fence Radius:</span>
                      <span className="font-mono text-[#111827] font-semibold">{city.geofenceRadiusKm} KM</span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
                      <span className="text-[11px] text-[#6B7280] font-bold block mb-1.5">
                        Allowed Ride Categories:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {city.allowedCategories.map((cat) => (
                          <span
                            key={cat}
                            className="px-2 py-0.5 rounded text-[10px] bg-slate-50 text-[#111827] border border-[#E5E7EB] font-semibold"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-[11px] text-[#6B7280]">
                  <span>Center: {city.centerCoords.lat}, {city.centerCoords.lng}</span>
                  <span className="text-[#0F766E] font-semibold">24/7 Operations</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Freight & Commercial Cargo Hub */}
      {activeTab === 'freight' && (
        <div className="space-y-6">
          {/* Freight Fleet Specs Info Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { type: 'Small: Suzuki Ravi / Bolan', payload: 'Up to 800 KG', rate: 'Rs. 45/km', laborAddon: 'Rs. 500' },
              { type: 'Medium: Hyundai Shehzore', payload: '1.5 – 2.5 Tons', rate: 'Rs. 75/km', laborAddon: 'Rs. 900' },
              { type: 'Large: Mazda / Isuzu', payload: '3.5 – 5.0 Tons', rate: 'Rs. 115/km', laborAddon: 'Rs. 1,500' },
              { type: 'Heavy: 20-40ft Container', payload: '10 – 30 Tons', rate: 'Rs. 220/km', laborAddon: 'Rs. 3,000' }
            ].map((f) => (
              <div key={f.type} className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] text-xs shadow-xs">
                <div className="font-bold text-[#0F766E] flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  {f.type}
                </div>
                <div className="text-[#111827] text-[11px] font-semibold mt-1">Payload: {f.payload}</div>
                <div className="text-[#6B7280] text-[10px] mt-0.5">Base Tariff: {f.rate}</div>
                <div className="text-amber-700 text-[10px] mt-0.5 font-medium">Porter Addon: {f.laborAddon}</div>
              </div>
            ))}
          </div>

          {/* Freight Orders Table */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-[#111827]">Active Freight Dispatches & Waybills</span>
                <p className="text-[11px] text-[#6B7280]">Intercity commercial haulage, cargo tracking and digital Bilty</p>
              </div>
              <span className="text-xs text-[#0F766E] font-semibold">Real-time OTP & Signature Delivery</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-[#6B7280] border-b border-[#E5E7EB] uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Order / Bilty Code</th>
                    <th className="py-3 px-4">Vehicle Category</th>
                    <th className="py-3 px-4">Shipper / Consignee</th>
                    <th className="py-3 px-4">Cargo Description</th>
                    <th className="py-3 px-4">Weight</th>
                    <th className="py-3 px-4">Route Path</th>
                    <th className="py-3 px-4">Fare (PKR)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Waybill</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {freightOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#111827]">{order.orderCode}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-[#0F766E] border border-[#E5E7EB]">
                          {order.vehicleType}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#111827]">{order.customerName}</div>
                        <div className="text-[10px] font-mono text-[#6B7280]">{order.customerPhone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-[#111827]">
                          <Package className="w-3.5 h-3.5 text-[#0F766E]" />
                          <span className="font-semibold">{order.cargoDescription}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#6B7280]">
                        {order.weightKg} KG
                      </td>
                      <td className="py-3 px-4 text-[11px] text-[#6B7280] max-w-xs truncate">
                        {order.pickupLocation} → {order.dropLocation}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#0F766E]">
                        {formatPKR(order.fare)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            order.status === 'in_transit'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200 animate-pulse'
                              : order.status === 'delivered'
                              ? 'bg-emerald-50 text-[#10B981] border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedWaybillOrder(order)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#0F766E]/10 hover:bg-[#0F766E]/20 text-[#0F766E] transition cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <FileText className="w-3 h-3" />
                          View Bilty
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add City Modal */}
      {showAddCityModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCity}
            className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-2xl space-y-4 text-[#111827]"
          >
            <h3 className="font-bold text-base text-[#111827] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0F766E]" />
              Add Operational City Hub
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#111827] font-semibold mb-1">City Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Faisalabad, Multan, Gujranwala"
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827]"
                />
              </div>

              <div>
                <label className="block text-[#111827] font-semibold mb-1">Province</label>
                <select
                  value={newCityProvince}
                  onChange={(e) => setNewCityProvince(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827]"
                >
                  <option value="Punjab">Punjab</option>
                  <option value="Sindh">Sindh</option>
                  <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                  <option value="Balochistan">Balochistan</option>
                  <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#111827] font-semibold mb-1">Geo-Radius (KM)</label>
                  <input
                    type="number"
                    value={newCityRadius}
                    onChange={(e) => setNewCityRadius(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-[#E5E7EB]"
                  />
                </div>
                <div>
                  <label className="block text-[#111827] font-semibold mb-1">Base Adjustment (PKR)</label>
                  <input
                    type="number"
                    value={newCityFareAdj}
                    onChange={(e) => setNewCityFareAdj(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-[#E5E7EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#111827] font-semibold mb-1">Center Latitude</label>
                  <input
                    type="text"
                    value={newCityLat}
                    onChange={(e) => setNewCityLat(e.target.value)}
                    className="w-full p-2 font-mono text-[11px] rounded-xl bg-slate-50 border border-[#E5E7EB]"
                  />
                </div>
                <div>
                  <label className="block text-[#111827] font-semibold mb-1">Center Longitude</label>
                  <input
                    type="text"
                    value={newCityLng}
                    onChange={(e) => setNewCityLng(e.target.value)}
                    className="w-full font-mono text-[11px] p-2 rounded-xl bg-slate-50 border border-[#E5E7EB]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setShowAddCityModal(false)}
                className="px-3 py-1.5 text-xs text-[#6B7280] hover:text-[#111827]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-[#0F766E] hover:bg-[#064E3B] text-white rounded-xl shadow-xs"
              >
                Save City Hub
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Official Waybill / Bilty Modal */}
      {selectedWaybillOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-2xl space-y-4 text-[#111827]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0F766E]">
                  Official Consignment Note (Bilty)
                </span>
                <h3 className="text-base font-extrabold text-[#111827]">
                  GoLife Freight Dispatch #{selectedWaybillOrder.orderCode}
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#111827] cursor-pointer"
                  title="Print Bilty"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedWaybillOrder(null)}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#111827] cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bilty Details Sheet */}
            <div className="p-4 rounded-xl bg-slate-50 border border-[#E5E7EB] space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-[#6B7280] font-bold uppercase">Shipper / Customer</span>
                  <div className="font-bold text-[#111827]">{selectedWaybillOrder.customerName}</div>
                  <div className="font-mono text-[#6B7280] text-[11px]">{selectedWaybillOrder.customerPhone}</div>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B7280] font-bold uppercase">Assigned Truck</span>
                  <div className="font-bold text-[#0F766E]">{selectedWaybillOrder.vehicleType}</div>
                  <div className="text-[11px] text-[#6B7280]">Status: {selectedWaybillOrder.status.toUpperCase()}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E5E7EB] grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-[#6B7280] font-bold uppercase">Origin (Pickup)</span>
                  <div className="text-[#111827] text-[11px]">{selectedWaybillOrder.pickupLocation}</div>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B7280] font-bold uppercase">Destination (Consignee)</span>
                  <div className="text-[#111827] text-[11px]">{selectedWaybillOrder.dropLocation}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#6B7280] font-bold uppercase">Cargo Manifest</span>
                  <div className="font-bold text-[#111827]">{selectedWaybillOrder.cargoDescription}</div>
                  <div className="text-[11px] text-[#6B7280]">Gross Weight: {selectedWaybillOrder.weightKg} KG</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#6B7280] font-bold uppercase">Total Bilty Charge</span>
                  <div className="text-base font-extrabold text-[#0F766E] font-mono">
                    {formatPKR(selectedWaybillOrder.fare)}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
              <span>Certified under Pakistani Carriage of Goods Act & National Highway Authority Regulations.</span>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedWaybillOrder(null)}
                className="px-4 py-1.5 text-xs font-bold bg-[#0F766E] text-white rounded-xl"
              >
                Close Bilty
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
