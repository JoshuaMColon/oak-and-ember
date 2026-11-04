import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AdminProducts } from "@/components/admin-studio";
import { getAccess } from "@/lib/access";
import { listProducts } from "@/lib/repository";

export const metadata = { title: "Products" };

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<p className="text-muted">Loading products…</p>}>
      <Body />
    </Suspense>
  );
}

async function Body() {
  const access = await getAccess();
  if (access === "guest") redirect("/login?next=/admin/products");
  const products = await listProducts();
  return <AdminProducts products={products} mode={access} />;
}
