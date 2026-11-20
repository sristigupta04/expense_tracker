#!/bin/bash
set -e

cd /b/project_folders/expense-tracker/expense_tracker

test -f ../expense_tracker-before-cleanup.bundle
test "$(git branch --show-current)" = "main"

REMOTE_URL=$(git remote get-url origin)
REMOTE_SHA=$(git ls-remote origin refs/heads/main | cut -f1)
test -n "$REMOTE_SHA"

if [ -f backend-audit.txt ]; then
  mv backend-audit.txt ../backend-audit.txt
fi

trap 'if [ -f ../backend-audit.txt ]; then mv ../backend-audit.txt backend-audit.txt; fi' EXIT

grep -qxF '*.zip' .gitignore || echo '*.zip' >> .gitignore
grep -qxF 'node_modules/' .gitignore || echo 'node_modules/' >> .gitignore

git add .gitignore
git commit -m "chore: ignore archives and dependencies" || true

# Run git-filter-repo through the Python launcher
py -3.14 -m git_filter_repo \
  --force \
  --path-glob '*.zip' \
  --path-glob '**/*.zip' \
  --path-glob 'node_modules/**' \
  --path-glob '**/node_modules/**' \
  --invert-paths

git remote add origin "$REMOTE_URL"

if git rev-list --objects --all | grep -E '(\.zip$|node_modules/)'; then
  echo "ERROR: Large files remain in history"
  exit 1
fi

git push origin main --force-with-lease=refs/heads/main:$REMOTE_SHA

echo "CLEANUP AND PUSH FINISHED"
git status -sb