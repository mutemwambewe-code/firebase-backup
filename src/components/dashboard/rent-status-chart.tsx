'use client';

import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, XAxis, YAxis, Tooltip } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { tenants } from '@/lib/data';

const chartData = [
  { status: 'Paid', tenants: tenants.filter(t => t.rentStatus === 'Paid').length, fill: 'var(--color-paid)' },
  { status: 'Pending', tenants: tenants.filter(t => t.rentStatus === 'Pending').length, fill: 'var(--color-pending)' },
  { status: 'Overdue', tenants: tenants.filter(t => t.rentStatus === 'Overdue').length, fill: 'var(--color-overdue)' },
];

const chartConfig = {
  tenants: {
    label: 'Tenants',
  },
  paid: {
    label: 'Paid',
    color: 'hsl(var(--chart-2))',
  },
  pending: {
    label: 'Pending',
    color: 'hsl(var(--chart-3))',
  },
  overdue: {
    label: 'Overdue',
    color: 'hsl(var(--chart-4))',
  },
};

export function RentStatusChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rent Status Overview</CardTitle>
        <CardDescription>Distribution of tenants by payment status.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis
              dataKey="status"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
              allowDecimals={false}
            />
             <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="tenants" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Track rent payments and send reminders efficiently.
        </div>
        <div className="leading-none text-muted-foreground">
          You have {chartData.find(d => d.status === 'Overdue')?.tenants} overdue tenant(s).
        </div>
      </CardFooter>
    </Card>
  );
}
