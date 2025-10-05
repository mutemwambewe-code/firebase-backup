
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { tenants as staticTenants } from '@/lib/data'; // Using static data for now

// This is a simplified in-memory "database" lookup.
// In a real app, you would fetch this from your actual database (e.g., Firestore).
async function findTenantByPhoneNumber(phoneNumber: string) {
  // The phone numbers from Africa's Talking are in international format e.g. +260...
  // We need to make sure our stored numbers are in a comparable format.
  // This is a basic normalization, you might need a more robust library for this.
  const normalizedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
  
  // Find the tenant. This is a very naive lookup and should be optimized in a real app.
  // It assumes the stored number might or might not have the '+'
  const tenant = staticTenants.find(t => {
    const tenantNumber = t.phone.startsWith('+') ? t.phone : `+${t.phone.replace(/\s/g, '')}`;
    return tenantNumber === normalizedNumber;
  });

  return tenant;
}

// In a real application, you would use a proper state management solution
// that can be shared between your webhook and your frontend, like a database.
// Since we are using localStorage on the frontend, we cannot directly update it from here.
// This is a placeholder for where you'd interact with your database.
async function addIncomingMessageToLog(tenant: any, message: string, date: string, messageId: string) {
    console.log(`[Webhook] Storing incoming message from ${tenant.name} (${tenant.phone}): "${message}"`);
    // In a real app, you would do something like:
    // await db.collection('messageLogs').add({
    //     id: messageId,
    //     tenantId: tenant.id,
    //     tenantName: tenant.name,
    //     message: message,
    //     date: date,
    //     method: 'SMS',
    //     direction: 'incoming',
    // });

    // Since we can't update frontend localStorage from the server, we'll revalidate the path
    // If the frontend were fetching data, this would trigger a refetch.
    revalidatePath('/communication');
}

async function updateMessageDeliveryStatus(messageId: string, status: string) {
    console.log(`[Webhook] Updating status for message ${messageId} to: ${status}`);
    // In a real app, you would do something like:
    // await db.collection('messageLogs').doc(messageId).update({ status: status });
    revalidatePath('/communication');
}


// The main handler for POST requests from Africa's Talking
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const body = Object.fromEntries(formData.entries());

    console.log('[Webhook] Received request from Africa\'s Talking with body:', body);
    
    // Check if it's an incoming message
    if (body.from && body.text) {
      const { from, text, date, id } = body as { from: string; text: string; date: string; id: string };
      const tenant = await findTenantByPhoneNumber(from);

      if (tenant) {
        await addIncomingMessageToLog(tenant, text, date, id);
      } else {
        console.warn(`[Webhook] Received message from unknown number: ${from}`);
      }
    } 
    // Check if it's a delivery report
    else if (body.id && body.status) {
      const { id, status, failureReason } = body as { id: string; status: string; failureReason?: string };
      const finalStatus = status === 'Failed' ? `${status}: ${failureReason}` : status;
      await updateMessageDeliveryStatus(id, finalStatus);
    } 
    // It might be an event notification for a sent message that does not have a status yet
    else if (body.id && !body.status){
      console.log(`[Webhook] Received an event notification for message ID: ${body.id}. Awaiting delivery report.`);
    }
    else {
      console.warn('[Webhook] Received an unhandled request format:', body);
    }

    // Africa's Talking expects a 200 OK response to acknowledge receipt
    return new NextResponse('OK', { status: 200 });

  } catch (error: any) {
    console.error('[Webhook] Error processing request:', error);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}
