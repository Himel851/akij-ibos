import { NextResponse } from "next/server";

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
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: false }, { status: 501 });
}
