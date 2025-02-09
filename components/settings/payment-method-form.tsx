"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import type { PaymentMethod } from "@/lib/db/schema";

export function PaymentMethodForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const setup_intent = searchParams.get("setup_intent");

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch("/api/stripe/payment-methods");
      if (!response.ok) {
        throw new Error("Failed to fetch payment methods");
      }
      const data = await response.json();
      setPaymentMethods(data.paymentMethods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast({
        title: "エラーが発生しました",
        description: "カード情報の取得に失敗しました。",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (success !== null) {
      if (success === "true" && setup_intent) {
        toast({
          title: "カード情報の登録が完了しました",
          description: "次回のお買い物からご利用いただけます。",
        });
        // カード情報を再取得
        fetchPaymentMethods();
      } else {
        toast({
          title: "カード情報の登録に失敗しました",
          description: "もう一度お試しください。",
          variant: "destructive",
        });
      }
      // パラメータをクリア
      router.replace("/settings/payment", { scroll: false });
    }
  }, [success, setup_intent, toast, router]);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const onSubmit = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/stripe/setup", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to create setup session");
      }

      const { url } = await response.json();
      router.push(url);
    } catch (error) {
      toast({
        title: "エラーが発生しました",
        description: "カード登録に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>クレジットカードの登録</CardTitle>
        <CardDescription>
          安全な決済のため、Stripeでカード情報を管理します。
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {paymentMethods.length > 0 ? (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between rounded-md border p-4"
              >
                <div className="flex items-center space-x-4">
                  <Icons.creditCard className="h-6 w-6" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {method.brand.toUpperCase()} •••• {method.last4}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      有効期限: {method.expMonth}/{method.expYear}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center space-x-4 rounded-md border p-4">
            <Icons.creditCard className="h-6 w-6" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                Stripeセキュア決済
              </p>
              <p className="text-sm text-muted-foreground">
                カード情報は安全に保管され、次回のお買い物から利用できます。
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={onSubmit} disabled={isLoading} className="w-full">
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          {paymentMethods.length > 0
            ? "新しいカードを追加"
            : "カードを登録する"}
        </Button>
      </CardFooter>
    </Card>
  );
}
