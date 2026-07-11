import type { PriceRow } from "@/lib/types";
import { cn } from "@/lib/utils";

/** A priced list card with a coloured header bar (Portretten / Klein werk). */
export function PriceCard({
  title,
  tag,
  headerClassName,
  rows,
}: {
  title: string;
  tag: string;
  headerClassName: string;
  rows: PriceRow[];
}) {
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
        {rows.map((row, i) => (
          <div
            key={row.id}
            className={cn(
              "flex items-baseline justify-between gap-4 py-3.5",
              i > 0 && "border-t border-line-300",
            )}
          >
            <div className="min-w-0">
              <p className="text-[15.5px] text-ink-700">{row.label}</p>
              {row.sublabel && (
                <p className="mt-0.5 text-[12px] text-muted-500">{row.sublabel}</p>
              )}
            </div>
            <span className="whitespace-nowrap font-display text-[22px] leading-none text-forest-900">
              {row.price}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
