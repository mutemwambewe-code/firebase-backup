
'use client';

import { automatedCommunication, type AutomatedCommunicationOutput } from '@/ai/flows/automated-communication';
import { tenants } from '@/lib/data';
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
import { FormItem, FormControl } from '../ui/form';

const formSchema = z.object({
  tenantId: z.string().min(1, 'Please select a tenant.'),
  recipientType: z.enum(['individual', 'group']).default('individual'),
});

type FormData = z.infer<typeof formSchema>;

const tags = ['name', 'rent_due', 'arrears', 'due_date', 'property', 'lease_end_date'];

export function AutomatedReminder() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AutomatedCommunicationOutput | null>(null);
  const [message, setMessage] = useState('');

  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tenantId: searchParams.get('tenantId') || '',
      recipientType: 'individual',
    },
  });

  const selectedTenantId = watch('tenantId');
  const recipientType = watch('recipientType');
  const selectedTenant = tenants.find((t) => t.id === selectedTenantId);

  useEffect(() => {
    if (result) {
      setMessage(result.message);
    }
  }, [result]);

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
    toast({
        title: "Message Sent!",
        description: `Your message has been sent to ${selectedTenant?.name}.`
    })
  }

  const handleTagClick = (tag: string) => {
    setMessage(prev => `${prev} {{${tag}}}`);
  }

  return (
    <Card className="mt-4 border-none shadow-none">
      <CardHeader>
        <CardTitle>Compose New Message</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <Controller
            name="recipientType"
            control={control}
            render={({ field }) => (
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex items-center space-x-4"
              >
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="individual" id="individual" />
                  </FormControl>
                  <Label htmlFor="individual">Individual Tenant</Label>
                </FormItem>
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="group" id="group" disabled />
                  </FormControl>
                  <Label htmlFor="group" className="opacity-50">Bulk Group (soon)</Label>
                </FormItem>
              </RadioGroup>
            )}
          />
          
          <div className={cn("space-y-2", recipientType === 'group' && 'opacity-50')}>
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
                  disabled={recipientType === 'group'}
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
            {errors.tenantId && recipientType === 'individual' && <p className="text-sm text-destructive">{errors.tenantId.message}</p>}
          </div>

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
          <Button type="submit" variant="outline" disabled={isLoading || !selectedTenantId}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Generate with AI
          </Button>
          <Button onClick={handleSend} disabled={!message || !selectedTenantId}>
            <Send className="mr-2 h-4 w-4" />
            Send Message
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
