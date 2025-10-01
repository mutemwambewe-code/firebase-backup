'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { TenantCard } from './tenant-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useTenants } from './tenant-provider';
import { AddTenant } from './add-tenant';
import { Skeleton } from '../ui/skeleton';

type FilterStatus = 'All' | 'Paid' | 'Pending' | 'Overdue';

function TenantListSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <Skeleton className="h-10 sm:w-64" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-16" />
                    <Skeleton className="h-10 w-16" />
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
        </div>
    )
}

function CardSkeleton() {
    return (
      <div className="p-4 border rounded-lg space-y-3">
        <div className="flex items-start gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className='flex-1 space-y-2'>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-8 w-8" />
        </div>
        <div className="space-y-3">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-2/3" />
        </div>
        <div className='flex items-center justify-between pt-2'>
            <div className='space-y-2'>
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="flex gap-2 pt-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

export function TenantList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { tenants, isInitialized } = useTenants();
  
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

  if (!isInitialized) {
      return <TenantListSkeleton />;
  }

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
