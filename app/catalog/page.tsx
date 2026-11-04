import { Suspense } from "react";
import { CatalogView } from "@/components/catalog-view";

export const metadata = { title: "Shop" };

export default function CatalogPage({ searchParams }: PageProps<"/catalog">) {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-muted">Loading the collection…</p>}>
      <CatalogView pathname="/catalog" searchParams={searchParams} />
    </Suspense>
  );
}
