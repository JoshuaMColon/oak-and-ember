import { Suspense } from "react";
import { LoginForm } from "@/components/auth-forms";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata = { title: "Log in" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-muted">Loading…</p>}>
      <LoginBody searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginBody({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/account";
  return <LoginForm next={next} configured={isSupabaseConfigured()} />;
}
