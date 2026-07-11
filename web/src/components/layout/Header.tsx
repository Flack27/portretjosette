"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/config";
import { cn } from "@/lib/utils";
import { Wordmark } from "./Wordmark";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the sheet whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  // Lock body scroll + close on Escape while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="bg-forest-900 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 pt-[30px] pb-3.5 md:px-12 md:py-5">
        <Wordmark />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex" aria-label="Hoofdnavigatie">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "border-b-2 pb-1 text-[14px] transition-colors",
                  active
                    ? "border-sage-400 font-bold text-white"
                    : "border-transparent font-medium text-nav-dim hover:text-white",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile trigger */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Menu openen"
          aria-expanded={open}
          className="-mr-1 p-1 text-[#e6e8d8] md:hidden"
        >
          <Menu size={26} strokeWidth={1.75} />
        </button>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-forest-900 md:hidden" role="dialog" aria-modal="true">
          <div className="flex items-center justify-between px-5 pt-[30px] pb-3.5">
            <Wordmark />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Menu sluiten"
              className="-mr-1 p-1 text-[#e6e8d8]"
            >
              <X size={26} strokeWidth={1.75} />
            </button>
          </div>
          <nav className="mt-6 flex flex-col gap-1 px-5" aria-label="Mobiele navigatie">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "border-b border-white/10 py-4 font-display text-[26px] leading-none transition-colors",
                    active ? "text-white" : "text-nav-dim hover:text-white",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
