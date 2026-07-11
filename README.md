# Portret door Josette

Self-hosted portfolio site for portrait artist **Josette Spapens** (Hilvarenbeek, NL).
Replaces the €160/yr JouwWeb site. Dutch, SEO- and performance-first.

- **`web/`** — Next.js 16 (App Router) + TypeScript + Tailwind v4. Statically
  generated, served as a standalone Node server.
- **`pocketbase/`** — PocketBase: the CMS, image store and admin UI Josette uses
  to manage the gallery and edit text — no code required.

## Architecture

```
                 reverse proxy (Let's Encrypt)
                 ├── portretdoorjosette.nl ──────► web        (Next, :3000)
                 └── cms.portretdoorjosette.nl ──► pocketbase (:8090, admin UI)

  web  ──(internal Docker network)──►  pocketbase   (reads content + images)
  pocketbase ──(pb_hooks on save)──►  web /api/revalidate   (refreshes cache)
```

- **SSG + ISR + on-demand revalidation.** Pages are prerendered at build and cached.
  Content fetches are tagged per collection; when Josette saves in PocketBase, a
  `pb_hook` calls `web`'s `/api/revalidate`, which invalidates just that tag — the
  change is live in seconds, no rebuild. A 1-hour ISR window is the safety net.
- **Resilient fallback.** If PocketBase is empty or unreachable, the site renders
  from a built-in seed (`web/src/content/seed.ts`), so it always builds and serves.
- **Images** are served from PocketBase and optimised by `next/image`.

## Content model (PocketBase collections)

Public read, superuser-only writes. Managed as a version-controlled migration
(`pocketbase/pb_migrations/`), applied automatically on start.

| Collection   | Fields                                                             | Purpose |
|--------------|-------------------------------------------------------------------|---------|
| `portraits`  | title, category, medium, image, order, featured, alt              | Gallery works |
| `categories` | name, slug, blurb, order                                          | The 4 folders + detail pages |
| `prices`     | group, label, sublabel, price, note, order                        | Tarieven page |
| `content`    | key, label, group, value                                          | Editable copy blocks |
| `settings`   | email, locality, region, socials, responseTime, mapEmbedUrl       | Site-wide info |

Categories are a fixed set: **mensen, kinderen, huisdieren, natuur**.

---

## Local development

Requires Node 22+. From `web/`:

```bash
cd web
cp .env.example .env      # optional; defaults work
npm install
npm run dev               # http://localhost:3000
```

Without PocketBase running, the site serves the seed content (that's expected).

### Run PocketBase locally (full CMS)

`pocketbase.exe` (v0.39.5) is already in the repo root, and a superuser + seeded
data already exist in `pocketbase/pb_data/`. Start it from the repo root:

```powershell
.\pocketbase.exe serve --dir .\pocketbase\pb_data --migrationsDir .\pocketbase\pb_migrations --hooksDir .\pocketbase\pb_hooks
```

Admin UI: http://127.0.0.1:8090/_/ — login is in `web/.env` (`PB_ADMIN_*`).
With PocketBase running, `npm run dev` in `web/` serves live from it. To re-seed
a fresh database: `npm run seed`.

> On other machines, download the matching binary from the
> [releases page](https://github.com/pocketbase/pocketbase/releases), create a
> superuser (`pocketbase superuser create <email> <pass>`), set `PB_ADMIN_*` in
> `web/.env`, then `npm run seed`.

`npm run seed` uploads the ~44 artworks in `web/public/art/`, and upserts the
categories, prices, copy blocks and settings. It's idempotent (re-run safely);
portraits are only imported when the collection is empty (`SEED_FORCE=1` to re-add).

> The seeded titles/categories are a **first pass** — Josette refines them in the
> admin UI. Four multi-work collage images are intentionally left out of the gallery.

---

## Deployment (Docker + your reverse proxy)

From the repo root:

```bash
cp .env.example .env       # fill in real values (see below)
docker compose up -d --build
```

This builds and runs both containers. Point your reverse proxy at:

- `portretdoorjosette.nl` → `web:3000`
- `cms.portretdoorjosette.nl` → `pocketbase:8090`  (so `NEXT_PUBLIC_POCKETBASE_URL`
  resolves and Josette can reach the admin UI)

First-run setup:

1. Create the PocketBase superuser (Josette's login):
   ```bash
   docker compose exec pocketbase /pb/pocketbase superuser create you@example.com 'strong-password'
   ```
2. Seed content once (from your machine, pointed at the public CMS URL):
   ```bash
   cd web
   POCKETBASE_URL=https://cms.portretdoorjosette.nl \
   PB_ADMIN_EMAIL=you@example.com PB_ADMIN_PASSWORD='strong-password' npm run seed
   ```

### Contact form (Resend)

1. Create a [Resend](https://resend.com) account and API key → `RESEND_API_KEY`.
2. Verify `portretdoorjosette.nl` in Resend (add the DNS records) and set
   `CONTACT_FROM_EMAIL` to an address on that domain. `CONTACT_TO_EMAIL` is where
   Josette receives messages.
3. Spam protection is built in: a honeypot field + a submit-timing check +
   a per-IP rate limit (5/min). No third-party CAPTCHA.

---

## Environment variables

Root `.env` (docker-compose):

| Var | Example | Notes |
|-----|---------|-------|
| `NEXT_PUBLIC_SITE_URL` | `https://portretdoorjosette.nl` | Canonical origin (build-time) |
| `NEXT_PUBLIC_POCKETBASE_URL` | `https://cms.portretdoorjosette.nl` | Public CMS/image host (build-time) |
| `REVALIDATE_SECRET` | random | Shared by the PB hook + Next |
| `RESEND_API_KEY` | `re_…` | Contact email |
| `CONTACT_TO_EMAIL` | `info@portretdoorjosette.nl` | Recipient |
| `CONTACT_FROM_EMAIL` | `… <website@…>` | Verified sender |
| `PB_VERSION` | `0.39.5` | Verified release; bump to match [latest](https://github.com/pocketbase/pocketbase/releases) |
| `NEXT_PUBLIC_FACEBOOK_URL` / `…_INSTAGRAM_URL` | | Optional; shown when set |

Set at runtime by compose for `web`: `POCKETBASE_URL=http://pocketbase:8090` (internal).

---

## How Josette manages the site

She logs into **cms.portretdoorjosette.nl/_/** and uses:

- **portraits** — add/remove works: upload an image, set title + category, optional
  order/featured. New work appears in the right folder within seconds. The home
  "Een greep uit het werk" strip = whichever portraits are marked **featured**, and
  each portfolio category card's photo-fan is built automatically from that
  category's works.
- **content** — edit any text block on the site (grouped per page).
- **prices** — update the Tarieven table.
- **settings** — email, socials, map, response time, and the two big brand photos
  (**heroImage** on Home, **overMijImage** on Over-mij). Leave a photo empty to use
  the built-in default.

She never touches code, and no rebuild is needed.

## Notes & possible next steps

- The **hero** and **over-mij** photos are editable in `settings`; the portfolio
  category fans are derived from each category's portraits (no separate management).
- **Socials** are hidden until a URL is set (in `settings` or env).
- Design source of truth: `design_handoff_portret_door_josette/README.md`.
