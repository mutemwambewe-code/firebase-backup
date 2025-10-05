
import { TenantList } from "@/components/tenants/tenant-list";

export default function TenantsPage({ title }: { title?: string }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tenant Management</h1>
        <p className="text-muted-foreground">
          View, manage, and communicate with your tenants.
        </p>
      </div>
      <TenantList />
    </div>
  );
}

TenantsPage.title = "Tenant Management";
