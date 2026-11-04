import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = { title: "Try the demo" };

async function enterDemo() {
  "use server";
  const jar = await cookies();
  jar.set("oak_demo", "1", {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 14,
  });
  redirect("/admin");
}

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">Guest demo</p>
      <h1 className="mt-3 font-serif text-5xl">Walk the studio without an account.</h1>
      <p className="mt-4 leading-7 text-muted">
        The demo opens the admin dashboard as a sandbox. You can edit products, stock, and order status in this browser. Nothing is written to a database, and the public shop keeps the seeded catalog. When a real admin signs in with Supabase, the same screens save for everyone.
      </p>
      <form action={enterDemo} className="mt-8">
        <button
          type="submit"
          className="h-12 rounded-full bg-ember-deep px-6 text-sm font-medium text-white transition hover:bg-[#722f10] active:scale-[0.98]"
        >
          Enter the demo
        </button>
      </form>
      <p className="mt-6 text-sm">
        <Link href="/catalog" className="underline">Or keep shopping as a guest</Link>
      </p>
    </div>
  );
}
