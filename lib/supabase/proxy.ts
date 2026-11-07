import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/env";

// Runs from proxy.ts on page requests. Two jobs: refresh the Supabase
// session cookies, and keep /admin from rendering for a signed-out
// visitor who is not in the demo.
// This is not the admin role check. A signed-in customer still reaches
// the layout, which calls getAccess() and sends them to log in. Role
// lives on oak.profiles, and I don't want a profile query on every request.
export async function updateSession(request: NextRequest) {
  const demo = request.cookies.get("oak_demo")?.value === "1";
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");

  if (!isSupabaseConfigured()) {
    if (isAdminPath && !demo) {
      return redirectToLogin(request);
    }
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // The refreshed tokens have to be visible to the rest of this
        // request and sent back to the browser. Writing only one side
        // drops the session on the next navigation.
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const user = data.user;

  // oak_demo lets the studio UI open. It is not a privilege: server
  // actions still require role = 'admin' before they touch Postgres.
  if (isAdminPath && !demo && !user) {
    const redirect = redirectToLogin(request);
    response.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie);
    });
    return redirect;
  }

  return response;
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}
