import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/env";

// Publishable anon key only. Sign-in and reads that RLS allows. This
// client cannot become admin, and the service role key never reaches it.
export function createBrowserSupabase() {
  if (!isSupabaseConfigured()) return null;
  return createBrowserClient(supabaseUrl(), supabaseAnonKey());
}
