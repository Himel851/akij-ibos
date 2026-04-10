import type { ExamQuestion } from "@/types/question";
import { Check } from "lucide-react";

function typeLabel(type: ExamQuestion["type"]): string {
  if (type === "radio") return "MCQ";
  if (type === "checkbox") return "Checkbox";
  return "Text";
}

function letterAt(index: number) {
  return String.fromCharCode(65 + index);
}

type Props = {
  question: ExamQuestion;
  index: number;
  onEdit: () => void;
  onRemove: () => void;
  disabled?: boolean;
};

export function QuestionPreviewCard({
  question,
  index,
  onEdit,
  onRemove,
  disabled = false,
}: Props) {
  const { prompt, score, type, options } = question;
  const opts = options.filter((o) => o.text.trim() !== "");
  const ptLabel = score === 1 ? "1 pt" : `${score} pts`;

  return (
    <li className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3 sm:px-5">
        <span className="text-sm font-bold text-zinc-900">
          Question {index + 1}
        </span>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
            {typeLabel(type)}
          </span>
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
            {ptLabel}
          </span>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-5">
        <p className="whitespace-pre-wrap text-sm font-semibold text-zinc-900">
          {prompt?.trim() ? prompt : "—"}
        </p>

        {type === "text" ? (
          <p className="mt-4 text-sm leading-relaxed text-zinc-600">
            {opts[0]?.text?.trim()
              ? opts[0].text
              : "Candidates will enter a free-text answer."}
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {opts.map((opt, i) => (
              <li
                key={opt.id}
                className={`flex items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2.5 text-sm ${
                  opt.isCorrect ? "bg-zinc-100" : "bg-white"
                }`}
              >
                <span className="min-w-0 text-zinc-800">
                  <span className="font-semibold text-zinc-500">
                    {letterAt(i)}.
                  </span>{" "}
                  <span className="whitespace-pre-wrap">{opt.text}</span>
                </span>
                {opt.isCorrect ? (
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"
                    aria-label="Correct answer"
                  >
                    <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={onEdit}
          disabled={disabled}
          className="text-sm font-semibold text-primary hover:text-primary-hover disabled:opacity-50 cursor-pointer"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50 cursor-pointer"
        >
          Remove From Exam
        </button>
      </div>
    </li>
  );
}
