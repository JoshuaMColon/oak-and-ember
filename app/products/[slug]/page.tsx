import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { ProductPurchase } from "@/components/product-purchase";
import { ReviewList } from "@/components/review-list";
import { products } from "@/lib/data/catalog";
import { getProduct, getRelated } from "@/lib/repository";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
  return {
    title: product?.name ?? "Piece",
    description: product?.description,
  };
}

export default function ProductPage({ params }: PageProps<"/products/[slug]">) {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-muted">Loading the piece…</p>}>
      <ProductBody params={params} />
    </Suspense>
  );
}

async function ProductBody({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const related = await getRelated(product);

  return (
    <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/catalog" className="hover:underline">Shop</Link>
        <span aria-hidden="true"> / </span>
        <Link href={`/catalog/${product.category}`} className="capitalize hover:underline">{product.category}</Link>
      </nav>
      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />
        <ProductPurchase product={product} />
      </div>
      <section className="mt-12 max-w-3xl">
        <h2 className="font-serif text-3xl">Details</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-muted">
          {product.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      </section>
      <ReviewList productId={product.id} reviews={product.reviews} />
      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-serif text-3xl">In the same room</h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
