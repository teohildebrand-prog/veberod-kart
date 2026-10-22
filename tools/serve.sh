#!/usr/bin/env bash
# Serve the game on http://localhost:${PORT:-8000}/ (index.html also opens straight from disk).
set -euo pipefail
cd "$(dirname "$0")/.."
exec python3 -m http.server "${PORT:-8000}" --bind 127.0.0.1
