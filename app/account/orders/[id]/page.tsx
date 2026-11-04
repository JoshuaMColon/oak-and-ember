import { Suspense } from "react";
import { OrderDetail } from "@/components/order-detail";
import { getSessionUser } from "@/lib/access";
import { listOrdersForUser } from "@/lib/repository";

export const metadata = { title: "Order" };

export default function OrderPage({ params }: PageProps<"/account/orders/[id]">) {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-muted">Loading the order…</p>}>
      <OrderBody params={params} />
    </Suspense>
  );
}

async function OrderBody({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  const orders = user ? await listOrdersForUser(user.id) : [];
  const serverOrder = orders.find((order) => order.id === id) ?? null;
  return <OrderDetail orderId={id} serverOrder={serverOrder} />;
}
