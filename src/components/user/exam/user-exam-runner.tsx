"use client";

import { RichTextArea } from "@/components/admin/manage-test/rich-text-area";
import { computeExamScore, type ExamScoreResult, type UserAnswer } from "@/lib/exam-scoring";
import type { Exam } from "@/types/exam";
import { Check, Clock, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

type Phase = "running" | "timeout" | "complete";

function formatMmSs(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function stripPromptForDisplay(raw: string): string {
  return raw.replace(/<[^>]*>/g, "").trim() || "—";
}

export function UserExamRunner({ exam }: { exam: Exam }) {
  const questions = exam.questions;
  const total = questions.length;

  const initialSeconds = useMemo(() => {
    const m = exam.durationMinutes > 0 ? exam.durationMinutes : 20;
    return Math.max(60, m * 60);
  }, [exam.durationMinutes]);

  const [phase, setPhase] = useState<Phase>("running");
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [skipped, setSkipped] = useState<Set<string>>(() => new Set());
  const [score, setScore] = useState<ExamScoreResult | null>(null);
  const [userName, setUserName] = useState("");

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
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          queueMicrotask(() => setPhase("timeout"));
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  const q = questions[index];
  const displayName = userName || "Participant";

  const finishExam = useCallback(() => {
    const result = computeExamScore(questions, answers, skipped);
    setScore(result);
    setPhase("complete");
  }, [questions, answers, skipped]);

  const goNext = useCallback(() => {
    if (index >= total - 1) {
      finishExam();
      return;
    }
    setIndex((i) => i + 1);
  }, [index, total, finishExam]);

  const handleSkip = () => {
    if (!q) return;
    setSkipped((prev) => new Set(prev).add(q.id));
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[q.id];
      return next;
    });
    goNext();
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
    goNext();
  };

  const setRadio = (optionId: string) => {
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q.id]: { kind: "radio", optionId } }));
  };

  const toggleCheckbox = (optionId: string) => {
    if (!q || q.type !== "checkbox") return;
    const cur = answers[q.id];
    const ids =
      cur?.kind === "checkbox" ? [...cur.optionIds] : [];
    const i = ids.indexOf(optionId);
    if (i >= 0) ids.splice(i, 1);
    else ids.push(optionId);
    setAnswers((prev) => ({ ...prev, [q.id]: { kind: "checkbox", optionIds: ids } }));
  };

  const setText = (text: string) => {
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q.id]: { kind: "text", text } }));
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
                  value={answers[q.id]?.kind === "text" ? answers[q.id].text : ""}
                  onChange={setText}
                  placeholder="Type your answer here…"
                  rows={8}
                />
              ) : (
                q.options.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                      q.type === "radio" &&
                      answers[q.id]?.kind === "radio" &&
                      answers[q.id].optionId === opt.id
                        ? "border-primary bg-primary/5"
                        : q.type === "checkbox" &&
                            answers[q.id]?.kind === "checkbox" &&
                            answers[q.id].optionIds.includes(opt.id)
                          ? "border-primary bg-primary/5"
                          : "border-zinc-200 bg-white hover:border-zinc-300"
                    }`}
                  >
                    {q.type === "radio" ? (
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        checked={Boolean(
                          answers[q.id]?.kind === "radio" &&
                            answers[q.id].optionId === opt.id,
                        )}
                        onChange={() => setRadio(opt.id)}
                        className="h-4 w-4 border-zinc-400 text-primary focus:ring-primary"
                      />
                    ) : (
                      <input
                        type="checkbox"
                        checked={Boolean(
                          answers[q.id]?.kind === "checkbox" &&
                            answers[q.id].optionIds.includes(opt.id),
                        )}
                        onChange={() => toggleCheckbox(opt.id)}
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
                className="rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
              >
                Skip this Question
              </button>
              <button
                type="button"
                onClick={handleSaveContinue}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
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
