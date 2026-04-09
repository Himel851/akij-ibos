import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export function AdminNavbar() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 max-w-container items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Link href="/admin" className="flex shrink-0 items-center">
          <Image
            src="/images/logo.png"
            alt="Akij Resource"
            width={160}
            height={40}
            className="h-8 w-auto max-w-32 object-contain object-left sm:h-9 sm:max-w-none"
            priority
          />
        </Link>
        <nav className="flex min-w-0 flex-1 justify-center">
          <Link
            href="/admin"
            className="truncate text-sm font-semibold text-primary hover:text-primary-hover"
          >
            Dashboard
          </Link>
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-zinc-900">Arif Hossain</p>
            <p className="text-xs text-zinc-500">Ref. ID - 16101121</p>
          </div>
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-muted text-sm font-semibold text-primary-muted-foreground"
            aria-hidden
          >
            AH
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
            aria-label="Account menu"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
