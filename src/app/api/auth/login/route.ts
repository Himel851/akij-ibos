import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth-session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Body = {
  email?: string;
  password?: string;
  panel?: string;
};

function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  return { email, password };
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { email, password, panel } = body;

  if (panel === "admin") {
    const { email: adminEmail, password: adminPassword } = getAdminCredentials();
    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { ok: false, error: "Admin credentials not configured" },
        { status: 500 },
      );
    }
    const ok =
      typeof email === "string" &&
      typeof password === "string" &&
      email.trim().toLowerCase() === adminEmail &&
      password === adminPassword;
    if (ok) {
      try {
        const supabase = await createSupabaseServerClient();
        await supabase.auth.signOut();
      } catch {
        // No Supabase env or session — admin-only login still OK.
      }

      const response = NextResponse.json({ ok: true });
      response.cookies.set(ADMIN_SESSION_COOKIE, "1", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 8,
      });
      return response;
    }
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  if (panel === "user") {
    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
      }

      const cookieStore = await cookies();
      cookieStore.set(ADMIN_SESSION_COOKIE, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
      });

      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json(
        { ok: false, error: "Supabase auth is not configured" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ ok: false }, { status: 400 });
}
