"use client";

import { ManageTestHeader } from "@/components/admin/manage-test/manage-test-header";
import { loadBasicInfo } from "@/lib/manage-test-storage";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function QuestionsStep() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loadBasicInfo()) {
      router.replace("/admin/tests/new");
      return;
    }
    setReady(true);
  }, [router]);

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
          className="w-full rounded-lg bg-primary px-5 py-4 text-center text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary-hover"
        >
          Add Question
        </button>
      </div>
    </div>
  );
}
