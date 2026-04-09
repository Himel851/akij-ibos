"use client";

type SignInCardProps = {
  /** Shown under the main title for context (e.g. employer vs candidate). */
  subtitle?: string;
};

export function SignInCard({ subtitle }: SignInCardProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Mock auth — wire to real flow later
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
      <h1 className="text-center text-2xl font-semibold tracking-tight text-zinc-900">
        Sign In
      </h1>
      {subtitle ? (
        <p className="mt-1 text-center text-sm text-zinc-500">{subtitle}</p>
      ) : null}
      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-zinc-800"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Your primary email address"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none ring-violet-600/20 focus:border-violet-600 focus:ring-2"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-zinc-800"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none ring-violet-600/20 focus:border-violet-600 focus:ring-2"
          />
        </div>
        <div className="flex justify-end">
          <a
            href="#"
            className="text-sm text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
          >
            Forget Password?
          </a>
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-violet-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
