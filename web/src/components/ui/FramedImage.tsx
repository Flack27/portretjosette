import Image from "next/image";
import { cn } from "@/lib/utils";

/** Portrait "print": crisp image with an elevated shadow and an offset frame
 *  line sitting behind it (design hero + over-mij photo). */
export function FramedImage({
  src,
  alt,
  ratio = 0.83,
  frameOffset = 14,
  priority = false,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  ratio?: number;
  frameOffset?: number;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-crisp border border-[#cfc9b8]"
        style={{ inset: -frameOffset }}
      />
      <div
        className="relative overflow-hidden rounded-crisp bg-paper-100 shadow-frame"
        style={{ aspectRatio: ratio }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes ?? "(min-width: 768px) 45vw, 100vw"}
          className="object-cover"
        />
      </div>
    </div>
  );
}
