import { Suspense } from "react";
import { AdminOverview } from "@/components/admin-studio";
import { getAccess } from "@/lib/access";
import { listOrdersForAdmin, listProducts } from "@/lib/repository";
import { redirect } from "next/navigation";

export const metadata = { title: "Studio overview" };

export default function AdminHome() {
  return (
    <Suspense fallback={<p className="text-muted">Loading overview…</p>}>
      <Body />
    </Suspense>
  );
}

async function Body() {
  const access = await getAccess();
  if (access === "guest") redirect("/login?next=/admin");
  const [products, orders] = await Promise.all([listProducts(), listOrdersForAdmin()]);
  return <AdminOverview products={products} orders={orders} mode={access} />;
}
