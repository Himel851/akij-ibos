"use client";

import {
  AlignLeft,
  Bold,
  Italic,
  Redo2,
  Undo2,
} from "lucide-react";
import { useRef } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
};

function wrapSelection(
  value: string,
  start: number,
  end: number,
  wrap: string,
): string {
  const selected = value.slice(start, end);
  return value.slice(0, start) + wrap + selected + wrap + value.slice(end);
}

export function RichTextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
  className = "",
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function applyWrap(wrap: string) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = wrapSelection(value, start, end, wrap);
    onChange(next);
    const pos = start + wrap.length + (end - start) + wrap.length;
    queueMicrotask(() => {
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  }

  return (
    <div className={`overflow-hidden rounded-lg border border-zinc-200 ${className}`}>
      <div className="flex flex-wrap items-center gap-1 border-b border-zinc-200 bg-zinc-50 px-2 py-1.5">
        <button
          type="button"
          className="rounded p-1.5 text-zinc-600 hover:bg-zinc-200"
          aria-label="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="rounded p-1.5 text-zinc-600 hover:bg-zinc-200"
          aria-label="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </button>
        <span className="mx-1 h-4 w-px bg-zinc-300" aria-hidden />
        <select
          className="max-w-[120px] rounded border-0 bg-transparent text-xs text-zinc-700"
          defaultValue="normal"
          aria-label="Text style"
        >
          <option value="normal">Normal text</option>
        </select>
        <button
          type="button"
          className="rounded p-1.5 text-zinc-600 hover:bg-zinc-200"
          aria-label="Align"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="rounded p-1.5 font-bold text-zinc-700 hover:bg-zinc-200"
          aria-label="Bold"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyWrap("**")}
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="rounded p-1.5 italic text-zinc-700 hover:bg-zinc-200"
          aria-label="Italic"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyWrap("*")}
        >
          <Italic className="h-4 w-4" />
        </button>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y border-0 px-3 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-0"
      />
    </div>
  );
}
