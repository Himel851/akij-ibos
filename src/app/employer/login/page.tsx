import { SignInCard } from "@/components/auth/sign-in-card";

export default function EmployerLoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-16">
      <SignInCard subtitle="Employer access" />
    </div>
  );
}
