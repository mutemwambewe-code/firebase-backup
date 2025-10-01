import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Home, Users, AlertTriangle } from 'lucide-react';
import { overviewStats } from '@/lib/data';

const cardData = [
  {
    title: 'Total Units',
    value: overviewStats.totalUnits,
    icon: Home,
    description: 'Across all properties',
  },
  {
    title: 'Occupied Units',
    value: overviewStats.occupiedUnits,
    icon: Users,
    description: `${(
      (overviewStats.occupiedUnits / overviewStats.totalUnits) *
      100
    ).toFixed(0)}% occupancy`,
  },
  {
    title: 'Rent Collected (Month)',
    value: `ZMW ${overviewStats.rentCollected.toLocaleString()}`,
    icon: DollarSign,
    description: `ZMW ${overviewStats.rentPending.toLocaleString()} pending`,
  },
  {
    title: 'Overdue Tenants',
    value: overviewStats.overdueTenants,
    icon: AlertTriangle,
    description: 'Require immediate attention',
    className: 'text-destructive',
  },
];

export function OverviewCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cardData.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={cn('h-4 w-4 text-muted-foreground', card.className)} />
          </CardHeader>
          <CardContent>
            <div className={cn('text-2xl font-bold', card.className)}>
              {card.value}
            </div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Helper function to concatenate class names
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
