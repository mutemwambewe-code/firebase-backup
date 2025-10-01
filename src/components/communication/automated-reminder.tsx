'use client';

import { automatedCommunication, type AutomatedCommunicationOutput } from '@/ai/flows/automated-communication';
import { tenants } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'next/navigation';
import { Loader2, Send, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const formSchema = z.object({
  tenantId: z.string().min(1, 'Please select a tenant.'),
});

type FormData = z.infer<typeof formSchema>;

export function AutomatedReminder() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AutomatedCommunicationOutput | null>(null);

  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tenantId: searchParams.get('tenantId') || '',
    },
  });

  const selectedTenantId = watch('tenantId');
  const selectedTenant = tenants.find((t) => t.id === selectedTenantId);

  async function onSubmit(data: FormData) {
    if (!selectedTenant) return;
    setIsLoading(true);
    setResult(null);

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
    toast({
        title: "Reminder Sent!",
        description: `Your reminder has been sent to ${selectedTenant?.name}.`
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reminder Generator</CardTitle>
        <CardDescription>Select a tenant to generate a personalized rent reminder using AI.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tenantId">Tenant</Label>
            <Controller
              name="tenantId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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

          {result && (
            <div className='space-y-4 pt-4'>
                <Alert>
                    <Wand2 className="h-4 w-4" />
                    <AlertTitle>AI Suggestion</AlertTitle>
                    <AlertDescription>
                        Suggested time to send: <strong>{result.sendTime}</strong> via <strong>{result.communicationMethod}</strong>.
                    </AlertDescription>
                </Alert>
                <div className="space-y-2">
                    <Label htmlFor="message">Generated Message</Label>
                    <Textarea id="message" value={result.message} rows={5} />
                </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="submit" disabled={isLoading || !selectedTenantId}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Generate
          </Button>
          {result && (
            <Button onClick={handleSend}>
              <Send className="mr-2 h-4 w-4" />
              Send Reminder
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
