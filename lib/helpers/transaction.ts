import { handleError } from "../utils";
import { createTransaction, updatePaymentStatus } from "../actions/transaction.action";
import { updateTokens } from "../actions/user.actions";

export async function createOrder(transaction: CreateOrderParams,setPaymentStatus:any) {
  const res = await fetch("/api/topup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: transaction.amount * 100 }),
  });
  const data = await res.json();
  const orderId = data.id;
  const newTransaction = await createTransaction(transaction, data.id);

  const paymentData = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_APIKEY,
    order_id: orderId,

    handler: async function (response: any) {
      // verify payment
      const res = await fetch("/api/topup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        }),
      });
      const data = await res.json();
      if (data.isOk) {
        await updateTokens(transaction.userId, transaction.tokens);
        await updatePaymentStatus(orderId, "Successfull");
        setPaymentStatus("Token Added Successfully")
      } else {
        alert("Payment failed");
      }
    },
  };

  const payment = new (window as any).Razorpay(paymentData);
  payment.open();
}
