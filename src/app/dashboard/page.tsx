import { OverviewCards } from '@/components/dashboard/overview-cards';
import { RentStatusChart } from '@/components/dashboard/rent-status-chart';
import TenantActivity from '@/components/dashboard/tenant-activity';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's a summary of your properties.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Link href="/tenants">
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Tenant
                </Button>
            </Link>
            <Link href="/communication">
                <Button variant="secondary">Send Reminders</Button>
            </Link>
        </div>
      </div>
      
      <OverviewCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RentStatusChart />
        <TenantActivity />
      </div>
    </div>
  );
}
