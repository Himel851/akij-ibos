import { Login } from "@/components/auth/login";

export default function UserLoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-16">
      <Login panel="user" subtitle="User access" />
    </div>
  );
}
