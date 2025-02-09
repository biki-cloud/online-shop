import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "@/components/settings/sidebar-nav";
import { getServerSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

const sidebarNavItems = [
  {
    title: "プロフィール",
    href: "/settings",
  },
  {
    title: "支払い方法",
    href: "/settings/payment",
  },
];

export default async function SettingsPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-6 p-10 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">設定</h2>
        <p className="text-muted-foreground">アカウントの設定を管理します。</p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1 lg:max-w-2xl">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">プロフィール</h3>
              <p className="text-sm text-muted-foreground">
                アカウント情報を管理します。
              </p>
            </div>
            {/* プロフィール設定フォームはここに追加予定 */}
          </div>
        </div>
      </div>
    </div>
  );
}
