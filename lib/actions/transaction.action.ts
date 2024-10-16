"use server";
import { handleError } from "../utils";
import { connectToDatabase } from "../database/mongoose";
import Transaction from "../database/models/transaction.model";
import { updateTokens } from "./user.actions";

// export async function checkoutCredits(transaction: CheckoutTransactionParams) {
//   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

//   const amount = Number(transaction.amount) * 100;

//   const session = await stripe.checkout.sessions.create({
//     line_items: [
//       {
//         price_data: {
//           currency: "usd",
//           unit_amount: amount,
//           product_data: {
//             name: transaction.plan,
//           },
//         },
//         quantity: 1,
//       },
//     ],
//     metadata: {
//       plan: transaction.plan,
//       credits: transaction.credits,
//       buyerId: transaction.buyerId,
//     },
//     mode: "payment",
//     success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile`,
//     cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/`,
//   });

//   redirect(session.url!);
// }

export async function createTransaction(transaction: CreateOrderParams,OrderId:string) {
  try {
    await connectToDatabase();

    // Create a new transaction with a userId
    const newTransaction = await Transaction.create({
      amount: transaction.amount,
      plan: transaction.plan,
      tokens: transaction.tokens,
      user_id: transaction.userId,
      razorpayOrderId: OrderId,
    });

    return JSON.parse(JSON.stringify(newTransaction));
  } catch (error) {
    handleError(error);
  }
}

export async function updatePaymentStatus(orderId: string, status: string) {
  try {
    await connectToDatabase();

    const updatedPaymentStatus = await Transaction.findOneAndUpdate(
      { razorpayOrderId: orderId },
      { $inc: { status: status } },
      { new: true }
    );

    if (!updatedPaymentStatus) throw new Error("User credits update failed");

    return JSON.parse(JSON.stringify(updatedPaymentStatus));
  } catch (error) {
    handleError(error);
  }
}
