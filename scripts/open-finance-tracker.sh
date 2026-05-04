#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$HOME/Projects/FinanceTracker/V1"
LOG_DIR="$APP_DIR/logs"
PID_FILE="$LOG_DIR/finance-tracker.pid"
URL="http://127.0.0.1:3000"
NPM_BIN="/usr/bin/npm"
OPEN_BIN="/usr/bin/xdg-open"
CURL_BIN="/usr/bin/curl"

mkdir -p "$LOG_DIR"
cd "$APP_DIR"

is_up() {
  "$CURL_BIN" -fsS "$URL" >/dev/null 2>&1
}

if ! is_up; then
  if [ ! -f "$APP_DIR/.next/BUILD_ID" ]; then
    "$NPM_BIN" run build >>"$LOG_DIR/app.log" 2>&1
  fi

  nohup "$NPM_BIN" run start >>"$LOG_DIR/app.log" 2>&1 &
  echo $! > "$PID_FILE"

  for _ in $(seq 1 30); do
    if is_up; then
      break
    fi
    sleep 1
  done
fi

"$OPEN_BIN" "$URL" >/dev/null 2>&1 &
