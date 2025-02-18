"use client";

import { User } from "@/lib/infrastructure/db/schema";
import { motion } from "framer-motion";
import {
  Mail,
  User as UserIcon,
  Shield,
  Calendar,
  Phone,
  MapPin,
} from "lucide-react";
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
import { useToast } from "@/lib/shared/hooks/use-toast";
import { updateProfile } from "@/app/actions/user";

const formSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  postalCode: z
    .string()
    .regex(/^\d{3}-?\d{4}$/, "正しい郵便番号を入力してください"),
  prefecture: z.string().min(1, "都道府県は必須です"),
  city: z.string().min(1, "市区町村は必須です"),
  address1: z.string().min(1, "住所は必須です"),
  address2: z.string().optional(),
  phoneNumber: z
    .string()
    .regex(/^0\d{1,4}-?\d{1,4}-?\d{4}$/, "正しい電話番号を入力してください"),
});

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || "",
      postalCode: user.postalCode || "",
      prefecture: user.prefecture || "",
      city: user.city || "",
      address1: user.address1 || "",
      address2: user.address2 || "",
      phoneNumber: user.phoneNumber || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateProfile(values);
      toast({
        title: "プロフィールを更新しました",
        description: "変更が正常に保存されました。",
      });
    } catch (error) {
      toast({
        title: "エラーが発生しました",
        description: "プロフィールの更新に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const readOnlyItems = [
    {
      icon: <Mail className="w-4 h-4" />,
      label: "メールアドレス",
      value: user.email,
    },
    {
      icon: <Shield className="w-4 h-4" />,
      label: "ロール",
      value: user.role,
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      label: "アカウント作成日",
      value: user.createdAt.toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {readOnlyItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group"
          >
            <div className="grid gap-2 group-hover:bg-orange-50/50 dark:group-hover:bg-orange-500/5 p-3 rounded-lg transition-colors">
              <div className="flex items-center gap-2">
                <div className="text-orange-500/70 dark:text-orange-400/70">
                  {item.icon}
                </div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {item.label}
                </label>
              </div>
              <p className="text-sm text-muted-foreground pl-6">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>名前</FormLabel>
                <FormControl>
                  <Input placeholder="山田 太郎" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>郵便番号</FormLabel>
                  <FormControl>
                    <Input placeholder="123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>電話番号</FormLabel>
                  <FormControl>
                    <Input placeholder="090-1234-5678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="prefecture"
            render={({ field }) => (
              <FormItem>
                <FormLabel>都道府県</FormLabel>
                <FormControl>
                  <Input placeholder="東京都" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>市区町村</FormLabel>
                <FormControl>
                  <Input placeholder="渋谷区" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>住所1</FormLabel>
                <FormControl>
                  <Input placeholder="代々木1-2-3" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>住所2（建物名など）</FormLabel>
                <FormControl>
                  <Input placeholder="○○マンション101" {...field} />
                </FormControl>
                <FormDescription>任意項目です</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
          >
            プロフィールを更新
          </Button>
        </form>
      </Form>
    </div>
  );
}
