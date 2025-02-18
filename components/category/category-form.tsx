"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/lib/shared/hooks/use-toast";
import { Category } from "@/lib/infrastructure/db/schema";
import { createCategory, updateCategory } from "@/app/actions/category";

const formSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  slug: z
    .string()
    .min(1, "スラッグは必須です")
    .regex(/^[a-z0-9-]+$/, "スラッグは半角英数字とハイフンのみ使用できます"),
  description: z.string().optional(),
});

interface CategoryFormProps {
  category?: Category;
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (category) {
        await updateCategory(category.id, values);
        toast({
          title: "カテゴリーを更新しました",
          variant: "default",
        });
      } else {
        await createCategory(values);
        toast({
          title: "カテゴリーを作成しました",
          variant: "default",
        });
      }
      router.push("/categories");
      router.refresh();
    } catch (error) {
      toast({
        title: "エラーが発生しました",
        description: category
          ? "カテゴリーの更新に失敗しました"
          : "カテゴリーの作成に失敗しました",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>名前</FormLabel>
              <FormControl>
                <Input placeholder="カテゴリー名" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>スラッグ</FormLabel>
              <FormControl>
                <Input placeholder="category-slug" {...field} />
              </FormControl>
              <FormDescription>
                URLで使用される識別子です。半角英数字とハイフンのみ使用できます。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>説明</FormLabel>
              <FormControl>
                <Textarea placeholder="カテゴリーの説明" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{category ? "更新" : "作成"}</Button>
      </form>
    </Form>
  );
}
