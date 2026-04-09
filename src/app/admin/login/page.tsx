import { Login } from "@/components/auth/login";

export default function AdminLoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-16">
      <Login panel="admin" subtitle="Admin access" />
    </div>
  );
}
