/**
 * Site-wide constants. Values that Josette should be able to change live in the
 * PocketBase `settings` collection (see lib/content.ts); the constants here are
 * brand/identity facts that only change with a code deploy.
 */
export const SITE = {
  name: "Portret door Josette",
  kicker: "Realistische portrettekeningen",
  artist: "Josette Spapens",
  description:
    "Josette Spapens tekent realistische portretten van mensen en huisdieren met pastelkrijt — met oog voor de juiste blik, emotie en karakter. Portret in opdracht vanuit Hilvarenbeek.",
  email: "info@portretdoorjosette.nl",
  locality: "Hilvarenbeek",
  region: "Noord-Brabant",
  country: "NL",
  countryName: "Nederland",
  locale: "nl_NL",
  /** Canonical origin, no trailing slash. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://portretdoorjosette.nl").replace(/\/+$/, ""),
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/over-mij", label: "Over mij" },
  { href: "/tarieven", label: "Tarieven" },
  { href: "/contact", label: "Contact" },
] as const;

/** Absolute URL helper for canonical/OG tags and the sitemap. */
export function absoluteUrl(path = "/") {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}
