import Image from "next/image";

export function MediaImage({
  src,
  alt,
  sizes,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (src.startsWith("data:") || src.startsWith("blob:") || src.startsWith("/")) {
    return (
      // Local posters and demo uploads are not passed through the optimizer.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={`h-full w-full object-cover ${className}`} />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
    />
  );
}
