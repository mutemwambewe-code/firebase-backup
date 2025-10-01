
'use client';

import { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Tenant, Payment } from '@/lib/types';
import { format, startOfMonth } from 'date-fns';

interface FinancialReportProps {
  payments: Payment[];
  tenants: Tenant[];
}

const getPastSixMonths = () => {
    const months = [];
    const date = new Date();
    date.setDate(1);
    for (let i = 0; i < 6; i++) {
        months.unshift(new Date(date));
        date.setMonth(date.getMonth() - 1);
    }
    return months;
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="p-2 text-sm shadow-lg">
          <p className="font-bold">{label}</p>
          <p style={{ color: 'hsl(var(--chart-2))' }}>
            Collected: ZMW {payload[0].value.toLocaleString()}
          </p>
        </Card>
      );
    }
    return null;
};

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function FinancialReport({ payments, tenants }: FinancialReportProps) {
  const monthlyIncomeData = useMemo(() => {
    const months = getPastSixMonths();
    return months.map(month => {
      const monthKey = format(month, 'MMM');
      const year = month.getFullYear();
      
      const collectedForMonth = payments
        .filter(p => {
          const paymentDate = new Date(p.date);
          return paymentDate.getMonth() === month.getMonth() && paymentDate.getFullYear() === year;
        })
        .reduce((sum, p) => sum + p.amount, 0);

      return {
        month: monthKey,
        collected: collectedForMonth,
      };
    });
  }, [payments]);

  const paymentMethodData = useMemo(() => {
    const methodCounts = payments.reduce((acc, p) => {
      acc[p.method] = (acc[p.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(methodCounts).map(([name, value]) => ({ name, value }));
  }, [payments]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Income</CardTitle>
          <CardDescription>Rent collected over the past 6 months.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyIncomeData}>
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `ZMW ${value / 1000}k`} />
              <Tooltip cursor={{ fill: 'hsla(var(--card-foreground) / 0.1)' }} content={<CustomTooltip />} />
              <Bar dataKey="collected" fill="hsl(var(--chart-2))" name="Rent Collected" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Distribution of payment methods used by tenants.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={paymentMethodData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8">
                {paymentMethodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
