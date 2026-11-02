import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Underlined semibold link with a trailing arrow (design "text link"). */
export function TextLink({
  href,
  children,
  className,
  tone = "dark",
  arrow = true,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  tone?: "dark" | "light";
  arrow?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group focus-ring inline-flex items-center gap-1.5 border-b pb-0.5 font-semibold transition-colors",
        tone === "dark"
          ? "border-forest-900/70 text-forest-900 hover:border-forest-600 hover:text-forest-600"
          : "focus-on-dark border-white/50 text-on-forest-cta hover:border-white",
        className,
      )}
    >
      {children}
      {arrow && (
        <span
          aria-hidden
          className="transition-transform duration-200 ease-settle group-hover:translate-x-1 group-focus-visible:translate-x-1"
        >
          →
        </span>
      )}
    </Link>
  );
}
