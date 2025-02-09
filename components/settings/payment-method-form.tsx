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

export function PaymentMethodForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  useEffect(() => {
    if (success !== null) {
      if (success === "true") {
        toast({
          title: "カード情報の登録が完了しました",
          description: "次回のお買い物からご利用いただけます。",
        });
      } else {
        toast({
          title: "カード情報の登録に失敗しました",
          description: "もう一度お試しください。",
          variant: "destructive",
        });
      }
      // パラメータをクリア
      router.replace("/settings/payment");
    }
  }, [success, toast, router]);

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
      </CardContent>
      <CardFooter>
        <Button onClick={onSubmit} disabled={isLoading} className="w-full">
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          カードを登録する
        </Button>
      </CardFooter>
    </Card>
  );
}
