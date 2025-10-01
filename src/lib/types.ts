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

export type EnrichedPayment = Payment & {
  tenantName: string;
  property: string;
  unit: string;
};

export type Property = {
  id: string;
  name: string;
  location: string;
  units: number;
  occupied: number;
  type: 'Shopping Complex' | 'Boarding House' | 'Residential Apartments' | 'House' | 'Other';
};

export type OverviewStats = {
  totalUnits: number;
  occupiedUnits: number;
  rentCollected: number;
  rentPending: number;
  overdueTenants: number;
};

export type MessageLog = {
    id: string;
    tenantId: string;
    tenantName: string;
    message: string;
    date: string;
    method: 'SMS' | 'WhatsApp';
}

export type Template = {
  id: string;
  title: string;
  content: string;
  category: string;
};
