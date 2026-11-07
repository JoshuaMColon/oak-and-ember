import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/env";

// Anon key plus the caller's cookies, so RLS still applies. Null when
// the project isn't configured; callers fall back to the seed catalog
// instead of throwing during a keyless demo.
export async function createServerSupabase() {
  if (!isSupabaseConfigured()) return null;
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // A Server Component can't always write cookies; the response
          // may already be streaming. proxy.ts refreshes the session on
          // the next request, so dropping the write here is safe.
        }
      },
    },
  });
}

// Service role bypasses RLS. The Stripe webhook is the only caller:
// it has no user session, and customers are not granted insert on
// orders. persistSession is off so this client never touches cookies.
// The key is a server env var and is not prefixed NEXT_PUBLIC_.
export function createServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
