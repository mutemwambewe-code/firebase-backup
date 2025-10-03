
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
import { Loader2, Send, Wand2, Eye, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Form, FormItem, FormControl } from '../ui/form';
import { useMessageLog } from './message-log-provider';
import type { Tenant } from '@/lib/types';
import { useProperties } from '../properties/property-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { MessageTemplates } from './message-templates';
import { sendSms } from '@/app/actions/send-sms';

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

const replacePlaceholders = (message: string, tenant?: Tenant): string => {
    if (!tenant) return message;

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
  const [isSending, setIsSending] = useState(false);
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

  const handleSend = async () => {
    if (!message) return;
    setIsSending(true);

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
      setIsSending(false);
      return;
    }

    try {
      let messagesSentCount = 0;
      // Handle bulk sending differently from single sends
      if (recipientType === 'group') {
        const phoneNumbers = recipients.map(r => r.phone);
        // NOTE: Africa's talking doesn't support personalizing bulk messages in one go.
        // We have to send them one by one if we want personalization.
        for (const tenant of recipients) {
            const personalizedMessage = replacePlaceholders(message, tenant);
            const res = await sendSms([tenant.phone], personalizedMessage);
            if (res.success) {
                messagesSentCount++;
                addMessageLog({
                    id: `msg_${Date.now()}_${tenant.id}`,
                    tenantId: tenant.id,
                    tenantName: tenant.name,
                    message: personalizedMessage,
                    date: new Date().toISOString(),
                    method: 'SMS',
                });
            } else {
                 console.error(`Failed to send SMS to ${tenant.name}: ${res.message}`);
            }
        }
      } else { // Individual sending
        const personalizedMessage = replacePlaceholders(message, selectedTenant);
        const res = await sendSms([selectedTenant!.phone], personalizedMessage);
        if (res.success) {
            messagesSentCount = 1;
            addMessageLog({
                id: `msg_${Date.now()}_${selectedTenant!.id}`,
                tenantId: selectedTenant!.id,
                tenantName: selectedTenant!.name,
                message: personalizedMessage,
                date: new Date().toISOString(),
                method: 'SMS',
            });
        }
      }

      if(messagesSentCount > 0) {
        toast({
            title: "Messages Sent!",
            description: `Your message has been sent to ${messagesSentCount} tenant(s).`
        });
        setMessage('');
        setResult(null);
      } else {
        throw new Error("SMS sending failed for all recipients.");
      }

    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Sending Failed',
        description: error.message || 'Could not send the message(s). Please check server logs.',
      });
    } finally {
        setIsSending(false);
    }
  }

  const handleTagClick = (tag: string) => {
    setMessage(prev => `${prev} {{${tag}}}`);
  };

  const isSendDisabled = !message || isSending || (recipientType === 'individual' && !selectedTenantId) || (recipientType === 'group' && !groupId);

  return (
    <Card className="mt-4 border-none shadow-none">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader>
                <CardTitle>Compose Message</CardTitle>
                <CardDescription>Select recipients and write your message.</CardDescription>
            </CardHeader>
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
                <Tabs defaultValue="write">
                    <TabsList className='grid w-full grid-cols-2'>
                        <TabsTrigger value="write"><Pencil className='mr-2'/> Write</TabsTrigger>
                        <TabsTrigger value="preview" disabled={recipientType !== 'individual' || !selectedTenant}><Eye className='mr-2' /> Preview</TabsTrigger>
                    </TabsList>
                    <TabsContent value="write" className='mt-4'>
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
                        <p className="text-xs text-muted-foreground mt-2">
                            {message.length} chars ({Math.ceil(message.length / 160)} SMS)
                        </p>
                    </TabsContent>
                    <TabsContent value="preview" className='mt-4'>
                        <div className="p-4 border rounded-md bg-muted/20 min-h-[170px] text-sm whitespace-pre-wrap">
                            {replacePlaceholders(message, selectedTenant)}
                        </div>
                         <p className="text-xs text-muted-foreground mt-2">
                            This is a preview for {selectedTenant?.name}. Placeholders are not shown for bulk groups.
                        </p>
                    </TabsContent>
                </Tabs>
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
          <CardFooter className="flex justify-between items-center border-t pt-6">
            <Button type="submit" variant="outline" disabled={isLoading || isSending || recipientType === 'group' || !selectedTenantId}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Generate with AI
            </Button>
            <Button onClick={handleSend} disabled={isSendDisabled}>
              {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Send Message
            </Button>
          </CardFooter>
        </form>
      </Form>

      <MessageTemplates onTemplateSelect={setMessage} />

    </Card>
  );
}
