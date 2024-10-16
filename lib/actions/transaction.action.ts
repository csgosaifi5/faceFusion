"use server";
import { handleError } from "../utils";
import { connectToDatabase } from "../database/mongoose";
import Transaction from "../database/models/transaction.model";


export async function createTransaction(transaction: CreateOrderParams, OrderId: string) {
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
      { razorpayOrderId: orderId }, // Query to find the transaction by orderId
      { status: status }, // Update the status field
      { new: true } // Return the updated document
    );

    if (!updatedPaymentStatus) throw new Error("User credits update failed");

    return JSON.parse(JSON.stringify(updatedPaymentStatus));
  } catch (error) {
    handleError(error);
  }
}
