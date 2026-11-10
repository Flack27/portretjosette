#!/usr/bin/env bash
#
# Deploy "Portret door Josette" on the server.
#
#   ./deploy.sh                    pull, rebuild, restart, then revalidate
#   ./deploy.sh --revalidate-only  just the revalidate (after a manual compose up)
#   ./deploy.sh --no-pull          rebuild what is already checked out
#
# Why the revalidate step exists: the pages are prerendered during `next build`,
# and inside the Docker build the `pocketbase` hostname does not resolve, so
# every CMS fetch fails and the fallbacks in web/src/content/seed.ts are baked
# into the HTML. Without a revalidate afterwards the live site serves seed
# placeholder prices and portraits until something else triggers a regeneration.
set -euo pipefail

cd "$(dirname "$0")"

PULL=1
BUILD=1
for arg in "$@"; do
  case "$arg" in
    --revalidate-only) PULL=0; BUILD=0 ;;
    --no-pull)         PULL=0 ;;
    -h|--help)         sed -n '2,10p' "$0"; exit 0 ;;
    *) echo "unknown option: $arg" >&2; exit 2 ;;
  esac
done

if [ ! -f .env ]; then
  echo "no .env next to this script — run it from the deployed checkout" >&2
  exit 1
fi

if [ "$PULL" = 1 ]; then
  echo "==> git pull"
  git pull --ff-only
fi

if [ "$BUILD" = 1 ]; then
  echo "==> docker compose up -d --build"
  docker compose up -d --build
fi

echo "==> waiting for the app to answer"
for _ in $(seq 1 30); do
  if curl -fsS -o /dev/null http://127.0.0.1:3000/; then break; fi
  sleep 2
done

# Read the secret without ever printing it. `.env` is not shell-sourceable here:
# CONTACT_FROM_EMAIL holds an unquoted value with angle brackets.
SECRET="$(grep -m1 '^REVALIDATE_SECRET=' .env | cut -d= -f2- | tr -d '"'"'"'\r')"
if [ -z "$SECRET" ]; then
  echo "REVALIDATE_SECRET is empty in .env — cannot revalidate" >&2
  exit 1
fi

echo "==> revalidating every collection"
code="$(curl -s -o /tmp/revalidate.$$ -w '%{http_code}' \
  -X POST http://127.0.0.1:3000/api/revalidate \
  -H 'Content-Type: application/json' \
  -H "x-revalidate-secret: $SECRET" \
  -d '{}')"
body="$(cat /tmp/revalidate.$$)"; rm -f /tmp/revalidate.$$
if [ "$code" != "200" ]; then
  echo "    revalidate failed: HTTP $code $body" >&2
  exit 1
fi
echo "    $body"

# Invalidating a tag only marks the page stale; the regeneration happens on the
# next request, and that request is still served the old HTML. Asking twice means
# the next real visitor gets the fresh page rather than triggering it themselves.
echo "==> warming the pages"
for path in / /portfolio /tarieven /over-mij /contact; do
  curl -s -o /dev/null "http://127.0.0.1:3000$path"
done
sleep 2
for path in / /portfolio /tarieven /over-mij /contact; do
  curl -s -o /dev/null "http://127.0.0.1:3000$path"
done

# A sanity check that real content came back, not the seed. "Bosdier" only
# exists in seed.ts; Josette's own rows say "Vogels, bosdieren & insecten".
if curl -s http://127.0.0.1:3000/tarieven | grep -q 'Bosdier'; then
  echo "WARNING: /tarieven is still serving seed prices. Re-run --revalidate-only." >&2
  exit 1
fi

echo "==> done; live content verified"
