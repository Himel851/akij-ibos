"use client";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideGlobalChrome =
    pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");

  return (
    <>
      {!hideGlobalChrome ? <Header /> : null}
      <main className="flex flex-1 flex-col">{children}</main>
      {!hideGlobalChrome ? <Footer /> : null}
    </>
  );
}
