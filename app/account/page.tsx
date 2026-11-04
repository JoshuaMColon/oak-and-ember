import { Suspense } from "react";
import { AccountPanel } from "@/components/account-panel";
import { getSessionUser } from "@/lib/access";
import { isSupabaseConfigured } from "@/lib/env";
import { listOrdersForUser } from "@/lib/repository";

export const metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-muted">Loading your account…</p>}>
      <AccountBody />
    </Suspense>
  );
}

async function AccountBody() {
  const user = await getSessionUser();
  const orders = user ? await listOrdersForUser(user.id) : [];
  return (
    <AccountPanel
      user={user ? { name: user.name, email: user.email } : null}
      orders={orders}
      supabase={isSupabaseConfigured()}
    />
  );
}
