import { NextResponse } from "next/server";

/** Mock attempts — replace with DB-backed list. */
const mockAttempts = [
  {
    id: "att-001",
    examId: "1",
    candidateEmail: "candidate@example.com",
    status: "in_progress" as const,
    startedAt: "2026-04-10T10:00:00.000Z",
  },
];

export async function GET() {
  return NextResponse.json({ data: mockAttempts });
}

export async function POST() {
  return NextResponse.json(
    { message: "Not implemented — start/submit attempt here." },
    { status: 501 },
  );
}
