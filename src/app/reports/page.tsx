import { BarChart } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-full">
      <div className="flex flex-col items-center gap-2 text-center">
        <BarChart className="h-16 w-16 text-muted-foreground" />
        <h3 className="text-2xl font-bold tracking-tight">
          Reports Coming Soon
        </h3>
        <p className="text-sm text-muted-foreground">
          Detailed financial and occupancy reports will be available here.
        </p>
      </div>
    </div>
  );
}
