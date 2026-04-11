import type { UserAnswer } from "@/lib/exam-scoring";
import type { Exam } from "@/types/exam";

/**
 * Turn client JSON into answers the scorer accepts. Only includes entries that
 * match the question type and valid option ids.
 */
export function parseExamSubmissionAnswers(
  exam: Exam,
  raw: unknown,
  skippedIds: Set<string>,
): Record<string, UserAnswer> {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  const obj = raw as Record<string, unknown>;
  const out: Record<string, UserAnswer> = {};

  for (const q of exam.questions) {
    if (skippedIds.has(q.id)) continue;
    const v = obj[q.id];
    if (v === null || v === undefined) continue;
    if (typeof v !== "object" || Array.isArray(v)) continue;
    const rec = v as Record<string, unknown>;

    if (q.type === "radio") {
      if (rec.kind !== "radio") continue;
      const optionId = rec.optionId;
      if (typeof optionId !== "string" || !optionId) continue;
      if (!q.options.some((o) => o.id === optionId)) continue;
      out[q.id] = { kind: "radio", optionId };
      continue;
    }

    if (q.type === "checkbox") {
      if (rec.kind !== "checkbox") continue;
      const ids = rec.optionIds;
      if (!Array.isArray(ids)) continue;
      const optionIds = ids.filter((x): x is string => typeof x === "string");
      const valid = optionIds.every((id) => q.options.some((o) => o.id === id));
      if (!valid) continue;
      out[q.id] = { kind: "checkbox", optionIds };
      continue;
    }

    if (q.type === "text") {
      if (rec.kind !== "text") continue;
      const text = typeof rec.text === "string" ? rec.text : "";
      out[q.id] = { kind: "text", text };
    }
  }

  return out;
}

export function parseSkippedIds(raw: unknown): Set<string> {
  if (!Array.isArray(raw)) return new Set();
  const ids = raw.filter((x): x is string => typeof x === "string" && x.length > 0);
  return new Set(ids);
}
