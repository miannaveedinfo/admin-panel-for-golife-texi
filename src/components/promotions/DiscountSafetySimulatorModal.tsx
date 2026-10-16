import React, { useState } from 'react';
import { PromoCode, RideCategory } from '../../types';
import { validateAndCalculatePromoDiscount } from '../../services/promotionRewardsService';
import { formatPKR } from '../../utils/i18n';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  Play,
  ArrowRight,
  Info,
  DollarSign
} from 'lucide-react';

interface DiscountSafetySimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  promoCodes?: PromoCode[];
  defaultPromoCode?: string;
}

export const DiscountSafetySimulatorModal: React.FC<DiscountSafetySimulatorModalProps> = ({
  isOpen,
  onClose,
  promoCodes = [],
  defaultPromoCode
}) => {
  const [selectedPromoCode, setSelectedPromoCode] = useState<string>(
    defaultPromoCode || (promoCodes?.[0]?.code ?? '')
  );
  const [fare, setFare] = useState<number>(350);
  const [city, setCity] = useState<string>('Lahore');
  const [category, setCategory] = useState<RideCategory>('GoRide');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [isNewPassenger, setIsNewPassenger] = useState<boolean>(false);
  const [currentPassengerUsageCount, setCurrentPassengerUsageCount] = useState<number>(0);

  if (!isOpen) return null;

  const currentPromo = (promoCodes || []).find((p) => p.code === selectedPromoCode);

  const simulationResult = currentPromo
    ? validateAndCalculatePromoDiscount(currentPromo, {
        fare,
        city,
        category,
        passengerId: 'SIM-PASSENGER-01',
        paymentMethod,
        isNewPassenger
      })
    : null;

  // Pricing & commission breakdown simulation (aligned with central pricing)
  const baseRideFare = fare;
  const discountAmt = simulationResult?.discountAmount || 0;
  const finalPassengerFare = simulationResult?.finalFare ?? fare;
  const platformFeeRate = 0.15; // 15% standard GoLife fee
  const calculatedPlatformCommission = Math.round(baseRideFare * platformFeeRate);
  // In GoLife model, promo discounts are absorbed by platform growth budget, not captain!
  const captainNetEarnings = Math.max(0, baseRideFare - calculatedPlatformCommission);

  return (
    <div
      id="modal-discount-safety-simulator"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#E5E7EB] space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111827]">
                Discount Safety & Negative Fare Protection Simulator
              </h2>
              <p className="text-xs text-[#6B7280]">
                Strict Section 4 verification: Ensures zero negative fares and protects captain earnings
              </p>
            </div>
          </div>
          <button
            id="btn-close-simulator"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-[#E5E7EB]">
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              Select Promo Voucher
            </label>
            <select
              id="sim-promo-select"
              value={selectedPromoCode}
              onChange={(e) => setSelectedPromoCode(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-[#D1D5DB] text-[#111827] focus:outline-none focus:border-amber-500"
            >
              {promoCodes.map((p) => (
                <option key={p.id} value={p.code}>
                  {p.code} — {p.discountType === 'percentage' ? `${p.discountValue}%` : `PKR ${p.discountValue}`}{' '}
                  (Cap: {p.maxDiscount ? `PKR ${p.maxDiscount}` : 'None'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              Original Ride Fare (PKR)
            </label>
            <input
              id="sim-fare-input"
              type="number"
              min="50"
              step="10"
              value={fare}
              onChange={(e) => setFare(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-[#D1D5DB] text-[#111827] focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">City</label>
            <select
              id="sim-city-select"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-[#D1D5DB] text-[#111827] focus:outline-none focus:border-amber-500"
            >
              <option value="Lahore">Lahore</option>
              <option value="Karachi">Karachi</option>
              <option value="Islamabad">Islamabad</option>
              <option value="Rawalpindi">Rawalpindi</option>
              <option value="Multan">Multan</option>
              <option value="Faisalabad">Faisalabad</option>
              <option value="Peshawar">Peshawar</option>
              <option value="Quetta">Quetta</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              Ride Category
            </label>
            <select
              id="sim-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as RideCategory)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-[#D1D5DB] text-[#111827] focus:outline-none focus:border-amber-500"
            >
              <option value="GoMini">GoMini (Budget AC)</option>
              <option value="GoRide">GoRide (Sedan Standard)</option>
              <option value="GoComfort">GoComfort (Premium)</option>
              <option value="GoAuto">GoAuto (Rickshaw)</option>
              <option value="GoMoto">GoMoto (Bike)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              Payment Method
            </label>
            <select
              id="sim-payment-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-[#D1D5DB] text-[#111827] focus:outline-none focus:border-amber-500"
            >
              <option value="cash">Cash on Arrival</option>
              <option value="wallet">GoLife Digital Wallet</option>
              <option value="easypaisa">EasyPaisa</option>
              <option value="jazzcash">JazzCash</option>
              <option value="card">Debit / Credit Card</option>
            </select>
          </div>

          <div className="flex flex-col justify-end space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#374151]">
              <input
                id="sim-new-passenger-check"
                type="checkbox"
                checked={isNewPassenger}
                onChange={(e) => setIsNewPassenger(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-gray-300"
              />
              Passenger is First-Time Rider
            </label>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#6B7280]">Prior code redemptions:</span>
              <input
                type="number"
                min="0"
                max="10"
                value={currentPassengerUsageCount}
                onChange={(e) => setCurrentPassengerUsageCount(Number(e.target.value))}
                className="w-14 px-2 py-0.5 text-xs rounded border border-[#D1D5DB] bg-white text-center"
              />
            </div>
          </div>
        </div>

        {/* Validation Result Box */}
        {simulationResult && (
          <div
            id="sim-result-container"
            className={`p-4 rounded-xl border ${
              simulationResult.valid
                ? 'bg-emerald-50/70 border-emerald-200'
                : 'bg-rose-50/70 border-rose-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {simulationResult.valid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      simulationResult.valid ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {simulationResult.valid
                      ? 'Promo Safety Validation: PASSED'
                      : `Validation Failed: ${simulationResult.errorCode}`}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#374151]">
                    {currentPromo?.code}
                  </span>
                </div>
                {!simulationResult.valid && (
                  <p className="text-xs text-rose-800 font-medium">
                    {simulationResult.errorMessage}
                  </p>
                )}
                {simulationResult.valid && (
                  <p className="text-xs text-emerald-800">
                    Promo criteria met. Discount successfully computed without violating minimum
                    fare floor or resulting in negative values.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Financial Flow Breakdown (Section 4 & 12) */}
        {simulationResult?.valid && (
          <div className="space-y-3 bg-white p-4 rounded-xl border border-[#E5E7EB]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#4B5563] flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-amber-600" />
              Central Pricing & Financial Settlement Breakdown
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-[#6B7280]">Gross Ride Fare</div>
                <div className="text-sm font-bold text-[#111827] font-mono mt-0.5">
                  {formatPKR(baseRideFare)}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="text-[11px] text-emerald-700">Promo Discount</div>
                <div className="text-sm font-bold text-emerald-600 font-mono mt-0.5">
                  - {formatPKR(discountAmt)}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                <div className="text-[11px] text-amber-800">Final Passenger Fare</div>
                <div className="text-sm font-bold text-amber-900 font-mono mt-0.5">
                  {formatPKR(finalPassengerFare)}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                <div className="text-[11px] text-blue-700">Captain Guaranteed Payout</div>
                <div className="text-sm font-bold text-blue-900 font-mono mt-0.5">
                  {formatPKR(captainNetEarnings)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 text-[11px] text-[#4B5563]">
              <Info className="w-4 h-4 text-blue-500 shrink-0" />
              <span>
                <strong>Platform Integrity Rule:</strong> The captain’s earnings are calculated from
                the gross trip fare (PKR {baseRideFare}). The voucher discount of PKR {discountAmt}{' '}
                is funded entirely from the GoLife Marketing Budget and never deducted from the driver.
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            id="btn-dismiss-simulator"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#374151] font-semibold text-xs transition cursor-pointer"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
