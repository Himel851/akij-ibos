import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ data: [] as unknown[] });
}

export async function POST() {
  return NextResponse.json(
    { message: "Not implemented — start/submit attempt here." },
    { status: 501 },
  );
}
