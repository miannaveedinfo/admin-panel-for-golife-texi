import { AdminTab } from './index';

export type ReportDateFilter = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface ReportDateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface MainReportMetrics {
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  activeRides: number;
  totalPassengers: number;
  totalDrivers: number;
  onlineDrivers: number;
  newDrivers: number;
  newPassengers: number;
  grossRevenue: number;         // Gross Ride Value (PKR)
  driverEarnings: number;       // Driver's gross or share (PKR)
  platformCommission: number;   // Platform Commission (PKR)
  serviceCharges: number;       // Passenger + Driver service charges (PKR)
  taxes: number;                // Provincial Sales Tax (PRA / SRB) (PKR)
  fines: number;                // Driver fines charged (PKR)
  refunds: number;              // Passenger refunds disbursed (PKR)
  reimbursements: number;       // Driver reimbursements paid (PKR)
  adjustments: number;          // Financial adjustments net (PKR)
  payouts: number;              // Driver payouts completed (PKR)
  netPlatformRevenue: number;   // Net Platform Revenue (PKR)
}

export interface CityWiseReportItem {
  city: string;
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  activeRides: number;
  passengers: number;
  drivers: number;
  revenue: number;
  commission: number;
  fines: number;
  refunds: number;
  payouts: number;
  completionRate: number;
  averageFare: number;
}

export interface DriverWiseReportItem {
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverPlate: string;
  city: string;
  avatar?: string;
  category: string;
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  grossEarnings: number;
  commission: number;
  fines: number;
  refunds: number;
  reimbursements: number;
  payouts: number;
  ratings: number;
  latePickups: number;
  lateDropoffs: number;
  complaints: number;
  suspensions: number;
  currentBalance: number;
  accountStatus: 'active' | 'suspended' | 'blocked' | 'pending';
}

export interface AnalyticsTrendPoint {
  label: string;
  date: string;
  revenue: number;
  rides: number;
  commission: number;
  driverEarnings: number;
  cancellations: number;
  fines: number;
  refunds: number;
  payouts: number;
}

export interface HistoricalRuleRecord {
  id: string;
  transactionId: string;
  rideId: string;
  rideCode: string;
  driverId: string;
  driverName: string;
  passengerId: string;
  passengerName: string;
  city: string;
  category: string;
  pricingRuleVersion: string;
  fineRuleVersion: string;
  timestamp: string;
  auditInformation: string;
  baseFare: number;
  perKmRate: number;
  distanceKm: number;
  grossFare: number;
  commissionRate: number;
  commissionAmount: number;
  serviceFee: number;
  fineAmount?: number;
  fineReason?: string;
  isLocked: boolean;
}

export interface ReportAiInsight {
  id: string;
  category: 'revenue' | 'cancellation' | 'fines' | 'payouts' | 'city' | 'driver' | 'abnormality';
  title: string;
  observation: string;
  recommendation: string;
  impact: 'positive' | 'warning' | 'critical' | 'neutral';
  targetTab?: AdminTab;
  relatedEntityId?: string;
  relatedEntityName?: string;
}

export type ExportFormat = 'csv' | 'excel' | 'pdf';
