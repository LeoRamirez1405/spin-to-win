#!/usr/bin/env bash
set -euo pipefail

# Usage: ./create_github_repo.sh [repo-name] [github-username]
REPO_NAME=${1:-spin-to-win}
GH_USER=${2:-LeoRamirez1405}
FULL="$GH_USER/$REPO_NAME"

if command -v gh >/dev/null 2>&1; then
  if ! gh auth status >/dev/null 2>&1; then
    echo "gh CLI not authenticated. Run: gh auth login"
    exit 1
  fi
  echo "Creating repo using gh: $FULL"
  gh repo create "$FULL" --public --source=. --remote=origin --push
  echo "Repository created and pushed: https://github.com/$FULL"
  exit 0
fi

if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "gh CLI not found and GITHUB_TOKEN not set. Install gh or export GITHUB_TOKEN." >&2
  exit 1
fi

echo "Creating repo via GitHub API: $FULL"
curl -s -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github.v3+json" \
  -d "{\"name\": \"$REPO_NAME\", \"private\": false}" \
  https://api.github.com/user/repos

REMOTE_URL="https://github.com/$FULL.git"
git remote add origin "$REMOTE_URL" 2>/dev/null || true
git branch -M main
git push -u origin main
echo "Repository created and pushed: $REMOTE_URL"
