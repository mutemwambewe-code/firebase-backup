
'use client';

import { automatedCommunication, type AutomatedCommunicationOutput } from '@/ai/flows/automated-communication';
import { useTenants } from '@/components/tenants/tenant-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'next/navigation';
import { Loader2, Send, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Form, FormItem, FormControl } from '../ui/form';
import { useMessageLog } from './message-log-provider';
import type { Tenant } from '@/lib/types';
import { useProperties } from '../properties/property-provider';

const formSchema = z.object({
  tenantId: z.string().optional(),
  recipientType: z.enum(['individual', 'group']).default('individual'),
  groupId: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const tags = ['name', 'rent_due', 'arrears', 'due_date', 'property', 'lease_end_date'];

interface AutomatedReminderProps {
    message: string;
    setMessage: (message: string) => void;
}

const replacePlaceholders = (message: string, tenant: Tenant): string => {
    const arrears = tenant.rentStatus === 'Overdue' ? tenant.rentAmount : 0;
    const dueDate = new Date(); // Using today as a proxy for due date
    dueDate.setDate(5); // Assuming due date is the 5th
  
    return message
      .replace(/{{name}}/g, tenant.name)
      .replace(/{{rent_due}}/g, `ZMW ${tenant.rentAmount.toLocaleString()}`)
      .replace(/{{arrears}}/g, `ZMW ${arrears.toLocaleString()}`)
      .replace(/{{due_date}}/g, dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }))
      .replace(/{{property}}/g, tenant.property)
      .replace(/{{lease_end_date}}/g, new Date(tenant.leaseEndDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  };

export function AutomatedReminder({ message, setMessage }: AutomatedReminderProps) {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { tenants } = useTenants();
  const { properties } = useProperties();
  const { addMessageLog } = useMessageLog();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AutomatedCommunicationOutput | null>(null);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tenantId: searchParams.get('tenantId') || '',
      recipientType: searchParams.get('tenantId') ? 'individual' : 'group',
      groupId: '',
    },
  });

  const { control, handleSubmit, watch, formState: { errors }, setValue } = form;

  const selectedTenantId = watch('tenantId');
  const recipientType = watch('recipientType');
  const groupId = watch('groupId');
  const selectedTenant = tenants.find((t) => t.id === selectedTenantId);

  const bulkGroups = [
    { id: 'all', name: 'All Tenants' },
    { id: 'arrears', name: 'Tenants in Arrears' },
    { id: 'pending', name: 'Tenants with Pending Payments' },
    ...properties.map(p => ({id: `prop-${p.id}`, name: `All Tenants in ${p.name}`})),
  ];
  
  useEffect(() => {
    const tenantIdFromParams = searchParams.get('tenantId');
    if (tenantIdFromParams) {
        setValue('tenantId', tenantIdFromParams);
        setValue('recipientType', 'individual');
    }
  }, [searchParams, setValue]);

  useEffect(() => {
    if (result) {
      setMessage(result.message);
    }
  }, [result, setMessage]);

  async function onSubmit(data: FormData) {
    if (!selectedTenant) return;
    setIsLoading(true);
    setResult(null);
    setMessage('');

    try {
      const input = {
        tenantName: selectedTenant.name,
        rentDueDate: selectedTenant.leaseEndDate, // Using lease end date as a proxy
        rentAmount: selectedTenant.rentAmount,
        communicationPreferences: ['SMS', 'WhatsApp'] as ('SMS' | 'WhatsApp')[],
        paymentHistory: selectedTenant.paymentHistorySummary,
        currentDate: new Date().toISOString().split('T')[0],
      };
      const response = await automatedCommunication(input);
      setResult(response);
      setMessage(response.message); // Set message on generation
    } catch (error) {
      console.error('Error generating reminder:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate reminder. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSend = () => {
    if (!message) return;

    let recipients: Tenant[] = [];

    if (recipientType === 'individual' && selectedTenant) {
        recipients.push(selectedTenant);
    } else if (recipientType === 'group' && groupId) {
        if (groupId === 'all') {
            recipients = tenants;
        } else if (groupId === 'arrears') {
            recipients = tenants.filter(t => t.rentStatus === 'Overdue');
        } else if (groupId === 'pending') {
            recipients = tenants.filter(t => t.rentStatus === 'Pending');
        } else if (groupId.startsWith('prop-')) {
            const propId = groupId.replace('prop-', '');
            const prop = properties.find(p => p.id === propId);
            if (prop) {
                recipients = tenants.filter(t => t.property === prop.name);
            }
        }
    }
    
    if(recipients.length === 0) {
        toast({
            variant: "destructive",
            title: "No recipients found",
            description: "Please select a valid tenant or group with members."
        });
        return;
    }

    recipients.forEach(tenant => {
        const personalizedMessage = replacePlaceholders(message, tenant);
        addMessageLog({
            id: `msg_${Date.now()}_${tenant.id}`,
            tenantId: tenant.id,
            tenantName: tenant.name,
            message: personalizedMessage,
            date: new Date().toISOString(),
            method: result?.communicationMethod || 'SMS',
        });
    });

    toast({
        title: "Messages Sent!",
        description: `Your message has been sent to ${recipients.length} tenant(s).`
    });
    setMessage('');
    setResult(null);
  }

  const handleTagClick = (tag: string) => {
    setMessage(prev => `${prev} {{${tag}}}`);
  };

  const isSendDisabled = !message || (recipientType === 'individual' && !selectedTenantId) || (recipientType === 'group' && !groupId);

  return (
    <Card className="mt-4 border-none shadow-none">
      <CardHeader>
        <CardTitle>Compose New Message</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <Controller
              name="recipientType"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={(value) => {
                      field.onChange(value);
                      setValue('tenantId', '');
                      setValue('groupId', '');
                  }}
                  defaultValue={field.value}
                  className="flex items-center space-x-4"
                  value={field.value}
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="individual" id="individual" />
                    </FormControl>
                    <Label htmlFor="individual">Individual Tenant</Label>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="group" id="group" />
                    </FormControl>
                    <Label htmlFor="group">Bulk Group</Label>
                  </FormItem>
                </RadioGroup>
              )}
            />
            
            {recipientType === 'individual' && (
              <div className="space-y-2">
                <Label htmlFor="tenantId">Select Tenant</Label>
                <Controller
                  name="tenantId"
                  control={control}
                  render={({ field }) => (
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setResult(null);
                        setMessage('');
                      }} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <SelectTrigger id="tenantId">
                        <SelectValue placeholder="Select a tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map((tenant) => (
                          <SelectItem key={tenant.id} value={tenant.id}>
                            {tenant.name} ({tenant.property} - {tenant.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.tenantId && <p className="text-sm text-destructive">{errors.tenantId.message}</p>}
              </div>
            )}
            
            {recipientType === 'group' && (
                <div className="space-y-2">
                    <Label htmlFor="groupId">Select Group</Label>
                    <Controller
                        name="groupId"
                        control={control}
                        render={({ field }) => (
                        <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                        >
                            <SelectTrigger id="groupId">
                                <SelectValue placeholder="Select a bulk group" />
                            </SelectTrigger>
                            <SelectContent>
                                {bulkGroups.map((group) => (
                                    <SelectItem key={group.id} value={group.id}>
                                        {group.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        )}
                    />
                </div>
            )}


            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(tag => (
                      <Badge 
                          key={tag}
                          variant="outline"
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => handleTagClick(tag)}
                      >
                          {tag.replace(/_/g, ' ')}
                      </Badge>
                  ))}
              </div>
              <Textarea 
                  id="message" 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  rows={6}
                  placeholder="Type your message here or generate one with AI. Use tags like {{name}}."
              />
              <p className="text-xs text-muted-foreground">
                  {message.length} chars ({Math.ceil(message.length / 160)} SMS)
              </p>
            </div>
            
            {result && (
              <Alert>
                  <Wand2 className="h-4 w-4" />
                  <AlertTitle>AI Suggestion</AlertTitle>
                  <AlertDescription>
                      Suggested time to send: <strong>{result.sendTime}</strong> via <strong>{result.communicationMethod}</strong>.
                  </AlertDescription>
              </Alert>
            )}

          </CardContent>
          <CardFooter className="flex justify-between items-center border-t pt-6 mt-6">
            <Button type="submit" variant="outline" disabled={isLoading || recipientType === 'group' || !selectedTenantId}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Generate with AI
            </Button>
            <Button onClick={handleSend} disabled={isSendDisabled}>
              <Send className="mr-2 h-4 w-4" />
              Send Message
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
