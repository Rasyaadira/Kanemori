module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[project]/src/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkpointForBackup",
    ()=>checkpointForBackup,
    "getDb",
    ()=>getDb,
    "invalidateDbConnection",
    ()=>invalidateDbConnection
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$better$2d$sqlite3__$5b$external$5d$__$28$better$2d$sqlite3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$better$2d$sqlite3$29$__ = __turbopack_context__.i("[externals]/better-sqlite3 [external] (better-sqlite3, cjs, [project]/node_modules/better-sqlite3)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
;
;
;
const DB_DIR = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'data');
const DB_PATH = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(DB_DIR, 'finance.db');
function getDb() {
    if (globalThis.__db) {
        try {
            globalThis.__db.prepare('SELECT 1').get();
            return globalThis.__db;
        } catch  {
            try {
                globalThis.__db.close();
            } catch  {}
            globalThis.__db = undefined;
        }
    }
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(DB_DIR)) {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(DB_DIR, {
            recursive: true
        });
    }
    const newDb = new __TURBOPACK__imported__module__$5b$externals$5d2f$better$2d$sqlite3__$5b$external$5d$__$28$better$2d$sqlite3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$better$2d$sqlite3$29$__["default"](DB_PATH);
    // === PRAGMA: Stability & Performance ===
    newDb.pragma('journal_mode = WAL');
    newDb.pragma('foreign_keys = ON');
    newDb.pragma('busy_timeout = 5000');
    newDb.pragma('wal_autocheckpoint = 1000');
    newDb.pragma('auto_vacuum = INCREMENTAL');
    newDb.pragma('cache_size = -8000');
    newDb.pragma('synchronous = NORMAL');
    initTables(newDb);
    seedData(newDb);
    globalThis.__db = newDb;
    return newDb;
}
function invalidateDbConnection() {
    if (globalThis.__db) {
        try {
            // Checkpoint WAL before closing to ensure all data is flushed
            globalThis.__db.pragma('wal_checkpoint(TRUNCATE)');
            globalThis.__db.close();
        } catch  {}
        globalThis.__db = undefined;
    }
}
function checkpointForBackup() {
    const conn = getDb();
    // Force all WAL data into the main DB file so backup gets complete data
    conn.pragma('wal_checkpoint(TRUNCATE)');
    return DB_PATH;
}
function initTables(db) {
    db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      balance INTEGER NOT NULL DEFAULT 0,
      hide_balance INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      parent_id INTEGER REFERENCES categories(id),
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      amount INTEGER NOT NULL,
      admin_fee INTEGER DEFAULT 0,
      from_account_id INTEGER REFERENCES accounts(id),
      to_account_id INTEGER REFERENCES accounts(id),
      category_id INTEGER REFERENCES categories(id),
      notes TEXT,
      location TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL REFERENCES categories(id),
      month TEXT NOT NULL,
      amount INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(category_id, month)
    );

    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      target_amount INTEGER NOT NULL,
      funded_amount INTEGER NOT NULL DEFAULT 0,
      deadline TEXT,
      icon TEXT,
      color TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS goal_fundings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goal_id INTEGER NOT NULL REFERENCES goals(id),
      account_id INTEGER REFERENCES accounts(id),
      amount INTEGER NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS debts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      person_name TEXT NOT NULL,
      origin_type TEXT NOT NULL DEFAULT 'manual_entry',
      start_date TEXT NOT NULL,
      due_date TEXT,
      total_amount INTEGER NOT NULL,
      paid_amount INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS debt_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      debt_id INTEGER NOT NULL REFERENCES debts(id),
      account_id INTEGER NOT NULL REFERENCES accounts(id),
      amount INTEGER NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}
function seedData(db) {
    const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
    if (categoryCount.count > 0) return;
    const insertCategory = db.prepare('INSERT INTO categories (name, type, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)');
    const expenseCategories = [
        [
            'Food & Dining',
            'expense',
            '🍽️',
            '#F97316',
            1
        ],
        [
            'Drinks & Snacks',
            'expense',
            '🧋',
            '#FB923C',
            2
        ],
        [
            'Groceries',
            'expense',
            '🛒',
            '#84CC16',
            3
        ],
        [
            'Transportation',
            'expense',
            '🚌',
            '#3B82F6',
            4
        ],
        [
            'Shopping',
            'expense',
            '🛍️',
            '#EC4899',
            5
        ],
        [
            'Bills & Utilities',
            'expense',
            '📄',
            '#8B5CF6',
            6
        ],
        [
            'Subscriptions',
            'expense',
            '🔄',
            '#A855F7',
            7
        ],
        [
            'Entertainment',
            'expense',
            '🎮',
            '#F43F5E',
            8
        ],
        [
            'Education',
            'expense',
            '📚',
            '#0EA5E9',
            9
        ],
        [
            'Health & Fitness',
            'expense',
            '💊',
            '#10B981',
            10
        ],
        [
            'Housing',
            'expense',
            '🏠',
            '#6366F1',
            11
        ],
        [
            'Personal Care',
            'expense',
            '✨',
            '#D946EF',
            12
        ],
        [
            'Donations',
            'expense',
            '❤️',
            '#F87171',
            13
        ],
        [
            'Top Up',
            'expense',
            '📱',
            '#14B8A6',
            14
        ],
        [
            'Administrative Fees',
            'expense',
            '📋',
            '#94A3B8',
            15
        ],
        [
            'Emergency',
            'expense',
            '🚨',
            '#EF4444',
            16
        ],
        [
            'Investment',
            'expense',
            '📈',
            '#059669',
            17
        ],
        [
            'Other',
            'expense',
            '📦',
            '#64748B',
            18
        ]
    ];
    const incomeCategories = [
        [
            'Salary',
            'income',
            '💰',
            '#10B981',
            1
        ],
        [
            'Freelance',
            'income',
            '💻',
            '#3B82F6',
            2
        ],
        [
            'Gift',
            'income',
            '🎁',
            '#EC4899',
            3
        ],
        [
            'Refund',
            'income',
            '↩️',
            '#F59E0B',
            4
        ],
        [
            'Bonus',
            'income',
            '🎉',
            '#8B5CF6',
            5
        ],
        [
            'Side Income',
            'income',
            '📊',
            '#14B8A6',
            6
        ],
        [
            'Other Income',
            'income',
            '📥',
            '#64748B',
            7
        ]
    ];
    const insertMany = db.transaction(()=>{
        for (const cat of expenseCategories){
            insertCategory.run(...cat);
        }
        for (const cat of incomeCategories){
            insertCategory.run(...cat);
        }
    });
    insertMany();
    // Seed default settings
    const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
    insertSetting.run('admin_fee_as_expense', 'true');
    insertSetting.run('default_account_id', '');
    insertSetting.run('app_name', 'Kanemori');
    insertSetting.run('hide_all_balances', 'false');
}
}),
"[project]/src/lib/api-handler.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "safeHandler",
    ()=>safeHandler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
function safeHandler(handler) {
    return async (...args)=>{
        try {
            return await handler(...args);
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            const message = err.message || 'Internal server error';
            const code = err.code;
            // Log full stack for debugging
            console.error(`[API Error] ${message}`, err.stack || '');
            // Determine appropriate status code and user-friendly message
            if (code === 'ERR_DLOPEN_FAILED') {
                // Native module issue (better-sqlite3 needs rebuild)
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Database engine needs to be recompiled. Please run: npm rebuild better-sqlite3',
                    code: 'NATIVE_MODULE_ERROR'
                }, {
                    status: 503
                });
            }
            if (message.includes('database is locked') || message.includes('SQLITE_BUSY')) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Database is busy, please try again',
                    code: 'DB_BUSY'
                }, {
                    status: 503
                });
            }
            if (message.includes('database disk image is malformed') || message.includes('SQLITE_CORRUPT')) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Database may be corrupted. Please restore from backup.',
                    code: 'DB_CORRUPT'
                }, {
                    status: 500
                });
            }
            if (message.includes('Not found')) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Not found'
                }, {
                    status: 404
                });
            }
            // Generic error
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Something went wrong. Please try again.'
            }, {
                status: 500
            });
        }
    };
}
}),
"[project]/src/app/api/dashboard/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-handler.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$eachDayOfInterval$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/eachDayOfInterval.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$endOfMonth$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/endOfMonth.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/date-fns/format.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$parseISO$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/parseISO.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$startOfMonth$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/startOfMonth.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$subMonths$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/subMonths.mjs [app-route] (ecmascript)");
;
;
;
;
/**
 * Validates and normalizes a month string.
 * Returns a valid 'YYYY-MM' string or the current month as fallback.
 */ function safeMonth(param) {
    if (!param) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(new Date(), 'yyyy-MM');
    // Must match YYYY-MM format
    if (!/^\d{4}-\d{2}$/.test(param)) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(new Date(), 'yyyy-MM');
    const [yearStr, monthStr] = param.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    // Validate ranges — support far-future use
    if (year < 2000 || year > 2099) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(new Date(), 'yyyy-MM');
    if (month < 1 || month > 12) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(new Date(), 'yyyy-MM');
    return param;
}
const GET = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safeHandler"])(async (request)=>{
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDb"])();
    const { searchParams } = new URL(request.url);
    const currentMonth = safeMonth(searchParams.get('month'));
    const settingsRows = db.prepare('SELECT key, value FROM settings').all();
    const settings = Object.fromEntries(settingsRows.map((row)=>[
            row.key,
            row.value
        ]));
    const countAdminFeeAsExpense = settings.admin_fee_as_expense !== 'false';
    const hideAllBalances = settings.hide_all_balances === 'true';
    // Parse month for previous month calculation
    const monthDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$parseISO$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseISO"])(`${currentMonth}-01`);
    const prevMonth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$subMonths$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["subMonths"])(monthDate, 1), 'yyyy-MM');
    // Total balance (sum of all active accounts — always current, not filtered by month)
    const totalBalance = db.prepare(`SELECT COALESCE(SUM(balance), 0) as total FROM accounts WHERE is_active = 1`).get();
    // This month income
    const monthIncome = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
     WHERE type = 'income' AND strftime('%Y-%m', date) = ?`).get(currentMonth);
    // This month expense
    const monthExpense = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
     WHERE type = 'expense' AND strftime('%Y-%m', date) = ?`).get(currentMonth);
    // Admin fees as expense (from transfers this month)
    const monthAdminFees = countAdminFeeAsExpense ? db.prepare(`SELECT COALESCE(SUM(admin_fee), 0) as total FROM transactions 
     WHERE type = 'transfer' AND admin_fee > 0 AND strftime('%Y-%m', date) = ?`).get(currentMonth) : {
        total: 0
    };
    // Cash flow per day for selected month
    const cashFlow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$eachDayOfInterval$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eachDayOfInterval"])({
        start: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$startOfMonth$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["startOfMonth"])(monthDate),
        end: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$endOfMonth$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["endOfMonth"])(monthDate)
    }).map((day)=>{
        const dayKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(day, 'yyyy-MM-dd');
        const inc = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
       WHERE type = 'income' AND date = ?`).get(dayKey);
        const exp = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
       WHERE type = 'expense' AND date = ?`).get(dayKey);
        const fee = countAdminFeeAsExpense ? db.prepare(`SELECT COALESCE(SUM(admin_fee), 0) as total FROM transactions
       WHERE type = 'transfer' AND admin_fee > 0 AND date = ?`).get(dayKey) : {
            total: 0
        };
        return {
            day: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(day, 'd'),
            income: inc.total,
            expense: exp.total + fee.total
        };
    });
    // Spending by category (selected month)
    const spendingByCategory = db.prepare(`SELECT c.name, c.color, c.icon, COALESCE(SUM(t.amount), 0) as total
     FROM transactions t
     JOIN categories c ON t.category_id = c.id
     WHERE t.type = 'expense' AND strftime('%Y-%m', t.date) = ?
     GROUP BY c.id
     ORDER BY total DESC
     LIMIT 6`).all(currentMonth);
    // Budget progress (selected month)
    const budgets = db.prepare(`SELECT b.id, b.amount as budget_amount, c.name, c.color, c.icon,
            COALESCE((SELECT SUM(t.amount) FROM transactions t 
             WHERE t.type = 'expense' AND t.category_id = b.category_id 
             AND strftime('%Y-%m', t.date) = b.month), 0) as spent
     FROM budgets b
     JOIN categories c ON b.category_id = c.id
     WHERE b.month = ?
     ORDER BY spent DESC
     LIMIT 5`).all(currentMonth);
    // Goals progress (active goals — not month-filtered)
    const goals = db.prepare(`SELECT id, name, target_amount, funded_amount, deadline, icon, color, status
     FROM goals WHERE status = 'active' ORDER BY created_at DESC LIMIT 4`).all();
    // Recent transactions (selected month)
    const recentTransactions = db.prepare(`SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color,
            fa.name as from_account_name, ta.name as to_account_name
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     LEFT JOIN accounts fa ON t.from_account_id = fa.id
     LEFT JOIN accounts ta ON t.to_account_id = ta.id
     WHERE strftime('%Y-%m', t.date) = ?
     ORDER BY t.date DESC, t.created_at DESC
     LIMIT 6`).all(currentMonth);
    // Last month totals for trend
    const lastMonthExpense = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
     WHERE type = 'expense' AND strftime('%Y-%m', date) = ?`).get(prevMonth);
    const lastMonthIncome = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
     WHERE type = 'income' AND strftime('%Y-%m', date) = ?`).get(prevMonth);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        totalBalance: totalBalance.total,
        monthIncome: monthIncome.total,
        monthExpense: monthExpense.total + monthAdminFees.total,
        cashflowHealth: monthIncome.total - (monthExpense.total + monthAdminFees.total),
        lastMonthExpense: lastMonthExpense.total,
        lastMonthIncome: lastMonthIncome.total,
        cashFlow,
        spendingByCategory,
        budgets,
        goals,
        recentTransactions,
        hideAllBalances
    });
});
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__19q1_ht._.js.map