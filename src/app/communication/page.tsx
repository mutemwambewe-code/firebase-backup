import { AutomatedReminder } from "@/components/communication/automated-reminder";

export default function CommunicationPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Automated Communication</h1>
        <p className="text-muted-foreground">
          Use AI to generate and schedule rent reminders for your tenants.
        </p>
      </div>
      <AutomatedReminder />
    </div>
  );
}
