import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ProductEditor } from "@/components/admin-studio";
import { getAccess } from "@/lib/access";
import { categories } from "@/lib/data/catalog";
import { listProducts } from "@/lib/repository";

export const metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <Suspense fallback={<p className="text-muted">Loading the form…</p>}>
      <Body />
    </Suspense>
  );
}

async function Body() {
  const access = await getAccess();
  if (access === "guest") redirect("/login?next=/admin/products/new");
  const catalog = await listProducts();
  return <ProductEditor product={null} mode={access} categories={categories} catalog={catalog} />;
}
