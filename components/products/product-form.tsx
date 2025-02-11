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
import { useState } from "react";
import Image from "next/image";

const productFormSchema = z.object({
  name: z.string().min(1, "商品名は必須です"),
  description: z.string().min(1, "商品説明は必須です"),
  price: z.coerce.number().min(0, "価格は0以上である必要があります"),
  stock: z.coerce.number().min(0, "在庫数は0以上である必要があります"),
  currency: z.string().default("JPY"),
  imageUrl: z.string().min(1, "商品画像は必須です"),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData?: Partial<ProductFormValues>;
  onSubmit: (
    data: ProductFormValues
  ) => Promise<{ success: boolean; error?: string }>;
}

export function ProductForm({ initialData, onSubmit }: ProductFormProps) {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.imageUrl ?? null
  );
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      currency: "JPY",
      imageUrl: "",
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("画像のアップロードに失敗しました");
      }

      const { url } = await response.json();
      form.setValue("imageUrl", url);
      setImagePreview(url);
    } catch (error) {
      console.error("画像のアップロードに失敗しました:", error);
    }
  };

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
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>商品画像</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                  {imagePreview && (
                    <div className="relative aspect-square w-48">
                      <Image
                        src={imagePreview}
                        alt="商品画像プレビュー"
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}
                  <Input type="hidden" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
