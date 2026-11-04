#!/usr/bin/env bash
# Live checks for issue #10 against a deployed URL (AC-2 redirects, AC-3 noindex, AC-11 cache headers).
# Usage: scripts/review/check-preview.sh <base-url> [vercel-share-token]
set -euo pipefail
BASE="${1%/}"
JAR="$(mktemp)"; trap 'rm -f "$JAR"' EXIT
fail=0
# Protected previews: a share token sets the auth cookie once.
if [[ -n "${2:-}" ]]; then curl -s -o /dev/null -c "$JAR" -L "$BASE/?_vercel_share=$2"; fi
req() { curl -s -o /dev/null -b "$JAR" -w '%{http_code} %{redirect_url}' "$@"; }
hdr() { curl -s -D - -o /dev/null -b "$JAR" "$1" | tr -d '\r'; }

# AC-2: each legacy URL (with and without slash) reaches a 200 page in at most one permanent hop.
# legacy=target pairs (plain list: macOS ships bash 3.2 without associative arrays)
for pair in /=/ /leistungen=/leistungen /datenschutzerklaerung=/datenschutz /kontakt=/kontakt \
  /kanzlei=/kanzlei /cookie-richtlinie-eu=/datenschutz /impressum=/impressum /karriere=/karriere /team=/team; do
  legacy="${pair%%=*}"; want="${pair#*=}"
  for path in "$legacy" "${legacy%/}/"; do
    [[ "$path" == "//" ]] && continue
    read -r code loc <<<"$(req "$BASE$path")"
    if [[ "$code" == 200 && "$path" == "$want" ]]; then echo "PASS AC-2 $path -> 200"; continue; fi
    if [[ "$code" =~ ^30[18]$ ]]; then
      dest="${loc#"$BASE"}"; dest="${dest:-/}"
      read -r code2 _ <<<"$(req "$loc")"
      if [[ "$dest" == "$want" && "$code2" == 200 ]]; then echo "PASS AC-2 $path -> $code $dest -> 200"; continue; fi
      echo "FAIL AC-2 $path -> $code $dest -> $code2 (want $want)"; fail=1; continue
    fi
    echo "FAIL AC-2 $path -> $code"; fail=1
  done
done

# AC-3: non-production host carries X-Robots-Tag noindex.
if hdr "$BASE/" | grep -qi '^x-robots-tag: noindex'; then echo "PASS AC-3 noindex on $BASE"; else echo "FAIL AC-3 no noindex on $BASE"; fail=1; fi

# AC-11: hashed assets immutable; HTML, API, robots, sitemap not long-cached.
asset="$(curl -s -b "$JAR" "$BASE/" | grep -oE '/_astro/[^"]+\.(css|js)' | head -1)"
if hdr "$BASE$asset" | grep -qi '^cache-control: public, max-age=31536000, immutable'; then echo "PASS AC-11 $asset immutable"; else echo "FAIL AC-11 $asset"; fail=1; fi
for p in / /kontakt /robots.txt /sitemap.xml /api/kontakt; do
  cc="$(hdr "$BASE$p" | grep -i '^cache-control:' || true)"
  if grep -qiE 'max-age=31536000|immutable' <<<"$cc"; then echo "FAIL AC-11 $p long-cached: $cc"; fail=1; else echo "PASS AC-11 $p ${cc:-no cache-control}"; fi
done
exit $fail
