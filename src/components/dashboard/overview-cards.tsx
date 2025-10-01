'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Home, Users, AlertTriangle } from 'lucide-react';
import { tenants, properties } from '@/lib/data';
import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

const totalUnits = properties.reduce((sum, prop) => sum + prop.units, 0);
const occupiedUnits = tenants.length;
const overdueTenants = tenants.filter(t => t.rentStatus === 'Overdue').length;

const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();

const rentCollected = tenants
  .flatMap(t => t.paymentHistory)
  .filter(p => {
    const paymentDate = new Date(p.date);
    return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
  })
  .reduce((sum, p) => sum + p.amount, 0);

const rentPending = tenants
    .filter(t => t.rentStatus === 'Pending' || t.rentStatus === 'Overdue')
    .reduce((sum, t) => sum + t.rentAmount, 0);


const occupancyRate = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : '0.0';

const cardData = [
  {
    title: 'Total Units',
    value: totalUnits,
    icon: Home,
    description: 'Across all properties',
  },
  {
    title: 'Occupied Units',
    value: occupiedUnits,
    icon: Users,
    description: (
      <span className="flex items-center gap-1">
        <TrendingUp className="h-4 w-4 text-accent" />
        <span className="text-accent">{occupancyRate}%</span> occupancy
      </span>
    ),
  },
  {
    title: 'Rent Collected (Month)',
    value: `ZMW ${rentCollected.toLocaleString()}`,
    icon: DollarSign,
    description: `ZMW ${rentPending.toLocaleString()} outstanding`,
  },
  {
    title: 'Tenants in Arrears',
    value: overdueTenants,
    icon: AlertTriangle,
    description: 'Require follow-up',
    className: 'text-yellow-600 dark:text-yellow-400',
    iconClassName: 'bg-yellow-500/10',
  },
];

export function OverviewCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cardData.map((card) => (
        <Card key={card.title}>
          <CardContent className="p-4 flex items-start gap-4">
             <div className={cn("p-3 rounded-lg bg-secondary", card.iconClassName)}>
                <card.icon className={cn('h-6 w-6 text-muted-foreground', card.className)} />
             </div>
             <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className={cn('text-2xl font-bold', card.className)}>
                  {card.value}
                </p>
                <p className="text-xs text-muted-foreground">{card.description}</p>
             </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
