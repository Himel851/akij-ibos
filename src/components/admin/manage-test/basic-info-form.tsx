"use client";

import { ManageTestHeader } from "@/components/admin/manage-test/manage-test-header";
import { FieldShell } from "@/components/admin/manage-test/field-shell";
import {
  datetimeLocalToIso,
  isoToDatetimeLocal,
  minutesBetweenDatetimeLocal,
} from "@/lib/datetime-local";
import { basicInfoToExamPatch, examToBasicInfo } from "@/lib/manage-test-basic-info-map";
import type { BasicInfo } from "@/lib/manage-test-storage";
import {
  clearDraftExamId,
  getDraftExamId,
  setDraftExamId,
} from "@/lib/manage-test-storage";
import { CalendarClock, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Exam } from "@/types/exam";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

function SelectChevron({
  id,
  name,
  required,
  defaultValue,
  placeholder,
  options,
}: {
  id: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        id={id}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="w-full appearance-none rounded-lg border border-zinc-200 bg-white py-2.5 pl-3 pr-10 text-sm text-zinc-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
        aria-hidden
      />
    </div>
  );
}

function DateTimeLocalInput({
  id,
  name,
  required,
  value,
  onChange,
}: {
  id: string;
  name: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type="datetime-local"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-3 pr-10 text-sm text-zinc-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <CalendarClock
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
        aria-hidden
      />
    </div>
  );
}

type FormState = {
  initial: BasicInfo;
  startLocal: string;
  endLocal: string;
};

function BasicInfoFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [examId, setExamId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (searchParams.get("fresh") === "1") {
        clearDraftExamId();
        router.replace("/admin/tests/new");
        return;
      }

      let id = getDraftExamId();

      try {
        if (!id) {
          const draftRes = await fetch("/api/exams/draft", { method: "POST" });
          if (!draftRes.ok) {
            const j = (await draftRes.json().catch(() => ({}))) as { error?: string };
            throw new Error(j.error ?? `Could not start draft (${draftRes.status})`);
          }
          const draftJson = (await draftRes.json()) as { data: { id: string } };
          id = draftJson.data.id;
          if (cancelled) return;
          setDraftExamId(id);
        }

        const examRes = await fetch(`/api/exams/${id}`);
        if (!examRes.ok) {
          if (examRes.status === 404) {
            clearDraftExamId();
            const retry = await fetch("/api/exams/draft", { method: "POST" });
            if (!retry.ok) throw new Error("Could not recover draft");
            const j = (await retry.json()) as { data: { id: string } };
            id = j.data.id;
            setDraftExamId(id);
            const again = await fetch(`/api/exams/${id}`);
            if (!again.ok) throw new Error("Could not load new draft");
            const examJson = (await again.json()) as { data: Exam };
            const loaded = examToBasicInfo(examJson.data);
            if (cancelled) return;
            setExamId(id);
            setForm({
              initial: loaded,
              startLocal: isoToDatetimeLocal(loaded.startTime),
              endLocal: isoToDatetimeLocal(loaded.endTime),
            });
            return;
          }
          throw new Error(`Could not load exam (${examRes.status})`);
        }

        const examJson = (await examRes.json()) as { data: Exam };
        const loaded = examToBasicInfo(examJson.data);
        if (cancelled) return;
        setExamId(id);
        setForm({
          initial: loaded,
          startLocal: isoToDatetimeLocal(loaded.startTime),
          endLocal: isoToDatetimeLocal(loaded.endTime),
        });
      } catch (e) {
        if (cancelled) return;
        setLoadError(e instanceof Error ? e.message : "Failed to load");
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  const durationMinutes = useMemo(
    () =>
      form ? minutesBetweenDatetimeLocal(form.startLocal, form.endLocal) : "",
    [form],
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form || !examId) return;

    if (form.startLocal && form.endLocal) {
      const a = new Date(form.startLocal).getTime();
      const b = new Date(form.endLocal).getTime();
      if (!Number.isNaN(a) && !Number.isNaN(b) && b <= a) {
        toast.error("End date & time must be after start date & time");
        return;
      }
    }

    const fd = new FormData(e.currentTarget);
    const data: BasicInfo = {
      title: String(fd.get("title") ?? ""),
      totalCandidates: String(fd.get("totalCandidates") ?? ""),
      totalSlots: String(fd.get("totalSlots") ?? ""),
      totalQuestionSet: String(fd.get("totalQuestionSet") ?? ""),
      questionType: String(fd.get("questionType") ?? ""),
      startTime: datetimeLocalToIso(form.startLocal),
      endTime: datetimeLocalToIso(form.endLocal),
      duration: durationMinutes,
    };

    const patch = basicInfoToExamPatch(data);
    try {
      const res = await fetch(`/api/exams/${examId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: patch.title,
          totalUsers: patch.totalUsers,
          totalSlots: patch.totalSlots,
          questionSetsCount: patch.questionSetsCount,
          questionType: patch.questionType,
          startTime: patch.startTime,
          endTime: patch.endTime,
          durationMinutes: patch.durationMinutes,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "Save failed");
      }
      router.push("/admin/tests/new/review");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-container px-4 py-10 text-center text-sm text-red-600">
        {loadError}
      </div>
    );
  }

  if (!form || !examId) {
    return (
      <div className="mx-auto max-w-container px-4 py-10 text-center text-sm text-zinc-500">
        Loading…
      </div>
    );
  }

  const { initial } = form;

  return (
    <div className="mx-auto w-full max-w-container space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <ManageTestHeader variant="two-step" activeStep={1} />

      <form key={examId} onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-bold text-zinc-900">Basic Information</h2>
          <div className="mt-6 space-y-5">
            <FieldShell label="Online Test Title" required>
              <input
                name="title"
                required
                defaultValue={initial.title}
                placeholder="Enter online test title"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </FieldShell>

            <div className="grid gap-5 sm:grid-cols-2">
              <FieldShell label="Total Candidates" required>
                <input
                  name="totalCandidates"
                  required
                  defaultValue={initial.totalCandidates}
                  placeholder="Enter total candidates"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </FieldShell>
              <FieldShell label="Total Slots" required>
                <SelectChevron
                  id="totalSlots"
                  name="totalSlots"
                  required
                  defaultValue={initial.totalSlots}
                  placeholder="Select total slots"
                  options={[
                    { value: "1", label: "1" },
                    { value: "2", label: "2" },
                    { value: "3", label: "3" },
                    { value: "4", label: "4" },
                    { value: "5", label: "5" },
                  ]}
                />
              </FieldShell>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FieldShell label="Total Question Set" required>
                <SelectChevron
                  id="totalQuestionSet"
                  name="totalQuestionSet"
                  required
                  defaultValue={initial.totalQuestionSet}
                  placeholder="Select total question set"
                  options={[
                    { value: "1", label: "1" },
                    { value: "2", label: "2" },
                    { value: "3", label: "3" },
                  ]}
                />
              </FieldShell>
              <FieldShell label="Question Type" required>
                <SelectChevron
                  id="questionType"
                  name="questionType"
                  required
                  defaultValue={initial.questionType}
                  placeholder="Select question type"
                  options={[
                    { value: "MCQ", label: "MCQ" },
                    { value: "Checkbox", label: "Checkbox" },
                    { value: "Radio", label: "Radio" },
                    { value: "Text", label: "Text" },
                  ]}
                />
              </FieldShell>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <FieldShell label="Start date & time" required>
                <DateTimeLocalInput
                  id="startTime"
                  name="startTime"
                  required
                  value={form.startLocal}
                  onChange={(v) =>
                    setForm((f) => (f ? { ...f, startLocal: v } : f))
                  }
                />
              </FieldShell>
              <FieldShell label="End date & time" required>
                <DateTimeLocalInput
                  id="endTime"
                  name="endTime"
                  required
                  value={form.endLocal}
                  onChange={(v) =>
                    setForm((f) => (f ? { ...f, endLocal: v } : f))
                  }
                />
              </FieldShell>
              <FieldShell label="Duration (minutes)">
                <input
                  readOnly
                  value={durationMinutes ? `${durationMinutes} min` : ""}
                  placeholder="Auto from start & end"
                  className="w-full cursor-not-allowed rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-700 placeholder:text-zinc-400"
                  aria-readonly
                />
              </FieldShell>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover"
          >
            Save & Continue
          </button>
        </div>
      </form>
    </div>
  );
}

export function BasicInfoForm() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-container px-4 py-10 text-center text-sm text-zinc-500">
          Loading…
        </div>
      }
    >
      <BasicInfoFormInner />
    </Suspense>
  );
}
