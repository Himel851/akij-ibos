import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const metadata = (user.user_metadata ?? {}) as { name?: string };

    return NextResponse.json({
      ok: true,
      user: {
        name: metadata.name ?? "",
        email: user.email ?? "",
        refId: user.id.replace(/-/g, "").slice(0, 10).toUpperCase(),
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Supabase auth is not configured" },
      { status: 500 },
    );
  }
}
