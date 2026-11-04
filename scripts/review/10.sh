#!/usr/bin/env bash
# Review run for issue #10: build + static checks locally, then live checks against the branch's Vercel preview.
# Usage (from the repo root of a checkout of feat/10-optimierungen):
#   scripts/review/10.sh [vercel-share-token]
# The preview sits behind Vercel SSO: without a token only the local checks run.
# Token: open the preview in the Vercel dashboard -> Share -> copy the _vercel_share value.
set -euo pipefail
cd "$(dirname "$0")/../.."
OUT="$(mktemp -d)"
trap 'rm -rf "$OUT"' EXIT
TOKEN="${1:-${VERCEL_SHARE:-}}"
step() { printf '\n== %s\n' "$*"; }

step "install + build"
npm ci --silent
npm run build >"$OUT/build.log" 2>&1 || { tail -30 "$OUT/build.log"; exit 1; }

step "static checks (AC-1, 3, 4, 7, 8, 9, 10)"
node scripts/review/check-dist.mjs
step "schema.org validator (AC-9)"
scripts/review/check-schema.sh

step "waiting for the Vercel preview of $(git rev-parse --short HEAD)"
URL="$(scripts/review/preview-url.sh HEAD)"
echo "$URL"
if [[ -z "$TOKEN" ]]; then
  echo "no share token: live checks skipped (AC-2, 3, 5, 6, 10, 11, 12, 13)"
  echo "preview: $URL"; exit 0
fi

step "redirects, noindex, cache headers (AC-2, 3, 11)"
scripts/review/check-preview.sh "$URL" "$TOKEN"
step "contact API (AC-6)"
scripts/review/check-api.sh "$URL" "$TOKEN"
step "browser tests (AC-4, 5, 6, 10, 13)"
node scripts/review/e2e.cjs "$URL" "$TOKEN" "$OUT/art"
step "lighthouse, 3 runs median (AC-12) - takes ~10 min"
scripts/review/lighthouse.sh "$URL" "$TOKEN" "$OUT/lh"

printf '\nall checks passed\npreview: %s/?_vercel_share=%s\n' "$URL" "$TOKEN"
