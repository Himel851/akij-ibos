import type { UserOwnAttemptRow } from "@/types/exam";
import Image from "next/image";
import Link from "next/link";

type Props = {
  attempts: UserOwnAttemptRow[];
  dbConfigured: boolean;
};

export function UserProfileAttemptsTable({ attempts, dbConfigured }: Props) {
  if (!dbConfigured) {
    return (
      <p className="text-sm text-zinc-600">
        Results history is unavailable because the database is not configured for this
        environment.
      </p>
    );
  }

  if (attempts.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-8 shadow-sm sm:p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <Image
            src="/images/no_data.png"
            alt=""
            width={120}
            height={120}
            className="mx-auto h-auto max-w-[min(100%,280px)] object-contain"
          />
          <h2 className="mt-6 text-lg font-bold text-zinc-900 sm:text-xl">
            No submissions yet
          </h2>
          <p className="mt-2 max-w-md text-sm text-zinc-500 sm:text-base">
            When you complete and submit a test, your attempts will appear here.
          </p>
          <Link
            href="/user"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover"
          >
            Browse tests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50/90">
            <th className="px-4 py-3 font-semibold text-zinc-800">Test</th>
            <th className="px-4 py-3 font-semibold text-zinc-800">Right</th>
            <th className="px-4 py-3 font-semibold text-zinc-800">Wrong</th>
            <th className="px-4 py-3 font-semibold text-zinc-800">Skip</th>
            <th className="px-4 py-3 font-semibold text-zinc-800">Marks</th>
            <th className="px-4 py-3 font-semibold text-zinc-800">%</th>
            <th className="px-4 py-3 font-semibold text-zinc-800">Submitted</th>
          </tr>
        </thead>
        <tbody>
          {attempts.map((r) => (
            <tr
              key={r.id}
              className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50/60"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/user/exam/${r.examId}`}
                  className="font-medium text-primary hover:text-primary-hover hover:underline"
                >
                  {r.examTitle}
                </Link>
              </td>
              <td className="px-4 py-3 tabular-nums text-zinc-700">{r.correctCount}</td>
              <td className="px-4 py-3 tabular-nums text-zinc-700">{r.wrongCount}</td>
              <td className="px-4 py-3 tabular-nums text-zinc-700">{r.skippedCount}</td>
              <td className="px-4 py-3 tabular-nums text-zinc-700">
                {r.totalPoints !== null && r.maxPoints !== null
                  ? `${Number(r.totalPoints.toFixed(2))} / ${Number(r.maxPoints.toFixed(2))}`
                  : "—"}
              </td>
              <td className="px-4 py-3 text-zinc-700">
                {r.scorePercent !== null ? `${r.scorePercent}%` : "—"}
              </td>
              <td className="px-4 py-3 text-zinc-600 tabular-nums">
                {new Date(r.submittedAt).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
