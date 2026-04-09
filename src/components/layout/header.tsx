import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="shrink-0 border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 max-w-container items-center px-4 sm:px-6 lg:px-8">
        <div className="flex w-32 shrink-0 items-center sm:w-40">
          <Link
            href="/"
            className="flex items-center"
            aria-label="Akij Resource home"
          >
            <Image
              src="/images/logo.png"
              alt="Akij Resource"
              width={160}
              height={40}
              className="h-9 w-auto max-w-38 object-contain object-left sm:max-w-none"
              priority
            />
          </Link>
        </div>
        <p className="flex-1 text-center text-base font-medium text-zinc-700 sm:text-lg">
          Akij Resource
        </p>
        <div className="w-32 shrink-0 sm:w-40" aria-hidden />
      </div>
    </header>
  );
}
