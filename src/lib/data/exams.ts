import { listExamSummariesPersisted } from "@/lib/exams-persistence";
import type { ExamSummary } from "@/types/exam";

/** Server-only: reads through the same persistence layer as /api/exams (no extra HTTP hop). */
export async function fetchExamSummariesFromApi(): Promise<ExamSummary[]> {
  return listExamSummariesPersisted();
}
