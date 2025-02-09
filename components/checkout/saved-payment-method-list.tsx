"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import type { PaymentMethod } from "@/lib/payments/types";
import { toast } from "sonner";

interface SavedPaymentMethodListProps {
  paymentMethods: PaymentMethod[];
  amount: number;
}

export function SavedPaymentMethodList({
  paymentMethods,
  amount,
}: SavedPaymentMethodListProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(
    paymentMethods[0]?.id || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handlePayment() {
    if (!selectedPaymentMethod) {
      toast.error("支払い方法を選択してください");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethodId: selectedPaymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "支払い処理に失敗しました");
      }

      router.push(`/orders/${data.orderId}`);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(
        error instanceof Error ? error.message : "支払い処理に失敗しました"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <RadioGroup
        value={selectedPaymentMethod}
        onValueChange={setSelectedPaymentMethod}
      >
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="flex items-center space-x-3 rounded-lg border p-4"
          >
            <RadioGroupItem value={method.id} id={method.id} />
            <Label htmlFor={method.id} className="flex-1 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icons.creditCard className="h-5 w-5" />
                  <span>
                    **** **** **** {method.card?.last4} ({method.card?.brand})
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {method.card?.exp_month}/{method.card?.exp_year}
                </span>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
      <Button
        onClick={handlePayment}
        disabled={isLoading || !selectedPaymentMethod}
        className="w-full"
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        選択したカードで支払う
      </Button>
    </div>
  );
}
