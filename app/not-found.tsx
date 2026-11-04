import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">404</p>
      <h1 className="mt-3 font-serif text-4xl">That piece is not on the floor.</h1>
      <p className="mt-3 text-muted">The link may be old, or the piece was never made.</p>
      <Link href="/catalog" className="mt-6 inline-flex h-11 items-center rounded-full bg-ember-deep px-5 text-sm text-white">
        Back to the shop
      </Link>
    </div>
  );
}
