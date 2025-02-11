"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

const productFormSchema = z.object({
  name: z.string().min(1, "商品名は必須です"),
  description: z.string().min(1, "商品説明は必須です"),
  price: z.coerce.number().min(0, "価格は0以上である必要があります"),
  stock: z.coerce.number().min(0, "在庫数は0以上である必要があります"),
  currency: z.string().default("JPY"),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData?: ProductFormValues;
  onSubmit: (
    data: ProductFormValues
  ) => Promise<{ success: boolean; error?: string }>;
}

export function ProductForm({ initialData, onSubmit }: ProductFormProps) {
  const router = useRouter();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      currency: "JPY",
    },
  });

  const handleSubmit = async (data: ProductFormValues) => {
    try {
      const result = await onSubmit(data);
      if (result.success) {
        router.push("/admin/products");
        router.refresh();
      } else {
        console.error("商品の保存に失敗しました:", result.error);
      }
    } catch (error) {
      console.error("商品の保存に失敗しました:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>商品名</FormLabel>
              <FormControl>
                <Input placeholder="商品名を入力" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>商品説明</FormLabel>
              <FormControl>
                <Textarea placeholder="商品の説明を入力" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>価格</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>在庫数</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit">保存</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            キャンセル
          </Button>
        </div>
      </form>
    </Form>
  );
}
