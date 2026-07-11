import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "primaryInverse" | "secondaryInverse";

const base =
  "inline-flex items-center justify-center gap-2 rounded-crisp px-[26px] py-3.5 text-[14.5px] leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:ring-offset-2";

const variants: Record<Variant, string> = {
  // On light (paper) surfaces
  primary:
    "bg-forest-900 font-bold text-[#f2f0e6] hover:bg-forest-600 focus-visible:ring-offset-paper-50",
  secondary:
    "border border-forest-900 font-semibold text-forest-900 hover:bg-forest-900 hover:text-[#f2f0e6] focus-visible:ring-offset-paper-50",
  // On dark (forest) surfaces the primary inverts
  primaryInverse:
    "bg-paper-50 font-bold text-forest-900 hover:bg-white focus-visible:ring-offset-forest-900",
  secondaryInverse:
    "border border-white/60 font-semibold text-white hover:bg-white/10 focus-visible:ring-offset-forest-900",
};

type BaseProps = {
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = BaseProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof BaseProps> & { href?: undefined };

type ButtonAsLink = BaseProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, keyof BaseProps> & { href: string };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", className, children, ...rest } = props;
  const classes = cn(base, variants[variant], className);

  if ("href" in rest && rest.href !== undefined) {
    return (
      <Link className={classes} {...(rest as ButtonAsLink)}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...(rest as ButtonAsButton)}>
      {children}
    </button>
  );
}
