"use client";

import { ManageTestHeader } from "@/components/admin/manage-test/manage-test-header";
import { FieldShell } from "@/components/admin/manage-test/field-shell";
import {
  datetimeLocalToIso,
  isoToDatetimeLocal,
  minutesBetweenDatetimeLocal,
} from "@/lib/datetime-local";
import type { BasicInfo } from "@/lib/manage-test-storage";
import { loadBasicInfo, saveBasicInfo } from "@/lib/manage-test-storage";
import { CalendarClock, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const empty: BasicInfo = {
  title: "",
  totalCandidates: "",
  totalSlots: "",
  totalQuestionSet: "",
  questionType: "",
  startTime: "",
  endTime: "",
  duration: "",
};

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
        className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-3 pr-4 text-sm text-zinc-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
     
    </div>
  );
}

type FormState = {
  initial: BasicInfo;
  startLocal: string;
  endLocal: string;
};

export function BasicInfoForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const loaded = loadBasicInfo() ?? empty;
      setForm({
        initial: loaded,
        startLocal: isoToDatetimeLocal(loaded.startTime),
        endLocal: isoToDatetimeLocal(loaded.endTime),
      });
    });
  }, []);

  const durationMinutes = useMemo(
    () =>
      form
        ? minutesBetweenDatetimeLocal(form.startLocal, form.endLocal)
        : "",
    [form],
  );

  if (!form) {
    return (
      <div className="mx-auto max-w-container px-4 py-10 text-center text-sm text-zinc-500">
        Loading…
      </div>
    );
  }

  const { initial } = form;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form) return;

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
    saveBasicInfo(data);
    router.push("/admin/tests/new/review");
  }

  return (
    <div className="mx-auto w-full max-w-container space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <ManageTestHeader variant="two-step" activeStep={1} />

      <form onSubmit={handleSubmit} className="space-y-6">
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
            className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover cursor-pointer"
          >
            Save & Continue
          </button>
        </div>
      </form>
    </div>
  );
}
