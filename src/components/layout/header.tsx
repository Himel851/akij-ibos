 "use client";

import { ChevronDown, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type MeResponse = {
  ok?: boolean;
  user?: {
    name?: string;
    email?: string;
    refId?: string;
  };
};

function getInitials(name: string, email: string) {
  const source = name.trim() || email.trim();
  if (!source) return "U";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRefId, setUserRefId] = useState("");

  const isAdminDashboard =
    pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
  const isUserDashboard =
    pathname.startsWith("/user") &&
    !pathname.startsWith("/user/login") &&
    !pathname.startsWith("/user/register");
  const showAccount = isAdminDashboard || isUserDashboard;
  const logoHref = isAdminDashboard ? "/admin" : isUserDashboard ? "/user" : "/";

  useEffect(() => {
    if (!isUserDashboard) return;

    async function loadMe() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as MeResponse;
        if (data.ok && data.user) {
          setUserName(data.user.name ?? "");
          setUserEmail(data.user.email ?? "");
          setUserRefId(data.user.refId ?? "");
        }
      } catch {
        // Ignore and keep fallback account text.
      }
    }
    void loadMe();
  }, [isUserDashboard]);

  useEffect(() => {
    if (!menuOpen) return;
    function handlePointerDown(e: MouseEvent) {
      if (wrapRef.current?.contains(e.target as Node)) return;
      setMenuOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [menuOpen]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setMenuOpen(false);
      router.push("/");
      router.refresh();
    }
  }

  const displayName = isAdminDashboard ? "Admin" : (userName || "User");
  const displayEmail = isAdminDashboard ? "Admin Panel" : (userEmail || "Signed in");
  const initials = getInitials(displayName, displayEmail);

  return (
    <header className="shrink-0 border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 max-w-container items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 shrink-0 items-center gap-4 sm:gap-6">
          <Link
            href={logoHref}
            className="flex shrink-0 items-center"
            aria-label="Akij Resource home"
          >
            <Image
              src="/images/logo.png"
              alt="Akij Resource"
              width={116}
              height={32}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
          {isUserDashboard ? (
            <Link
              href="/user"
              className="shrink-0 text-sm font-semibold text-primary hover:text-primary-hover"
            >
              Dashboard
            </Link>
          ) : null}
        </div>
        <p className="flex-1 text-center text-base font-medium text-zinc-700 sm:text-lg">
          Akij Resource
        </p>
        {showAccount ? (
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-zinc-900">{displayName}</p>
              <p className="text-xs text-zinc-500">{displayEmail}</p>
              {isUserDashboard && userRefId ? (
                <p className="text-xs text-zinc-400">Ref. ID: {userRefId}</p>
              ) : null}
            </div>
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-muted text-sm font-semibold text-primary-muted-foreground"
              aria-hidden
            >
              {initials}
            </div>
            <div className="relative" ref={wrapRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="cursor-pointer rounded-md p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 aria-expanded:bg-zinc-100"
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
                    className="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-50"
                  >
                    <LogOut className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="w-32 shrink-0 sm:w-40" aria-hidden />
        )}
      </div>
    </header>
  );
}
