import { createDraftExamPersisted } from "@/lib/exams-persistence";
import { isAdminSessionRequest } from "@/lib/require-admin-api";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!isAdminSessionRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await createDraftExamPersisted();
    return NextResponse.json({ data: { id } }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create draft" },
      { status: 500 },
    );
  }
}
