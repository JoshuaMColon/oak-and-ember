import Link from "next/link";

export const metadata = { title: "Our story" };

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-16">
      <p className="text-xs uppercase tracking-[0.18em] text-oak">Our story</p>
      <h1 className="mt-3 font-serif text-5xl">A room at the end of the day.</h1>
      <div className="mt-6 space-y-4 leading-7 text-muted">
        <p>
          Oak &amp; Ember is a furniture shop drawn from a sketch: a sofa you can fall sideways onto, a table that can take a glass, a lamp that makes 8 p.m. feel like a decision rather than an accident.
        </p>
        <p>
          Frames are kiln-dried oak or walnut. Upholstery is linen, cotton, leather, or boucle. Brass is left unlacquered so it records the hands that use it. Stock counts on each finish are real — when a variant says two left, the cart will not pretend otherwise.
        </p>
        <p>
          This storefront is also a portfolio piece. Without Supabase and Stripe keys it runs on a seeded catalog and a demo checkout. With those keys, the same pages talk to Postgres, auth, storage, and Stripe test mode.
        </p>
      </div>
      <Link href="/catalog" className="mt-8 inline-flex h-11 items-center rounded-full bg-ember-deep px-5 text-sm text-white">
        Shop the collection
      </Link>
    </article>
  );
}
