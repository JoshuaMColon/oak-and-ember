import Link from "next/link";
import { categories } from "@/lib/data/catalog";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-serif text-2xl">Oak &amp; Ember</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
            Furniture from a small workshop: oak, linen, brass, and a little firelight. Pieces are made to order or sent from the floor when the stock count says so.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Collections</p>
          <ul className="mt-3 space-y-2 text-sm">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link className="hover:text-ember-deep" href={`/catalog/${category.slug}`}>
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Visit</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-ember-deep" href="/about">Our story</Link></li>
            <li><Link className="hover:text-ember-deep" href="/shipping">Shipping &amp; returns</Link></li>
            <li><Link className="hover:text-ember-deep" href="/credits">Image credits</Link></li>
            <li><Link className="hover:text-ember-deep" href="/demo">Try the demo</Link></li>
            <li><Link className="hover:text-ember-deep" href="/account">Account</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs text-muted sm:px-6">
          © 2026 Oak &amp; Ember. A portfolio shop. Payments run in Stripe test mode when keys are present.
        </p>
      </div>
    </footer>
  );
}
