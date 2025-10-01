'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { TenantCard } from './tenant-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useTenants } from './tenant-provider';
import { AddTenant } from './add-tenant';

type FilterStatus = 'All' | 'Paid' | 'Pending' | 'Overdue';

export function TenantList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { tenants } = useTenants();
  
  const getFilterFromURL = (): FilterStatus => {
    const filter = searchParams.get('filter');
    if (filter === 'Paid' || filter === 'Pending' || filter === 'Overdue') {
      return filter;
    }
    return 'All';
  };

  const [filter, setFilter] = useState<FilterStatus>(getFilterFromURL());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setFilter(getFilterFromURL());
  }, [searchParams]);

  const handleFilterChange = (status: FilterStatus) => {
    setFilter(status);
    const params = new URLSearchParams(searchParams.toString());
    if (status === 'All') {
      params.delete('filter');
    } else {
      params.set('filter', status);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const filteredTenants = tenants
    .filter((tenant) => {
      if (filter === 'All') return true;
      return tenant.rentStatus === filter;
    })
    .filter((tenant) =>
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (!tenants.length) {
    return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">No tenants yet</h2>
            <p className="text-muted-foreground mt-2">Add your first tenant to get started.</p>
            <AddTenant />
        </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tenants..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          {(['All', 'Paid', 'Pending', 'Overdue'] as FilterStatus[]).map(
            (status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                onClick={() => handleFilterChange(status)}
                className="capitalize"
              >
                {status}
              </Button>
            )
          )}
          <AddTenant />
        </div>
      </div>

      {filteredTenants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenants.map((tenant) => (
            <TenantCard key={tenant.id} tenant={tenant} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg col-span-full">
            <h2 className="text-xl font-semibold">No matching tenants</h2>
            <p className="text-muted-foreground mt-2">Try adjusting your search or filter.</p>
        </div>
      )}
    </div>
  );
}
