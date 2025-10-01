import type { Tenant, Property, OverviewStats } from './types';
import { PlaceHolderImages } from './placeholder-images';

const tenantImages = {
  t1: PlaceHolderImages.find(p => p.id === 'tenant-1')?.imageUrl,
  t2: PlaceHolderImages.find(p => p.id === 'tenant-2')?.imageUrl,
  t3: PlaceHolderImages.find(p => p.id === 'tenant-3')?.imageUrl,
  t4: PlaceHolderImages.find(p => p.id === 'tenant-4')?.imageUrl,
  t5: PlaceHolderImages.find(p => p.id === 'tenant-5')?.imageUrl,
}

export const properties: Property[] = [
  { id: 'prop1', name: 'Kalingalinga Complex', location: 'Lusaka', units: 10, occupied: 8 },
  { id: 'prop2', name: 'Woodlands Apartments', location: 'Lusaka', units: 5, occupied: 5 },
];

export const tenants: Tenant[] = [
  {
    id: 't1',
    name: 'Bwalya Chanda',
    avatarUrl: tenantImages.t1!,
    property: 'Kalingalinga Complex',
    unit: 'A01',
    phone: '+260 977 123456',
    email: 'b.chanda@example.com',
    rentStatus: 'Paid',
    rentAmount: 2500,
    leaseStartDate: '2023-01-15',
    leaseEndDate: '2024-01-14',
    paymentHistorySummary: 'Always on time, sometimes a day early.',
    paymentHistory: [
      { id: 'p1', date: '2024-05-01', amount: 2500, method: 'Mobile Money' },
      { id: 'p2', date: '2024-04-01', amount: 2500, method: 'Mobile Money' },
    ],
  },
  {
    id: 't2',
    name: 'Thandiwe Zulu',
    avatarUrl: tenantImages.t2!,
    property: 'Kalingalinga Complex',
    unit: 'B03',
    phone: '+260 966 789012',
    email: 't.zulu@example.com',
    rentStatus: 'Pending',
    rentAmount: 3000,
    leaseStartDate: '2022-11-01',
    leaseEndDate: '2023-10-31',
    paymentHistorySummary: 'Usually pays a few days after the due date.',
    paymentHistory: [
      { id: 'p3', date: '2024-04-05', amount: 3000, method: 'Bank Transfer' },
      { id: 'p4', date: '2024-03-06', amount: 3000, method: 'Bank Transfer' },
    ],
  },
  {
    id: 't3',
    name: 'Chisenga Banda',
    avatarUrl: tenantImages.t3!,
    property: 'Woodlands Apartments',
    unit: 'W02',
    phone: '+260 955 345678',
    email: 'c.banda@example.com',
    rentStatus: 'Overdue',
    rentAmount: 4500,
    leaseStartDate: '2023-06-20',
    leaseEndDate: '2024-06-19',
    paymentHistorySummary: 'First time being overdue. Usually pays on time.',
    paymentHistory: [
      { id: 'p5', date: '2024-04-01', amount: 4500, method: 'Mobile Money' },
      { id: 'p6', date: '2024-03-01', amount: 4500, method: 'Cash' },
    ],
  },
  {
    id: 't4',
    name: 'Lumbani Phiri',
    avatarUrl: tenantImages.t4!,
    property: 'Woodlands Apartments',
    unit: 'W05',
    phone: '+260 777 901234',
    email: 'l.phiri@example.com',
    rentStatus: 'Paid',
    rentAmount: 4200,
    leaseStartDate: '2023-02-01',
    leaseEndDate: '2024-01-31',
    paymentHistorySummary: 'Excellent payment history.',
    paymentHistory: [
      { id: 'p7', date: '2024-05-01', amount: 4200, method: 'Mobile Money' },
      { id: 'p8', date: '2024-04-01', amount: 4200, method: 'Mobile Money' },
    ],
  },
  {
    id: 't5',
    name: 'Mumbi Mwansa',
    avatarUrl: tenantImages.t5!,
    property: 'Kalingalinga Complex',
    unit: 'C02',
    phone: '+260 977 567890',
    email: 'm.mwansa@example.com',
    rentStatus: 'Paid',
    rentAmount: 2800,
    leaseStartDate: '2023-08-10',
    leaseEndDate: '2024-08-09',
    paymentHistorySummary: 'Pays consistently within the grace period.',
    paymentHistory: [
       { id: 'p9', date: '2024-05-03', amount: 2800, method: 'Bank Transfer' },
       { id: 'p10', date: '2024-04-02', amount: 2800, method: 'Bank Transfer' },
    ],
  },
];

export const overviewStats: OverviewStats = {
  totalUnits: properties.reduce((sum, prop) => sum + prop.units, 0),
  occupiedUnits: properties.reduce((sum, prop) => sum + prop.occupied, 0),
  rentCollected: 58500,
  rentPending: 7500,
  overdueTenants: tenants.filter(t => t.rentStatus === 'Overdue').length,
};
