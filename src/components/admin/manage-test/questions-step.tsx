"use client";

import { ConfirmDialog } from "./confirm-dialog";
import {
  QuestionModal,
  type DraftQuestionPayload,
} from "./question-modal";
import { QuestionPreviewCard } from "./question-preview-card";
import {
  draftToExamQuestion,
  examQuestionFromPayload,
  examQuestionToDraft,
  normalizeExamQuestions,
} from "@/lib/exam-questions-map";
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
  const [deleteTarget, setDeleteTarget] = useState<ExamQuestion | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingQuestion =
    editingId !== null ? questions.find((q) => q.id === editingId) : undefined;
  const modalInitialDraft =
    editingQuestion !== undefined ? examQuestionToDraft(editingQuestion) : null;
  const modalQuestionNumber =
    editingId !== null
      ? Math.max(1, questions.findIndex((q) => q.id === editingId) + 1)
      : questions.length + 1;

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
    const next =
      editingId !== null
        ? questions.map((q) =>
            q.id === editingId ? examQuestionFromPayload(payload, editingId) : q,
          )
        : [...questions, draftToExamQuestion(payload)];
    try {
      await persistQuestions(next);
      setQuestions(next);
      setModalOpen(false);
      setEditingId(null);
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
          onClick={() => {
            setEditingId(null);
            setModalOpen(true);
          }}
          className="w-full rounded-lg bg-primary px-5 py-4 text-center text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary-hover disabled:opacity-60 cursor-pointer"
        >
          {saving ? "Saving…" : "Add Question"}
        </button>

        {questions.length > 0 ? (
          <ul className="mt-6 space-y-4 border-t border-zinc-200 pt-6">
            {questions.map((q, i) => (
              <QuestionPreviewCard
                key={q.id}
                question={q}
                index={i}
                disabled={saving || deletePending}
                onEdit={() => {
                  setEditingId(q.id);
                  setModalOpen(true);
                }}
                onRemove={() => setDeleteTarget(q)}
              />
            ))}
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
        questionNumber={modalQuestionNumber}
        resetKey={draftKey}
        initialDraft={modalInitialDraft}
        isEditing={editingId !== null}
        onClose={() => {
          setEditingId(null);
          setModalOpen(false);
        }}
        onSave={(p) => void handleSave(p)}
        onSaveAndAddMore={(p) => void handleSaveAndAddMore(p)}
      />
    </div>
  );
}
