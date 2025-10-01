import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

export function MessageTemplates() {
  return (
    <Card className="mt-4 border-none shadow-none">
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Message Templates</CardTitle>
                    <CardDescription>Create and manage reusable message templates.</CardDescription>
                </div>
                <Button disabled>
                    <Plus className="mr-2"/>
                    New Template
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-center py-16 border-2 border-dashed rounded-lg col-span-full">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold mt-4">Templates Coming Soon</h2>
                <p className="text-muted-foreground mt-2">You will soon be able to create and save message templates here.</p>
            </div>
        </CardContent>
    </Card>
  );
}
