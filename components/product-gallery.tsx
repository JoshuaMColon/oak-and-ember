"use client";

import { useState } from "react";
import { MediaImage } from "@/components/media-image";
import type { ProductImage } from "@/lib/types";

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [index, setIndex] = useState(0);
  const current = images[index] ?? images[0];
  if (!current) return null;

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-[#e7dfd3] dark:bg-[#2a241e]">
        <MediaImage
          src={current.src}
          alt={current.alt || name}
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
        />
      </div>
      {images.length > 1 ? (
        <div className="mt-3 flex gap-2">
          {images.map((image, imageIndex) => (
            <button
              key={image.id}
              type="button"
              title={`Show image ${imageIndex + 1}`}
              aria-label={`Show image ${imageIndex + 1} of ${name}`}
              aria-pressed={imageIndex === index}
              onClick={() => setIndex(imageIndex)}
              className={`relative h-20 w-16 overflow-hidden rounded-xl border ${imageIndex === index ? "border-ink" : "border-transparent"}`}
            >
              <MediaImage src={image.src} alt="" sizes="64px" />
            </button>
          ))}
        </div>
      ) : null}
      {current.credit ? (
        <p className="mt-2 text-xs text-muted">
          Photograph:{" "}
          <a className="underline" href={current.credit}>
            Unsplash
          </a>
        </p>
      ) : null}
    </div>
  );
}
