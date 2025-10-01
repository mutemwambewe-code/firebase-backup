import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { tenants } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

export default function TenantActivity() {
  const recentTenants = tenants.slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Recent payments and new tenants.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {recentTenants.map((tenant) => {
          const avatar = PlaceHolderImages.find(p => p.id === tenant.avatarId);
          return (
            <div key={tenant.id} className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <Avatar>
                  {avatar && <AvatarImage asChild src={avatar.imageUrl}><Image src={avatar.imageUrl} alt={tenant.name} width={40} height={40} data-ai-hint={avatar.imageHint} /></AvatarImage>}
                  <AvatarFallback>{tenant.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">{tenant.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Paid rent for {tenant.unit}
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium text-accent">
                + ZMW {tenant.rentAmount.toLocaleString()}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
