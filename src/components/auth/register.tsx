"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

type RegisterApiResponse = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

type RegisterProps = {
  subtitle?: string;
};

export function Register({ subtitle }: RegisterProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim().toLowerCase();
    const password = String(fd.get("password") ?? "");
    const confirmPassword = String(fd.get("confirmPassword") ?? "");

    if (!name) {
      toast.error("Please enter your name");
      return;
    }
    if (!phone) {
      toast.error("Please enter your phone number");
      return;
    }
    if (phone.replace(/\D/g, "").length < 11) {
      toast.error("Please enter a valid phone number (11 digits)");
      return;
    }
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setPending(true);
    try {
      const { data, status } = await axios.post<RegisterApiResponse>(
        "/api/auth/register",
        { name, phone, email, password },
        { validateStatus: () => true },
      );

      if (status >= 200 && status < 300 && data.ok) {
        toast.success("Account created. You can log in now.");
        router.push("/user/login");
        return;
      }
      if (data.fieldErrors) {
        const first = Object.values(data.fieldErrors)[0];
        toast.error(first ?? "Check your details");
        return;
      }
      if (status === 409 && data.error) {
        toast.error(data.error);
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
        Create account
      </h1>
      {subtitle ? (
        <p className="mt-1 text-center text-sm text-zinc-500">{subtitle}</p>
      ) : null}
      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-zinc-800"
          >
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            required
            disabled={pending}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none ring-primary/20 focus:border-primary focus:ring-2 disabled:opacity-60"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-zinc-800"
          >
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            placeholder="e.g. 01712 345678"
            disabled={pending}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none ring-primary/20 focus:border-primary focus:ring-2 disabled:opacity-60"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-zinc-800"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Your primary email address"
            required
            disabled={pending}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none ring-primary/20 focus:border-primary focus:ring-2 disabled:opacity-60"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-zinc-800"
          >
            Password <span className="text-red-500">*</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            required
            disabled={pending}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none ring-primary/20 focus:border-primary focus:ring-2 disabled:opacity-60"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-zinc-800"
          >
            Confirm password <span className="text-red-500">*</span>
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            required
            disabled={pending}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none ring-primary/20 focus:border-primary focus:ring-2 disabled:opacity-60"
          />
        </div>
        <p className="text-center text-sm text-zinc-600">
          Already have an account?{" "}
          <Link
            href="/user/login"
            className="font-medium text-zinc-900 underline-offset-2 hover:underline"
          >
            Log in
          </Link>
        </p>
        <button
          type="submit"
          disabled={pending}
          className="w-full cursor-pointer rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
        >
          {pending ? "Please wait…" : "Register"}
        </button>
      </form>
    </div>
  );
}
