"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Portrait } from "@/lib/types";

/** Square gallery grid with an accessible lightbox (Esc / ← → / backdrop). */
export function Gallery({ portraits }: { portraits: Portrait[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;
  const count = portraits.length;

  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + count) % count)),
    [count],
  );
  const next = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % count)),
    [count],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, prev, next]);

  if (count === 0) {
    return (
      <p className="rounded-card border border-line-200 bg-card-50 px-6 py-12 text-center text-muted-500">
        Binnenkort meer werk in deze categorie.
      </p>
    );
  }

  const current = index !== null ? portraits[index] : null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-3.5">
        {portraits.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="group relative block aspect-square w-full overflow-hidden rounded-crisp shadow-print-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:ring-offset-2 focus-visible:ring-offset-paper-50"
              aria-label={`Bekijk ${p.title}`}
            >
              <Image
                src={p.image}
                alt={p.alt}
                fill
                sizes="(min-width: 768px) 22vw, 45vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </button>
          </li>
        ))}
      </ul>

      {open && current && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-forest-900/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          onClick={close}
        >
          <div className="flex items-center justify-between px-5 py-4 text-on-forest-cta">
            <span className="text-[13px] tabular-nums text-on-forest-body">
              {index! + 1} / {count}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Sluiten"
              className="p-1.5 hover:text-white"
            >
              <X size={26} strokeWidth={1.75} />
            </button>
          </div>

          <div
            className="relative flex flex-1 items-center justify-center px-4 pb-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={prev}
              aria-label="Vorige"
              className="absolute left-2 z-10 rounded-full p-2 text-on-forest-cta hover:bg-white/10 hover:text-white md:left-6"
            >
              <ChevronLeft size={34} strokeWidth={1.5} />
            </button>

            <figure className="flex max-h-full flex-col items-center">
              <div className="relative h-[72vh] w-[86vw] max-w-4xl">
                <Image
                  src={current.image}
                  alt={current.alt}
                  fill
                  sizes="86vw"
                  className="object-contain"
                  priority
                />
              </div>
              <figcaption className="mt-3 text-center text-on-forest-body">
                <span className="font-display text-[19px] text-on-forest-heading">
                  {current.title}
                </span>
                {current.medium && (
                  <span className="ml-2 text-[13px]">· {current.medium}</span>
                )}
              </figcaption>
            </figure>

            <button
              type="button"
              onClick={next}
              aria-label="Volgende"
              className="absolute right-2 z-10 rounded-full p-2 text-on-forest-cta hover:bg-white/10 hover:text-white md:right-6"
            >
              <ChevronRight size={34} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
