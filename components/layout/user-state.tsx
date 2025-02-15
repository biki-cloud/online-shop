"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOutButton } from "./sign-out-button";
import { User as UserType } from "@/lib/infrastructure/db/schema";

interface UserStateProps {
  user: UserType | null;
}

export function UserState({ user }: UserStateProps) {
  console.log("[UserState] Current user state:", user);

  if (!user) {
    console.log("[UserState] No user found, showing sign-in/sign-up buttons");
    return (
      <>
        <Link href="/sign-in">
          <Button variant="ghost" size="sm">
            サインイン
          </Button>
        </Link>
        <Link href="/sign-up">
          <Button variant="default" size="sm">
            新規登録
          </Button>
        </Link>
      </>
    );
  }

  console.log("[UserState] User is logged in:", user.email);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <User className="h-4 w-4" />
          <span>{user.email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/settings">設定</Link>
        </DropdownMenuItem>
        <SignOutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
