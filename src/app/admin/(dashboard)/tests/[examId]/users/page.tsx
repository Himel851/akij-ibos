import { listExamAdminTableRowsPersisted } from "@/lib/exam-candidates-persistence";
import { getExamDetailPersisted } from "@/lib/exams-persistence";
import { buildMockExamAdminTableRowsForExam } from "@/lib/mock-exam-candidates";
import { hasSupabaseServiceConfig } from "@/lib/supabase/service-role";
import type { ExamAdminTableRow, ExamCandidateStatus } from "@/types/exam-candidate";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{ examId: string }>;
};

function statusLabel(s: ExamCandidateStatus): string {
  switch (s) {
    case "completed":
      return "Completed";
    case "in_progress":
      return "In progress";
    default:
      return "Not started";
  }
}

function statusPillClass(s: ExamCandidateStatus): string {
  switch (s) {
    case "completed":
      return "bg-emerald-50 text-emerald-800 ring-emerald-600/15";
    case "in_progress":
      return "bg-amber-50 text-amber-900 ring-amber-600/20";
    default:
      return "bg-zinc-100 text-zinc-700 ring-zinc-500/10";
  }
}

export default async function ExamCandidatesPage({ params }: PageProps) {
  const { examId } = await params;
  const exam = await getExamDetailPersisted(examId);
  if (!exam) notFound();

  const useDatabase = hasSupabaseServiceConfig();
  let rows: ExamAdminTableRow[] = [];
  let showingSample = false;

  if (useDatabase) {
    rows = await listExamAdminTableRowsPersisted(examId);
  } else {
    rows = buildMockExamAdminTableRowsForExam(exam.id, exam.totalUsers);
    showingSample = exam.totalUsers > rows.length;
  }

  return (
    <div className="mx-auto w-full max-w-container flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to Online Tests
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
              Candidates
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              <span className="font-semibold text-zinc-800">{exam.title}</span>
              {exam.totalUsers > 0 ? (
                <>
                  {" "}
                  · Expected enrollment:{" "}
                  <span className="font-medium text-zinc-800">
                    {exam.totalUsers.toLocaleString("en-US")}
                  </span>
                </>
              ) : null}
              {useDatabase && rows.length > 0 ? (
                <>
                  {" "}
                  · In database:{" "}
                  <span className="font-medium text-zinc-800">{rows.length}</span>
                </>
              ) : null}
            </p>
            {showingSample ? (
              <p className="mt-2 text-xs text-zinc-500">
                Showing a sample of {rows.length} demo rows (Supabase not
                configured).
              </p>
            ) : null}
          </div>
          <Link
            href={`/admin/tests/${examId}/questions`}
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover"
          >
            Show Questions
          </Link>
        </div>

        {rows.length === 0 ? (
          <div className="mt-8 rounded-xl border border-zinc-200 bg-zinc-50/50 p-8 shadow-sm sm:p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Image
                src="/images/no_data.png"
                alt=""
                width={120}
                height={120}
                className="mx-auto h-auto max-w-[min(100%,280px)] object-contain"
              />
              <h2 className="mt-6 text-lg font-bold text-zinc-900 sm:text-xl">
                No Candidates Yet
              </h2>
              <p className="mt-2 max-w-md text-sm text-zinc-500 sm:text-base">
                There are no candidates listed for this test right now. When people
                enroll or take the exam, they will appear in this table.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200">
            <table className="w-full min-w-[960px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/90">
                  <th className="px-4 py-3 font-semibold text-zinc-800">
                    Name
                  </th>
                  <th className="px-4 py-3 font-semibold text-zinc-800">
                    Email
                  </th>
                  <th className="px-4 py-3 font-semibold text-zinc-800">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold text-zinc-800">
                    Right
                  </th>
                  <th className="px-4 py-3 font-semibold text-zinc-800">
                    Wrong
                  </th>
                  <th className="px-4 py-3 font-semibold text-zinc-800">
                    Skip
                  </th>
                  <th className="px-4 py-3 font-semibold text-zinc-800">
                    Marks
                  </th>
                  <th className="px-4 py-3 font-semibold text-zinc-800">
                    %
                  </th>
                  <th className="px-4 py-3 font-semibold text-zinc-800">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50/60"
                  >
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {r.name}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{r.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusPillClass(r.status)}`}
                      >
                        {statusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-zinc-700">
                      {r.correctCount !== null ? r.correctCount : "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-zinc-700">
                      {r.wrongCount !== null ? r.wrongCount : "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-zinc-700">
                      {r.skippedCount !== null ? r.skippedCount : "—"}
                    </td>
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
        )}
      </div>
    </div>
  );
}
