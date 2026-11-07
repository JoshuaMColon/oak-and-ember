import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Request proxy. Session refresh and the /admin gate live in updateSession.
// Static files are excluded so images and the hero film don't pay for a
// Supabase round trip.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)"],
};
