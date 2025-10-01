
'use client';

import { AutomatedReminder } from "@/components/communication/automated-reminder";
import { MessageLogs } from "@/components/communication/message-logs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, History, MessagesSquare } from "lucide-react";

export default function CommunicationPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Messaging</h1>
        <p className="text-muted-foreground">
          Compose, view, and manage your tenant communications.
        </p>
      </div>

      <Tabs defaultValue="compose" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compose">
            <MessagesSquare className="mr-2" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="logs">
            <History className="mr-2" />
            Message Logs
          </TabsTrigger>
          <TabsTrigger value="templates" disabled>
            <FileText className="mr-2" />
            Templates
          </TabsTrigger>
        </TabsList>
        <TabsContent value="compose">
          <AutomatedReminder />
        </TabsContent>
        <TabsContent value="logs">
            <MessageLogs />
        </TabsContent>
        <TabsContent value="templates">
          {/* Placeholder for future templates component */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
