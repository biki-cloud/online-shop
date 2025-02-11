"use client";

import { signOut } from "@/app/(login)/actions";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function SignOutButton() {
  const handleSignOut = async () => {
    console.log("[SignOutButton] Attempting to sign out");
    try {
      await signOut();
      console.log("[SignOutButton] Sign out successful");
    } catch (error) {
      console.error("[SignOutButton] Error during sign out:", error);
    }
  };

  return (
    <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
      ログアウト
    </DropdownMenuItem>
  );
}
