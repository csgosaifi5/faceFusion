import { Schema, model, models } from "mongoose";

const TransactionSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User" },

  razorpayOrderId: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  plan: {
    type: String,
  },
  status: {
    type: String,
    default: "Failed",
  },
  tokens: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Transaction = models?.Transaction || model("Transaction", TransactionSchema);

export default Transaction;
