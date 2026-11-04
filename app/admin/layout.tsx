import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { getAccess } from "@/lib/access";

async function exitDemo() {
  "use server";
  const jar = await cookies();
  jar.delete("oak_demo");
  redirect("/");
}

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-muted">Opening the studio…</p>}>
      <AdminFrame>{children}</AdminFrame>
    </Suspense>
  );
}

async function AdminFrame({ children }: { children: ReactNode }) {
  const access = await getAccess();
  if (access === "guest") redirect("/login?next=/admin");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {access === "demo" ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#8d3c16] px-4 py-3 text-sm text-white">
          <p>Demo sandbox. Changes stay in this browser and are not published to the shop.</p>
          <form action={exitDemo}>
            <button type="submit" className="rounded-full bg-white/15 px-3 py-1 hover:bg-white/25" title="Leave the demo">
              Leave demo
            </button>
          </form>
        </div>
      ) : null}
      <nav className="mb-8 flex gap-2 overflow-x-auto" aria-label="Studio">
        {[
          ["/admin", "Overview"],
          ["/admin/products", "Products"],
          ["/admin/orders", "Orders"],
        ].map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="shrink-0 rounded-full border border-line px-4 py-2 text-sm hover:bg-surface"
          >
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
