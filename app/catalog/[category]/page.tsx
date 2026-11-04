import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/catalog-view";
import { categories } from "@/lib/data/catalog";
import { CATEGORY_SLUGS, type CategorySlug } from "@/lib/types";

export function generateStaticParams() {
  return CATEGORY_SLUGS.map((category) => ({ category }));
}

export async function generateMetadata({ params }: PageProps<"/catalog/[category]">) {
  const { category } = await params;
  const found = categories.find((item) => item.slug === category);
  return { title: found?.name ?? "Collection" };
}

export default function CategoryPage({ params, searchParams }: PageProps<"/catalog/[category]">) {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-muted">Loading the collection…</p>}>
      <CategoryBody params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function CategoryBody({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { category } = await params;
  if (!CATEGORY_SLUGS.includes(category as CategorySlug)) notFound();
  return (
    <CatalogView
      pathname={`/catalog/${category}`}
      searchParams={searchParams}
      category={category}
    />
  );
}
