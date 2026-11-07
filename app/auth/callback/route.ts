import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// Supabase sends the browser here with a one-time code after email
// confirmation. I exchange it for a session cookie on the server.
// next has to be a same-origin path. Rejecting "//" blocks a
// protocol-relative redirect to another host.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/account";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  if (code) {
    const supabase = await createServerSupabase();
    if (supabase) await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL(safeNext, url.origin));
}
