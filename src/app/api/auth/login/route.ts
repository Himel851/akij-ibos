import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Not implemented — wire mock auth here." },
    { status: 501 },
  );
}
