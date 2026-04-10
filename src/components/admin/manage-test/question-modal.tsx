"use client";

import type {
  DraftOption,
  DraftQuestionPayload,
} from "./question-modal-types";
import { RichTextArea } from "@/components/admin/manage-test/rich-text-area";
import type { QuestionType } from "@/types/question";
import { Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";
import { toast } from "react-toastify";

export type { DraftOption, DraftQuestionPayload } from "./question-modal-types";

type Props = {
  open: boolean;
  questionNumber: number;
  resetKey: number;
  /** When set, form opens with this data (edit mode). */
  initialDraft?: DraftQuestionPayload | null;
  isEditing?: boolean;
  onClose: () => void;
  onSave: (payload: DraftQuestionPayload) => void;
  onSaveAndAddMore: (payload: DraftQuestionPayload) => void;
};

let optionIdCounter = 0;
function nextOptionId() {
  optionIdCounter += 1;
  return `opt-${optionIdCounter}`;
}

function letterAt(index: number) {
  return String.fromCharCode(65 + index);
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "radio", label: "MCQ" },
  { value: "checkbox", label: "Checkbox" },
  { value: "text", label: "Text" },
];

function OptionRow({
  letter,
  opt,
  type,
  radioName,
  onText,
  onCorrect,
  onRemove,
}: {
  letter: string;
  opt: DraftOption;
  type: QuestionType;
  radioName: string;
  onText: (text: string) => void;
  onCorrect: (checked: boolean) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white text-sm font-semibold text-zinc-700">
            {letter}
          </span>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
            {type === "radio" ? (
              <input
                type="radio"
                name={radioName}
                checked={opt.isCorrect}
                onChange={() => onCorrect(true)}
                className="border-zinc-400 text-primary focus:ring-primary cursor-pointer"
              />
            ) : (
              <input
                type="checkbox"
                checked={opt.isCorrect}
                onChange={(e) => onCorrect(e.target.checked)}
                className="rounded border-zinc-400 text-primary focus:ring-primary cursor-pointer"
              />
            )}
            Set as correct answer
          </label>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1.5 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 cursor-pointer"
          aria-label={`Remove option ${letter}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <RichTextArea
        value={opt.text}
        onChange={onText}
        placeholder={`Option ${letter} text`}
        rows={3}
      />
    </div>
  );
}

function TextAnswerRow({
  value,
  onChange,
  onClear,
}: {
  value: string;
  onChange: (text: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white text-sm font-semibold text-zinc-700">
          A
        </span>
        <button
          type="button"
          onClick={onClear}
          className="rounded p-1.5 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 cursor-pointer"
          aria-label="Clear answer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <RichTextArea
        value={value}
        onChange={onChange}
        placeholder="Expected answer (optional)…"
        rows={5}
      />
    </div>
  );
}

function draftFingerprint(d: DraftQuestionPayload | null | undefined): string {
  if (!d) return "";
  return JSON.stringify({
    p: d.prompt,
    s: d.score,
    t: d.type,
    o: d.options.map((x) => `${x.id}:${x.text}:${x.isCorrect}`),
  });
}

export function QuestionModal({
  open,
  questionNumber,
  resetKey,
  initialDraft = null,
  isEditing = false,
  onClose,
  onSave,
  onSaveAndAddMore,
}: Props) {
  const titleId = useId();
  const radioGroupName = useId();
  const [score, setScore] = useState(1);
  const [type, setType] = useState<QuestionType>("radio");
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState<DraftOption[]>(() => [
    { id: nextOptionId(), text: "", isCorrect: false },
    { id: nextOptionId(), text: "", isCorrect: false },
    { id: nextOptionId(), text: "", isCorrect: false },
  ]);

  const reset = useCallback(() => {
    setScore(1);
    setType("radio");
    setPrompt("");
    setOptions([
      { id: nextOptionId(), text: "", isCorrect: false },
      { id: nextOptionId(), text: "", isCorrect: false },
      { id: nextOptionId(), text: "", isCorrect: false },
    ]);
  }, []);

  const initialKey = draftFingerprint(initialDraft);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      if (initialDraft && initialKey) {
        setScore(initialDraft.score);
        setType(initialDraft.type);
        setPrompt(initialDraft.prompt);
        const opts = initialDraft.options;
        if (initialDraft.type === "text") {
          const o0 = opts[0];
          setOptions([
            o0
              ? { ...o0, isCorrect: true }
              : { id: nextOptionId(), text: "", isCorrect: true },
          ]);
        } else {
          setOptions(
            opts.length > 0
              ? opts.map((o) => ({ ...o }))
              : [
                  { id: nextOptionId(), text: "", isCorrect: false },
                  { id: nextOptionId(), text: "", isCorrect: false },
                ],
          );
        }
      } else {
        reset();
      }
    });
  }, [open, resetKey, initialKey, initialDraft, reset]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function buildPayload(): DraftQuestionPayload {
    if (type === "text") {
      const row = options[0];
      const text = (row?.text ?? "").trim();
      const opts =
        text === ""
          ? []
          : [
              {
                id: row?.id ?? nextOptionId(),
                text,
                isCorrect: true,
              },
            ];
      return {
        score,
        type: "text",
        prompt: prompt.trim(),
        options: opts,
      };
    }
    const nonEmpty = options
      .map((o) => ({ ...o, text: o.text.trim() }))
      .filter((o) => o.text !== "");
    return {
      score,
      type,
      prompt: prompt.trim(),
      options: nonEmpty,
    };
  }

  function handleTypeChange(next: QuestionType) {
    if (next === type) return;
    if (next === "text") {
      setType("text");
      setOptions((prev) => {
        const first = prev[0] ?? {
          id: nextOptionId(),
          text: "",
          isCorrect: false,
        };
        return [{ ...first, isCorrect: true }];
      });
      return;
    }
    setType(next);
    setOptions((prev) => {
      const carry = prev[0]?.text ?? "";
      const firstCorrect = next === "radio" && carry.trim() !== "";
      return [
        {
          id: nextOptionId(),
          text: carry,
          isCorrect: firstCorrect,
        },
        { id: nextOptionId(), text: "", isCorrect: false },
        { id: nextOptionId(), text: "", isCorrect: false },
      ];
    });
  }

  function validateForSave(): boolean {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      toast.error("Please enter the question");
      return false;
    }
    if (type === "text") return true;
    const nonEmptyCount = options.filter((o) => o.text.trim() !== "").length;
    if (nonEmptyCount < 2) {
      toast.error("Add at least 2 options with text");
      return false;
    }
    return true;
  }

  function handleSaveClick() {
    if (!validateForSave()) return;
    onSave(buildPayload());
  }

  function handleSaveAndAddMoreClick() {
    if (!validateForSave()) return;
    onSaveAndAddMore(buildPayload());
  }

  function handleCorrectChange(optionId: string, checked: boolean) {
    setOptions((prev) => {
      if (type === "radio") {
        return prev.map((o) =>
          o.id === optionId ? { ...o, isCorrect: true } : { ...o, isCorrect: false },
        );
      }
      return prev.map((o) =>
        o.id === optionId ? { ...o, isCorrect: checked } : o,
      );
    });
  }

  function updateOptionText(id: string, text: string) {
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, text } : o)),
    );
  }

  function addOption() {
    setOptions((prev) => [
      ...prev,
      { id: nextOptionId(), text: "", isCorrect: false },
    ]);
  }

  function removeOption(id: string) {
    setOptions((prev) =>
      prev.length <= 2 ? prev : prev.filter((o) => o.id !== id),
    );
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {questionNumber}
            </span>
            <h2 id={titleId} className="text-base font-semibold text-zinc-900">
              {isEditing ? "Edit question" : `Question ${questionNumber}`}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-zinc-600">
              Score:
              <input
                type="number"
                min={0}
                value={score}
                onChange={(e) => setScore(Number(e.target.value) || 0)}
                className="w-14 rounded-md border border-zinc-300 px-2 py-1 text-center text-sm font-medium text-zinc-900"
              />
            </label>
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <RichTextArea
            value={prompt}
            onChange={setPrompt}
            placeholder="Enter your question…"
            rows={5}
          />

          {type === "text" ? (
            <div className="mt-6">
              <TextAnswerRow
                value={options[0]?.text ?? ""}
                onChange={(text) => {
                  const row = options[0];
                  if (!row) {
                    setOptions([{ id: nextOptionId(), text, isCorrect: true }]);
                    return;
                  }
                  updateOptionText(row.id, text);
                }}
                onClear={() => {
                  const row = options[0];
                  if (row) updateOptionText(row.id, "");
                }}
              />
            </div>
          ) : (
            <>
              <div className="mt-6 space-y-4">
                {options.map((opt, idx) => (
                  <OptionRow
                    key={opt.id}
                    letter={letterAt(idx)}
                    opt={opt}
                    type={type}
                    radioName={radioGroupName}
                    onText={(text) => updateOptionText(opt.id, text)}
                    onCorrect={(checked) => handleCorrectChange(opt.id, checked)}
                    onRemove={() => removeOption(opt.id)}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={addOption}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Another options
              </button>
            </>
          )}
        </div>

        <div className="flex flex-col-reverse justify-end gap-3 border-t border-zinc-200 px-5 py-4 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
            className="rounded-lg border border-primary bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 cursor-pointer"
          >
            {isEditing ? "Save changes" : "Save"}
          </button>
          {!isEditing ? (
            <button
              type="button"
              onClick={handleSaveAndAddMoreClick}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover cursor-pointer"
            >
              Save & Add More
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
