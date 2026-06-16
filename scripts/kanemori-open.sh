#!/usr/bin/env bash
# ============================================================
# Kanemori Finance Tracker — Smart Startup Script
# ============================================================
# Features:
# - Auto-detects Node.js version changes & rebuilds native modules
# - Auto-rebuilds .next cache when needed
# - Health check with retry logic
# - Graceful error handling
# ============================================================
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$APP_DIR/logs"
PID_FILE="$LOG_DIR/kanemori.pid"
NODE_VERSION_FILE="$APP_DIR/data/.node-version"
URL="http://127.0.0.1:3000"
NPM_BIN="$(command -v npm || echo /usr/bin/npm)"
OPEN_BIN="$(command -v xdg-open || echo /usr/bin/xdg-open)"
CURL_BIN="$(command -v curl || echo /usr/bin/curl)"
NODE_BIN="$(command -v node || echo /usr/bin/node)"

mkdir -p "$LOG_DIR"
mkdir -p "$APP_DIR/data"
cd "$APP_DIR"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_DIR/app.log"
}

is_up() {
  "$CURL_BIN" -fsS "$URL/api/test" >/dev/null 2>&1
}

# ============================================================
# 1. Check if Node.js version changed → rebuild native modules
# ============================================================
CURRENT_NODE_VERSION="$("$NODE_BIN" -v)"

if [ -f "$NODE_VERSION_FILE" ]; then
  SAVED_NODE_VERSION="$(cat "$NODE_VERSION_FILE")"
  if [ "$CURRENT_NODE_VERSION" != "$SAVED_NODE_VERSION" ]; then
    log "Node.js version changed: $SAVED_NODE_VERSION → $CURRENT_NODE_VERSION"
    log "Rebuilding native modules (better-sqlite3)..."
    "$NPM_BIN" rebuild better-sqlite3 >> "$LOG_DIR/app.log" 2>&1 || true
    # Force rebuild of .next cache since native modules changed
    rm -rf "$APP_DIR/.next"
    log "Native modules rebuilt successfully"
  fi
else
  log "First run — recording Node.js version: $CURRENT_NODE_VERSION"
fi

# Save current Node.js version
echo "$CURRENT_NODE_VERSION" > "$NODE_VERSION_FILE"

# ============================================================
# 2. Quick native module sanity check
# ============================================================
if ! "$NODE_BIN" -e "require('better-sqlite3')" 2>/dev/null; then
  log "better-sqlite3 native module is broken — rebuilding..."
  "$NPM_BIN" rebuild better-sqlite3 >> "$LOG_DIR/app.log" 2>&1 || {
    log "FATAL: Cannot rebuild better-sqlite3. Run: cd $APP_DIR && npm rebuild better-sqlite3"
    # Try to open browser anyway to show error
    "$OPEN_BIN" "$URL" >/dev/null 2>&1 &
    exit 1
  }
  rm -rf "$APP_DIR/.next"
  log "Native module rebuilt successfully"
fi

# ============================================================
# 3. Start server if not already running
# ============================================================
if ! is_up; then
  # Kill any stale processes on port 3000
  fuser -k 3000/tcp 2>/dev/null || true
  sleep 0.5

  # Build if needed
  if [ ! -f "$APP_DIR/.next/BUILD_ID" ]; then
    log "Building production bundle..."
    "$NPM_BIN" run build >> "$LOG_DIR/app.log" 2>&1
    log "Build complete"
  fi

  # Start the server
  log "Starting Kanemori server (Node $CURRENT_NODE_VERSION)..."
  nohup "$NPM_BIN" run start >> "$LOG_DIR/app.log" 2>&1 &
  echo $! > "$PID_FILE"

  # Wait for server to be ready (up to 30 seconds)
  for i in $(seq 1 30); do
    if is_up; then
      log "Server is ready (took ${i}s)"
      break
    fi
    if [ "$i" -eq 30 ]; then
      log "WARNING: Server did not start within 30 seconds"
    fi
    sleep 1
  done
fi

# ============================================================
# 4. Open in browser
# ============================================================
"$OPEN_BIN" "$URL" >/dev/null 2>&1 &
