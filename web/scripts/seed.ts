/*
  Seed a fresh PocketBase from the content in src/content/seed.ts.

  Prerequisites:
    - PocketBase running and reachable at POCKETBASE_URL (default 127.0.0.1:8090)
    - A superuser exists; set PB_ADMIN_EMAIL / PB_ADMIN_PASSWORD (see web/.env)
    - The schema migration has been applied (it runs automatically on PB start)

  Run:  npm run seed
  Re-run safely — categories/prices/content/settings are upserted. Portraits are
  only imported when the collection is empty (set SEED_FORCE=1 to add them again).
*/
import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PocketBase, { type RecordModel } from "pocketbase";
import {
  CATEGORIES,
  CONTENT,
  CONTENT_FIELDS,
  PORTRAITS,
  PRICES,
  SETTINGS,
} from "../src/content/seed";

const PB_URL = process.env.POCKETBASE_URL ?? "http://127.0.0.1:8090";
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD;

const dir = path.dirname(fileURLToPath(import.meta.url));
const ART_DIR = path.join(dir, "..", "public", "art");

/** Escape a value for use inside a PocketBase filter string literal. */
const q = (s: string) => s.replace(/"/g, '\\"');

async function findOne(
  pb: PocketBase,
  collection: string,
  filter: string,
): Promise<RecordModel | null> {
  try {
    return await pb.collection(collection).getFirstListItem(filter);
  } catch {
    return null;
  }
}

async function seedCategories(pb: PocketBase) {
  for (const c of CATEGORIES) {
    const data = { name: c.name, slug: c.slug, blurb: c.blurb, order: c.order };
    const existing = await findOne(pb, "categories", `slug="${q(c.slug)}"`);
    if (existing) await pb.collection("categories").update(existing.id, data);
    else await pb.collection("categories").create(data);
  }
  console.log(`✓ categories (${CATEGORIES.length})`);
}

async function seedPrices(pb: PocketBase) {
  for (const p of PRICES) {
    const data = {
      group: p.group,
      label: p.label,
      sublabel: p.sublabel ?? "",
      price: p.price,
      note: p.note ?? "",
      order: p.order,
    };
    const existing = await findOne(
      pb,
      "prices",
      `group="${q(p.group)}" && label="${q(p.label)}"`,
    );
    if (existing) await pb.collection("prices").update(existing.id, data);
    else await pb.collection("prices").create(data);
  }
  console.log(`✓ prices (${PRICES.length})`);
}

async function seedContent(pb: PocketBase) {
  const keys = Object.keys(CONTENT);
  for (const key of keys) {
    const meta = CONTENT_FIELDS[key] ?? { label: key, group: "Overig" };
    const data = { key, label: meta.label, group: meta.group, value: CONTENT[key] };
    const existing = await findOne(pb, "content", `key="${q(key)}"`);
    if (existing) await pb.collection("content").update(existing.id, data);
    else await pb.collection("content").create(data);
  }
  console.log(`✓ content blocks (${keys.length})`);
}

async function readArtFile(filename: string): Promise<File> {
  const buf = await fs.readFile(path.join(ART_DIR, filename));
  return new File([new Uint8Array(buf)], filename, { type: "image/webp" });
}

async function seedSettings(pb: PocketBase) {
  const existing = await pb.collection("settings").getFullList({ perPage: 1 });
  const current = existing[0];

  const form = new FormData();
  form.append("email", SETTINGS.email);
  form.append("locality", SETTINGS.locality);
  form.append("region", SETTINGS.region);
  form.append("countryName", SETTINGS.countryName);
  form.append("facebook", SETTINGS.facebook);
  form.append("instagram", SETTINGS.instagram);
  form.append("responseTime", SETTINGS.responseTime);
  form.append("mapEmbedUrl", SETTINGS.mapEmbedUrl);

  // Upload default brand photos only if not already set — keeps re-seeds cheap
  // and preserves any images Josette uploaded herself.
  const withPhotos = !current?.heroImage || !current?.overMijImage;
  if (!current?.heroImage) form.append("heroImage", await readArtFile("kind-groen.webp"));
  if (!current?.overMijImage) form.append("overMijImage", await readArtFile("vrouw.webp"));

  if (current) await pb.collection("settings").update(current.id, form);
  else await pb.collection("settings").create(form);
  console.log(`✓ settings${withPhotos ? " (+ brand photos)" : ""}`);
}

async function seedPortraits(pb: PocketBase) {
  const { totalItems } = await pb.collection("portraits").getList(1, 1);
  if (totalItems > 0 && !process.env.SEED_FORCE) {
    console.log(`• portraits: ${totalItems} already present — skipping (SEED_FORCE=1 to re-add)`);
    return;
  }

  let n = 0;
  for (const p of PORTRAITS) {
    const filename = p.image.replace("/art/", "");
    const file = await readArtFile(filename);

    const form = new FormData();
    form.append("title", p.title);
    form.append("category", p.category);
    form.append("medium", p.medium);
    form.append("order", String(p.order));
    form.append("featured", String(p.featured));
    form.append("alt", p.alt);
    form.append("image", file);

    await pb.collection("portraits").create(form);
    n += 1;
  }
  console.log(`✓ portraits (${n} uploaded)`);
}

async function main() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      "Set PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD (in web/.env) to a PocketBase superuser.",
    );
  }
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);
  await pb.collection("_superusers").authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log(`Authenticated at ${PB_URL}`);

  await seedCategories(pb);
  await seedPrices(pb);
  await seedContent(pb);
  await seedSettings(pb);
  await seedPortraits(pb);
  console.log("\n✅ Seed complete.");
}

main().catch((err) => {
  console.error("\n❌ Seed failed:", err?.message ?? err);
  if (err?.response?.data) {
    console.error("Field errors:", JSON.stringify(err.response.data, null, 2));
  } else if (err?.data) {
    console.error("Details:", JSON.stringify(err.data, null, 2));
  }
  process.exit(1);
});
