"use client";

import {
  QuestionModal,
  type DraftQuestionPayload,
} from "./question-modal";
import { draftToExamQuestion, normalizeExamQuestions } from "@/lib/exam-questions-map";
import { ManageTestHeader } from "@/components/admin/manage-test/manage-test-header";
import { getDraftExamId } from "@/lib/manage-test-storage";
import type { ExamQuestion } from "@/types/question";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export function QuestionsStep() {
  const router = useRouter();
  const [phase, setPhase] = useState<"loading" | "ready">("loading");
  const [modalOpen, setModalOpen] = useState(false);
  const [draftKey, setDraftKey] = useState(0);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const id = getDraftExamId();
    if (!id) {
      router.replace("/admin/tests/new");
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/exams/${id}`);
        if (!res.ok) throw new Error("load failed");
        const json = (await res.json()) as { data: { questions?: unknown } };
        if (cancelled) return;
        setQuestions(normalizeExamQuestions(json.data.questions));
      } catch {
        if (!cancelled) toast.error("Could not load saved questions");
      } finally {
        if (!cancelled) queueMicrotask(() => setPhase("ready"));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const questionNumber = questions.length + 1;

  async function persistQuestions(next: ExamQuestion[]) {
    const id = getDraftExamId();
    if (!id) throw new Error("Missing exam");
    setSaving(true);
    try {
      const res = await fetch(`/api/exams/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: next }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? "Save failed");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(payload: DraftQuestionPayload) {
    const next = [...questions, draftToExamQuestion(payload)];
    try {
      await persistQuestions(next);
      setQuestions(next);
      setModalOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function handleSaveAndAddMore(payload: DraftQuestionPayload) {
    const next = [...questions, draftToExamQuestion(payload)];
    try {
      await persistQuestions(next);
      setQuestions(next);
      setDraftKey((k) => k + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  }

  if (phase === "loading") {
    return (
      <div className="mx-auto max-w-container px-4 py-10 text-center text-sm text-zinc-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-container space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <ManageTestHeader variant="complete" />

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <button
          type="button"
          disabled={saving}
          onClick={() => setModalOpen(true)}
          className="w-full rounded-lg bg-primary px-5 py-4 text-center text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary-hover disabled:opacity-60"
        >
          {saving ? "Saving…" : "Add Question"}
        </button>

        {questions.length > 0 ? (
          <ul className="mt-6 space-y-3 border-t border-zinc-200 pt-6">
            {questions.map((q, i) => (
              <li
                key={q.id}
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm"
              >
                <p className="font-semibold text-zinc-900">
                  Q{i + 1}. {q.prompt.slice(0, 120)}
                  {q.prompt.length > 120 ? "…" : ""}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Score: {q.score} · Type: {q.type} · Options: {q.options.length}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <QuestionModal
        open={modalOpen}
        questionNumber={questionNumber}
        resetKey={draftKey}
        onClose={() => setModalOpen(false)}
        onSave={(p) => void handleSave(p)}
        onSaveAndAddMore={(p) => void handleSaveAndAddMore(p)}
      />
    </div>
  );
}
