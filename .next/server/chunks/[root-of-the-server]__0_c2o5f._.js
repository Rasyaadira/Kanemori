module.exports=[93695,(e,t,T)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},14747,(e,t,T)=>{t.exports=e.x("path",()=>require("path"))},18622,(e,t,T)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,T)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,T)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,T)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,T)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},85148,(e,t,T)=>{t.exports=e.x("better-sqlite3-90e2652d1716b047",()=>require("better-sqlite3-90e2652d1716b047"))},22734,(e,t,T)=>{t.exports=e.x("fs",()=>require("fs"))},43793,32393,e=>{"use strict";var t=e.i(85148),T=e.i(14747),a=e.i(22734);let E=T.default.join(process.cwd(),"data"),r=T.default.join(E,"finance.db");function n(){if(globalThis.__db)try{return globalThis.__db.prepare("SELECT 1").get(),globalThis.__db}catch{try{globalThis.__db.close()}catch{}globalThis.__db=void 0}a.default.existsSync(E)||a.default.mkdirSync(E,{recursive:!0});let e=new t.default(r);return e.pragma("journal_mode = WAL"),e.pragma("foreign_keys = ON"),e.pragma("busy_timeout = 5000"),e.pragma("wal_autocheckpoint = 1000"),e.pragma("auto_vacuum = INCREMENTAL"),e.pragma("cache_size = -8000"),e.pragma("synchronous = NORMAL"),e.exec(`
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
  `),function(e){if(e.prepare("SELECT COUNT(*) as count FROM categories").get().count>0)return;let t=e.prepare("INSERT INTO categories (name, type, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)"),T=[["Food & Dining","expense","🍽️","#F97316",1],["Drinks & Snacks","expense","🧋","#FB923C",2],["Groceries","expense","🛒","#84CC16",3],["Transportation","expense","🚌","#3B82F6",4],["Shopping","expense","🛍️","#EC4899",5],["Bills & Utilities","expense","📄","#8B5CF6",6],["Subscriptions","expense","🔄","#A855F7",7],["Entertainment","expense","🎮","#F43F5E",8],["Education","expense","📚","#0EA5E9",9],["Health & Fitness","expense","💊","#10B981",10],["Housing","expense","🏠","#6366F1",11],["Personal Care","expense","✨","#D946EF",12],["Donations","expense","❤️","#F87171",13],["Top Up","expense","📱","#14B8A6",14],["Administrative Fees","expense","📋","#94A3B8",15],["Emergency","expense","🚨","#EF4444",16],["Investment","expense","📈","#059669",17],["Other","expense","📦","#64748B",18]],a=[["Salary","income","💰","#10B981",1],["Freelance","income","💻","#3B82F6",2],["Gift","income","🎁","#EC4899",3],["Refund","income","↩️","#F59E0B",4],["Bonus","income","🎉","#8B5CF6",5],["Side Income","income","📊","#14B8A6",6],["Other Income","income","📥","#64748B",7]];e.transaction(()=>{for(let e of T)t.run(...e);for(let e of a)t.run(...e)})();let E=e.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");E.run("admin_fee_as_expense","true"),E.run("default_account_id",""),E.run("app_name","Kanemori"),E.run("hide_all_balances","false")}(e),globalThis.__db=e,e}e.s(["checkpointForBackup",0,function(){return n().pragma("wal_checkpoint(TRUNCATE)"),r},"getDb",0,n,"invalidateDbConnection",0,function(){if(globalThis.__db){try{globalThis.__db.pragma("wal_checkpoint(TRUNCATE)"),globalThis.__db.close()}catch{}globalThis.__db=void 0}}],43793);var s=e.i(89171);e.s(["safeHandler",0,function(e){return async(...t)=>{try{return await e(...t)}catch(a){let e=a instanceof Error?a:Error(String(a)),t=e.message||"Internal server error",T=e.code;if(console.error(`[API Error] ${t}`,e.stack||""),"ERR_DLOPEN_FAILED"===T)return s.NextResponse.json({error:"Database engine needs to be recompiled. Please run: npm rebuild better-sqlite3",code:"NATIVE_MODULE_ERROR"},{status:503});if(t.includes("database is locked")||t.includes("SQLITE_BUSY"))return s.NextResponse.json({error:"Database is busy, please try again",code:"DB_BUSY"},{status:503});if(t.includes("database disk image is malformed")||t.includes("SQLITE_CORRUPT"))return s.NextResponse.json({error:"Database may be corrupted. Please restore from backup.",code:"DB_CORRUPT"},{status:500});if(t.includes("Not found"))return s.NextResponse.json({error:"Not found"},{status:404});return s.NextResponse.json({error:"Something went wrong. Please try again."},{status:500})}}}],32393)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0_c2o5f._.js.map