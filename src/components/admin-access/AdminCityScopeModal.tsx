import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { AdminUser } from '../../types';
import { MapPin, Check, X, Shield } from 'lucide-react';

interface AdminCityScopeModalProps {
  admin: AdminUser | null;
  onClose: () => void;
}

const AVAILABLE_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Peshawar',
  'Multan',
  'Quetta',
  'Sialkot',
  'Gujranwala'
];

export const AdminCityScopeModal: React.FC<AdminCityScopeModalProps> = ({ admin, onClose }) => {
  const { updateAdminCityScope, showToast } = useAdmin();

  const [selectedCities, setSelectedCities] = useState<string[]>(() => {
    if (!admin) return ['all'];
    if (admin.assignedCity === 'all' || !admin.cityScope || admin.cityScope.includes('all')) {
      return ['all'];
    }
    return admin.cityScope;
  });

  if (!admin) return null;

  const isNational = selectedCities.includes('all');

  const handleToggleCity = (city: string) => {
    if (isNational) {
      setSelectedCities([city]);
      return;
    }

    if (selectedCities.includes(city)) {
      const next = selectedCities.filter((c) => c !== city);
      setSelectedCities(next.length === 0 ? ['all'] : next);
    } else {
      setSelectedCities([...selectedCities, city]);
    }
  };

  const handleSelectNational = () => {
    setSelectedCities(['all']);
  };

  const handleSave = () => {
    updateAdminCityScope(admin.id, selectedCities);
    showToast(`Updated city jurisdiction for ${admin.name}`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-400 text-slate-950 font-black">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">City Jurisdiction & Dispatch Scope</h3>
              <p className="text-[11px] text-slate-500">
                {admin.name} ({admin.role.replace('_', ' ').toUpperCase()})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-200/50 cursor-pointer"
          >
            &times;
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-xs text-slate-600">
            Administrators restricted to specific cities can only inspect, dispatch, and review rides, drivers, and cases located inside their assigned territories.
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={handleSelectNational}
              className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                isNational
                  ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-600" />
                <div>
                  <div className="text-xs font-black">All Pakistan (National Scope)</div>
                  <div className="text-[10px] text-slate-500 font-normal">
                    Unrestricted jurisdiction across all provinces and cities
                  </div>
                </div>
              </div>
              {isNational && <Check className="w-4 h-4 text-amber-600" />}
            </button>

            <div className="pt-2 text-xs font-bold text-slate-700">Or Select Specific Cities:</div>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_CITIES.map((city) => {
                const isChecked = !isNational && selectedCities.includes(city);
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleToggleCity(city)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                      isChecked
                        ? 'bg-amber-400 border-amber-500 text-slate-950 font-black'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{city}</span>
                    {isChecked && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black shadow-xs cursor-pointer"
            >
              Update Jurisdiction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
