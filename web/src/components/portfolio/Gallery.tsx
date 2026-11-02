"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Portrait } from "@/lib/types";

/** Square gallery grid with an accessible lightbox (Esc / ← → / backdrop). */
export function Gallery({ portraits }: { portraits: Portrait[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;
  const count = portraits.length;
  const dialogRef = useRef<HTMLDivElement>(null);
  // The tile that opened the lightbox, so focus can go back where it came from.
  const openerRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + count) % count)),
    [count],
  );
  const next = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % count)),
    [count],
  );

  // While the lightbox is open it owns the screen: the page behind cannot
  // scroll, Escape and the arrow keys drive it, Tab stays inside it, and
  // closing returns focus to the thumbnail that opened it.
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const opener = openerRef.current;

    const focusable = () =>
      Array.from(dialog?.querySelectorAll<HTMLElement>("button:not([disabled])") ?? []);

    focusable()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return close();
      if (e.key === "ArrowLeft") return prev();
      if (e.key === "ArrowRight") return next();
      if (e.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      opener?.focus();
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
          <li
            key={p.id}
            className="lay-reveal"
            // Stagger by column, so a row of prints lays down left to right.
            style={{ "--lay-i": i % 4 } as React.CSSProperties}
          >
            <button
              type="button"
              onClick={(e) => {
                openerRef.current = e.currentTarget;
                setIndex(i);
              }}
              className="group focus-ring relative block aspect-square w-full overflow-hidden rounded-crisp shadow-print-soft transition-transform duration-200 ease-settle active:scale-[0.98]"
              aria-label={`Bekijk ${p.title}`}
            >
              <Image
                src={p.image}
                alt={p.alt}
                fill
                sizes="(min-width: 768px) 22vw, 45vw"
                className="object-cover transition-transform duration-500 ease-settle group-hover:scale-[1.04] group-focus-visible:scale-[1.04]"
              />
            </button>
          </li>
        ))}
      </ul>

      {open && current && (
        <div
          ref={dialogRef}
          className="lay-in focus-on-dark fixed inset-0 z-50 flex flex-col bg-forest-900/95 backdrop-blur-sm [--lay-rise:0px]"
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
              className="focus-ring -mr-1.5 p-2.5 transition-colors hover:text-white"
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
              className="focus-ring absolute left-2 z-10 rounded-full p-3 text-on-forest-cta transition-[background-color,color,transform] duration-200 ease-settle hover:bg-white/10 hover:text-white active:scale-90 md:left-6"
            >
              <ChevronLeft size={34} strokeWidth={1.5} />
            </button>

            {/* Keyed on the portrait so stepping through the gallery replays the
                entrance: each print lays down in turn instead of swapping. */}
            <figure key={current.id} className="lay-in flex max-h-full flex-col items-center [--lay-rise:10px]">
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
              className="focus-ring absolute right-2 z-10 rounded-full p-3 text-on-forest-cta transition-[background-color,color,transform] duration-200 ease-settle hover:bg-white/10 hover:text-white active:scale-90 md:right-6"
            >
              <ChevronRight size={34} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
