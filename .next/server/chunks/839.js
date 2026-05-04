exports.id=839,exports.ids=[839],exports.modules={11572:(a,b,c)=>{Promise.resolve().then(c.t.bind(c,54160,23)),Promise.resolve().then(c.t.bind(c,31603,23)),Promise.resolve().then(c.t.bind(c,68495,23)),Promise.resolve().then(c.t.bind(c,75170,23)),Promise.resolve().then(c.t.bind(c,77526,23)),Promise.resolve().then(c.t.bind(c,78922,23)),Promise.resolve().then(c.t.bind(c,29234,23)),Promise.resolve().then(c.t.bind(c,12263,23)),Promise.resolve().then(c.bind(c,82146))},17703:(a,b,c)=>{Promise.resolve().then(c.bind(c,22348))},22348:(a,b,c)=>{"use strict";c.d(b,{default:()=>d});let d=(0,c(97954).registerClientReference)(function(){throw Error("Attempted to call the default export of \"/home/rasaaa/Projects/FinanceTracker/V1/src/components/layout/Sidebar.tsx\" from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/home/rasaaa/Projects/FinanceTracker/V1/src/components/layout/Sidebar.tsx","default")},35552:(a,b,c)=>{"use strict";c.d(b,{L:()=>m});var d=c(87550),e=c.n(d),f=c(33873),g=c.n(f),h=c(29021),i=c.n(h);let j=g().join(process.cwd(),"data"),k=g().join(j,"finance.db"),l=null;function m(){if(l)try{return l.prepare("SELECT 1").get(),l}catch{try{l.close()}catch{}l=null}return i().existsSync(j)||i().mkdirSync(j,{recursive:!0}),(l=new(e())(k)).pragma("journal_mode = WAL"),l.pragma("foreign_keys = ON"),l.exec(`
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
  `),function(a){if(a.prepare("SELECT COUNT(*) as count FROM categories").get().count>0)return;let b=a.prepare("INSERT INTO categories (name, type, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)"),c=[["Food & Dining","expense","\uD83C\uDF7D️","#F97316",1],["Drinks & Snacks","expense","\uD83E\uDDCB","#FB923C",2],["Groceries","expense","\uD83D\uDED2","#84CC16",3],["Transportation","expense","\uD83D\uDE8C","#3B82F6",4],["Shopping","expense","\uD83D\uDECD️","#EC4899",5],["Bills & Utilities","expense","\uD83D\uDCC4","#8B5CF6",6],["Subscriptions","expense","\uD83D\uDD04","#A855F7",7],["Entertainment","expense","\uD83C\uDFAE","#F43F5E",8],["Education","expense","\uD83D\uDCDA","#0EA5E9",9],["Health & Fitness","expense","\uD83D\uDC8A","#10B981",10],["Housing","expense","\uD83C\uDFE0","#6366F1",11],["Personal Care","expense","✨","#D946EF",12],["Donations","expense","❤️","#F87171",13],["Top Up","expense","\uD83D\uDCF1","#14B8A6",14],["Administrative Fees","expense","\uD83D\uDCCB","#94A3B8",15],["Emergency","expense","\uD83D\uDEA8","#EF4444",16],["Investment","expense","\uD83D\uDCC8","#059669",17],["Other","expense","\uD83D\uDCE6","#64748B",18]],d=[["Salary","income","\uD83D\uDCB0","#10B981",1],["Freelance","income","\uD83D\uDCBB","#3B82F6",2],["Gift","income","\uD83C\uDF81","#EC4899",3],["Refund","income","↩️","#F59E0B",4],["Bonus","income","\uD83C\uDF89","#8B5CF6",5],["Side Income","income","\uD83D\uDCCA","#14B8A6",6],["Other Income","income","\uD83D\uDCE5","#64748B",7]];a.transaction(()=>{for(let a of c)b.run(...a);for(let a of d)b.run(...a)})();let e=a.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");e.run("admin_fee_as_expense","true"),e.run("default_account_id",""),e.run("app_name","Kanemori"),e.run("hide_all_balances","false")}(l),l}},35692:()=>{},44943:(a,b,c)=>{"use strict";c.d(b,{AV:()=>i,Ew:()=>j,Ow:()=>m,U9:()=>g,UL:()=>k,Yq:()=>h,hm:()=>p,lc:()=>q,o1:()=>l,sy:()=>o,t2:()=>n,vv:()=>f});var d=c(21222),e=c(25054);function f(a){let b=Math.abs(a).toString().replace(/\B(?=(\d{3})+(?!\d))/g,".");return a<0?`-Rp ${b}`:`Rp ${b}`}function g(a){let b=Math.abs(a).toString().replace(/\B(?=(\d{3})+(?!\d))/g,".");return a>0?`+Rp ${b}`:a<0?`-Rp ${b}`:"Rp 0"}function h(a){try{return(0,d.GP)((0,e.H)(a),"MMM dd, yyyy")}catch{return a}}function i(){return(0,d.GP)(new Date,"yyyy-MM-dd")}function j(){return(0,d.GP)(new Date,"yyyy-MM")}function k(a){try{return(0,d.GP)((0,e.H)(`${a}-01`),"MMMM yyyy")}catch{return a}}function l(a,b,c=100){return b<=0?0:Math.min(Math.round(a/b*100),c)}function m(a,b){if(b<=0)return"healthy";let c=a/b;return c>1?"exceeded":c>.75?"warning":"healthy"}let n={expense:{label:"Expense",color:"#F87171"},income:{label:"Income",color:"#10B981"},transfer:{label:"Transfer",color:"#2853FF"}},o=[{value:"bank",label:"Bank"},{value:"cash",label:"Cash"},{value:"e-wallet",label:"E-Wallet"},{value:"prepaid",label:"Prepaid"},{value:"stored-value",label:"Stored Value"},{value:"other",label:"Other"}],p=[{value:"cash_loan",label:"Cash Loan"},{value:"paid_by_other",label:"Paid by Other"},{value:"paid_for_other",label:"Paid for Other"},{value:"shared_expense",label:"Shared Expense"},{value:"manual_entry",label:"Manual Entry"}];function q(a){let b=Math.abs(a),c=a<0?"-":"";return b>=1e9?`${c}${(b/1e9).toFixed(1)}B`:b>=1e6?`${c}${(b/1e6).toFixed(1)}M`:b>=1e3?`${c}${(b/1e3).toFixed(0)}K`:`${c}${b}`}},51472:(a,b,c)=>{"use strict";c.r(b),c.d(b,{default:()=>h,generateMetadata:()=>g});var d=c(75338);c(35692);var e=c(22348),f=c(35552);async function g(){let a="Kanemori";try{let b=(0,f.L)().prepare("SELECT value FROM settings WHERE key = 'app_name'").get();b?.value&&(a=b.value)}catch{}return{title:`${a} — Personal Finance Tracker`,description:"Track your finances, monitor spending, and achieve your financial goals."}}function h({children:a}){return(0,d.jsx)("html",{lang:"en",children:(0,d.jsx)("body",{children:(0,d.jsxs)("div",{className:"app-layout",children:[(0,d.jsx)(e.default,{}),(0,d.jsx)("main",{className:"main-area",children:(0,d.jsx)("div",{className:"page-content",children:a})})]})})})}},58836:(a,b,c)=>{Promise.resolve().then(c.t.bind(c,81170,23)),Promise.resolve().then(c.t.bind(c,23597,23)),Promise.resolve().then(c.t.bind(c,36893,23)),Promise.resolve().then(c.t.bind(c,89748,23)),Promise.resolve().then(c.t.bind(c,6060,23)),Promise.resolve().then(c.t.bind(c,7184,23)),Promise.resolve().then(c.t.bind(c,69576,23)),Promise.resolve().then(c.t.bind(c,73041,23)),Promise.resolve().then(c.t.bind(c,51384,23))},78162:(a,b,c)=>{"use strict";c.r(b),c.d(b,{default:()=>e});var d=c(97523);let e=async a=>[{type:"image/png",sizes:"32x32",url:(0,d.fillMetadataSegment)(".",await a.params,"icon.png")+"?7cbe9f9be65c5a1e"}]},94650:(a,b,c)=>{"use strict";c.r(b),c.d(b,{default:()=>e});var d=c(97523);let e=async a=>[{type:"image/png",sizes:"32x32",url:(0,d.fillMetadataSegment)(".",await a.params,"apple-icon.png")+"?7cbe9f9be65c5a1e"}]},96538:(a,b,c)=>{"use strict";c.d(b,{default:()=>t});var d=c(21124),e=c(3991),f=c.n(e),g=c(42378),h=c(38301),i=c(77850),j=c(85291),k=c(46816),l=c(50349),m=c(7550),n=c(81808),o=c(82823),p=c(15952),q=c(94684);let r=[{href:"/",label:"Dashboard",icon:i.A},{href:"/transactions",label:"Transactions",icon:j.A},{href:"/accounts",label:"Accounts",icon:k.A},{href:"/categories",label:"Categories",icon:l.A},{href:"/budget",label:"Budget",icon:m.A},{href:"/goals",label:"Goals",icon:n.A},{href:"/debts",label:"Debt & Credit",icon:o.A},{href:"/reports",label:"Reports",icon:p.A}],s=[{href:"/settings",label:"Settings",icon:q.A}];function t(){let a=(0,g.usePathname)(),[b,c]=(0,h.useState)("Kanemori"),[e,i]=(0,h.useState)(null),j=b=>"/"===b?"/"===a:a.startsWith(b),k=(b||"K").charAt(0).toUpperCase();return(0,d.jsxs)("aside",{className:"sidebar",children:[(0,d.jsxs)("div",{className:"sidebar-logo",children:[e?(0,d.jsx)("img",{src:e,alt:"Profile",className:"sidebar-logo-icon",style:{objectFit:"cover"}}):(0,d.jsx)("div",{className:"sidebar-logo-icon",children:k}),(0,d.jsx)("span",{className:"sidebar-logo-text",children:b})]}),(0,d.jsx)("nav",{className:"sidebar-nav",children:r.map(a=>(0,d.jsxs)(f(),{href:a.href,className:`sidebar-nav-item ${j(a.href)?"active":""}`,children:[(0,d.jsx)(a.icon,{}),a.label]},a.href))}),(0,d.jsx)("div",{className:"sidebar-bottom",children:s.map(a=>(0,d.jsxs)(f(),{href:a.href,className:`sidebar-nav-item ${j(a.href)?"active":""}`,children:[(0,d.jsx)(a.icon,{}),a.label]},a.href))})]})}},99551:(a,b,c)=>{Promise.resolve().then(c.bind(c,96538))}};