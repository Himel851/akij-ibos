import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth-session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    // Best effort: admin logout still works even if Supabase is unavailable.
  }

  return response;
}
