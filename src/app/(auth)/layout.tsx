import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-10">
      <Logo />
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
