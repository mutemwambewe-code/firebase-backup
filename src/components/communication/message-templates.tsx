
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clipboard, MoreVertical, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTemplates } from "./template-provider";
import { AddTemplate } from "./add-template";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";
import type { Template } from "@/lib/types";

export function MessageTemplates() {
  const { toast } = useToast();
  const { templates, isInitialized, deleteTemplate } = useTemplates();
  
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
        title: "Template Copied!",
        description: "You can now paste the template in the compose box."
    })
  }

  const handleDelete = (template: Template) => {
    let deletionTimeout: NodeJS.Timeout;

    const performDelete = () => {
      deleteTemplate(template.id);
    }

    deletionTimeout = setTimeout(performDelete, 5000);

    toast({
      title: "Template Deleted",
      description: `"${template.title}" has been moved to trash.`,
      action: (
        <Button
          variant="secondary"
          onClick={() => {
            clearTimeout(deletionTimeout);
            // The template is not yet deleted, so we just need to cancel the deletion.
            // Re-adding is not necessary with this logic.
            toast({
              title: "Deletion Undone",
              description: `"${template.title}" has been restored.`,
            });
          }}
        >
          Undo
        </Button>
      ),
    });
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
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-base flex-grow">{template.title}</CardTitle>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                                                            <MoreVertical className="h-4 w-4"/>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleCopy(template.content)}>
                                                            <Clipboard className="mr-2 h-4 w-4" /> Copy
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(template)}>
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <p className="text-sm text-muted-foreground">{template.content}</p>
                                        </CardContent>
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
