import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// POST so a cross-site link or image can't log someone out. 303 lands
// on GET / after the session cookies are cleared.
export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  if (supabase) await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
