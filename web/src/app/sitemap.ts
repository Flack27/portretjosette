import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/config";
import { getCategories } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const categories = await getCategories();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/portfolio"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/over-mij"), lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: absoluteUrl("/tarieven"), lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.6 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: absoluteUrl(`/portfolio/${c.slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes];
}
