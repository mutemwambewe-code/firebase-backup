import Image from 'next/image';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Tenant } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Phone, Mail, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { EditTenant } from './edit-tenant';

interface TenantCardProps {
  tenant: Tenant;
}

const statusStyles = {
  Paid: 'bg-accent text-accent-foreground border-transparent',
  Pending: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30 dark:text-yellow-400',
  Overdue: 'bg-destructive/20 text-destructive border-destructive/30',
};

export function TenantCard({ tenant }: TenantCardProps) {
  const avatar = PlaceHolderImages.find((p) => p.id === tenant.avatarId);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start gap-4">
        <Avatar className="h-14 w-14">
          {avatar && (
            <AvatarImage asChild src={avatar.imageUrl}>
                <Image src={avatar.imageUrl} alt={tenant.name} width={56} height={56} data-ai-hint={avatar.imageHint} />
            </AvatarImage>
          )}
          <AvatarFallback className="text-xl">
            {tenant.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
        <div className='flex-1'>
          <h3 className="text-lg font-bold">{tenant.name}</h3>
          <p className="text-sm text-muted-foreground">
            {tenant.property} - Unit {tenant.unit}
          </p>
        </div>
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className='h-8 w-8'>
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <EditTenant tenant={tenant} />
                <DropdownMenuItem className="text-destructive">
                    Delete Tenant
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{tenant.phone}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{tenant.email}</span>
        </div>
        <div className='flex items-center justify-between pt-2'>
            <div className='text-sm'>
                <p className="text-muted-foreground">Rent</p>
                <p className="font-semibold">ZMW {tenant.rentAmount.toLocaleString()}</p>
            </div>
             <Badge className={cn('text-xs', statusStyles[tenant.rentStatus])}>
                {tenant.rentStatus}
            </Badge>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" className="w-full">
          Log Payment
        </Button>
        <Link href={`/communication?tenantId=${tenant.id}`} className='w-full'>
          <Button className="w-full">Send Reminder</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
