import {
  computeExamScore,
  type ExamScoreResult,
  type UserAnswer,
} from "@/lib/exam-scoring";
import type { ExamQuestion } from "@/types/question";
import { create } from "zustand";

export type ExamPhase = "running" | "timeout" | "complete";

type ExamSessionState = {
  examId: string | null;
  phase: ExamPhase;
  index: number;
  secondsLeft: number;
  answers: Record<string, UserAnswer>;
  skipped: Set<string>;
  score: ExamScoreResult | null;
  resultSubmitSent: boolean;
};

type ExamSessionActions = {
  init: (examId: string, initialSeconds: number) => void;
  tick: () => void;
  setRadio: (questionId: string, optionId: string) => void;
  toggleCheckbox: (questionId: string, optionId: string) => void;
  setText: (questionId: string, text: string) => void;
  skipQuestion: (questionId: string) => void;
  goNext: (questions: ExamQuestion[]) => void;
  finishExam: (questions: ExamQuestion[]) => void;
  submitExamResultOnce: (examId: string) => void;
};

export const useUserExamSessionStore = create<ExamSessionState & ExamSessionActions>(
  (set, get) => ({
    examId: null,
    phase: "running",
    index: 0,
    secondsLeft: 0,
    answers: {},
    skipped: new Set(),
    score: null,
    resultSubmitSent: false,

    init: (examId, initialSeconds) =>
      set({
        examId,
        phase: "running",
        index: 0,
        secondsLeft: initialSeconds,
        answers: {},
        skipped: new Set(),
        score: null,
        resultSubmitSent: false,
      }),

    tick: () =>
      set((s) => {
        if (s.phase !== "running") return s;
        if (s.secondsLeft <= 1) {
          return { ...s, secondsLeft: 0, phase: "timeout" };
        }
        return { ...s, secondsLeft: s.secondsLeft - 1 };
      }),

    setRadio: (questionId, optionId) =>
      set((s) => {
        const existing = s.answers[questionId];
        if (existing?.kind === "radio") return s;
        return {
          ...s,
          answers: { ...s.answers, [questionId]: { kind: "radio", optionId } },
        };
      }),

    /** Add-only: once an option is checked it cannot be unchecked. */
    toggleCheckbox: (questionId, optionId) =>
      set((s) => {
        const cur = s.answers[questionId];
        const ids = cur?.kind === "checkbox" ? [...cur.optionIds] : [];
        if (ids.includes(optionId)) return s;
        ids.push(optionId);
        return {
          ...s,
          answers: {
            ...s.answers,
            [questionId]: { kind: "checkbox", optionIds: ids },
          },
        };
      }),

    setText: (questionId, text) =>
      set((s) => ({
        ...s,
        answers: { ...s.answers, [questionId]: { kind: "text", text } },
      })),

    skipQuestion: (questionId) =>
      set((s) => {
        const nextAnswers = { ...s.answers };
        delete nextAnswers[questionId];
        const nextSkipped = new Set(s.skipped);
        nextSkipped.add(questionId);
        return { ...s, answers: nextAnswers, skipped: nextSkipped };
      }),

    goNext: (questions) => {
      const { index } = get();
      const total = questions.length;
      if (index >= total - 1) {
        get().finishExam(questions);
        return;
      }
      set((s) => ({ ...s, index: s.index + 1 }));
    },

    finishExam: (questions) => {
      const { answers, skipped } = get();
      const result = computeExamScore(questions, answers, skipped);
      set({ score: result, phase: "complete" });
      const id = get().examId;
      if (id) get().submitExamResultOnce(id);
    },

    submitExamResultOnce: (examId) => {
      if (get().resultSubmitSent) return;
      set({ resultSubmitSent: true });
      const { answers, skipped } = get();
      void (async () => {
        try {
          const res = await fetch(`/api/exams/${examId}/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({
              answers,
              skippedIds: [...skipped],
            }),
          });
          if (!res.ok) {
            const j = (await res.json().catch(() => ({}))) as { error?: string };
            console.warn("Could not save exam result:", j.error ?? res.status);
            set({ resultSubmitSent: false });
          }
        } catch (e) {
          console.warn("Could not save exam result", e);
          set({ resultSubmitSent: false });
        }
      })();
    },
  }),
);
