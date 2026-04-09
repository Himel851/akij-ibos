import {
  createExam,
  listExamSummaries,
} from "@/lib/mock/exams-repository";
import type { ExamSummary } from "@/types/exam";
import { NextResponse } from "next/server";

export async function GET() {
  const data: ExamSummary[] = listExamSummaries();
  return NextResponse.json({ data });
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

  const summary = createExam({
    title,
    totalUsers: body.totalUsers ?? null,
    totalSlots: body.totalSlots ?? null,
    questionSetsCount: body.questionSetsCount ?? null,
    questionType: body.questionType,
    startTime: body.startTime ?? "",
    endTime: body.endTime ?? "",
    durationMinutes: body.durationMinutes ?? 0,
    questions: [],
  });

  return NextResponse.json({ data: summary }, { status: 201 });
}
