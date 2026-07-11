import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Uppercase wide-tracked label. Default colour is muted; pass a text-* class
 *  (e.g. text-on-forest-eyebrow) to flip it on the forest hero. */
export function Eyebrow({
  children,
  className,
  as: Tag = "p",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  return <Tag className={cn("eyebrow text-muted-400", className)}>{children}</Tag>;
}
