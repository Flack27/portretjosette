import Link from "next/link";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/config";

/** "Portret door Josette" wordmark used in the header (with kicker) and footer. */
export function Wordmark({
  className,
  kicker = true,
  size = "md",
}: {
  className?: string;
  kicker?: boolean;
  size?: "md" | "sm";
}) {
  return (
    <Link href="/" className={cn("inline-block", className)} aria-label={`${SITE.name} — home`}>
      <span
        className={cn(
          "block font-display font-semibold leading-none text-on-forest-heading",
          size === "md" ? "text-[24px]" : "text-[20px]",
        )}
      >
        {SITE.name}
      </span>
      {kicker && (
        <span className="mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.26em] text-on-forest-eyebrow">
          {SITE.kicker}
        </span>
      )}
    </Link>
  );
}
