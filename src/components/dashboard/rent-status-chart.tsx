'use client';

import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const rentData = [
    { month: 'Jan', due: 150000, collected: 125000 },
    { month: 'Feb', due: 152000, collected: 148000 },
    { month: 'Mar', due: 155000, collected: 135000 },
    { month: 'Apr', due: 153000, collected: 150000 },
    { month: 'May', due: 156000, collected: 142000 },
    { month: 'Jun', due: 158000, collected: 155000 },
];

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
  return (
    <Card className="shadow-none h-full">
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
