"use client";

import { RichTextArea } from "@/components/admin/manage-test/rich-text-area";
import type { UserAnswer } from "@/lib/exam-scoring";
import { useUserExamSessionStore } from "@/stores/user-exam-session-store";
import type { Exam } from "@/types/exam";
import type { ExamQuestion, McqOption } from "@/types/question";
import { Check, Clock, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

function formatMmSs(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function stripPromptForDisplay(raw: string): string {
  return raw.replace(/<[^>]*>/g, "").trim() || "—";
}

function setsEqualIds(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

const rowBase =
  "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors";

/**
 * Instant feedback for MCQ:
 * - Radio: after pick, show green on correct option(s), red on wrong pick.
 * - Checkbox: only style options the user has checked until the full set matches;
 *   then show all correct rows green (avoids revealing other correct answers on partial select).
 */
function optionRowClassName(
  q: ExamQuestion,
  opt: McqOption,
  currentAns: UserAnswer | undefined,
): string {
  if (q.type === "radio") {
    const selectedId = currentAns?.kind === "radio" ? currentAns.optionId : null;
    const revealed = selectedId !== null;
    if (!revealed) {
      return `${rowBase} border-zinc-200 bg-white hover:border-zinc-300`;
    }
    if (opt.isCorrect) {
      return `${rowBase} border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500/40`;
    }
    if (selectedId === opt.id && !opt.isCorrect) {
      return `${rowBase} border-red-500 bg-red-50 ring-1 ring-red-500/40`;
    }
    return `${rowBase} border-zinc-200 bg-zinc-50/90 text-zinc-500`;
  }

  if (q.type === "checkbox") {
    const ids = currentAns?.kind === "checkbox" ? currentAns.optionIds : [];
    const selected = new Set(ids);
    const revealed = ids.length > 0;
    if (!revealed) {
      return `${rowBase} border-zinc-200 bg-white hover:border-zinc-300`;
    }
    const correctSet = new Set(q.options.filter((o) => o.isCorrect).map((o) => o.id));
    const match = setsEqualIds(selected, correctSet);
    if (match) {
      return opt.isCorrect
        ? `${rowBase} border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500/40`
        : `${rowBase} border-zinc-200 bg-white`;
    }
    // Partial selection: colour only checked rows (do not highlight unchecked correct answers).
    if (selected.has(opt.id)) {
      return opt.isCorrect
        ? `${rowBase} border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500/40`
        : `${rowBase} border-red-500 bg-red-50 ring-1 ring-red-500/40`;
    }
    return `${rowBase} border-zinc-200 bg-white hover:border-zinc-300`;
  }

  return `${rowBase} border-zinc-200 bg-white hover:border-zinc-300`;
}

export function UserExamRunner({ exam }: { exam: Exam }) {
  const questions = exam.questions;
  const total = questions.length;

  const initialSeconds = useMemo(() => {
    const m = exam.durationMinutes > 0 ? exam.durationMinutes : 20;
    return Math.max(60, m * 60);
  }, [exam.durationMinutes]);

  const phase = useUserExamSessionStore((s) => s.phase);
  const index = useUserExamSessionStore((s) => s.index);
  const secondsLeft = useUserExamSessionStore((s) => s.secondsLeft);
  const answers = useUserExamSessionStore((s) => s.answers);
  const score = useUserExamSessionStore((s) => s.score);
  const examIdInStore = useUserExamSessionStore((s) => s.examId);

  const init = useUserExamSessionStore((s) => s.init);
  const tick = useUserExamSessionStore((s) => s.tick);
  const setRadio = useUserExamSessionStore((s) => s.setRadio);
  const toggleCheckbox = useUserExamSessionStore((s) => s.toggleCheckbox);
  const setText = useUserExamSessionStore((s) => s.setText);
  const skipQuestion = useUserExamSessionStore((s) => s.skipQuestion);
  const goNext = useUserExamSessionStore((s) => s.goNext);
  const submitExamResultOnce = useUserExamSessionStore((s) => s.submitExamResultOnce);

  const [userName, setUserName] = useState("");

  useEffect(() => {
    init(exam.id, initialSeconds);
  }, [exam.id, initialSeconds, init]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          user?: { name?: string; email?: string };
        };
        const n = data.user?.name?.trim();
        const e = data.user?.email?.trim();
        setUserName(n || e || "Participant");
      } catch {
        setUserName("Participant");
      }
    })();
  }, []);

  useEffect(() => {
    if (phase !== "running") return;
    const id = window.setInterval(() => {
      tick();
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, tick]);

  useEffect(() => {
    if (phase !== "timeout" || !examIdInStore) return;
    submitExamResultOnce(examIdInStore);
  }, [phase, examIdInStore, submitExamResultOnce]);

  const q = questions[index];
  const currentAns = q ? answers[q.id] : undefined;
  const displayName = userName || "Participant";

  const handleSkip = () => {
    if (!q) return;
    skipQuestion(q.id);
    goNext(questions);
  };

  const handleSaveContinue = () => {
    if (!q) return;
    if (q.type === "radio") {
      const a = answers[q.id];
      if (!a || a.kind !== "radio") {
        toast.error("Please select an option");
        return;
      }
    }
    if (q.type === "checkbox") {
      const a = answers[q.id];
      if (!a || a.kind !== "checkbox" || a.optionIds.length === 0) {
        toast.error("Select at least one option");
        return;
      }
    }
    goNext(questions);
  };

  const onSetRadio = (optionId: string) => {
    if (!q) return;
    setRadio(q.id, optionId);
  };

  const onToggleCheckbox = (optionId: string) => {
    if (!q || q.type !== "checkbox") return;
    toggleCheckbox(q.id, optionId);
  };

  const onSetText = (text: string) => {
    if (!q) return;
    setText(q.id, text);
  };

  if (total === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-zinc-600">
        This test has no questions yet.
        <div className="mt-4">
          <Link href="/user" className="font-semibold text-primary hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      {phase === "timeout" ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="timeout-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
            <div className="relative mx-auto h-[4.5rem] w-[4.5rem]">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Clock className="h-8 w-8" aria-hidden />
              </div>
              <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-red-500 text-white shadow-sm">
                <X className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <h2 id="timeout-title" className="mt-6 text-center text-xl font-bold text-slate-900">
              Timeout!
            </h2>
            <p className="mt-3 text-center text-sm leading-relaxed text-slate-600">
              Dear {displayName}, your exam time has finished. Thank you for participating.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/user"
                className="rounded-lg border border-zinc-300 bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {phase === "complete" && score ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-white shadow-md">
            <Check className="h-10 w-10" strokeWidth={2.5} aria-hidden />
          </div>
          <h1 className="mt-8 text-center text-2xl font-bold text-zinc-900">Test Completed</h1>
          <p className="mx-auto mt-4 max-w-lg text-center text-sm leading-relaxed text-zinc-600">
            Congratulations! {displayName}, you have completed{" "}
            {exam.title ? ` “${exam.title}”` : " your test"}. Score:{" "}
            <span className="font-semibold text-zinc-900">
              {score.totalPoints.toFixed(2)}
            </span>{" "}
            / {score.maxPossiblePoints} points ({score.correctCount} correct,{" "}
            {score.wrongCount} wrong, {score.skippedCount} skipped). Thank you for participating.
          </p>
          <div className="mt-10 flex justify-center">
            <Link
              href="/user"
              className="rounded-lg border border-zinc-300 bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      ) : null}

      {phase === "running" || phase === "timeout" ? (
        <div
          className={
            phase === "timeout" ? "pointer-events-none opacity-40 transition-opacity" : ""
          }
          aria-hidden={phase === "timeout"}
        >
          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-sm font-semibold text-zinc-800">
              Question ({index + 1}/{total})
            </p>
            <div className="inline-flex w-fit rounded-full bg-zinc-100 px-4 py-2 text-sm font-bold text-zinc-900">
              {formatMmSs(secondsLeft)} left
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
            <p className="text-base font-semibold leading-relaxed text-zinc-900">
              Q{index + 1}. {stripPromptForDisplay(q.prompt)}
            </p>

            <div className="mt-6 space-y-3">
              {q.type === "text" ? (
                <RichTextArea
                  value={
                    currentAns?.kind === "text" ? currentAns.text : ""
                  }
                  onChange={onSetText}
                  placeholder="Type your answer here…"
                  rows={8}
                />
              ) : (
                q.options.map((opt) => (
                  <label
                    key={opt.id}
                    className={optionRowClassName(q, opt, currentAns)}
                  >
                    {q.type === "radio" ? (
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        checked={Boolean(
                          currentAns?.kind === "radio" &&
                            currentAns.optionId === opt.id,
                        )}
                        onChange={() => onSetRadio(opt.id)}
                        className="h-4 w-4 border-zinc-400 text-primary focus:ring-primary"
                      />
                    ) : (
                      <input
                        type="checkbox"
                        checked={Boolean(
                          currentAns?.kind === "checkbox" &&
                            currentAns.optionIds.includes(opt.id),
                        )}
                        onChange={() => onToggleCheckbox(opt.id)}
                        className="h-4 w-4 rounded border-zinc-400 text-primary focus:ring-primary"
                      />
                    )}
                    <span className="text-sm text-zinc-800">
                      {stripPromptForDisplay(opt.text)}
                    </span>
                  </label>
                ))
              )}
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={handleSkip}
                className="rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 cursor-pointer"
              >
                Skip this Question
              </button>
              <button
                type="button"
                onClick={handleSaveContinue}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover cursor-pointer"
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
