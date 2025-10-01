'use client';

import { useState } from 'react';
import { properties as allProperties } from '@/lib/data';
import type { Property } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

export function PropertyList() {
  const [properties, setProperties] = useState<Property[]>(allProperties);

  const handleRemoveProperty = (id: string) => {
    setProperties(properties.filter((p) => p.id !== id));
  };

  if (!properties.length) {
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
            <div className='flex justify-between items-start'>
                <div>
                    <CardTitle>Properties</CardTitle>
                    <CardDescription>A list of all your properties.</CardDescription>
                </div>
                <Button>
                    <Plus className="mr-2" />
                    Add Property
                </Button>
            </div>
        </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[40%]'>Name</TableHead>
              <TableHead>Total Units</TableHead>
              <TableHead>Occupied Units</TableHead>
              <TableHead>Occupancy Rate</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property) => {
                const occupancyRate = (property.occupied / property.units) * 100;
                return (
                    <TableRow key={property.id}>
                        <TableCell className="font-medium">{property.name}</TableCell>
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
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRemoveProperty(property.id)}
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
      </CardContent>
    </Card>
  );
}
