export type CategorySlug = "mensen" | "kinderen" | "huisdieren" | "natuur";

export const CATEGORY_ORDER: CategorySlug[] = [
  "mensen",
  "kinderen",
  "huisdieren",
  "natuur",
];

export interface Category {
  slug: CategorySlug;
  name: string;
  blurb: string;
  order: number;
}

export interface Portrait {
  id: string;
  slug: string;
  title: string;
  category: CategorySlug;
  medium: string;
  /** Absolute URL (PocketBase) or app-local path (/art/…). */
  image: string;
  alt: string;
  /** Whether this work appears in the home page strip. */
  featured: boolean;
  /** Position inside its own category: the gallery page, and the first five
   *  become the folder-card fan. 0 means "no preference" — newest first. */
  order: number;
  /** Position in the home page strip, for featured works. 0 means newest. */
  homeOrder: number;
}

export type PriceGroup = "Portretten" | "Klein werk" | "Afwerking";

export interface PriceRow {
  id: string;
  group: PriceGroup;
  label: string;
  sublabel?: string;
  /** Price in the card's first column (A4 for portraits). "" renders as "–". */
  price: string;
  /** Optional second column (A3 for portraits); omitted on single-column cards. */
  priceAlt?: string;
  note?: string;
  order: number;
}

export interface SiteSettings {
  email: string;
  locality: string;
  region: string;
  countryName: string;
  facebook: string;
  instagram: string;
  responseTime: string;
  mapEmbedUrl: string;
  /** Big brand photos (URL or app-local /art path). */
  heroImage: string;
  overMijImage: string;
}

/** key → value map of editable copy blocks. */
export type ContentMap = Record<string, string>;
