import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { ProductEditor } from "@/components/admin-studio";
import { getAccess } from "@/lib/access";
import { categories } from "@/lib/data/catalog";
import { listProducts } from "@/lib/repository";

export const metadata = { title: "Edit product" };

export default function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  return (
    <Suspense fallback={<p className="text-muted">Loading the piece…</p>}>
      <Body params={params} />
    </Suspense>
  );
}

async function Body({ params }: { params: Promise<{ id: string }> }) {
  const access = await getAccess();
  if (access === "guest") redirect("/login?next=/admin");
  const { id } = await params;
  const catalog = await listProducts();
  const product = catalog.find((item) => item.id === id);
  if (!product) notFound();
  return <ProductEditor product={product} mode={access} categories={categories} catalog={catalog} />;
}
