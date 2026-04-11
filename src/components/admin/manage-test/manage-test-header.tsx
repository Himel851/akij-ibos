import Link from "next/link";
import { Check } from "lucide-react";

type TwoStepVariant = {
  variant: "two-step";
  /** 1 = Basic Info active, 2 = second step active (unused in our flow, always 1 for form+review) */
  activeStep: 1 | 2;
};

type CompleteVariant = {
  variant: "complete";
};

type Props = {
  title?: string;
  /** Defaults to /admin */
  backHref?: string;
  backLabel?: string;
} & (TwoStepVariant | CompleteVariant);

export function ManageTestHeader(props: Props) {
  const title = props.title ?? "Manage Online Test";
  const backHref = props.backHref ?? "/admin";
  const backLabel = props.backLabel ?? "Back to Dashboard";

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold text-zinc-900 sm:text-xl">{title}</h1>
          {props.variant === "two-step" ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={
                    props.activeStep === 1
                      ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
                      : "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-semibold text-zinc-500"
                  }
                >
                  1
                </span>
                <span
                  className={
                    props.activeStep === 1
                      ? "text-sm font-semibold text-primary"
                      : "text-sm font-medium text-zinc-500"
                  }
                >
                  Basic Info
                </span>
              </div>
              <div className="hidden h-px w-10 bg-zinc-300 sm:block" aria-hidden />
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-semibold text-zinc-500">
                  2
                </span>
                <span className="text-sm font-medium text-zinc-500">Questions</span>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                </span>
                <span className="text-sm font-semibold text-primary">Basic Info</span>
              </div>
              <div className="hidden h-px w-10 bg-zinc-300 sm:block" aria-hidden />
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                </span>
                <span className="text-sm font-semibold text-primary">Questions Sets</span>
              </div>
            </div>
          )}
        </div>
        <Link
          href={backHref}
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50"
        >
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
