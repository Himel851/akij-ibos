"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

type LoginProps = {
  /** Shown under the main title for context (e.g. admin vs user). */
  subtitle?: string;
  panel: "admin" | "user";
};

export function Login({ subtitle, panel }: LoginProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");

    if (panel === "admin") {
      setPending(true);
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, panel: "admin" }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };

        if (res.ok && data.ok) {
          toast.success("Login successful");
          router.push("/admin");
          return;
        }
        if (res.status === 401) {
          toast.error("Email or password incorrect");
          return;
        }
        if (res.status === 500) {
          toast.error(data.error ?? "Server error");
          return;
        }
        toast.error("Something went wrong");
      } catch {
        toast.error("Something went wrong");
      } finally {
        setPending(false);
      }
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, panel: "user" }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (res.ok && data.ok) {
        toast.success("Login successful");
        router.push("/user");
        return;
      }
      if (res.status === 401) {
        toast.error("Email or password incorrect");
        return;
      }
      toast.error(data.error ?? "Something went wrong");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
      <h1 className="text-center text-2xl font-semibold tracking-tight text-zinc-900">
        Log In
      </h1>
      {subtitle ? (
        <p className="mt-1 text-center text-sm text-zinc-500">{subtitle}</p>
      ) : null}
      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-zinc-800"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Your primary email address"
            disabled={pending}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none ring-primary/20 focus:border-primary focus:ring-2 disabled:opacity-60"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-zinc-800"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            disabled={pending}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none ring-primary/20 focus:border-primary focus:ring-2 disabled:opacity-60"
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {panel === "user" ? (
            <p className="text-sm text-zinc-600">
              New user?{" "}
              <Link
                href="/user/register"
                className="font-medium text-zinc-900 underline-offset-2 hover:underline"
              >
                Register
              </Link>
            </p>
          ) : (
            <span className="hidden sm:block" aria-hidden />
          )}
          <a
            href="#"
            className="text-right text-sm text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline sm:text-left"
          >
            Forget Password?
          </a>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full cursor-pointer rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
        >
          {pending ? "Please wait…" : "Submit"}
        </button>
      </form>
    </div>
  );
}
