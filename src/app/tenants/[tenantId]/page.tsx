
'use client';

import { useParams } from 'next/navigation';
import { useTenants } from '@/components/tenants/tenant-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { ArrowLeft, Edit, Mail, MessageSquare, Phone, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { LogPayment } from '@/components/tenants/log-payment';
import { EditTenant } from '@/components/tenants/edit-tenant';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const statusStyles = {
  Paid: 'bg-accent text-accent-foreground border-transparent',
  Pending: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30 dark:text-yellow-400',
  Overdue: 'bg-destructive/20 text-destructive border-destructive/30',
};

export default function TenantDetailPage() {
  const params = useParams();
  const { tenants } = useTenants();
  const { toast } = useToast();
  
  const tenantId = params.tenantId as string;
  const tenant = tenants.find((t) => t.id === tenantId);
  const avatar = tenant ? PlaceHolderImages.find((p) => p.id === tenant.avatarId) : null;

  if (!tenant) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-full">
        <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-2xl font-bold tracking-tight">Tenant not found</h3>
            <p className="text-sm text-muted-foreground">
                The tenant you are looking for does not exist.
            </p>
            <Link href="/tenants">
                <Button variant="outline" className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Tenants
                </Button>
            </Link>
        </div>
      </div>
    );
  }

    const handleDelete = () => {
        toast({
            variant: "destructive",
            title: "Feature coming soon!",
            description: "The ability to delete tenants is not yet implemented.",
        })
    }

  return (
    <div className="flex flex-col gap-6">
       <div className='flex justify-start'>
            <Link href="/tenants">
                <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Tenants
                </Button>
            </Link>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader className="items-center text-center">
              <Avatar className="h-24 w-24 mb-2">
                {avatar && (
                  <AvatarImage asChild src={avatar.imageUrl}>
                    <Image src={avatar.imageUrl} alt={tenant.name} width={96} height={96} data-ai-hint={avatar.imageHint} />
                  </AvatarImage>
                )}
                <AvatarFallback className="text-3xl">
                  {tenant.name.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{tenant.name}</CardTitle>
              <CardDescription>
                {tenant.property} - Unit {tenant.unit}
              </CardDescription>
               <Badge className={cn('text-sm mt-2', statusStyles[tenant.rentStatus])}>
                {tenant.rentStatus}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{tenant.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{tenant.email}</span>
                </div>
                <div className="border-t pt-4 space-y-2">
                     <div className='flex justify-between items-center text-sm'>
                        <span className='text-muted-foreground'>Rent Amount:</span>
                        <span className='font-semibold'>ZMW {tenant.rentAmount.toLocaleString()}</span>
                     </div>
                     <div className='flex justify-between items-center text-sm'>
                        <span className='text-muted-foreground'>Lease Start:</span>
                        <span className='font-semibold'>{format(new Date(tenant.leaseStartDate), 'PPP')}</span>
                     </div>
                     <div className='flex justify-between items-center text-sm'>
                        <span className='text-muted-foreground'>Lease End:</span>
                        <span className='font-semibold'>{format(new Date(tenant.leaseEndDate), 'PPP')}</span>
                     </div>
                </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
                <LogPayment tenant={tenant}>
                    <Button variant="outline" className="w-full">
                        Log Payment
                    </Button>
                </LogPayment>
                <Link href={`/communication?tenantId=${tenant.id}`} className='w-full'>
                    <Button className="w-full">
                        <MessageSquare className="mr-2" />
                        Send Reminder
                    </Button>
                </Link>
                <EditTenant tenant={tenant}>
                    <Button variant='outline' className='w-full'>
                        <Edit className='mr-2' /> Edit
                    </Button>
                </EditTenant>
                <Button variant="destructive" className="w-full" onClick={handleDelete}>
                    <Trash2 className="mr-2" />
                    Delete
                </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                A complete record of all payments made by {tenant.name}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tenant.paymentHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenant.paymentHistory.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{format(new Date(payment.date), 'PPP')}</TableCell>
                        <TableCell>ZMW {payment.amount.toLocaleString()}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h2 className="text-xl font-semibold">No Payments Recorded</h2>
                    <p className="text-muted-foreground mt-2">Log a payment to see the history here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
