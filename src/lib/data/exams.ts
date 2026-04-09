import type { ExamSummary } from "@/types/exam";
import { headers } from "next/headers";

/**
 * Server-only: calls the same Route Handler as the browser would.
 * Use this in Server Components to keep a single API surface for the mock backend.
 */
export async function fetchExamSummariesFromApi(): Promise<ExamSummary[]> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const url = `${proto}://${host}/api/exams`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`GET /api/exams failed: ${res.status}`);
  }
  const json = (await res.json()) as { data: ExamSummary[] };
  return json.data;
}
