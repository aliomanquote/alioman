"use client";

import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { AuthGuard } from "@/components/auth-guard";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <MobileNav />
        <Sidebar />
        <main className="pt-16 lg:ml-64 lg:pt-0">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
