import { cache } from "react";
import {
  CATEGORIES,
  CONTENT,
  PORTRAITS,
  PRICES,
  SETTINGS,
} from "@/content/seed";
import type {
  Category,
  CategorySlug,
  ContentMap,
  Portrait,
  PriceRow,
  SiteSettings,
} from "@/lib/types";
import { CATEGORY_ORDER } from "@/lib/types";
import { PB_TAGS, pbFileUrl, pbList, type PbRecord } from "@/lib/pocketbase";

/*
  Typed content fetchers. Each tries PocketBase and falls back to the seed in
  content/seed.ts. Editorial content (copy, categories, prices, settings) also
  falls back when PocketBase is reachable-but-empty; the gallery does not, so a
  genuinely empty gallery is respected.
*/

function devWarn(scope: string, err: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[content] ${scope}: using seed fallback —`, (err as Error).message);
  }
}

// ─── Portraits ───────────────────────────────────────────────────────────────
interface PbPortrait extends PbRecord {
  title: string;
  category: CategorySlug;
  medium: string;
  order: number;
  featured: boolean;
  alt: string;
  image: string;
}

export const getPortraits = cache(async (): Promise<Portrait[]> => {
  try {
    const items = await pbList<PbPortrait>("portraits", {
      tag: PB_TAGS.portraits,
      sort: "-created",
    });
    return items
      .filter((r) => r.image)
      .map((r) => ({
        id: r.id,
        slug: r.id,
        title: r.title,
        category: r.category,
        medium: r.medium || "Pastelkrijt",
        image: pbFileUrl(r.collectionName, r.id, r.image),
        alt: r.alt || `Realistisch portret — ${r.title}`,
        featured: Boolean(r.featured),
        order: r.order ?? 0,
      }));
  } catch (err) {
    devWarn("portraits", err);
    return PORTRAITS;
  }
});

export const getPortraitsByCategory = cache(
  async (slug: CategorySlug): Promise<Portrait[]> => {
    const all = await getPortraits();
    return all.filter((p) => p.category === slug);
  },
);

export const getFeaturedPortraits = cache(
  async (limit = 4): Promise<Portrait[]> => {
    const all = await getPortraits(); // already newest-first
    const featured = all.filter((p) => p.featured);
    const rest = all.filter((p) => !p.featured);
    // Pinned (featured) first, then newest — same rule as the category fan, so
    // "featured" means "to the front" consistently everywhere.
    return [...featured, ...rest].slice(0, limit);
  },
);

// ─── Categories (+ live counts) ──────────────────────────────────────────────
interface PbCategory extends PbRecord {
  name: string;
  slug: CategorySlug;
  blurb: string;
  order: number;
}

export const getCategories = cache(async (): Promise<Category[]> => {
  try {
    const items = await pbList<PbCategory>("categories", {
      tag: PB_TAGS.categories,
      sort: "order",
    });
    if (items.length === 0) return CATEGORIES;
    return items.map((r) => ({
      slug: r.slug,
      name: r.name,
      blurb: r.blurb,
      order: r.order ?? 0,
    }));
  } catch (err) {
    devWarn("categories", err);
    return CATEGORIES;
  }
});

export interface CategoryWithCount extends Category {
  count: number;
  /** Up to 5 image URLs for the folder-card fan (order number first, then newest). */
  previews: string[];
}

export const getCategoriesWithCounts = cache(
  async (): Promise<CategoryWithCount[]> => {
    const [categories, portraits] = await Promise.all([
      getCategories(),
      getPortraits(),
    ]);
    return categories
      .slice()
      .sort((a, b) => CATEGORY_ORDER.indexOf(a.slug) - CATEGORY_ORDER.indexOf(b.slug))
      .map((c) => {
        const inCategory = portraits
          .filter((p) => p.category === c.slug)
          // Fan order: photos with an `order` number come first (1,2,3…), the rest
          // by newest. inCategory is already newest-first (getPortraits sorts -created)
          // and Array.sort is stable, so unordered photos keep their newest order.
          // previews[0] lands in the fan centre, [1] left-middle, [2] right-middle,
          // [3] left-outer, [4] right-outer (see CategoryCard fanLayout).
          .sort((a, b) => {
            const ao = a.order && a.order > 0 ? a.order : Infinity;
            const bo = b.order && b.order > 0 ? b.order : Infinity;
            return ao - bo;
          });
        return {
          ...c,
          count: inCategory.length,
          previews: inCategory.slice(0, 5).map((p) => p.image),
        };
      });
  },
);

export const getCategory = cache(
  async (slug: string): Promise<Category | undefined> => {
    const categories = await getCategories();
    return categories.find((c) => c.slug === slug);
  },
);

// ─── Prices ──────────────────────────────────────────────────────────────────
interface PbPrice extends PbRecord {
  group: PriceRow["group"];
  label: string;
  sublabel: string;
  price: string;
  note: string;
  order: number;
}

export const getPrices = cache(async (): Promise<PriceRow[]> => {
  try {
    const items = await pbList<PbPrice>("prices", { tag: PB_TAGS.prices, sort: "order" });
    if (items.length === 0) return PRICES;
    return items.map((r) => ({
      id: r.id,
      group: r.group,
      label: r.label,
      sublabel: r.sublabel || undefined,
      price: r.price,
      note: r.note || undefined,
      order: r.order ?? 0,
    }));
  } catch (err) {
    devWarn("prices", err);
    return PRICES;
  }
});

export const getPricesByGroup = cache(async (group: PriceRow["group"]) => {
  const prices = await getPrices();
  return prices.filter((p) => p.group === group);
});

// ─── Editable copy blocks ────────────────────────────────────────────────────
interface PbContent extends PbRecord {
  key: string;
  value: string;
}

export const getContent = cache(async (): Promise<ContentMap> => {
  try {
    const items = await pbList<PbContent>("content", { tag: PB_TAGS.content });
    const overrides: ContentMap = {};
    for (const r of items) if (r.key && r.value) overrides[r.key] = r.value;
    // Seed defaults guarantee every key resolves even if PB is missing some.
    return { ...CONTENT, ...overrides };
  } catch (err) {
    devWarn("content", err);
    return CONTENT;
  }
});

// ─── Settings ────────────────────────────────────────────────────────────────
interface PbSettings extends PbRecord {
  email?: string;
  locality?: string;
  region?: string;
  countryName?: string;
  facebook?: string;
  instagram?: string;
  responseTime?: string;
  mapEmbedUrl?: string;
  // File fields arrive as stored filenames.
  heroImage?: string;
  overMijImage?: string;
}

export const getSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const items = await pbList<PbSettings>("settings", {
      tag: PB_TAGS.settings,
      perPage: 1,
    });
    if (items.length === 0) return SETTINGS;
    const r = items[0];
    return {
      email: r.email || SETTINGS.email,
      locality: r.locality || SETTINGS.locality,
      region: r.region || SETTINGS.region,
      countryName: r.countryName || SETTINGS.countryName,
      facebook: r.facebook ?? SETTINGS.facebook,
      instagram: r.instagram ?? SETTINGS.instagram,
      responseTime: r.responseTime || SETTINGS.responseTime,
      mapEmbedUrl: r.mapEmbedUrl || SETTINGS.mapEmbedUrl,
      heroImage: r.heroImage
        ? pbFileUrl(r.collectionName, r.id, r.heroImage)
        : SETTINGS.heroImage,
      overMijImage: r.overMijImage
        ? pbFileUrl(r.collectionName, r.id, r.overMijImage)
        : SETTINGS.overMijImage,
    };
  } catch (err) {
    devWarn("settings", err);
    return SETTINGS;
  }
});

/** Read a copy block by key from a pre-fetched content map. */
export function text(map: ContentMap, key: string): string {
  return map[key] ?? "";
}
