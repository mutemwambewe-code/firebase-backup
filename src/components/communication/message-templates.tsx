
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clipboard, FileText, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


const templates = [
    {
        category: "Rent Reminders",
        items: [
            {
                title: "Gentle Rent Due Reminder",
                content: "Hi {{name}}, just a friendly reminder that your rent of ZMW {{rent_due}} is due on {{due_date}}. Thank you!"
            },
            {
                title: "Rent Overdue Notice",
                content: "Hi {{name}}, your rent of ZMW {{rent_due}} was due on {{due_date}} and is now overdue. Please make the payment as soon as possible to avoid late fees. Thank you."
            }
        ]
    },
    {
        category: "Lease Management",
        items: [
            {
                title: "Lease Expiration Reminder",
                content: "Hi {{name}}, this is a reminder that your lease for unit {{unit}} at {{property}} is set to expire on {{lease_end_date}}. Please let us know if you plan to renew. Thanks!"
            },
            {
                title: "Lease Renewal Confirmation",
                content: "Hi {{name}}, thank you for renewing your lease for another term. We're happy to have you continue your stay with us at {{property}}."
            }
        ]
    },
    {
        category: "Payments",
        items: [
            {
                title: "Payment Confirmation",
                content: "Hi {{name}}, we have received your payment of ZMW {{payment_amount}}. Thank you for being a great tenant!"
            }
        ]
    },
    {
        category: "General Announcements",
        items: [
            {
                title: "Maintenance Announcement",
                content: "Hello residents of {{property}}, please be advised that scheduled maintenance will occur on {{date}} between {{start_time}} and {{end_time}}. We apologize for any inconvenience."
            },
            {
                title: "Holiday Greetings",
                content: "Warm holiday wishes to all our tenants! We hope you have a wonderful and safe holiday season."
            }
        ]
    }
]

export function MessageTemplates() {
  const { toast } = useToast();

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
        title: "Template Copied!",
        description: "You can now paste the template in the compose box."
    })
  }
    
  return (
    <Card className="mt-4 border-none shadow-none">
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Message Templates</CardTitle>
                    <CardDescription>Use these templates to quickly compose messages.</CardDescription>
                </div>
                <Button disabled>
                    <Plus className="mr-2"/>
                    New Template (soon)
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <Accordion type="multiple" defaultValue={["Rent Reminders"]} className="w-full">
                {templates.map(category => (
                     <AccordionItem value={category.category} key={category.category}>
                        <AccordionTrigger className="text-lg font-semibold">{category.category}</AccordionTrigger>
                        <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {category.items.map(template => (
                                    <Card key={template.title} className="flex flex-col">
                                        <CardHeader>
                                            <CardTitle className="text-base">{template.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <p className="text-sm text-muted-foreground">{template.content}</p>
                                        </CardContent>
                                        <div className="p-4 pt-0">
                                            <Button variant="outline" size="sm" onClick={() => handleCopy(template.content)}>
                                                <Clipboard className="mr-2" />
                                                Copy
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </CardContent>
    </Card>
  );
}
