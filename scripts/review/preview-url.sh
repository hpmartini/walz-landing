#!/usr/bin/env bash
# Waits for the Vercel preview of a commit (GitHub deployment status) and prints its URL.
# Usage: scripts/review/preview-url.sh <sha> [timeout-seconds]
set -euo pipefail
SHA="$(git rev-parse "$1")"; LIMIT="${2:-600}"; REPO=hpmartini/walz-landing
for ((t = 0; t < LIMIT; t += 15)); do
  id="$(gh api "repos/$REPO/deployments?sha=$SHA" --jq '.[0].id // empty')"
  if [[ -n "$id" ]]; then
    read -r state url <<<"$(gh api "repos/$REPO/deployments/$id/statuses" --jq '.[0] | "\(.state) \(.environment_url // "")"')"
    case "$state" in
      success) echo "$url"; exit 0 ;;
      failure|error) echo "deployment $state for $SHA" >&2; exit 1 ;;
    esac
  fi
  sleep 15
done
echo "timeout waiting for preview of $SHA" >&2; exit 1
