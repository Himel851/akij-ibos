import Image from "next/image";

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto shrink-0 bg-[#0b1220] text-white">
      <div className="mx-auto flex max-w-container flex-col gap-6 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-zinc-400">Powered by</span>
          <Image
            src="/images/logo.png"
            alt=""
            width={140}
            height={36}
            className="h-7 w-auto object-contain object-left brightness-0 invert"
          />
        </div>
        <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:gap-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-zinc-400">Helpline</span>
            <PhoneIcon className="shrink-0 text-white" />
            <a
              href="tel:+88011020202505"
              className="font-medium text-white underline-offset-2 hover:underline"
            >
              +88 011020202505
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <MailIcon className="shrink-0 text-white" />
            <a
              href="mailto:support@akij.work"
              className="font-medium text-white underline-offset-2 hover:underline"
            >
              support@akij.work
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
