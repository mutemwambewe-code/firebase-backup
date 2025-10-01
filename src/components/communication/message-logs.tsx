
'use client';

import { useMessageLog } from "./message-log-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { format } from "date-fns";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { History } from "lucide-react";

export function MessageLogs() {
  const { messageLogs, isInitialized } = useMessageLog();

  if (!isInitialized) {
    return <div>Loading logs...</div>;
  }
  
  return (
    <Card className="mt-4 border-none shadow-none">
      <CardHeader>
        <CardTitle>Message History</CardTitle>
        <CardDescription>A log of all messages sent to tenants.</CardDescription>
      </CardHeader>
      <CardContent>
        {messageLogs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messageLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-muted-foreground w-[150px]">
                    {format(new Date(log.date), 'PPp')}
                  </TableCell>
                  <TableCell>
                    <Link href={`/tenants/${log.tenantId}`} className="font-medium hover:underline">
                      {log.tenantName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.method}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-sm">
                    {log.message}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg col-span-full">
                <History className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold mt-4">No Messages Sent Yet</h2>
                <p className="text-muted-foreground mt-2">Your message history will appear here once you send a message.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
