"use client";

import { useEffect, useRef, useState } from "react";
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
  const sheetRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close the sheet whenever the route changes — including a back/forward step,
  // which no link handler would catch. Adjusting state during render is the
  // sanctioned way to react to a changed input; an effect here would schedule a
  // second render pass and leave the open sheet painted over the new page.
  const [openedAt, setOpenedAt] = useState(pathname);
  if (openedAt !== pathname) {
    setOpenedAt(pathname);
    setOpen(false);
  }

  // While the sheet is open it owns the screen: body scroll is locked, Escape
  // closes it, and Tab cycles inside it instead of wandering into the page
  // behind. Closing hands focus back to the button that opened it.
  useEffect(() => {
    if (!open) return;
    const sheet = sheetRef.current;
    const opener = triggerRef.current;

    const focusable = () =>
      Array.from(
        sheet?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? [],
      );

    focusable()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
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
  }, [open]);

  return (
    <header className="focus-on-dark bg-forest-900 text-white">
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
                  "focus-ring border-b-2 pb-1 text-[14px] transition-colors duration-200",
                  active
                    ? "border-sage-400 font-bold text-white"
                    : "border-transparent font-medium text-nav-dim hover:border-sage-400/50 hover:text-white",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile trigger */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Menu openen"
          aria-expanded={open}
          className="focus-ring -mr-1 p-1 text-[#e6e8d8] transition-opacity active:opacity-70 md:hidden"
        >
          <Menu size={26} strokeWidth={1.75} />
        </button>
      </div>

      {/* Mobile sheet. The surface itself is opaque from the first frame — fading
          a full-screen panel in would show the page ghosting through it — and the
          links lay in behind it, so the menu reads as opening, not dissolving. */}
      {open && (
        <div
          ref={sheetRef}
          className="fixed inset-0 z-50 flex flex-col bg-forest-900 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="flex items-center justify-between px-5 pt-[30px] pb-3.5">
            <Wordmark />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Menu sluiten"
              className="focus-ring -mr-1 p-1 text-[#e6e8d8] transition-opacity active:opacity-70"
            >
              <X size={26} strokeWidth={1.75} />
            </button>
          </div>
          <nav className="mt-6 flex flex-col gap-1 px-5" aria-label="Mobiele navigatie">
            {NAV_LINKS.map((link, i) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  style={{ "--lay-delay": `${30 + i * 35}ms` } as React.CSSProperties}
                  className={cn(
                    "lay-in focus-ring border-b border-white/10 py-4 font-display text-[26px] leading-none transition-colors",
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
