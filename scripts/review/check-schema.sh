#!/usr/bin/env bash
# AC-9: built pages through validator.schema.org; every page must report zero errors.
# Usage: npm run build && scripts/review/check-schema.sh [distDir]
set -euo pipefail
DIST="${1:-dist/client}"
fail=0
for f in index.html leistungen/existenzgruendung/index.html leistungen/nachfolgeberatung/index.html \
  leistungen/finanzbuchhaltung/index.html leistungen/steuerberatung/index.html kontakt/index.html team/index.html; do
  raw="$(curl -s -w '\n%{http_code}' -X POST https://validator.schema.org/validate --data-urlencode "html@$DIST/$f")"
  code="${raw##*$'\n'}"
  # External service: when it does not answer, say so instead of aborting the whole review run.
  if [[ "$code" != 200 ]]; then echo "SKIP AC-9 schema $f: validator.schema.org answered HTTP $code"; continue; fi
  res="$(printf '%s' "${raw%$'\n'*}" | tail -n +2)"
  summary="$(node -e '
    const r = JSON.parse(process.argv[1]);
    const types = []; let errors = 0;
    const walk = (n) => { if (!n || typeof n !== "object") return;
      if (Array.isArray(n.errors)) errors += n.errors.length;
      for (const v of Object.values(n)) walk(v); };
    walk(r);
    for (const g of r.tripleGroups ?? []) for (const n of g.nodes ?? []) types.push(n.typeGroup);
    console.log(`${errors} ${[...new Set(types)].join(",")}`);
  ' "$res")"
  read -r errors types <<<"$summary"
  if [[ "$errors" == 0 && -n "$types" ]]; then echo "PASS AC-9 schema $f: 0 errors ($types)"; else echo "FAIL AC-9 schema $f: $errors errors ($types)"; fail=1; fi
done
exit $fail
