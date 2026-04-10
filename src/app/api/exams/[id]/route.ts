import { normalizeExamQuestions } from "@/lib/exam-questions-map";
import { deleteExamPersisted, getExamDetailPersisted, updateExamPersisted } from "@/lib/exams-persistence";
import { isAdminSessionRequest } from "@/lib/require-admin-api";
import type { Exam } from "@/types/exam";
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
    const data: Exam | null = await getExamDetailPersisted(id);
    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load exam" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!isAdminSessionRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const updated = await updateExamPersisted(id, {
      title: typeof body.title === "string" ? body.title : undefined,
      totalUsers:
        body.totalUsers === null
          ? null
          : typeof body.totalUsers === "number"
            ? body.totalUsers
            : undefined,
      totalSlots:
        body.totalSlots === null
          ? null
          : typeof body.totalSlots === "number"
            ? body.totalSlots
            : undefined,
      questionSetsCount:
        body.questionSetsCount === null
          ? null
          : typeof body.questionSetsCount === "number"
            ? body.questionSetsCount
            : undefined,
      questionType:
        typeof body.questionType === "string" ? body.questionType : undefined,
      startTime:
        typeof body.startTime === "string" ? body.startTime : undefined,
      endTime: typeof body.endTime === "string" ? body.endTime : undefined,
      durationMinutes:
        typeof body.durationMinutes === "number"
          ? body.durationMinutes
          : undefined,
      questions: Array.isArray(body.questions)
        ? normalizeExamQuestions(body.questions)
        : undefined,
    });
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!isAdminSessionRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  try {
    const ok = await deleteExamPersisted(id);
    if (!ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
