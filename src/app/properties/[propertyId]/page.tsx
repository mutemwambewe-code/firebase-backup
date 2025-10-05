
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTenants } from '@/components/tenants/tenant-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import { ArrowLeft, Building, MapPin, Users, Tag, Edit } from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { AddTenant } from '@/components/tenants/add-tenant';
import { useProperties } from '@/components/properties/property-provider';
import { EditProperty } from '@/components/properties/edit-property';

const statusStyles = {
  Paid: 'bg-accent text-accent-foreground border-transparent',
  Pending: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30 dark:text-yellow-400',
  Overdue: 'bg-destructive/20 text-destructive border-destructive/30',
};

function PropertyDetailPage({ title }: { title?: string }) {
  const params = useParams();
  const router = useRouter();
  const { tenants } = useTenants();
  const { properties } = useProperties();
  
  const propertyId = params.propertyId as string;
  const property = properties.find((p) => p.id === propertyId);

  if (!property) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-full">
        <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-2xl font-bold tracking-tight">Property not found</h3>
            <p className="text-sm text-muted-foreground">
                The property you are looking for does not exist.
            </p>
            <Link href="/properties">
                <Button variant="outline" className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Properties
                </Button>
            </Link>
        </div>
      </div>
    );
  }

  const tenantsInProperty = tenants.filter(t => t.property === property.name);
  const occupancyRate = property.units > 0 ? (tenantsInProperty.length / property.units) * 100 : 0;

  const handleRowClick = (tenantId: string) => {
    router.push(`/tenants/${tenantId}`);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
       <div className='flex justify-between items-start flex-col sm:flex-row sm:items-center gap-4'>
            <div className='flex-1'>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Building />
                    {property.name}
                </h1>
                <div className="flex items-center gap-4 text-muted-foreground mt-1">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {property.location}
                    </div>
                     <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        {property.type}
                    </div>
                </div>
            </div>
            <div className='flex items-center gap-2'>
                <Link href="/properties">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </Link>
                <EditProperty property={property}>
                    <Button>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Property
                    </Button>
                </EditProperty>
            </div>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Property Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <Users className="h-8 w-8 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Occupancy</p>
                        <p className="text-xl font-bold">{tenantsInProperty.length} / {property.units}</p>
                    </div>
                </div>
                 <div className="flex flex-col justify-center gap-2 p-4 border rounded-lg col-span-2">
                    <div className='flex items-center justify-between'>
                        <span className='text-sm text-muted-foreground'>Occupancy Rate</span>
                        <span className='text-sm font-bold'>{occupancyRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={occupancyRate} className="h-3" />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Tenants</CardTitle>
                  <CardDescription>
                    A list of all tenants in {property.name}.
                  </CardDescription>
                </div>
                <AddTenant />
              </div>
            </CardHeader>
            <CardContent>
              {tenantsInProperty.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Rent Status</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead className='text-right'>Rent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenantsInProperty.map((tenant) => (
                      <TableRow key={tenant.id} onClick={() => handleRowClick(tenant.id)} className="cursor-pointer">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage asChild src={tenant.avatarUrl}>
                                    <Image src={tenant.avatarUrl} alt={tenant.name} width={40} height={40} />
                                </AvatarImage>
                                <AvatarFallback>{tenant.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{tenant.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{tenant.unit}</TableCell>
                        <TableCell>
                            <Badge className={cn('text-xs', statusStyles[tenant.rentStatus])}>
                                {tenant.rentStatus}
                            </Badge>
                        </TableCell>
                        <TableCell>{tenant.phone}</TableCell>
                        <TableCell className='text-right'>ZMW {tenant.rentAmount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h2 className="text-xl font-semibold">No Tenants in this Property</h2>
                    <p className="text-muted-foreground mt-2">Add a tenant to see them listed here.</p>
                </div>
              )}
            </CardContent>
          </Card>
    </div>
  );
}

PropertyDetailPage.title = "Property Details";
export default PropertyDetailPage;
