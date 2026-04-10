"use client";

import { clearManageTestSession } from "@/lib/manage-test-storage";
import { ChevronDown, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function AdminNavbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handlePointerDown(e: MouseEvent) {
      if (wrapRef.current?.contains(e.target as Node)) return;
      setMenuOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [menuOpen]);

  function handleLogout() {
    clearManageTestSession();
    setMenuOpen(false);
    router.push("/");
  }

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 max-w-container items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Link href="/admin" className="flex shrink-0 items-center">
          <Image
            src="/images/logo.png"
            alt="Akij Resource"
            width={160}
            height={40}
            className="h-8 w-auto max-w-32 object-contain object-left sm:h-9 sm:max-w-none"
            priority
          />
        </Link>
        <nav className="flex min-w-0 flex-1 justify-center">
          <Link
            href="/admin"
            className="truncate text-sm font-semibold text-primary hover:text-primary-hover"
          >
            Dashboard
          </Link>
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-zinc-900">Arif Hossain</p>
            <p className="text-xs text-zinc-500">Ref. ID - 16101121</p>
          </div>
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-muted text-sm font-semibold text-primary-muted-foreground"
            aria-hidden
          >
            AH
          </div>
          <div className="relative" ref={wrapRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 aria-expanded:bg-zinc-100 cursor-pointer"
              aria-label="Account menu"
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              <ChevronDown
                className={`h-5 w-5 transition-transform ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>
            {menuOpen ? (
              <div
                className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-lg border border-zinc-200 bg-white py-1 shadow-lg"
                role="menu"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-50 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
                  Log out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
