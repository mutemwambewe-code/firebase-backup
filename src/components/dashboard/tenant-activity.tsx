import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { tenants } from '@/lib/data';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const statusData = [
  { name: 'Paid', value: tenants.filter(t => t.rentStatus === 'Paid').length },
  { name: 'Pending', value: tenants.filter(t => t.rentStatus === 'Pending').length },
  { name: 'Overdue', value: tenants.filter(t => t.rentStatus === 'Overdue').length },
];

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export default function TenantActivity() {
  const totalTenants = statusData.reduce((acc, entry) => acc + entry.value, 0);

  return (
    <Card className="shadow-none h-full">
      <CardHeader>
        <CardTitle>Tenant Status</CardTitle>
        <CardDescription>
          Distribution of tenants by lease status.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    innerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, value, index }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x  = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy  + radius * Math.sin(-midAngle * RADIAN);
            
                        return (
                          <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                            {`${((value / totalTenants) * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                >
                    {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        background: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "var(--radius)",
                    }}
                />
                <Legend wrapperStyle={{fontSize: "0.8rem"}}/>
            </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
