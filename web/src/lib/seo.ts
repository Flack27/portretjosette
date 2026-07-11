import type { Metadata } from "next";
import { SITE, absoluteUrl } from "@/lib/config";
import type { SiteSettings } from "@/lib/types";

/** Build per-page metadata. Title flows through the root template; the root
 *  opengraph-image applies to every route, so pages rarely set images. */
export function pageMetadata(opts: {
  title?: string;
  description?: string;
  path?: string;
}): Metadata {
  const description = opts.description ?? SITE.description;
  const url = absoluteUrl(opts.path ?? "/");
  return {
    title: opts.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      title: opts.title ?? SITE.name,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title ?? SITE.name,
      description,
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
    priceRange: "€€",
    founder: { "@id": absoluteUrl("/#josette") },
    areaServed: settings.countryName,
    knowsLanguage: "nl-NL",
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
      image: opts.images,
    },
  };
}
