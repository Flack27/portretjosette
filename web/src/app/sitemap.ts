import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/config";
import { getCategories, getPortraits } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [categories, portraits] = await Promise.all([getCategories(), getPortraits()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/portfolio"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/over-mij"), lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: absoluteUrl("/tarieven"), lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.6 },
  ];

  /*
    The drawings are the point of this site and most of them are only ever seen
    inside a gallery grid, so each category page declares its own images. Without
    this, Google Images has to discover them by crawling the markup; an artist's
    work is worth pointing at directly. Individual works have no page of their
    own, so the category page is the landing page for every image on it.
  */
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: absoluteUrl(`/portfolio/${c.slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
    images: portraits
      .filter((p) => p.category === c.slug)
      // A sitemap may only carry absolute URLs. Live images already are, being
      // PocketBase file URLs, but the seed fallback uses project-relative paths
      // like /art/vrouw.webp — and the sitemap is prerendered at build time,
      // when PocketBase is not reachable, so that fallback does get rendered.
      .map((p) => (/^https?:\/\//.test(p.image) ? p.image : absoluteUrl(p.image))),
  }));

  return [...staticRoutes, ...categoryRoutes];
}
