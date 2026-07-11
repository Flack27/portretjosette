import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { PB_TAGS } from "@/lib/pocketbase";

export const runtime = "nodejs";

const VALID_TAGS = new Set<string>(Object.values(PB_TAGS));

/**
 * Called by PocketBase hooks after a record changes (see pocketbase/pb_hooks).
 * Authenticated with a shared secret. Body: { "collection": "portraits" } to
 * refresh one collection, or empty to refresh everything.
 */
export async function POST(req: Request) {
  const secret =
    req.headers.get("x-revalidate-secret") ??
    new URL(req.url).searchParams.get("secret");

  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { collection?: string } | null;
  const collection = body?.collection;

  if (collection && VALID_TAGS.has(collection)) {
    revalidateTag(collection, "max");
    return NextResponse.json({ revalidated: [collection] });
  }

  const all = Object.values(PB_TAGS);
  for (const tag of all) revalidateTag(tag, "max");
  return NextResponse.json({ revalidated: all });
}
