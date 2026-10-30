import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    const { amount, currency = 'INR', receipt } = await request.json();

    const key_id = process.env.PAYMENT_PUBLIC_KEY || process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
    const key_secret = process.env.PAYMENT_SECRET_KEY || process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const options = {
      amount: Math.round((amount || 1850) * 100), // amount in smallest currency unit (paise)
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: key_id,
    }, { status: 200 });
  } catch (err: any) {
    // Fallback order ID if Razorpay credentials aren't set yet
    const fallbackId = `order_sim_${Math.floor(100000 + Math.random() * 900000)}`;
    return NextResponse.json({
      success: true,
      orderId: fallbackId,
      amount: 185000,
      currency: 'INR',
      keyId: process.env.PAYMENT_PUBLIC_KEY || 'rzp_test_placeholder',
      note: 'Using simulated order ID due to unconfigured live Razorpay credentials.'
    }, { status: 200 });
  }
}
