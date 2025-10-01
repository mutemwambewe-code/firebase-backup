'use server';
/**
 * @fileOverview An AI-powered tool for automated rent reminder communication.
 *
 * - automatedCommunication - A function that determines the best time to send rent reminders and generates customized messages.
 * - AutomatedCommunicationInput - The input type for the automatedCommunication function.
 * - AutomatedCommunicationOutput - The return type for the automatedCommunication function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomatedCommunicationInputSchema = z.object({
  tenantName: z.string().describe('The name of the tenant.'),
  rentDueDate: z.string().describe('The due date for the rent payment (YYYY-MM-DD).'),
  rentAmount: z.number().describe('The amount of rent due.'),
  communicationPreferences: z.array(z.enum(['SMS', 'WhatsApp'])).describe('The preferred communication methods of the tenant.'),
  paymentHistory: z.string().describe('A summary of the tenant\'s payment history.'),
  currentDate: z.string().describe('The current date (YYYY-MM-DD).'),
});
export type AutomatedCommunicationInput = z.infer<typeof AutomatedCommunicationInputSchema>;

const AutomatedCommunicationOutputSchema = z.object({
  message: z.string().describe('The content of the rent reminder message.'),
  sendTime: z.string().describe('The suggested time to send the reminder (HH:mm in 24-hour format).'),
  communicationMethod: z.enum(['SMS', 'WhatsApp']).describe('The recommended communication method.'),
});
export type AutomatedCommunicationOutput = z.infer<typeof AutomatedCommunicationOutputSchema>;

export async function automatedCommunication(input: AutomatedCommunicationInput): Promise<AutomatedCommunicationOutput> {
  return automatedCommunicationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automatedCommunicationPrompt',
  input: {schema: AutomatedCommunicationInputSchema},
  output: {schema: AutomatedCommunicationOutputSchema},
  prompt: `You are an AI assistant designed to help Zambian landlords automate their rent collection process.

  Given the following information about a tenant, determine the best time to send a rent reminder and generate a personalized message.  Consider Zambian culture and business hours when determining the best time to send the reminder.

  Tenant Name: {{{tenantName}}}
  Rent Due Date: {{{rentDueDate}}}
  Rent Amount: {{{rentAmount}}}
  Communication Preferences: {{#each communicationPreferences}}{{{this}}} {{/each}}
  Payment History: {{{paymentHistory}}}
  Current Date: {{{currentDate}}}

  Respond with a message that is friendly and professional.

  Follow the format:
  {
  "message": "Your rent is due on",
  "sendTime": "14:00",
  "communicationMethod": "WhatsApp"
  }`,
});

const automatedCommunicationFlow = ai.defineFlow(
  {
    name: 'automatedCommunicationFlow',
    inputSchema: AutomatedCommunicationInputSchema,
    outputSchema: AutomatedCommunicationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
