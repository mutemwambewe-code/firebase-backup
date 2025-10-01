
'use client';

import { useMemo, useState } from 'react';
import type { Tenant } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TenantReportTableProps {
  tenants: Tenant[];
}

const statusStyles = {
    Paid: 'bg-accent text-accent-foreground border-transparent',
    Pending: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30 dark:text-yellow-400',
    Overdue: 'bg-destructive/20 text-destructive border-destructive/30',
};

export function TenantReportTable({ tenants }: TenantReportTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredTenants = useMemo(() => {
    return tenants
      .filter(tenant => {
        if (statusFilter === 'All') return true;
        return tenant.rentStatus === statusFilter;
      })
      .filter(tenant => 
        tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.property.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [tenants, searchTerm, statusFilter]);

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <CardTitle>Tenant Details</CardTitle>
                <CardDescription>A comprehensive list of all your tenants.</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by name or property..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className='w-[140px]'>
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Statuses</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Overdue">Overdue</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Property & Unit</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Lease End</TableHead>
              <TableHead>Rent</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell className="font-medium">{tenant.name}</TableCell>
                <TableCell>{tenant.property} - {tenant.unit}</TableCell>
                <TableCell>
                    <div className='flex flex-col'>
                        <span>{tenant.phone}</span>
                        <span className='text-muted-foreground text-xs'>{tenant.email}</span>
                    </div>
                </TableCell>
                <TableCell>{format(new Date(tenant.leaseEndDate), 'PPP')}</TableCell>
                <TableCell>ZMW {tenant.rentAmount.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge className={cn('text-xs', statusStyles[tenant.rentStatus])}>
                    {tenant.rentStatus}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
