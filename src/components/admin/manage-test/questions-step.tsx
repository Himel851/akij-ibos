"use client";

import { ConfirmDialog } from "./confirm-dialog";
import {
  QuestionModal,
  type DraftQuestionPayload,
} from "./question-modal";
import { draftToExamQuestion, normalizeExamQuestions } from "@/lib/exam-questions-map";
import { ManageTestHeader } from "@/components/admin/manage-test/manage-test-header";
import { getDraftExamId } from "@/lib/manage-test-storage";
import type { ExamQuestion } from "@/types/question";
import { Trash2 } from "lucide-react";
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
  const [deleteTarget, setDeleteTarget] = useState<ExamQuestion | null>(null);
  const [deletePending, setDeletePending] = useState(false);

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

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    const next = questions.filter((q) => q.id !== deleteTarget.id);
    setDeletePending(true);
    try {
      await persistQuestions(next);
      setQuestions(next);
      setDeleteTarget(null);
      toast.success("Question removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete question");
    } finally {
      setDeletePending(false);
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
          className="w-full rounded-lg bg-primary px-5 py-4 text-center text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary-hover disabled:opacity-60 cursor-pointer"
        >
          {saving ? "Saving…" : "Add Question"}
        </button>

        {questions.length > 0 ? (
          <ul className="mt-6 space-y-3 border-t border-zinc-200 pt-6">
            {questions.map((q, i) => {
              const preview = (q.prompt || "").slice(0, 120);
              const hasMore = (q.prompt || "").length > 120;
              return (
                <li
                  key={q.id}
                  className="flex flex-row items-start justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-900">
                      Q{i + 1}. {preview}
                      {hasMore ? "…" : ""}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Score: {q.score} · Type: {q.type} · Options:{" "}
                      {q.options.length}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={saving || deletePending}
                    onClick={() => setDeleteTarget(q)}
                    className="shrink-0 rounded-lg p-2 text-zinc-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 cursor-pointer"
                    aria-label={`Delete question ${i + 1}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this question?"
        description="Are you sure you want to remove this question from the test? This cannot be undone."
        confirmLabel="Delete question"
        cancelLabel="Cancel"
        loading={deletePending}
        onCancel={() => !deletePending && setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
      />

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
