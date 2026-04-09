import type { Exam, ExamSummary } from "@/types/exam";

/** Base path for Route Handlers — swap origin for a real backend later. */
export const API_BASE = "/api";

export type ExamsListResponse = { data: ExamSummary[] };

export type ExamDetailResponse = { data: Exam };

export async function fetchExams(): Promise<ExamSummary[]> {
  const res = await fetch(`${API_BASE}/exams`, { cache: "no-store" });
  if (!res.ok) throw new Error(`fetchExams: ${res.status}`);
  const json = (await res.json()) as ExamsListResponse;
  return json.data;
}

export async function fetchExamById(id: string): Promise<Exam | null> {
  const res = await fetch(`${API_BASE}/exams/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`fetchExamById: ${res.status}`);
  const json = (await res.json()) as ExamDetailResponse;
  return json.data;
}

export async function createExam(body: {
  title: string;
  totalUsers?: number | null;
  totalSlots?: number | null;
  questionSetsCount?: number | null;
  questionType?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
}): Promise<ExamSummary> {
  const res = await fetch(`${API_BASE}/exams`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`createExam: ${res.status}`);
  const json = (await res.json()) as { data: ExamSummary };
  return json.data;
}
