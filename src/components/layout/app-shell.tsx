"use client";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideFooterForAdmin =
    pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
  const hideFooterForUser =
    pathname.startsWith("/user") &&
    !pathname.startsWith("/user/login") &&
    !pathname.startsWith("/user/register");
  const hideFooter = hideFooterForAdmin || hideFooterForUser;

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col">{children}</main>
      {!hideFooter ? <Footer /> : null}
    </>
  );
}
