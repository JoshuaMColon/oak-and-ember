import Link from "next/link";
import { Suspense } from "react";
import { Hero } from "@/components/hero";
import { MediaImage } from "@/components/media-image";
import { ProductCard } from "@/components/product-card";
import { categories } from "@/lib/data/catalog";
import { listProducts } from "@/lib/repository";

export default function HomePage() {
  return (
    <>
      <Hero />
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Collections</p>
            <h2 className="mt-2 font-serif text-4xl">Rooms, by the piece</h2>
          </div>
          <Link href="/catalog" className="hidden text-sm underline-offset-4 hover:underline sm:inline">
            Shop all
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/catalog/${category.slug}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#e7dfd3] sm:aspect-[5/4]"
            >
              <MediaImage
                src={category.image}
                alt=""
                sizes="(min-width: 768px) 30vw, 50vw"
                className="transition duration-500 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 p-4 text-[#f7f1e8]">
                <h3 className="font-serif text-2xl">{category.name}</h3>
                <p className="mt-1 hidden text-sm text-white/80 sm:block">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Best sellers</p>
        <h2 className="mt-2 font-serif text-4xl">What leaves the floor first</h2>
        <Suspense fallback={<p className="mt-8 text-muted">Loading the floor…</p>}>
          <BestSellers />
        </Suspense>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2">
          <div className="relative aspect-[5/4] overflow-hidden rounded-3xl bg-[#e7dfd3]">
            <MediaImage
              src="https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1600&q=80"
              alt="A quiet living room with a sofa, wood floor, and warm light"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-oak">The workshop</p>
            <h2 className="mt-3 font-serif text-4xl leading-tight">Oak first. Then the light.</h2>
            <p className="mt-4 text-base leading-7 text-muted">
              Oak &amp; Ember started as a sketch of a room at the end of the day: a sofa low enough to live on, a lamp that does not shout, a table that can take a glass without a coaster lecture. We still build to that sketch.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-flex h-11 items-center rounded-full border border-line px-5 text-sm transition hover:bg-background active:scale-[0.98]"
            >
              Read the story
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

async function BestSellers() {
  const products = await listProducts();
  const picks = products.filter((product) => product.bestseller).slice(0, 4);
  return (
    <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {picks.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
