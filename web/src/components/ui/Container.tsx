import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Centered content column: max-w-6xl (~1180px), px-5 → px-12. */
export function Container({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  return (
    <Tag className={cn("mx-auto w-full max-w-6xl px-5 md:px-12", className)}>
      {children}
    </Tag>
  );
}
