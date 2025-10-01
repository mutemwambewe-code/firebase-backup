'use client';

import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { tenants } from '@/lib/data';
import { useRouter } from 'next/navigation';

// Helper to get past 6 months
const getPastSixMonths = () => {
  const months = [];
  const date = new Date();
  for (let i = 0; i < 6; i++) {
    months.unshift(new Date(date.getFullYear(), date.getMonth() - i, 1));
  }
  return months;
};

// Aggregate rent data
const aggregateRentData = () => {
  const months = getPastSixMonths();
  const allPayments = tenants.flatMap(t => t.paymentHistory.map(p => ({...p, rentAmount: t.rentAmount})));
  
  return months.map(month => {
    const monthKey = month.toLocaleString('default', { month: 'short' });
    const year = month.getFullYear();
    
    // Calculate total due for that month based on active leases
    const totalRentDue = tenants.filter(t => {
        const leaseStart = new Date(t.leaseStartDate);
        const leaseEnd = new Date(t.leaseEndDate);
        return leaseStart <= month && leaseEnd >= month;
    }).reduce((acc, tenant) => acc + tenant.rentAmount, 0);

    const collectedForMonth = allPayments
      .filter(p => {
        const paymentDate = new Date(p.date);
        return paymentDate.getMonth() === month.getMonth() && paymentDate.getFullYear() === year;
      })
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      month: monthKey,
      due: totalRentDue,
      collected: collectedForMonth,
    };
  });
};

const rentData = aggregateRentData();


const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="p-2 text-sm shadow-lg">
          <p className="font-bold">{label}</p>
          <p style={{ color: 'hsl(var(--chart-2))' }}>
            Collected: ZMW {payload[1].value.toLocaleString()}
          </p>
          <p style={{ color: 'hsl(var(--chart-1))' }}>
            Due: ZMW {payload[0].value.toLocaleString()}
          </p>
        </Card>
      );
    }
  
    return null;
  };

export function RentStatusChart() {
  const router = useRouter();

  const handleChartClick = () => {
    router.push('/reports');
  };
  
  return (
    <Card className="shadow-none h-full cursor-pointer hover:border-primary/50 transition-colors" onClick={handleChartClick}>
      <CardHeader>
        <CardTitle>Rent Collection Trend</CardTitle>
        <CardDescription>Last 6 months collection vs. due amount.</CardDescription>
      </CardHeader>
      <CardContent className='h-[300px]'>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rentData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `ZMW ${value / 1000}k`}
            />
             <Tooltip cursor={{ fill: 'hsla(var(--card-foreground) / 0.1)' }} content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize: "0.8rem"}}/>
            <Bar dataKey="due" fill="hsl(var(--chart-1))" name="Rent Due" radius={[4, 4, 0, 0]} />
            <Bar dataKey="collected" fill="hsl(var(--chart-2))" name="Rent Collected" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
