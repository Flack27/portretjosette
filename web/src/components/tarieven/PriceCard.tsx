import type { ReactNode } from "react";
import type { PriceRow } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * A priced list card with a coloured header bar (Portretten / Klein werk).
 *
 * With `columns` the prices become a matrix: one row per subject and a price
 * column per format (A4 / A3), which keeps a long list short and lets the two
 * formats be compared at a glance. Without it, each row shows a single price.
 *
 * `footer` adds a tinted strip under the list for a caveat that belongs to this
 * card only (e.g. the framing surcharge on the "excl. lijst" portraits).
 */
export function PriceCard({
  title,
  tag,
  headerClassName,
  columns,
  rows,
  footer,
}: {
  title: string;
  tag: string;
  headerClassName: string;
  columns?: [string, string];
  rows: PriceRow[];
  footer?: ReactNode;
}) {
  // Fixed-width right-aligned cells keep the two format columns lined up; the
  // narrower base size leaves the longest label ("Persoon + dier") on one line
  // on a 360px phone.
  const priceCol = "w-[74px] text-right sm:w-[86px]";
  const priceGap = "gap-3 sm:gap-4";

  return (
    <div className="overflow-hidden rounded-card border border-line-200 bg-card-50">
      <div
        className={cn(
          "flex items-center justify-between px-5 py-3.5 text-[#eef0e5]",
          headerClassName,
        )}
      >
        <span className="font-display text-[22px] leading-none">{title}</span>
        <span className="text-[12px] uppercase tracking-[0.16em] text-[#a9b490]">
          {tag}
        </span>
      </div>

      <div className="px-5">
        {columns && (
          <div
            className={cn(
              "flex items-baseline justify-end border-b border-line-300 pb-2 pt-3",
              priceGap,
            )}
          >
            {columns.map((c) => (
              <span
                key={c}
                className={cn(
                  "text-[11px] uppercase tracking-[0.16em] text-muted-500",
                  priceCol,
                )}
              >
                {c}
              </span>
            ))}
          </div>
        )}

        {rows.map((row, i) => (
          <div
            key={row.id}
            className={cn(
              "flex items-baseline justify-between",
              // A matrix has more rows, so it breathes a little tighter.
              columns ? cn("py-2", priceGap) : "gap-4 py-3",
              i > 0 && "border-t border-line-300",
            )}
          >
            <div className="min-w-0">
              <p className="text-[15.5px] text-ink-700">{row.label}</p>
              {row.sublabel && (
                <p className="mt-0.5 text-[12px] text-muted-500">{row.sublabel}</p>
              )}
            </div>
            <div className={cn("flex items-baseline", priceGap)}>
              <Price value={row.price} className={columns && priceCol} />
              {columns && <Price value={row.priceAlt} className={priceCol} />}
            </div>
          </div>
        ))}
      </div>

      {footer && (
        <div className="mt-1 border-t border-line-300 bg-paper-100 px-5 py-3">
          {footer}
        </div>
      )}
    </div>
  );
}

/** One price cell; an empty value means "not offered in this format". */
function Price({ value, className }: { value?: string; className?: string | false }) {
  return (
    <span
      className={cn(
        "whitespace-nowrap font-display text-[22px] leading-none",
        value ? "text-forest-900" : "text-muted-400",
        className,
      )}
    >
      {value || "–"}
    </span>
  );
}
