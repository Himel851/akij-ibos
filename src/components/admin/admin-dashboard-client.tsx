"use client";

import { ConfirmDialog } from "@/components/admin/manage-test/confirm-dialog";
import { TestCard } from "@/components/admin/test-card";
import type { ExamSummary } from "@/types/exam";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

export function AdminDashboardClient({ tests }: { tests: ExamSummary[] }) {
  const [query, setQuery] = useState("");
  const [examList, setExamList] = useState(tests);
  const [deleteTarget, setDeleteTarget] = useState<ExamSummary | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  useEffect(() => {
    setExamList(tests);
  }, [tests]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return examList;
    return examList.filter((t) => t.title.toLowerCase().includes(q));
  }, [examList, query]);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeletePending(true);
    try {
      const res = await fetch(`/api/exams/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? "Delete failed");
      }
      setExamList((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success("Test deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete test");
    } finally {
      setDeletePending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-container flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Online Tests
        </h1>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end lg:flex-1 lg:pl-8">
          <div className="relative w-full max-w-xl flex-1">
            <input
              type="search"
              name="exam-search"
              placeholder="Search by exam title"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search by exam title"
              className="w-full rounded-lg border border-primary/25 bg-white py-2.5 pl-4 pr-11 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none ring-primary/15 focus:border-primary focus:ring-2"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-primary">
              <Search className="h-5 w-5" aria-hidden />
            </span>
          </div>
          <Link
            href="/admin/tests/new?fresh=1"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover"
          >
            Create Online Test
          </Link>
        </div>
      </div>

      {examList.length === 0 ? (
        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Image
              src="/images/no_data.png"
              alt=""
              width={120}
              height={120}
              className="mx-auto h-auto max-w-[min(100%,280px)] object-contain"
            />
            <h2 className="mt-6 text-lg font-bold text-zinc-900 sm:text-xl">
              No Online Test Available
            </h2>
            <p className="mt-2  text-sm text-zinc-500 sm:text-base">
              Currently, there are no online tests available. Please check back
              later for updates.
            </p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm text-zinc-600">
          No exams match &quot;{query.trim()}&quot;.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {filtered.map((t) => (
            <TestCard
              key={t.id}
              examId={t.id}
              title={t.title}
              candidatesLabel={t.candidatesLabel}
              questionSetLabel={t.questionSetLabel}
              examSlotsLabel={t.examSlotsLabel}
              onDeleteClick={() => setDeleteTarget(t)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this test?"
        description={
          deleteTarget
            ? `Are you sure you want to delete “${deleteTarget.title}”? This cannot be undone.`
            : ""
        }
        confirmLabel="Yes"
        cancelLabel="No"
        loading={deletePending}
        onCancel={() => !deletePending && setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
      />

      {examList.length > 0 ? (
        <div className="mt-10 flex flex-col gap-4 border-t border-zinc-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded-md p-2 text-zinc-400 hover:bg-zinc-200/80 hover:text-zinc-700"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="flex h-9 min-w-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground">
              1
            </span>
            <button
              type="button"
              className="rounded-md p-2 text-zinc-400 hover:bg-zinc-200/80 hover:text-zinc-700"
              aria-label="Next page"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-600">
            <label htmlFor="per-page" className="whitespace-nowrap">
              Online Test Per Page
            </label>
            <select
              id="per-page"
              name="per-page"
              defaultValue="8"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="8">8</option>
              <option value="16">16</option>
              <option value="24">24</option>
            </select>
          </div>
        </div>
      ) : null}
    </div>
  );
}
