import { NextResponse } from "next/server";

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

/** In-memory store until a database is added (dev/demo only; resets on cold start). */
const registeredEmails = new Set<string>();

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

  if (registeredEmails.has(email)) {
    return NextResponse.json(
      {
        ok: false,
        error: "An account with this email already exists",
      },
      { status: 409 },
    );
  }

  registeredEmails.add(email);

  return NextResponse.json({ ok: true });
}
