"use client";

import { ManageTestHeader } from "@/components/admin/manage-test/manage-test-header";
import { formatIsoForDisplay } from "@/lib/datetime-local";
import type { BasicInfo } from "@/lib/manage-test-storage";
import { loadBasicInfo } from "@/lib/manage-test-storage";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function BasicInfoReview() {
  const router = useRouter();
  const [data, setData] = useState<BasicInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loaded = loadBasicInfo();
    if (!loaded) {
      router.replace("/admin/tests/new");
      return;
    }
    setData(loaded);
    setLoading(false);
  }, [router]);

  if (loading || !data) {
    return (
      <div className="mx-auto max-w-container px-4 py-10 text-center text-sm text-zinc-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-container space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <ManageTestHeader variant="two-step" activeStep={1} />

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-zinc-900">Basic Information</h2>
          <Link
            href="/admin/tests/new"
            className="inline-flex items-center gap-2 self-start text-sm font-semibold text-primary hover:text-primary-hover"
          >
            <Pencil className="h-4 w-4" aria-hidden />
            Edit
          </Link>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <p className="text-xs font-medium text-zinc-500">Online Test Title</p>
            <p className="mt-1 text-lg font-bold text-zinc-900">{data.title}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-zinc-500">Total Candidates</p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                {data.totalCandidates}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500">Total Slots</p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                {data.totalSlots}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500">Total Question Set</p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                {data.totalQuestionSet}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500">
                Duration Per Slots (Minutes)
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                {data.duration || "—"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-zinc-500">Question Type</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">
              {data.questionType}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-zinc-500">Start date & time</p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                {formatIsoForDisplay(data.startTime)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500">End date & time</p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                {formatIsoForDisplay(data.endTime)}
              </p>
            </div>
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
        <Link
          href="/admin/tests/new/questions"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover"
        >
          Save & Continue
        </Link>
      </div>
    </div>
  );
}
