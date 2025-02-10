import { Metadata } from "next";
import { ProfileForm } from "@/components/settings/profile-form";
import { getUser } from "@/lib/db/queries";
import { mockUsers } from "@/lib/mock/user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { redirect } from "next/navigation";
import { User } from "@/lib/db/schema";

const USE_MOCK = process.env.USE_MOCK === "true";

export const metadata: Metadata = {
  title: "設定",
  description: "ユーザー設定を管理します。",
};

export default async function SettingsPage() {
  const userData = USE_MOCK ? mockUsers[0] : await getUser();

  if (!userData) {
    redirect("/sign-in");
  }

  const user: User = userData;

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">設定</h1>
          <p className="text-muted-foreground">
            アカウント設定とユーザープロフィールを管理します。
          </p>
        </div>
        <Separator />
        <Card>
          <CardHeader>
            <CardTitle>プロフィール</CardTitle>
            <CardDescription>
              あなたのプロフィール情報を表示・管理します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={user} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
