"use client";

import { useEffect, useState } from "react";
import { createOrder } from "@/lib/helpers/transaction";
import { toast } from "sonner";

import { Button } from "../ui/button";

const Checkout = ({
  plan,
  amount,
  tokens,
  userId,
}: {
  plan: string;
  amount: number;
  tokens: number;
  userId: string;
}) => {
  const [paymentStatus, setPaymentStatus] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        console.log("Razorpay script loaded");
      };

      script.onerror = () => {
        console.error("Failed to load Razorpay SDK");
      };
    }
  }, []);

  useEffect(() => {
    if (paymentStatus === "Token Added Successfully") {
      toast.success(paymentStatus);
      setTimeout(() => {
        setPaymentStatus("");
      }, 3000);
    }
  }, [paymentStatus]);

  const onCheckout = async () => {
    const transaction = {
      plan,
      amount,
      tokens,
      userId,
    };

    const response = await createOrder(transaction, setPaymentStatus);
    if (paymentStatus === "Token Added Successfully") {
      toast.success(paymentStatus);
      setTimeout(() => {
        setPaymentStatus("");
      }, 3000);
    }
  };

  return (
    <div onClick={onCheckout}>
      <section>
        <Button type="submit" role="link" className="w-full rounded-full bg-purple-gradient bg-cover">
          Buy Tokens
        </Button>
      </section>
    </div>
  );
};

export default Checkout;
