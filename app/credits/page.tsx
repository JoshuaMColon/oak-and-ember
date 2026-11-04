import { HERO_VIDEO, products } from "@/lib/data/catalog";

export const metadata = { title: "Credits" };

export default function CreditsPage() {
  const images = products.flatMap((product) =>
    product.images.map((image) => ({
      product: product.name,
      alt: image.alt,
      credit: image.credit,
    })),
  );

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-5xl">Credits</h1>
      <p className="mt-4 leading-7 text-muted">
        Product photographs are served from Unsplash under the Unsplash License. The homepage film is free to use under the Pexels License. Attribution is not required by either license; it is listed here anyway.
      </p>
      <h2 className="mt-10 font-serif text-2xl">Film</h2>
      <p className="mt-2">
        <a className="underline" href={HERO_VIDEO.source}>{HERO_VIDEO.title}</a> by {HERO_VIDEO.author} on Pexels.{" "}
        <a className="underline" href={HERO_VIDEO.license}>License</a>
      </p>
      <h2 className="mt-10 font-serif text-2xl">Photographs</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {images.map((image) => (
          <li key={`${image.product}-${image.credit}`}>
            {image.product} — {image.alt}.{" "}
            <a className="underline" href={image.credit}>Source</a>
          </li>
        ))}
      </ul>
    </article>
  );
}
