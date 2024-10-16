"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useEffect } from "react";
import { createOrder } from "@/lib/helpers/transaction";
import { useToast } from "@/components/ui/use-toast";

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
  

  // useEffect(() => {
  //   // Check to see if this is a redirect back from Checkout
  //   const query = new URLSearchParams(window.location.search);
  //   if (query.get("success")) {
  //     toast({
  //       title: "Order placed!",
  //       description: "You will receive an email confirmation",
  //       duration: 5000,
  //       className: "success-toast",
  //     });
  //   }

  //   if (query.get("canceled")) {
  //     toast({
  //       title: "Order canceled!",
  //       description: "Continue to shop around and checkout when you're ready",
  //       duration: 5000,
  //       className: "error-toast",
  //     });
  //   }
  // }, []);

  const onCheckout = async () => {
    const transaction = {
      plan,
      amount,
      tokens,
      userId,
    };

    await createOrder(transaction);
  };

  return (
    <div onClick={onCheckout}>
      <section>
        <Button
          type="submit"
          role="link"
          className="w-full rounded-full bg-purple-gradient bg-cover"
        >
          Buy Tokens
        </Button>
      </section>
    </div>
  );
};

export default Checkout;