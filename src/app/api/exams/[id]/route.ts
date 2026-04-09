import {
  deleteExam,
  getExamDetail,
  updateExam,
} from "@/lib/mock/exams-repository";
import type { Exam } from "@/types/exam";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const data: Exam | null = getExamDetail(id);
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ data });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const updated = updateExam(id, {
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
      questions: Array.isArray(body.questions) ? body.questions : undefined,
    });
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ data: getExamDetail(id) });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const ok = deleteExam(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
