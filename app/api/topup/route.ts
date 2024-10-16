import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";

const generatedSignature = (razorpayOrderId: string, razorpayPaymentId: string) => {
  const keySecret = process.env.RAZORPAY_API_SECRET as string;

  const sig = crypto
    .createHmac("sha256", keySecret)
    .update(razorpayOrderId + "|" + razorpayPaymentId)
    .digest("hex");
  return sig;
};

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_APIKEY as string,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

export const POST = async (req: Request) => {
  const { amount } = await req.json();
  const order = await razorpay.orders.create({
    amount,
    currency: "INR",
  });

  return NextResponse.json(order);
}

export async function PUT(request: NextRequest) {
  const { orderId, razorpayPaymentId, razorpaySignature } = await request.json();

  const signature = generatedSignature(orderId, razorpayPaymentId);
  if (signature !== razorpaySignature) {
    return NextResponse.json({ message: "payment verification failed", isOk: false }, { status: 400 });
  }

  // Probably some database calls here to update order or add premium status to user
  return NextResponse.json({ message: "payment verified successfully", isOk: true }, { status: 200 });
}
