import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Home, Users, AlertTriangle } from 'lucide-react';
import { overviewStats } from '@/lib/data';
import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

const occupancyRate = (
  (overviewStats.occupiedUnits / overviewStats.totalUnits) *
  100
).toFixed(1);

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
    description: (
      <span className="flex items-center gap-1">
        <TrendingUp className="h-4 w-4 text-accent" />
        <span className="text-accent">{occupancyRate}%</span> occupancy
      </span>
    ),
  },
  {
    title: 'Rent Collected (Month)',
    value: `ZMW ${overviewStats.rentCollected.toLocaleString()}`,
    icon: DollarSign,
    description: `ZMW ${overviewStats.rentPending.toLocaleString()} outstanding`,
  },
  {
    title: 'Tenants in Arrears',
    value: overviewStats.overdueTenants,
    icon: AlertTriangle,
    description: 'Require follow-up',
    className: 'text-yellow-600 dark:text-yellow-400',
    iconClassName: 'text-yellow-500',
  },
];

export function OverviewCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cardData.map((card) => (
        <Card key={card.title} className="shadow-none">
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
