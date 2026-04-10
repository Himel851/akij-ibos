import { listExamCandidatesPersisted } from "@/lib/exam-candidates-persistence";
import { isAdminSessionRequest } from "@/lib/require-admin-api";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  if (!isAdminSessionRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  try {
    const data = await listExamCandidatesPersisted(id);
    return NextResponse.json({ data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load candidates" }, { status: 500 });
  }
}
