import type { DraftQuestionPayload } from "@/components/admin/manage-test/question-modal-types";
import type { ExamQuestion, McqOption, QuestionType } from "@/types/question";

export function newExamQuestionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `q-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function draftToExamQuestion(payload: DraftQuestionPayload): ExamQuestion {
  return {
    id: newExamQuestionId(),
    score: payload.score,
    type: payload.type,
    prompt: payload.prompt,
    options: payload.options.map((o) => ({
      id: o.id,
      text: o.text,
      isCorrect: o.isCorrect,
    })),
  };
}

export function examQuestionToDraft(q: ExamQuestion): DraftQuestionPayload {
  return {
    score: q.score,
    type: q.type,
    prompt: q.prompt,
    options: q.options.map((o) => ({
      id: o.id,
      text: o.text,
      isCorrect: o.isCorrect,
    })),
  };
}

/** Update existing row — keeps `id` for PATCH payload. */
export function examQuestionFromPayload(
  payload: DraftQuestionPayload,
  id: string,
): ExamQuestion {
  const options = payload.options
    .map((o) => ({
      id: o.id,
      text: o.text.trim(),
      isCorrect: o.isCorrect,
    }))
    .filter((o) => o.text !== "");
  return {
    id,
    score: payload.score,
    type: payload.type,
    prompt: payload.prompt.trim(),
    options,
  };
}

function isQuestionType(v: unknown): v is QuestionType {
  return v === "checkbox" || v === "radio" || v === "text";
}

function normalizeMcqOptions(raw: unknown): McqOption[] {
  if (!Array.isArray(raw)) return [];
  const out: McqOption[] = [];
  let i = 0;
  for (const item of raw) {
    if (item && typeof item === "object" && "text" in item) {
      const o = item as Record<string, unknown>;
      const id = typeof o.id === "string" && o.id ? o.id : `opt-${i}`;
      const text = typeof o.text === "string" ? o.text : "";
      const isCorrect = Boolean(o.isCorrect);
      out.push({ id, text, isCorrect });
    } else if (typeof item === "string") {
      out.push({ id: `opt-${i}`, text: item, isCorrect: false });
    }
    i += 1;
  }
  return out;
}

/** Parse `exams.questions` jsonb from DB or legacy shapes. */
export function normalizeExamQuestions(raw: unknown): ExamQuestion[] {
  if (!Array.isArray(raw)) return [];
  const out: ExamQuestion[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id = typeof o.id === "string" && o.id ? o.id : newExamQuestionId();
    const prompt =
      typeof o.prompt === "string"
        ? o.prompt
        : typeof o.title === "string"
          ? o.title
          : "";
    const type: QuestionType = isQuestionType(o.type) ? o.type : "radio";
    const score =
      typeof o.score === "number" && Number.isFinite(o.score) ? Math.max(0, o.score) : 1;
    const options = normalizeMcqOptions(o.options);
    out.push({ id, score, type, prompt, options });
  }
  return out;
}
