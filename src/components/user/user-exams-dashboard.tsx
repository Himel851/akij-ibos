"use client";

import { UserExamCard } from "@/components/user/user-exam-card";
import type { UserExamListItem } from "@/types/exam";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

type Props = {
  exams: UserExamListItem[];
};

export function UserExamsDashboard({ exams }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return exams;
    return exams.filter((e) => e.title.toLowerCase().includes(q));
  }, [exams, query]);

  return (
    <div className="mx-auto w-full max-w-container flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Online Tests
        </h1>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end lg:max-w-xl lg:flex-1 lg:pl-8">
          <div className="flex w-full items-center gap-2 sm:max-w-xl">
            <input
              type="search"
              name="exam-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by exam title"
              aria-label="Search by exam title"
              className="min-w-0 flex-1 rounded-full border border-primary/25 bg-white py-2.5 pl-4 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none ring-primary/15 focus:border-primary focus:ring-2"
            />
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:bg-primary-hover"
              aria-label="Search"
            >
              <Search className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
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
            <p className="mt-2 max-w-md text-sm text-zinc-500 sm:text-base">
              {exams.length === 0
                ? "Currently, there are no tests available. Please check back later for updates."
                : "No tests match your search. Try a different title."}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {filtered.map((exam) => (
            <UserExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      )}

      {exams.length > 0 ? (
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
            <label htmlFor="user-per-page" className="whitespace-nowrap">
              Online Test Per Page
            </label>
            <select
              id="user-per-page"
              name="user-per-page"
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
