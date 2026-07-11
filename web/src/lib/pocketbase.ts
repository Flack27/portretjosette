/**
 * Minimal read-only PocketBase REST client for Server Components.
 *
 * - Data is fetched over the INTERNAL url (POCKETBASE_URL, e.g. the Docker
 *   service name) and cached + tagged so pages are static and refresh only when
 *   the PocketBase hook calls /api/revalidate.
 * - Image URLs are built against the PUBLIC url (NEXT_PUBLIC_POCKETBASE_URL) so
 *   next/image can fetch and optimise them through the reverse proxy.
 */

const PB_INTERNAL = (process.env.POCKETBASE_URL ?? "http://127.0.0.1:8090").replace(/\/+$/, "");

export const PB_PUBLIC = (
  process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://127.0.0.1:8090"
).replace(/\/+$/, "");

/** Cache tags — one per collection, matched by the revalidate route + PB hook. */
export const PB_TAGS = {
  portraits: "portraits",
  categories: "categories",
  prices: "prices",
  content: "content",
  settings: "settings",
} as const;

export type PbTag = (typeof PB_TAGS)[keyof typeof PB_TAGS];

interface PbListResponse<T> {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: T[];
}

export interface PbRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
}

export async function pbList<T extends PbRecord>(
  collection: string,
  opts: { tag: PbTag; sort?: string; filter?: string; perPage?: number },
): Promise<T[]> {
  const params = new URLSearchParams({ perPage: String(opts.perPage ?? 200) });
  if (opts.sort) params.set("sort", opts.sort);
  if (opts.filter) params.set("filter", opts.filter);

  const url = `${PB_INTERNAL}/api/collections/${collection}/records?${params}`;
  // In dev, always read live so the site reflects the current PocketBase state
  // (and falls back to the seed the moment PB is stopped). In prod, cache with a
  // per-collection tag + ISR safety-net, invalidated on-demand by the PB hook.
  const isDev = process.env.NODE_ENV !== "production";
  const res = await fetch(
    url,
    isDev ? { cache: "no-store" } : { next: { tags: [opts.tag], revalidate: 3600 } },
  );

  if (!res.ok) {
    throw new Error(`PocketBase list ${collection} failed: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as PbListResponse<T>;
  return data.items;
}

/** Public file URL for a stored file field. */
export function pbFileUrl(collection: string, recordId: string, filename: string): string {
  return `${PB_PUBLIC}/api/files/${collection}/${recordId}/${encodeURIComponent(filename)}`;
}
