#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$APP_DIR/logs"
PID_FILE="$LOG_DIR/kanemori.pid"
PORT=3000

if [ -f "$PID_FILE" ]; then
  PID="$(cat "$PID_FILE")"
  if kill -0 "$PID" 2>/dev/null; then
    kill "$PID" 2>/dev/null || true
  fi
  rm -f "$PID_FILE"
fi

pkill -f "$APP_DIR/node_modules/.bin/next start" 2>/dev/null || true
pkill -f "next-server.*$APP_DIR" 2>/dev/null || true

PORT_PIDS="$(ss -ltnp 2>/dev/null | awk -v port=":$PORT" '$4 ~ port { if (match($0, /pid=[0-9]+/)) print substr($0, RSTART + 4, RLENGTH - 4) }' | sort -u)"
if [ -n "$PORT_PIDS" ]; then
  kill $PORT_PIDS 2>/dev/null || true
fi
