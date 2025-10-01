import { OverviewCards } from '@/components/dashboard/overview-cards';
import { RentStatusChart } from '@/components/dashboard/rent-status-chart';
import TenantActivity from '@/components/dashboard/tenant-activity';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, Receipt } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Here&apos;s a summary of your properties.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Link href="/tenants">
                <Button variant="outline">
                    <Plus className="mr-2" /> Add Tenant
                </Button>
            </Link>
            <Link href="/communication">
                <Button variant="outline">
                    <MessageSquare className="mr-2" /> Send Message
                </Button>
            </Link>
            <Link href="/tenants">
                <Button>
                    <Receipt className="mr-2" /> Record Payment
                </Button>
            </Link>
        </div>
      </div>
      
      <OverviewCards />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <RentStatusChart />
        </div>
        <div className="lg:col-span-2">
          <TenantActivity />
        </div>
      </div>
    </div>
  );
}
