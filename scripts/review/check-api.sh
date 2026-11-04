#!/usr/bin/env bash
# Live checks for /api/kontakt (AC-6 server side): origin check passes for same-origin, rejects foreign,
# anliegen is validated. Usage: scripts/review/check-api.sh <base-url> [vercel-share-token]
set -euo pipefail
BASE="${1%/}"
JAR="$(mktemp)"; trap 'rm -f "$JAR"' EXIT
fail=0
if [[ -n "${2:-}" ]]; then curl -s -o /dev/null -c "$JAR" -L "$BASE/?_vercel_share=$2"; fi
# 4 POSTs: stays under the endpoint limit of 5 per window per IP; the mailer check runs first.
post() { curl -s -o /dev/null -b "$JAR" -w '%{http_code}' -X POST "$BASE/api/kontakt" -H "Origin: $1" -H 'Accept: application/json' "${@:2}"; }
expect() { if [[ "$2" == "$3" ]]; then echo "PASS AC-6 $1 -> $2"; else echo "FAIL AC-6 $1 -> $2 (want $3)"; fail=1; fi; }
F=(--data-urlencode name=Test --data-urlencode email=test@example.com --data-urlencode message=Hallo --data-urlencode privacy=on)
# Valid request reaches the mailer: 200 with a key, 503 without one; never the 403 origin rejection.
code="$(post "$BASE" "${F[@]}" --data-urlencode 'anliegen=Gründung')"
if [[ "$code" == 200 || "$code" == 503 ]]; then echo "PASS AC-6 valid same-origin -> $code"; else echo "FAIL AC-6 valid same-origin -> $code"; fail=1; fi
expect "missing anliegen" "$(post "$BASE" "${F[@]}")" 400
expect "unknown anliegen" "$(post "$BASE" "${F[@]}" --data-urlencode anliegen=Hack)" 400
expect "foreign origin" "$(post https://evil.example "${F[@]}" --data-urlencode 'anliegen=Gründung')" 403
exit $fail
