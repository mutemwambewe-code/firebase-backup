export type Tenant = {
  id: string;
  name: string;
  avatarUrl: string; // Was avatarId
  property: string;
  unit: string;
  phone: string;
  email: string;
  rentStatus: 'Paid' | 'Pending' | 'Overdue';
  rentAmount: number;
  leaseStartDate: string;
  leaseEndDate: string;
  paymentHistorySummary: string;
  paymentHistory: Payment[];
};

export type Payment = {
  id: string;
  date: string;
  amount: number;
  method: 'Mobile Money' | 'Bank Transfer' | 'Cash';
};

export type Property = {
  id: string;
  name: string;
  units: number;
  occupied: number;
};

export type OverviewStats = {
  totalUnits: number;
  occupiedUnits: number;
  rentCollected: number;
  rentPending: number;
  overdueTenants: number;
};
