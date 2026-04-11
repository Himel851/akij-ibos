import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createSupabaseServiceClient,
  hasSupabaseServiceConfig,
} from "@/lib/supabase/service-role";

type Body = {
  name?: string;
  phone?: string;
  email?: string;
  password?: string;
};

function fieldErrors(body: Body): Record<string, string> | null {
  const errors: Record<string, string> = {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const emailRaw = typeof body.email === "string" ? body.email.trim() : "";
  const email = emailRaw.toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";

  if (!name) errors.name = "Name is required";
  if (!phone) errors.phone = "Phone is required";
  else if (phone.replace(/\D/g, "").length < 10) {
    errors.phone = "Enter a valid phone number";
  }
  if (!email) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Invalid email";
  }
  if (!password) errors.password = "Password is required";
  else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  return Object.keys(errors).length ? errors : null;
}

function mapAuthErrorToResponse(message: string) {
  const normalized = message.toLowerCase();
  if (
    normalized.includes("already registered") ||
    normalized.includes("already exists") ||
    normalized.includes("already been registered")
  ) {
    return NextResponse.json(
      { ok: false, error: "An account with this email already exists" },
      { status: 409 },
    );
  }
  if (normalized.includes("rate limit")) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Too many signup attempts from this email or network. Please wait a few minutes and try again.",
      },
      { status: 429 },
    );
  }
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const errs = fieldErrors(body);
  if (errs) {
    return NextResponse.json({ ok: false, fieldErrors: errs }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";

  try {
    if (hasSupabaseServiceConfig()) {
      const admin = createSupabaseServiceClient();
      const { error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, phone, role: "user" },
      });

      if (error) {
        return mapAuthErrorToResponse(error.message);
      }
      return NextResponse.json({ ok: true });
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone, role: "user" },
      },
    });

    if (error) {
      return mapAuthErrorToResponse(error.message);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Supabase auth is not configured" },
      { status: 500 },
    );
  }
}
