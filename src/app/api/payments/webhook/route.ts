import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || request.headers.get('stripe-signature');

    // In production, verify signature with PAYMENT_WEBHOOK_SECRET
    // For now, parse event and update order status in Supabase
    const event = JSON.parse(body);

    const supabase = await createClient();

    if (event.event === 'payment.captured' || event.type === 'checkout.session.completed') {
      const paymentData = event.payload?.payment?.entity || event.data?.object;
      const orderId = paymentData?.notes?.order_id || paymentData?.metadata?.order_id;

      if (orderId) {
        await supabase
          .from('orders')
          .update({
            status: 'paid',
            razorpay_payment_id: paymentData.id || paymentData.payment_intent,
          })
          .eq('id', orderId);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
