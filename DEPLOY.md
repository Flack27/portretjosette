# Deploy — Linux + Docker + Cloudflare

Concise runbook. Two containers via `docker compose`: **web** (Next, port 3000) and
**pocketbase** (CMS + image host + admin, port 8090). Cloudflare in front for DNS/TLS.

## 0. Prerequisites
- Docker + Docker Compose plugin on the server.
- `portretdoorjosette.nl` managed in Cloudflare.
- A reverse proxy on the server (Caddy / nginx / Traefik) **or** a Cloudflare Tunnel.
- Node 22 somewhere with this repo (to run the one-time content seed).

## 1. Cloudflare DNS
Records → the server's public IP, **proxied** (orange cloud):

| Type | Name | Content |
|-------|-------|---------|
| A | `@`   | `<server-ip>` |
| A | `cms` | `<server-ip>` |
| CNAME | `www` | `portretdoorjosette.nl` |

- `cms.portretdoorjosette.nl` is Josette's admin UI **and** where gallery images are served from, so it must be publicly reachable.
- The old site used `www.` URLs; the new canonical is the bare domain, so `www` **must 301 → non-www** (handled by the proxy in step 4). This preserves the old URLs' Google ranking. The paths (`/over-mij`, `/tarieven`, `/contact`) are unchanged, so no per-page redirects are needed.

## 2. Configure
```bash
git clone <repo-url> portret && cd portret
cp .env.example .env
```
Edit `.env` (these are read at build + runtime, so set them **before** step 3):
- `NEXT_PUBLIC_SITE_URL=https://portretdoorjosette.nl`
- `NEXT_PUBLIC_POCKETBASE_URL=https://cms.portretdoorjosette.nl`
- `REVALIDATE_SECRET=` → `openssl rand -hex 32`
- `RESEND_API_KEY=` → from resend.com
- `CONTACT_TO_EMAIL=info@portretdoorjosette.nl`
- `CONTACT_FROM_EMAIL="Portret door Josette <website@portretdoorjosette.nl>"` (domain must be verified in Resend)
- `PB_VERSION=0.39.5`
- Socials are already defaulted in code; override here only if they change.

## 3. Build + run
```bash
docker compose up -d --build
```
`web` listens on `:3000`, `pocketbase` on `:8090` (both bound to the host). `pb_data`
(database + uploaded images) persists in a named volume — **back this up**.

## 4. Reverse proxy
Terminate TLS at the proxy (or use Cloudflare Origin cert) and route by hostname:

- `portretdoorjosette.nl`     → `127.0.0.1:3000`
- `cms.portretdoorjosette.nl` → `127.0.0.1:8090`

Minimal **Caddyfile** (auto-HTTPS):
```
portretdoorjosette.nl {
    reverse_proxy 127.0.0.1:3000
}
www.portretdoorjosette.nl {
    redir https://portretdoorjosette.nl{uri} permanent   # 301 www → non-www
}
cms.portretdoorjosette.nl {
    reverse_proxy 127.0.0.1:8090
}
```
> Make sure the proxy forwards the real client IP as `X-Forwarded-For` (Cloudflare
> sends it in `CF-Connecting-IP`) — the contact-form rate limit reads it.

## 5. First run — admin + content
```bash
# 1) Create Josette's admin login
docker compose exec pocketbase /pb/pocketbase superuser create you@example.com 'strong-password'

# 2) Seed content + upload the artwork (from any machine with Node 22 + this repo)
cd web && npm ci
POCKETBASE_URL=https://cms.portretdoorjosette.nl \
PB_ADMIN_EMAIL=you@example.com PB_ADMIN_PASSWORD='strong-password' \
npm run seed
```
The schema migration applies automatically on first PocketBase start; the seed loads
categories, prices, copy, settings and the ~44 images. Re-runnable (portraits skip if present).

## 6. Cloudflare settings
- **SSL/TLS → Full (strict)** if the origin serves a valid cert (Caddy/Let's Encrypt or a CF Origin cert).
- **Do not enable "Cache Everything" on HTML.** Default CF caching (static assets + images only) is correct — it lets the site's on-demand revalidation stay authoritative. Cloudflare will still cache `/_next/static` and images.
- Free tier caps a single upload at 100 MB (fine for these images).

## 7. Google discovery (at launch)
On-page SEO is built in (per-page metadata, JSON-LD LocalBusiness + Person, sitemap,
robots, OpenGraph, favicon). The rest is on Google's side:

1. **Google Search Console** — add `https://portretdoorjosette.nl` and submit
   `/sitemap.xml`. Verify via a **Cloudflare DNS TXT record** (easiest, no rebuild), or via
   the HTML tag by setting `GOOGLE_SITE_VERIFICATION` in `.env` and rebuilding.
2. **Google Business Profile** (business.google.com) — the listing that drives the branded
   knowledge panel and local search. Set it up as a **service-area business** so Josette's
   home address stays private.
3. **Request indexing** in Search Console after launch (or wait for the crawl). Branded
   search ("Portret door Josette") ranks quickly given the unique name + existing domain.
4. Validate structured data with Google's **Rich Results Test**.

## 8. Verify
- [ ] `https://portretdoorjosette.nl` loads; gallery images come from `cms.…`.
- [ ] `www.` and `http://` both 301 to `https://portretdoorjosette.nl`.
- [ ] Edit a record in `cms.…/_/` → change is live within a few seconds (revalidation hook).
- [ ] Submit the contact form → email arrives at `CONTACT_TO_EMAIL`.
- [ ] `/sitemap.xml` and `/robots.txt` respond.
- [ ] Lighthouse / PageSpeed looks healthy (SSG + cached images).

## Updating later
```bash
git pull && docker compose up -d --build
```
`pb_data` (Josette's content) is untouched by rebuilds.

---
Full context, architecture and the content model are in [`README.md`](./README.md).
