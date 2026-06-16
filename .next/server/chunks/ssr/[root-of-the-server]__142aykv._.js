module.exports=[85148,(a,b,c)=>{b.exports=a.x("better-sqlite3-90e2652d1716b047",()=>require("better-sqlite3-90e2652d1716b047"))},22734,(a,b,c)=>{b.exports=a.x("fs",()=>require("fs"))},75124,a=>{"use strict";a.s(["default",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/src/components/layout/Sidebar.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/src/components/layout/Sidebar.tsx <module evaluation>","default")},85065,a=>{"use strict";a.s(["default",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/src/components/layout/Sidebar.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/src/components/layout/Sidebar.tsx","default")},73388,a=>{"use strict";a.i(75124);var b=a.i(85065);a.n(b)},27572,a=>{"use strict";var b=a.i(7997),c=a.i(73388),d=a.i(85148),e=a.i(14747),f=a.i(22734);let g=e.default.join(process.cwd(),"data"),h=e.default.join(g,"finance.db");async function i(){let a="Kanemori";try{let b=(function(){if(globalThis.__db)try{return globalThis.__db.prepare("SELECT 1").get(),globalThis.__db}catch{try{globalThis.__db.close()}catch{}globalThis.__db=void 0}f.default.existsSync(g)||f.default.mkdirSync(g,{recursive:!0});let a=new d.default(h);return a.pragma("journal_mode = WAL"),a.pragma("foreign_keys = ON"),a.pragma("busy_timeout = 5000"),a.pragma("wal_autocheckpoint = 1000"),a.pragma("auto_vacuum = INCREMENTAL"),a.pragma("cache_size = -8000"),a.pragma("synchronous = NORMAL"),a.exec(`
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
  `),function(a){if(a.prepare("SELECT COUNT(*) as count FROM categories").get().count>0)return;let b=a.prepare("INSERT INTO categories (name, type, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)"),c=[["Food & Dining","expense","🍽️","#F97316",1],["Drinks & Snacks","expense","🧋","#FB923C",2],["Groceries","expense","🛒","#84CC16",3],["Transportation","expense","🚌","#3B82F6",4],["Shopping","expense","🛍️","#EC4899",5],["Bills & Utilities","expense","📄","#8B5CF6",6],["Subscriptions","expense","🔄","#A855F7",7],["Entertainment","expense","🎮","#F43F5E",8],["Education","expense","📚","#0EA5E9",9],["Health & Fitness","expense","💊","#10B981",10],["Housing","expense","🏠","#6366F1",11],["Personal Care","expense","✨","#D946EF",12],["Donations","expense","❤️","#F87171",13],["Top Up","expense","📱","#14B8A6",14],["Administrative Fees","expense","📋","#94A3B8",15],["Emergency","expense","🚨","#EF4444",16],["Investment","expense","📈","#059669",17],["Other","expense","📦","#64748B",18]],d=[["Salary","income","💰","#10B981",1],["Freelance","income","💻","#3B82F6",2],["Gift","income","🎁","#EC4899",3],["Refund","income","↩️","#F59E0B",4],["Bonus","income","🎉","#8B5CF6",5],["Side Income","income","📊","#14B8A6",6],["Other Income","income","📥","#64748B",7]];a.transaction(()=>{for(let a of c)b.run(...a);for(let a of d)b.run(...a)})();let e=a.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");e.run("admin_fee_as_expense","true"),e.run("default_account_id",""),e.run("app_name","Kanemori"),e.run("hide_all_balances","false")}(a),globalThis.__db=a,a})().prepare("SELECT value FROM settings WHERE key = 'app_name'").get();b?.value&&(a=b.value)}catch{}return{title:`${a} — Personal Finance Tracker`,description:"Track your finances, monitor spending, and achieve your financial goals."}}a.s(["default",0,function({children:a}){return(0,b.jsx)("html",{lang:"en",suppressHydrationWarning:!0,children:(0,b.jsx)("body",{suppressHydrationWarning:!0,children:(0,b.jsxs)("div",{className:"app-layout",children:[(0,b.jsx)(c.default,{}),(0,b.jsx)("main",{className:"main-area",children:(0,b.jsx)("div",{className:"page-content",children:a})})]})})})},"generateMetadata",0,i],27572)},50645,a=>{a.n(a.i(27572))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__142aykv._.js.map