import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Online Assessment Platform
        </h1>
        <p className="mt-2 text-muted-foreground text-zinc-600">
          Choose a panel to continue.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Link
          href="/employer/login"
          className="rounded-lg border border-zinc-300 bg-white px-6 py-3 text-center font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
        >
          Employer login
        </Link>
        <Link
          href="/candidate/login"
          className="rounded-lg border border-zinc-300 bg-white px-6 py-3 text-center font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
        >
          Candidate login
        </Link>
      </div>
      <p className="text-sm text-zinc-500">
        New candidate?{" "}
        <Link href="/candidate/register" className="font-medium underline">
          Register
        </Link>
      </p>
    </div>
  );
}
