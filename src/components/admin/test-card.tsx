import { Clock, FileText, Users } from "lucide-react";
import Link from "next/link";

export type TestCardProps = {
  title: string;
  candidatesLabel: string;
  questionSetLabel: string;
  examSlotsLabel: string;
  examId: string;
};

function StatCell({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-gray-600">
      <Icon
        className="h-5 w-5 shrink-0 text-gray-400"
        strokeWidth={1.75}
        aria-hidden
      />
      <p className="min-w-0 text-sm leading-snug">
        <span className="text-gray-500">{label}: </span>
        <span className="font-semibold text-slate-900">{value}</span>
      </p>
    </div>
  );
}

export function TestCard({
  title,
  candidatesLabel,
  questionSetLabel,
  examSlotsLabel,
  examId,
}: TestCardProps) {
  return (
    <article className="flex flex-col rounded-3xl border border-gray-200 bg-white py-8 px-6 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold leading-snug text-slate-800">
        {title}
      </h2>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-4">
        <StatCell
          icon={Users}
          label="Candidates"
          value={candidatesLabel}
        />
        <StatCell
          icon={FileText}
          label="Question Set"
          value={questionSetLabel}
        />
        <StatCell
          icon={Clock}
          label="Exam Slots"
          value={examSlotsLabel}
        />  
      </div>

      <div>
        <Link
          href={`/admin/tests/${examId}/users`}
          className="inline-flex rounded-full border border-primary bg-white px-6 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
        >
          View Candidates
        </Link>
      </div>
    </article>
  );
}
