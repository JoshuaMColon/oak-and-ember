import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AdminOrders } from "@/components/admin-studio";
import { getAccess } from "@/lib/access";
import { listOrdersForAdmin } from "@/lib/repository";

export const metadata = { title: "Orders" };

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<p className="text-muted">Loading orders…</p>}>
      <Body />
    </Suspense>
  );
}

async function Body() {
  const access = await getAccess();
  if (access === "guest") redirect("/login?next=/admin/orders");
  const orders = await listOrdersForAdmin();
  return <AdminOrders orders={orders} mode={access} />;
}
