import { Register } from "@/components/auth/register";

export default function UserRegisterPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-16">
      <Register subtitle="Sign up for user access" />
    </div>
  );
}
