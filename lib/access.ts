import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabase } from "@/lib/supabase/server";

export type Access = "admin" | "demo" | "guest";

export async function getAccess(): Promise<Access> {
  const cookieStore = await cookies();
  const demo = cookieStore.get("oak_demo")?.value === "1";
  if (!isSupabaseConfigured()) return demo ? "demo" : "guest";

  const supabase = await createServerSupabase();
  if (!supabase) return demo ? "demo" : "guest";
  const { data } = await supabase.auth.getUser();
  if (!data.user) return demo ? "demo" : "guest";
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  if (profile?.role === "admin") return "admin";
  return demo ? "demo" : "guest";
}

export async function getSessionUser() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", data.user.id)
    .maybeSingle();
  return {
    id: data.user.id,
    email: data.user.email ?? "",
    name: profile?.full_name || data.user.email || "Customer",
    role: profile?.role === "admin" ? "admin" : "customer",
  };
}
