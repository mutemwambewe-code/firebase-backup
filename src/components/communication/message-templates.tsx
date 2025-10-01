
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clipboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTemplates } from "./template-provider";
import { AddTemplate } from "./add-template";

export function MessageTemplates() {
  const { toast } = useToast();
  const { templates, isInitialized } = useTemplates();
  
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
        title: "Template Copied!",
        description: "You can now paste the template in the compose box."
    })
  }

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, typeof templates>);
    
  if (!isInitialized) {
    return <div>Loading templates...</div>;
  }

  return (
    <Card className="mt-4 border-none shadow-none">
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Message Templates</CardTitle>
                    <CardDescription>Use these templates to quickly compose messages.</CardDescription>
                </div>
                <AddTemplate />
            </div>
        </CardHeader>
        <CardContent>
            <Accordion type="multiple" defaultValue={["Rent Reminders"]} className="w-full">
                {Object.entries(groupedTemplates).map(([category, items]) => (
                     <AccordionItem value={category} key={category}>
                        <AccordionTrigger className="text-lg font-semibold">{category}</AccordionTrigger>
                        <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {items.map(template => (
                                    <Card key={template.id} className="flex flex-col">
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
