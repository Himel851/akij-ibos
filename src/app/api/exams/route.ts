import { createExamPersisted, listExamSummariesPersisted } from "@/lib/exams-persistence";
import { isAdminSessionRequest } from "@/lib/require-admin-api";
import type { ExamSummary } from "@/types/exam";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data: ExamSummary[] = await listExamSummariesPersisted();
    return NextResponse.json({ data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to list exams" }, { status: 500 });
  }
}

type CreateBody = {
  title?: string;
  totalUsers?: number | null;
  totalSlots?: number | null;
  questionSetsCount?: number | null;
  questionType?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
};

export async function POST(request: Request) {
  if (!isAdminSessionRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateBody;
  try {
    body = (await request.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  try {
    const summary = await createExamPersisted({
      title,
      totalUsers: body.totalUsers ?? null,
      totalSlots: body.totalSlots ?? null,
      questionSetsCount: body.questionSetsCount ?? null,
      questionType: body.questionType,
      startTime: body.startTime ?? "",
      endTime: body.endTime ?? "",
      durationMinutes: body.durationMinutes ?? 0,
    });
    return NextResponse.json({ data: summary }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create exam" }, { status: 500 });
  }
}
