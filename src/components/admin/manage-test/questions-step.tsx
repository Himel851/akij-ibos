"use client";

import {
  QuestionModal,
  type DraftQuestionPayload,
} from "./question-modal";
import { ManageTestHeader } from "@/components/admin/manage-test/manage-test-header";
import { getDraftExamId } from "@/lib/manage-test-storage";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function QuestionsStep() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [draftKey, setDraftKey] = useState(0);
  const [questions, setQuestions] = useState<DraftQuestionPayload[]>([]);

  useEffect(() => {
    if (!getDraftExamId()) {
      router.replace("/admin/tests/new");
      return;
    }
    queueMicrotask(() => setReady(true));
  }, [router]);

  const questionNumber = questions.length + 1;

  function handleSave(payload: DraftQuestionPayload) {
    setQuestions((q) => [...q, payload]);
    setModalOpen(false);
  }

  function handleSaveAndAddMore(payload: DraftQuestionPayload) {
    setQuestions((q) => [...q, payload]);
    setDraftKey((k) => k + 1);
  }

  if (!ready) {
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
          onClick={() => setModalOpen(true)}
          className="w-full rounded-lg bg-primary px-5 py-4 text-center text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary-hover"
        >
          Add Question
        </button>

        {questions.length > 0 ? (
          <ul className="mt-6 space-y-3 border-t border-zinc-200 pt-6">
            {questions.map((q, i) => (
              <li
                key={`${q.prompt.slice(0, 24)}-${i}`}
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
        onSave={handleSave}
        onSaveAndAddMore={handleSaveAndAddMore}
      />
    </div>
  );
}
