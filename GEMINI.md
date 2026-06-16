# Kanemori Maintenance Guide

This project was renamed from FinanceTracker to **Kanemori** and optimized for long-term stability.

## Project Structure
- `src/`: Next.js 16 source code (App Router).
- `data/`: SQLite database (`finance.db`) and version tracking.
- `scripts/`: Control scripts and startup logic.
- `logs/`: Application logs.

## Reliability Features
- **Auto-Rebuild:** The startup script (`scripts/open-finance-tracker.sh`) automatically detects Node.js version changes and rebuilds the `better-sqlite3` native module.
- **Robust DB:** Uses SQLite WAL mode for crash resistance and concurrent access.
- **Error Handling:** Centralized `safeHandler` in `src/lib/api-handler.ts` prevents the server from crashing on database or native module errors.
- **Global DB Instance:** Uses `globalThis` to maintain the DB connection during development (HMR), preventing "too many open files" or locking issues.

## Common Tasks

### 1. Manual Rebuild
If the app shows a "Native module error" or fails to start after a system update:
```bash
cd /home/rasaaa/Projects/kanemori
npm rebuild better-sqlite3
npm run build
```

### 2. Backup Database
The database is located at `data/finance.db`. You can simply copy this file.
Alternatively, use the **Export** feature in the app settings.

### 3. Reset App
If you need to clear all data and start fresh:
1. Stop the app.
2. Delete `data/finance.db`.
3. Start the app. It will auto-seed default categories.

## Desktop Integration
The project includes `.desktop` files in `~/Desktop` for easy control:
- **Kanemori**: Starts the server and opens the app in a browser.
- **Kanemori Control**: A small GUI to check status, start, or stop the server.
- **Stop Kanemori**: Stops the local server.

## Stability Notes
- **Next.js Version:** Currently using Next.js 16.
- **Node.js:** Ensure you are using a stable Node.js version. If you change versions, the app will auto-rebuild on next launch via `open-finance-tracker.sh`.
