import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { catalogHref, facetValues, normalizeQuery, queryCatalog } from "@/lib/catalog-query";
import { categories } from "@/lib/data/catalog";
import { getCatalog, listProducts } from "@/lib/repository";
import type { CatalogQuery } from "@/lib/types";

export async function CatalogView({
  pathname,
  searchParams,
  category,
}: {
  pathname: string;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  category?: string;
}) {
  const raw = await searchParams;
  const query = normalizeQuery(raw, { category });
  const all = await listProducts();
  const facets = facetValues(category ? all.filter((product) => product.category === category) : all);
  const result = query.q && (await usesSearch(query))
    ? await getCatalog(query)
    : { ...queryCatalog(all, query), source: "local" as const };
  const title = category
    ? categories.find((item) => item.slug === category)?.name ?? "Collection"
    : "The collection";
  const intro = category
    ? categories.find((item) => item.slug === category)?.description
    : "Sofas, chairs, tables, beds, storage, and lighting from the workshop.";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">Catalog</p>
      <h1 className="mt-2 font-serif text-4xl sm:text-5xl">{title}</h1>
      <p className="mt-3 max-w-xl text-muted">{intro}</p>

      <form id="search" action={pathname} className="mt-8 flex flex-col gap-3 sm:flex-row" role="search">
        <label className="sr-only" htmlFor="catalog-q">Search</label>
        <input
          id="catalog-q"
          name="q"
          defaultValue={query.q ?? ""}
          placeholder="Search oak, linen, lamps…"
          className="h-12 flex-1 rounded-full border border-line bg-surface px-5"
        />
        {query.material ? <input type="hidden" name="material" value={query.material} /> : null}
        {query.color ? <input type="hidden" name="color" value={query.color} /> : null}
        {query.min != null ? <input type="hidden" name="min" value={query.min} /> : null}
        {query.max != null ? <input type="hidden" name="max" value={query.max} /> : null}
        {query.sort !== "featured" ? <input type="hidden" name="sort" value={query.sort} /> : null}
        <button
          type="submit"
          className="h-12 rounded-full bg-ember-deep px-6 text-sm font-medium text-white transition hover:bg-[#722f10] active:scale-[0.98] dark:bg-ember dark:text-[#1a120c]"
        >
          Search
        </button>
      </form>

      <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_1fr]">
        <details className="rounded-3xl border border-line bg-surface px-5 py-4 lg:hidden">
          <summary className="cursor-pointer list-none font-serif text-xl [&::-webkit-details-marker]:hidden">
            Filters
          </summary>
          <div className="pt-4">
            <FilterPanel pathname={pathname} query={query} facets={facets} activeCategory={category} bare />
          </div>
        </details>
        <div className="hidden lg:block">
          <FilterPanel pathname={pathname} query={query} facets={facets} activeCategory={category} />
        </div>
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              {result.total} {result.total === 1 ? "piece" : "pieces"}
              {result.source === "supabase" ? " · full-text search" : ""}
            </p>
            <SortForm pathname={pathname} query={query} />
          </div>
          {result.items.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-line p-10 text-center">
              <p className="font-serif text-2xl">Nothing matches.</p>
              <p className="mt-2 text-sm text-muted">Try a broader word, or clear the filters.</p>
              <Link href={pathname} className="mt-4 inline-flex text-sm underline">
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {result.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          <Pagination pathname={pathname} query={query} page={result.page} pageCount={result.pageCount} />
        </div>
      </div>
    </div>
  );
}

async function usesSearch(query: CatalogQuery) {
  const { isSupabaseConfigured } = await import("@/lib/env");
  return isSupabaseConfigured() && Boolean(query.q);
}

function FilterPanel({
  pathname,
  query,
  facets,
  activeCategory,
  bare = false,
}: {
  pathname: string;
  query: CatalogQuery;
  facets: ReturnType<typeof facetValues>;
  activeCategory?: string;
  bare?: boolean;
}) {
  return (
    <aside className={bare ? "" : "h-fit rounded-3xl border border-line bg-surface p-5"}>
      <div className="flex items-center justify-between">
        {bare ? <span className="sr-only">Filters</span> : <h2 className="font-serif text-xl">Filters</h2>}
        <Link href={activeCategory ? `/catalog/${activeCategory}` : "/catalog"} className="ml-auto text-xs underline">
          Reset
        </Link>
      </div>
      <div className="mt-5">
        <p className="text-xs uppercase tracking-[0.16em] text-muted">Category</p>
        <ul className="mt-2 space-y-1 text-sm">
          <li>
            <Link className={chip(!activeCategory)} href={catalogHref("/catalog", { ...query, category: undefined }, { page: 1 })}>
              All
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                className={chip(activeCategory === category.slug)}
                href={catalogHref(`/catalog/${category.slug}`, { ...query, category: category.slug }, { page: 1 })}
                aria-current={activeCategory === category.slug ? "page" : undefined}
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <form action={pathname} className="mt-6 space-y-4">
        {query.q ? <input type="hidden" name="q" value={query.q} /> : null}
        {query.sort !== "featured" ? <input type="hidden" name="sort" value={query.sort} /> : null}
        <fieldset>
          <legend className="text-xs uppercase tracking-[0.16em] text-muted">Price</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="text-xs text-muted">
              Min
              <input name="min" inputMode="numeric" defaultValue={query.min ?? ""} className="mt-1 h-10 w-full rounded-xl border border-line bg-background px-3" />
            </label>
            <label className="text-xs text-muted">
              Max
              <input name="max" inputMode="numeric" defaultValue={query.max ?? ""} className="mt-1 h-10 w-full rounded-xl border border-line bg-background px-3" />
            </label>
          </div>
        </fieldset>
        <label className="block text-xs uppercase tracking-[0.16em] text-muted">
          Material
          <select name="material" defaultValue={query.material ?? ""} className="mt-2 h-10 w-full rounded-xl border border-line bg-background px-3 text-sm normal-case tracking-normal text-ink">
            <option value="">Any</option>
            {facets.materials.map((material) => (
              <option key={material}>{material}</option>
            ))}
          </select>
        </label>
        <label className="block text-xs uppercase tracking-[0.16em] text-muted">
          Color
          <select name="color" defaultValue={query.color ?? ""} className="mt-2 h-10 w-full rounded-xl border border-line bg-background px-3 text-sm normal-case tracking-normal text-ink">
            <option value="">Any</option>
            {facets.colors.map((color) => (
              <option key={color}>{color}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="h-10 w-full rounded-full border border-line text-sm transition hover:bg-background active:scale-[0.98]">
          Apply filters
        </button>
      </form>
    </aside>
  );
}

function SortForm({ pathname, query }: { pathname: string; query: CatalogQuery }) {
  return (
    <form action={pathname} className="flex items-center gap-2">
      {query.q ? <input type="hidden" name="q" value={query.q} /> : null}
      {query.material ? <input type="hidden" name="material" value={query.material} /> : null}
      {query.color ? <input type="hidden" name="color" value={query.color} /> : null}
      {query.min != null ? <input type="hidden" name="min" value={query.min} /> : null}
      {query.max != null ? <input type="hidden" name="max" value={query.max} /> : null}
      <label htmlFor="sort" className="text-sm text-muted">Sort</label>
      <select
        id="sort"
        name="sort"
        defaultValue={query.sort}
        className="h-10 rounded-full border border-line bg-surface px-3 text-sm"
      >
        <option value="featured">Featured</option>
        <option value="newest">Newest</option>
        <option value="price-asc">Price, low to high</option>
        <option value="price-desc">Price, high to low</option>
        <option value="rating">Rating</option>
      </select>
      <button type="submit" title="Apply sort" className="h-10 rounded-full border border-line px-3 text-sm hover:bg-surface active:scale-95">
        Go
      </button>
    </form>
  );
}

function Pagination({
  pathname,
  query,
  page,
  pageCount,
}: {
  pathname: string;
  query: CatalogQuery;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;
  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 ? (
        <Link className="rounded-full border border-line px-4 py-2 text-sm hover:bg-surface" href={catalogHref(pathname, query, { page: page - 1 })}>
          Previous
        </Link>
      ) : null}
      <p className="px-2 text-sm text-muted">
        Page {page} of {pageCount}
      </p>
      {page < pageCount ? (
        <Link className="rounded-full border border-line px-4 py-2 text-sm hover:bg-surface" href={catalogHref(pathname, query, { page: page + 1 })}>
          Next
        </Link>
      ) : null}
    </nav>
  );
}

function chip(active: boolean) {
  return active
    ? "block rounded-full bg-ink px-3 py-1.5 text-background"
    : "block rounded-full px-3 py-1.5 hover:bg-background";
}
