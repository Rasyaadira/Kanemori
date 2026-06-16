module.exports=[93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},14747,(e,t,a)=>{t.exports=e.x("path",()=>require("path"))},18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},85148,(e,t,a)=>{t.exports=e.x("better-sqlite3-90e2652d1716b047",()=>require("better-sqlite3-90e2652d1716b047"))},22734,(e,t,a)=>{t.exports=e.x("fs",()=>require("fs"))},43793,32393,e=>{"use strict";var t=e.i(85148),a=e.i(14747),r=e.i(22734);let n=a.default.join(process.cwd(),"data"),o=a.default.join(n,"finance.db");function s(){if(globalThis.__db)try{return globalThis.__db.prepare("SELECT 1").get(),globalThis.__db}catch{try{globalThis.__db.close()}catch{}globalThis.__db=void 0}r.default.existsSync(n)||r.default.mkdirSync(n,{recursive:!0});let e=new t.default(o);return e.pragma("journal_mode = WAL"),e.pragma("foreign_keys = ON"),e.pragma("busy_timeout = 5000"),e.pragma("wal_autocheckpoint = 1000"),e.pragma("auto_vacuum = INCREMENTAL"),e.pragma("cache_size = -8000"),e.pragma("synchronous = NORMAL"),e.exec(`
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
  `),function(e){if(e.prepare("SELECT COUNT(*) as count FROM categories").get().count>0)return;let t=e.prepare("INSERT INTO categories (name, type, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)"),a=[["Food & Dining","expense","🍽️","#F97316",1],["Drinks & Snacks","expense","🧋","#FB923C",2],["Groceries","expense","🛒","#84CC16",3],["Transportation","expense","🚌","#3B82F6",4],["Shopping","expense","🛍️","#EC4899",5],["Bills & Utilities","expense","📄","#8B5CF6",6],["Subscriptions","expense","🔄","#A855F7",7],["Entertainment","expense","🎮","#F43F5E",8],["Education","expense","📚","#0EA5E9",9],["Health & Fitness","expense","💊","#10B981",10],["Housing","expense","🏠","#6366F1",11],["Personal Care","expense","✨","#D946EF",12],["Donations","expense","❤️","#F87171",13],["Top Up","expense","📱","#14B8A6",14],["Administrative Fees","expense","📋","#94A3B8",15],["Emergency","expense","🚨","#EF4444",16],["Investment","expense","📈","#059669",17],["Other","expense","📦","#64748B",18]],r=[["Salary","income","💰","#10B981",1],["Freelance","income","💻","#3B82F6",2],["Gift","income","🎁","#EC4899",3],["Refund","income","↩️","#F59E0B",4],["Bonus","income","🎉","#8B5CF6",5],["Side Income","income","📊","#14B8A6",6],["Other Income","income","📥","#64748B",7]];e.transaction(()=>{for(let e of a)t.run(...e);for(let e of r)t.run(...e)})();let n=e.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");n.run("admin_fee_as_expense","true"),n.run("default_account_id",""),n.run("app_name","Kanemori"),n.run("hide_all_balances","false")}(e),globalThis.__db=e,e}e.s(["checkpointForBackup",0,function(){return s().pragma("wal_checkpoint(TRUNCATE)"),o},"getDb",0,s,"invalidateDbConnection",0,function(){if(globalThis.__db){try{globalThis.__db.pragma("wal_checkpoint(TRUNCATE)"),globalThis.__db.close()}catch{}globalThis.__db=void 0}}],43793);var i=e.i(89171);e.s(["safeHandler",0,function(e){return async(...t)=>{try{return await e(...t)}catch(r){let e=r instanceof Error?r:Error(String(r)),t=e.message||"Internal server error",a=e.code;if(console.error(`[API Error] ${t}`,e.stack||""),"ERR_DLOPEN_FAILED"===a)return i.NextResponse.json({error:"Database engine needs to be recompiled. Please run: npm rebuild better-sqlite3",code:"NATIVE_MODULE_ERROR"},{status:503});if(t.includes("database is locked")||t.includes("SQLITE_BUSY"))return i.NextResponse.json({error:"Database is busy, please try again",code:"DB_BUSY"},{status:503});if(t.includes("database disk image is malformed")||t.includes("SQLITE_CORRUPT"))return i.NextResponse.json({error:"Database may be corrupted. Please restore from backup.",code:"DB_CORRUPT"},{status:500});if(t.includes("Not found"))return i.NextResponse.json({error:"Not found"},{status:404});return i.NextResponse.json({error:"Something went wrong. Please try again."},{status:500})}}}],32393)},60626,e=>{"use strict";var t=e.i(47909),a=e.i(74017),r=e.i(96250),n=e.i(59756),o=e.i(61916),s=e.i(74677),i=e.i(69741),E=e.i(16795),d=e.i(87718),l=e.i(95169),c=e.i(47587),T=e.i(66012),u=e.i(70101),p=e.i(26937),N=e.i(10372),R=e.i(93695);e.i(52474);var m=e.i(220),L=e.i(89171),O=e.i(43793),_=e.i(32393),g=e.i(9245),A=e.i(65387),C=e.i(54895),U=e.i(70035);let f=(0,_.safeHandler)(async e=>{let t,a,r,n=(0,O.getDb)(),{searchParams:o}=new URL(e.url),s=function(e){if(!e||!/^\d{4}-\d{2}$/.test(e))return(0,A.format)(new Date,"yyyy-MM");let[t,a]=e.split("-"),r=parseInt(t,10),n=parseInt(a,10);return r<2e3||r>2099||n<1||n>12?(0,A.format)(new Date,"yyyy-MM"):e}(o.get("month")),i=Object.fromEntries(n.prepare("SELECT key, value FROM settings").all().map(e=>[e.key,e.value])),E="false"!==i.admin_fee_as_expense,d="true"===i.hide_all_balances,l=(0,C.parseISO)(`${s}-01`),c=(0,A.format)((0,U.subMonths)(l,1),"yyyy-MM"),T=n.prepare("SELECT COALESCE(SUM(balance), 0) as total FROM accounts WHERE is_active = 1").get(),u=n.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
     WHERE type = 'income' AND strftime('%Y-%m', date) = ?`).get(s),p=n.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
     WHERE type = 'expense' AND strftime('%Y-%m', date) = ?`).get(s),N=E?n.prepare(`SELECT COALESCE(SUM(admin_fee), 0) as total FROM transactions 
     WHERE type = 'transfer' AND admin_fee > 0 AND strftime('%Y-%m', date) = ?`).get(s):{total:0},R=(function(e){let t=(0,g.toDate)(e.start),a=(0,g.toDate)(e.end),r=+t>+a,n=r?+t:+a,o=r?a:t;o.setHours(0,0,0,0);let s=(void 0)??1;if(!s)return[];s<0&&(s=-s,r=!r);let i=[];for(;+o<=n;)i.push((0,g.toDate)(o)),o.setDate(o.getDate()+s),o.setHours(0,0,0,0);return r?i.reverse():i})({start:((t=(0,g.toDate)(l)).setDate(1),t.setHours(0,0,0,0),t),end:(r=(a=(0,g.toDate)(l)).getMonth(),a.setFullYear(a.getFullYear(),r+1,0),a.setHours(23,59,59,999),a)}).map(e=>{let t=(0,A.format)(e,"yyyy-MM-dd"),a=n.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
       WHERE type = 'income' AND date = ?`).get(t),r=n.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
       WHERE type = 'expense' AND date = ?`).get(t),o=E?n.prepare(`SELECT COALESCE(SUM(admin_fee), 0) as total FROM transactions
       WHERE type = 'transfer' AND admin_fee > 0 AND date = ?`).get(t):{total:0};return{day:(0,A.format)(e,"d"),income:a.total,expense:r.total+o.total}}),m=n.prepare(`SELECT c.name, c.color, c.icon, COALESCE(SUM(t.amount), 0) as total
     FROM transactions t
     JOIN categories c ON t.category_id = c.id
     WHERE t.type = 'expense' AND strftime('%Y-%m', t.date) = ?
     GROUP BY c.id
     ORDER BY total DESC
     LIMIT 6`).all(s),_=n.prepare(`SELECT b.id, b.amount as budget_amount, c.name, c.color, c.icon,
            COALESCE((SELECT SUM(t.amount) FROM transactions t 
             WHERE t.type = 'expense' AND t.category_id = b.category_id 
             AND strftime('%Y-%m', t.date) = b.month), 0) as spent
     FROM budgets b
     JOIN categories c ON b.category_id = c.id
     WHERE b.month = ?
     ORDER BY spent DESC
     LIMIT 5`).all(s),f=n.prepare(`SELECT id, name, target_amount, funded_amount, deadline, icon, color, status
     FROM goals WHERE status = 'active' ORDER BY created_at DESC LIMIT 4`).all(),h=n.prepare(`SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color,
            fa.name as from_account_name, ta.name as to_account_name
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     LEFT JOIN accounts fa ON t.from_account_id = fa.id
     LEFT JOIN accounts ta ON t.to_account_id = ta.id
     WHERE strftime('%Y-%m', t.date) = ?
     ORDER BY t.date DESC, t.created_at DESC
     LIMIT 6`).all(s),I=n.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
     WHERE type = 'expense' AND strftime('%Y-%m', date) = ?`).get(c),S=n.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
     WHERE type = 'income' AND strftime('%Y-%m', date) = ?`).get(c);return L.NextResponse.json({totalBalance:T.total,monthIncome:u.total,monthExpense:p.total+N.total,cashflowHealth:u.total-(p.total+N.total),lastMonthExpense:I.total,lastMonthIncome:S.total,cashFlow:R,spendingByCategory:m,budgets:_,goals:f,recentTransactions:h,hideAllBalances:d})});e.s(["GET",0,f],32933);var h=e.i(32933);let I=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/dashboard/route",pathname:"/api/dashboard",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/dashboard/route.ts",nextConfigOutput:"",userland:h,...{}}),{workAsyncStorage:S,workUnitAsyncStorage:x,serverHooks:y}=I;async function b(e,t,r){r.requestMeta&&(0,n.setRequestMeta)(e,r.requestMeta),I.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let L="/api/dashboard/route";L=L.replace(/\/index$/,"")||"/";let O=await I.prepare(e,t,{srcPage:L,multiZoneDraftMode:!1});if(!O)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:_,deploymentId:g,params:A,nextConfig:C,parsedUrl:U,isDraftMode:f,prerenderManifest:h,routerServerContext:S,isOnDemandRevalidate:x,revalidateOnlyGenerated:y,resolvedPathname:b,clientReferenceManifest:F,serverActionsManifest:D}=O,v=(0,i.normalizeAppPath)(L),M=!!(h.dynamicRoutes[v]||h.routes[b]),w=async()=>((null==S?void 0:S.render404)?await S.render404(e,t,U,!1):t.end("This page could not be found"),null);if(M&&!f){let e=!!h.routes[b],t=h.dynamicRoutes[v];if(t&&!1===t.fallback&&!e){if(C.adapterPath)return await w();throw new R.NoFallbackError}}let X=null;!M||I.isDev||f||(X="/index"===(X=b)?"/":X);let P=!0===I.isDev||!M,B=M&&!P;D&&F&&(0,s.setManifestsSingleton)({page:L,clientReferenceManifest:F,serverActionsManifest:D});let G=e.method||"GET",H=(0,o.getTracer)(),k=H.getActiveScopeSpan(),Y=!!(null==S?void 0:S.isWrappedByNextServer),q=!!(0,n.getRequestMeta)(e,"minimalMode"),j=(0,n.getRequestMeta)(e,"incrementalCache")||await I.getIncrementalCache(e,C,h,q);null==j||j.resetRequestCache(),globalThis.__incrementalCache=j;let K={params:A,previewProps:h.preview,renderOpts:{experimental:{authInterrupts:!!C.experimental.authInterrupts},cacheComponents:!!C.cacheComponents,supportsDynamicResponse:P,incrementalCache:j,cacheLifeProfiles:C.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,n)=>I.onRequestError(e,t,r,n,S)},sharedContext:{buildId:_,deploymentId:g}},W=new E.NodeNextRequest(e),$=new E.NodeNextResponse(t),V=d.NextRequestAdapter.fromNodeNextRequest(W,(0,d.signalFromNodeResponse)(t));try{let n,s=async e=>I.handle(V,K).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=H.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==l.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${G} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",r),n.updateName(t))}else e.updateName(`${G} ${L}`)}),i=async n=>{var o,i;let E=async({previousCacheEntry:a})=>{try{if(!q&&x&&y&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let o=await s(n);e.fetchMetrics=K.renderOpts.fetchMetrics;let i=K.renderOpts.pendingWaitUntil;i&&r.waitUntil&&(r.waitUntil(i),i=void 0);let E=K.renderOpts.collectedTags;if(!M)return await (0,T.sendResponse)(W,$,o,K.renderOpts.pendingWaitUntil),null;{let e=await o.blob(),t=(0,u.toNodeOutgoingHttpHeaders)(o.headers);E&&(t[N.NEXT_CACHE_TAGS_HEADER]=E),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==K.renderOpts.collectedRevalidate&&!(K.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&K.renderOpts.collectedRevalidate,r=void 0===K.renderOpts.collectedExpire||K.renderOpts.collectedExpire>=N.INFINITE_CACHE?void 0:K.renderOpts.collectedExpire;return{value:{kind:m.CachedRouteKind.APP_ROUTE,status:o.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==a?void 0:a.isStale)&&await I.onRequestError(e,t,{routerKind:"App Router",routePath:L,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:B,isOnDemandRevalidate:x})},!1,S),t}},d=await I.handleResponse({req:e,nextConfig:C,cacheKey:X,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:h,isRoutePPREnabled:!1,isOnDemandRevalidate:x,revalidateOnlyGenerated:y,responseGenerator:E,waitUntil:r.waitUntil,isMinimalMode:q});if(!M)return null;if((null==d||null==(o=d.value)?void 0:o.kind)!==m.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(i=d.value)?void 0:i.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});q||t.setHeader("x-nextjs-cache",x?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),f&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let l=(0,u.fromNodeOutgoingHttpHeaders)(d.value.headers);return q&&M||l.delete(N.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||l.get("Cache-Control")||l.set("Cache-Control",(0,p.getCacheControlHeader)(d.cacheControl)),await (0,T.sendResponse)(W,$,new Response(d.value.body,{headers:l,status:d.value.status||200})),null};Y&&k?await i(k):(n=H.getActiveScopeSpan(),await H.withPropagatedContext(e.headers,()=>H.trace(l.BaseServerSpan.handleRequest,{spanName:`${G} ${L}`,kind:o.SpanKind.SERVER,attributes:{"http.method":G,"http.target":e.url}},i),void 0,!Y))}catch(t){if(t instanceof R.NoFallbackError||await I.onRequestError(e,t,{routerKind:"App Router",routePath:v,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:B,isOnDemandRevalidate:x})},!1,S),M)throw t;return await (0,T.sendResponse)(W,$,new Response(null,{status:500})),null}}e.s(["handler",0,b,"patchFetch",0,function(){return(0,r.patchFetch)({workAsyncStorage:S,workUnitAsyncStorage:x})},"routeModule",0,I,"serverHooks",0,y,"workAsyncStorage",0,S,"workUnitAsyncStorage",0,x],60626)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__03rpo8m._.js.map