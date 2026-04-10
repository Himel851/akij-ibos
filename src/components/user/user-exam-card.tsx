import type { UserExamListItem } from "@/types/exam";
import { CircleX, Clock, FileText } from "lucide-react";
import Link from "next/link";

type Props = {
  exam: UserExamListItem;
};

function StatLine({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
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

export function UserExamCard({ exam }: Props) {
  const durationLabel =
    exam.durationMinutes > 0 ? `${exam.durationMinutes} min` : "—";

  return (
    <article className="flex flex-col rounded-3xl border border-gray-200 bg-white py-8 px-6 shadow-sm">
      <h2 className="mb-6 text-xl font-bold leading-snug text-slate-800 sm:text-2xl">
        {exam.title}
      </h2>

      <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-0">
        <StatLine icon={Clock} label="Duration" value={durationLabel} />
        <StatLine
          icon={FileText}
          label="Question"
          value={String(exam.questionCount)}
        />
        <StatLine
          icon={CircleX}
          label="Negative Marks"
          value={exam.negativeMarkingLabel}
        />
      </div>

      <div>
        <Link
          href={`/user/exam/${exam.id}`}
          className="inline-flex rounded-full border border-primary bg-white px-6 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
        >
          Start
        </Link>
      </div>
    </article>
  );
}
