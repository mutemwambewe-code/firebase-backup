'use client';

import { useState } from 'react';
import type { Property } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Plus, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { properties as allProperties } from '@/lib/data';
import { useTenants } from '../tenants/tenant-provider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function PropertyList() {
  const [searchTerm, setSearchTerm] = useState('');
  const { tenants } = useTenants();
  const router = useRouter();

  const propertiesWithOccupancy = allProperties.map(p => {
    const occupiedCount = tenants.filter(t => t.property === p.name).length;
    return { ...p, occupied: occupiedCount };
  });

  const filteredProperties = propertiesWithOccupancy.filter((property) =>
    property.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRemoveProperty = (id: string) => {
    // This is a mock implementation. In a real app, you'd update the state.
    alert(`Removing property ${id}. This is a mock action.`);
  };
  
  const handleRowClick = (propertyId: string) => {
    router.push(`/properties/${propertyId}`);
  };

  if (!allProperties.length) {
    return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">No properties yet</h2>
            <p className="text-muted-foreground mt-2">Add your first property to get started.</p>
            <Button className="mt-4">
                <Plus className="mr-2" />
                Add Property
            </Button>
        </div>
    )
  }

  return (
    <Card>
        <CardHeader>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                <div>
                    <CardTitle>Properties</CardTitle>
                    <CardDescription>A list of all your properties.</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                    <div className="relative sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search properties..."
                            className="pl-8 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button className='w-full sm:w-auto'>
                        <Plus className="mr-2" />
                        Add Property
                    </Button>
                </div>
            </div>
        </CardHeader>
      <CardContent>
        {filteredProperties.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[30%]'>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Total Units</TableHead>
                <TableHead>Occupied Units</TableHead>
                <TableHead>Occupancy Rate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProperties.map((property) => {
                  const occupancyRate = property.units > 0 ? (property.occupied / property.units) * 100 : 0;
                  return (
                      <TableRow key={property.id} onClick={() => handleRowClick(property.id)} className="cursor-pointer">
                          <TableCell className="font-medium">{property.name}</TableCell>
                          <TableCell>{property.location}</TableCell>
                          <TableCell>{property.units}</TableCell>
                          <TableCell>{property.occupied}</TableCell>
                          <TableCell>
                              <div className='flex items-center gap-2'>
                                  <Progress value={occupancyRate} className="w-24 h-2" />
                                  <span className='text-muted-foreground text-xs'>{occupancyRate.toFixed(0)}%</span>
                              </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                  <MoreHorizontal />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/properties/${property.id}`}>View Details</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); alert('Edit functionality coming soon!')}}>Edit</DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {e.stopPropagation(); handleRemoveProperty(property.id)}}
                                  className="text-destructive"
                                >
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                      </TableRow>
                  )
              })}
            </TableBody>
          </Table>
        ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg col-span-full">
                <h2 className="text-xl font-semibold">No matching properties</h2>
                <p className="text-muted-foreground mt-2">Try adjusting your search.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
