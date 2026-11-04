#!/usr/bin/env bash
# AC-12: Lighthouse median of 3 cold runs per page, mobile and desktop.
# Usage: scripts/review/lighthouse.sh <base-url> [vercel-share-token] [outdir]
set -euo pipefail
BASE="${1%/}"; OUT="${3:-$(mktemp -d)}"; mkdir -p "$OUT"
HDR='{}'
if [[ -n "${2:-}" ]]; then
  # Protected preview: trade the share token for the auth cookie and send it with every request.
  jwt="$(curl -s -o /dev/null -D - "$BASE/?_vercel_share=$2" | tr -d '\r' | grep -i '^set-cookie: _vercel_jwt=' | sed -E 's/^[^=]*=([^;]*).*/\1/' | head -1)"
  [[ -n "$jwt" ]] || { echo "no _vercel_jwt cookie from share token" >&2; exit 1; }
  HDR="{\"Cookie\":\"_vercel_jwt=$jwt\"}"
fi
fail=0
for page in / /leistungen/existenzgruendung /kontakt /team; do
  for form in mobile desktop; do
    flags=(); [[ "$form" == desktop ]] && flags=(--preset=desktop)
    stem="$OUT/$(echo "$page" | tr '/' '_')-$form"
    for run in 1 2 3; do
      npx -y lighthouse@13 "$BASE$page" ${flags[@]+"${flags[@]}"} --quiet --output=json --output-path="$stem-$run.json" \
        --extra-headers="$HDR" --chrome-flags="--headless=new" >/dev/null 2>&1
    done
    node -e '
      const fs = require("fs");
      const [form, page, ...files] = process.argv.slice(1);
      const r = files.map((f) => JSON.parse(fs.readFileSync(f, "utf8")));
      const med = (f) => r.map(f).sort((x, y) => x - y)[1];
      const score = (c) => Math.round(med((x) => x.categories[c].score) * 100);
      const perf = score("performance"), a11y = score("accessibility"), bp = score("best-practices");
      const lcp = med((x) => x.audits["largest-contentful-paint"].numericValue);
      const cls = med((x) => x.audits["cumulative-layout-shift"].numericValue);
      const tbt = med((x) => x.audits["total-blocking-time"].numericValue);
      // Previews send X-Robots-Tag: noindex by design (AC-3), so is-crawlable is the one SEO audit
      // allowed to fail here; every other SEO audit must pass.
      const seoFails = [...new Set(r.flatMap((x) => x.categories.seo.auditRefs
        .filter((a) => a.weight > 0 && x.audits[a.id].score !== 1 && a.id !== "is-crawlable").map((a) => a.id)))];
      const ok = perf >= (form === "desktop" ? 99 : 98) && a11y === 100 && bp === 100 && !seoFails.length && lcp <= 2500 && cls <= 0.1;
      console.log(`${ok ? "PASS" : "FAIL"} AC-12 ${page} ${form} perf=${perf} a11y=${a11y} bp=${bp} seo-fails=[${seoFails}] lcp=${Math.round(lcp)}ms cls=${cls.toFixed(3)} tbt=${Math.round(tbt)}ms`);
      process.exit(ok ? 0 : 1);
    ' "$form" "$page" "$stem"-1.json "$stem"-2.json "$stem"-3.json || fail=1
  done
done
echo "reports: $OUT"
exit $fail
