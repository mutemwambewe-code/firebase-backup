
import { PropertyList } from "@/components/properties/property-list";

export default function PropertiesPage({ title }: { title?: string }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Property Management</h1>
        <p className="text-muted-foreground">
          View, add, and manage your properties.
        </p>
      </div>
      <PropertyList />
    </div>
  );
}

PropertiesPage.title = "Property Management";
