"use server";
import { handleError } from "../utils";
import { connectToDatabase } from "../database/mongoose";
import Transaction from "../database/models/transaction.model";
import User from "../database/models/user.model";
const populateUser = (query: any) => query.populate({
  path: 'user_id',
  model: User,
  select: '_id firstName lastName clerkId'
})

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
      { razorpayOrderId: orderId }, // Use the field you want to filter by
      { status: status }, // The update to apply
      { new: true } // Return the updated document
    );

    if (!updatedPaymentStatus){
      throw new Error("Transaction Status update failed");
    } 


    return JSON.parse(JSON.stringify(updatedPaymentStatus));
  } catch (error) {
    handleError(error);
  }
}


export async function getUserTransactions({
  limit = 5,
  page = 1,
  userId,
}: {
  limit?: number;
  page: number;
  userId: string;
}) {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;

    const transactions = await populateUser(Transaction.find({ user_id: userId }))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);

    const totalTransactions = await Transaction.find({ user_id: userId }).countDocuments();


    return {
      data: JSON.parse(JSON.stringify(transactions)),
      totalPages: Math.ceil(totalTransactions / limit),
    };
  } catch (error) {
    handleError(error);
  }
}