"use client";

import { ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type UserProfile = {
  name: string;
  email: string;
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

export function UserNavbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({ name: "", email: "" });
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadMe() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          ok?: boolean;
          user?: { name?: string; email?: string };
        };
        if (data.ok && data.user) {
          setProfile({
            name: data.user.name ?? "",
            email: data.user.email ?? "",
          });
        }
      } catch {
        // Ignore fetch errors; navbar can still render.
      }
    }
    void loadMe();
  }, []);

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
      router.push("/user/login");
      router.refresh();
    }
  }

  const initials = getInitials(profile.name, profile.email);

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 max-w-container items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Link
          href="/user"
          className="truncate text-sm font-semibold text-primary hover:text-primary-hover"
        >
          User Panel
        </Link>
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-zinc-900">
              {profile.name || "User"}
            </p>
            <p className="text-xs text-zinc-500">{profile.email || "No email"}</p>
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
                  className="cursor-pointer flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-50"
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
