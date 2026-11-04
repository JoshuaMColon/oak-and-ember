import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabase } from "@/lib/supabase/server";

type ServerSupabase = NonNullable<Awaited<ReturnType<typeof createServerSupabase>>>;
type AuthUser = { id: string; user_metadata?: Record<string, unknown> | null };

// Oak & Ember shares a Supabase project with other apps, so there is no
// auth.users trigger. The customer profile is created on first signed-in visit.
async function loadProfile(supabase: ServerSupabase, user: AuthUser) {
  const { data: profile } = await supabase
    .from("oak_profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile) return profile;
  const fullName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";
  const { data: created } = await supabase
    .from("oak_profiles")
    .insert({ id: user.id, full_name: fullName })
    .select("full_name, role")
    .maybeSingle();
  return created;
}

export type Access = "admin" | "demo" | "guest";

export async function getAccess(): Promise<Access> {
  const cookieStore = await cookies();
  const demo = cookieStore.get("oak_demo")?.value === "1";
  if (!isSupabaseConfigured()) return demo ? "demo" : "guest";

  const supabase = await createServerSupabase();
  if (!supabase) return demo ? "demo" : "guest";
  const { data } = await supabase.auth.getUser();
  if (!data.user) return demo ? "demo" : "guest";
  const profile = await loadProfile(supabase, data.user);
  if (profile?.role === "admin") return "admin";
  return demo ? "demo" : "guest";
}

export async function getSessionUser() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const profile = await loadProfile(supabase, data.user);
  return {
    id: data.user.id,
    email: data.user.email ?? "",
    name: profile?.full_name || data.user.email || "Customer",
    role: profile?.role === "admin" ? "admin" : "customer",
  };
}
