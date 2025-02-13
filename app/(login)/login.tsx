"use client";

import { AuthForm } from "@/components/auth/auth-form";
import { AuthHeader } from "@/components/auth/auth-header";

export function Login({ mode = "signin" }: { mode?: "signin" | "signup" }) {
  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <AuthHeader mode={mode} />
      <AuthForm mode={mode} />
    </div>
  );
}
