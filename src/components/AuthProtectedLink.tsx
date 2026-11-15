"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export function AuthProtectedLink({
  href,
  className,
  children,
  onNavigate,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  onNavigate?: () => void;
}) {
  const { email, loading } = useAuthGuard();
  const router = useRouter();

  function handleClick(e: React.MouseEvent) {
    if (loading) return;
    if (!email) {
      e.preventDefault();
      router.push("/auth/login");
      return;
    }
    onNavigate?.();
  }

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
