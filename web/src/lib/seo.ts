import type { Metadata } from "next";
import { SITE, absoluteUrl } from "@/lib/config";
import type { SiteSettings } from "@/lib/types";

/**
 * schema.org requires absolute image URLs, and unlike the metadata helpers it
 * gets no `metadataBase` applied for it. Live images are already absolute
 * PocketBase URLs; the seed fallback uses project-relative paths.
 */
const absoluteImage = (src: string) =>
  /^https?:\/\//.test(src) ? src : absoluteUrl(src);

/** BCP-47 for structured data, where `nl_NL` (the OpenGraph form) is invalid. */
const LANG = SITE.locale.replace("_", "-");

/** Build per-page metadata. Title flows through the root template; the root
 *  opengraph-image applies to every route, so pages rarely set images. */
export function pageMetadata(opts: {
  title?: string;
  description?: string;
  path?: string;
}): Metadata {
  const description = opts.description ?? SITE.description;
  const url = absoluteUrl(opts.path ?? "/");

  // The root layout's `title.default` only applies to segments that do not
  // define a title at all. Passing `title: undefined` still counts as defining
  // one, which left the home page with no <title> element whatsoever — so the
  // key is omitted rather than set to undefined.
  const title = opts.title ? { title: opts.title } : {};

  // Declaring `openGraph` here replaces what the root opengraph-image.tsx
  // contributes, so the card image has to be named again or every page but the
  // home page ships without one.
  const ogImage = {
    url: absoluteUrl("/opengraph-image"),
    width: 1200,
    height: 630,
    alt: `${SITE.name} — Realistische portrettekeningen`,
  };

  return {
    ...title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      title: opts.title ?? SITE.name,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title ?? SITE.name,
      description,
      images: [ogImage.url],
    },
  };
}

/** schema.org graph: Josette (Person) + her practice (LocalBusiness). */
export function siteJsonLd(settings: SiteSettings) {
  const sameAs = [settings.facebook, settings.instagram].filter(Boolean);

  const person = {
    "@type": "Person",
    "@id": absoluteUrl("/#josette"),
    name: SITE.artist,
    jobTitle: "Portretkunstenaar",
    url: SITE.url,
    ...(sameAs.length ? { sameAs } : {}),
  };

  const business = {
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": absoluteUrl("/#business"),
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    email: settings.email,
    image: absoluteUrl("/art/vrouw.webp"),
    knowsLanguage: LANG,
    priceRange: "€€",
    founder: { "@id": absoluteUrl("/#josette") },
    areaServed: settings.countryName,
    address: {
      "@type": "PostalAddress",
      addressLocality: settings.locality,
      addressRegion: settings.region,
      addressCountry: SITE.country,
    },
    ...(sameAs.length ? { sameAs } : {}),
  };

  return { "@context": "https://schema.org", "@graph": [person, business] };
}

/** BreadcrumbList for a category detail page. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

/**
 * VisualArtwork for a single drawing.
 *
 * This is the schema search engines use for artwork, and it is the reason each
 * work has a page of its own: it ties the image to its medium, its maker and a
 * stable URL, which a thumbnail inside a gallery grid cannot do.
 */
export function artworkJsonLd(opts: {
  title: string;
  description: string;
  image: string;
  medium: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: opts.title,
    description: opts.description,
    image: absoluteImage(opts.image),
    url: absoluteUrl(opts.path),
    artMedium: opts.medium,
    artform: "Portret",
    creator: { "@id": absoluteUrl("/#josette") },
    isFamilyFriendly: true,
    inLanguage: LANG,
  };
}

/** ImageGallery + CollectionPage for a category of works. */
export function galleryJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  images: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.path),
    mainEntity: {
      "@type": "ImageGallery",
      image: opts.images.map(absoluteImage),
    },
  };
}
