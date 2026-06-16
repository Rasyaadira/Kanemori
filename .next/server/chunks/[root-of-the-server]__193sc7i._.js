module.exports=[93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},14747,(e,t,a)=>{t.exports=e.x("path",()=>require("path"))},18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},85148,(e,t,a)=>{t.exports=e.x("better-sqlite3-90e2652d1716b047",()=>require("better-sqlite3-90e2652d1716b047"))},22734,(e,t,a)=>{t.exports=e.x("fs",()=>require("fs"))},43793,32393,e=>{"use strict";var t=e.i(85148),a=e.i(14747),n=e.i(22734);let r=a.default.join(process.cwd(),"data"),o=a.default.join(r,"finance.db");function s(){if(globalThis.__db)try{return globalThis.__db.prepare("SELECT 1").get(),globalThis.__db}catch{try{globalThis.__db.close()}catch{}globalThis.__db=void 0}n.default.existsSync(r)||n.default.mkdirSync(r,{recursive:!0});let e=new t.default(o);return e.pragma("journal_mode = WAL"),e.pragma("foreign_keys = ON"),e.pragma("busy_timeout = 5000"),e.pragma("wal_autocheckpoint = 1000"),e.pragma("auto_vacuum = INCREMENTAL"),e.pragma("cache_size = -8000"),e.pragma("synchronous = NORMAL"),e.exec(`
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
  `),function(e){if(e.prepare("SELECT COUNT(*) as count FROM categories").get().count>0)return;let t=e.prepare("INSERT INTO categories (name, type, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)"),a=[["Food & Dining","expense","🍽️","#F97316",1],["Drinks & Snacks","expense","🧋","#FB923C",2],["Groceries","expense","🛒","#84CC16",3],["Transportation","expense","🚌","#3B82F6",4],["Shopping","expense","🛍️","#EC4899",5],["Bills & Utilities","expense","📄","#8B5CF6",6],["Subscriptions","expense","🔄","#A855F7",7],["Entertainment","expense","🎮","#F43F5E",8],["Education","expense","📚","#0EA5E9",9],["Health & Fitness","expense","💊","#10B981",10],["Housing","expense","🏠","#6366F1",11],["Personal Care","expense","✨","#D946EF",12],["Donations","expense","❤️","#F87171",13],["Top Up","expense","📱","#14B8A6",14],["Administrative Fees","expense","📋","#94A3B8",15],["Emergency","expense","🚨","#EF4444",16],["Investment","expense","📈","#059669",17],["Other","expense","📦","#64748B",18]],n=[["Salary","income","💰","#10B981",1],["Freelance","income","💻","#3B82F6",2],["Gift","income","🎁","#EC4899",3],["Refund","income","↩️","#F59E0B",4],["Bonus","income","🎉","#8B5CF6",5],["Side Income","income","📊","#14B8A6",6],["Other Income","income","📥","#64748B",7]];e.transaction(()=>{for(let e of a)t.run(...e);for(let e of n)t.run(...e)})();let r=e.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");r.run("admin_fee_as_expense","true"),r.run("default_account_id",""),r.run("app_name","Kanemori"),r.run("hide_all_balances","false")}(e),globalThis.__db=e,e}e.s(["checkpointForBackup",0,function(){return s().pragma("wal_checkpoint(TRUNCATE)"),o},"getDb",0,s,"invalidateDbConnection",0,function(){if(globalThis.__db){try{globalThis.__db.pragma("wal_checkpoint(TRUNCATE)"),globalThis.__db.close()}catch{}globalThis.__db=void 0}}],43793);var i=e.i(89171);e.s(["safeHandler",0,function(e){return async(...t)=>{try{return await e(...t)}catch(n){let e=n instanceof Error?n:Error(String(n)),t=e.message||"Internal server error",a=e.code;if(console.error(`[API Error] ${t}`,e.stack||""),"ERR_DLOPEN_FAILED"===a)return i.NextResponse.json({error:"Database engine needs to be recompiled. Please run: npm rebuild better-sqlite3",code:"NATIVE_MODULE_ERROR"},{status:503});if(t.includes("database is locked")||t.includes("SQLITE_BUSY"))return i.NextResponse.json({error:"Database is busy, please try again",code:"DB_BUSY"},{status:503});if(t.includes("database disk image is malformed")||t.includes("SQLITE_CORRUPT"))return i.NextResponse.json({error:"Database may be corrupted. Please restore from backup.",code:"DB_CORRUPT"},{status:500});if(t.includes("Not found"))return i.NextResponse.json({error:"Not found"},{status:404});return i.NextResponse.json({error:"Something went wrong. Please try again."},{status:500})}}}],32393)},98683,e=>{"use strict";var t=e.i(47909),a=e.i(74017),n=e.i(96250),r=e.i(59756),o=e.i(61916),s=e.i(74677),i=e.i(69741),E=e.i(16795),d=e.i(87718),c=e.i(95169),T=e.i(47587),l=e.i(66012),u=e.i(70101),p=e.i(26937),N=e.i(10372),R=e.i(93695);e.i(52474);var L=e.i(220),_=e.i(89171),m=e.i(43793),g=e.i(32393);let O=(0,g.safeHandler)(async e=>{let t=(0,m.getDb)(),{searchParams:a}=new URL(e.url),n=a.get("type"),r=a.get("account_id"),o=a.get("category_id"),s=a.get("search"),i=a.get("start_date"),E=a.get("end_date"),d=Math.min(Math.max(parseInt(a.get("limit")||"50")||50,1),500),c=Math.max(parseInt(a.get("offset")||"0")||0,0),T="1=1",l=[];n&&(T+=" AND t.type = ?",l.push(n)),r&&(T+=" AND (t.from_account_id = ? OR t.to_account_id = ?)",l.push(r,r)),o&&(T+=" AND t.category_id = ?",l.push(o)),s&&(T+=" AND t.name LIKE ?",l.push(`%${s}%`)),i&&(T+=" AND t.date >= ?",l.push(i)),E&&(T+=" AND t.date <= ?",l.push(E));let u=t.prepare(`SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color,
            fa.name as from_account_name, ta.name as to_account_name
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     LEFT JOIN accounts fa ON t.from_account_id = fa.id
     LEFT JOIN accounts ta ON t.to_account_id = ta.id
     WHERE ${T}
     ORDER BY t.date DESC, t.created_at DESC
     LIMIT ? OFFSET ?`).all(...l,d,c),p=t.prepare(`SELECT COUNT(*) as total FROM transactions t WHERE ${T}`).get(...l);return _.NextResponse.json({transactions:u,total:p.total})}),A=(0,g.safeHandler)(async e=>{let t=(0,m.getDb)(),{type:a,name:n,date:r,amount:o,admin_fee:s,from_account_id:i,to_account_id:E,category_id:d,notes:c,location:T}=await e.json();if(!a||!n||!r||!o)return _.NextResponse.json({error:"Type, name, date, and amount are required"},{status:400});let l=t.transaction(()=>{let e=t.prepare(`INSERT INTO transactions (type, name, date, amount, admin_fee, from_account_id, to_account_id, category_id, notes, location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(a,n,r,o,s||0,i||null,E||null,d||null,c||null,T||null);if("expense"===a&&i)t.prepare("UPDATE accounts SET balance = balance - ?, updated_at = datetime('now') WHERE id = ?").run(o,i);else if("income"===a&&E)t.prepare("UPDATE accounts SET balance = balance + ?, updated_at = datetime('now') WHERE id = ?").run(o,E);else if("transfer"===a&&i&&E){let e=o+(s||0);t.prepare("UPDATE accounts SET balance = balance - ?, updated_at = datetime('now') WHERE id = ?").run(e,i),t.prepare("UPDATE accounts SET balance = balance + ?, updated_at = datetime('now') WHERE id = ?").run(o,E)}return e.lastInsertRowid})(),u=t.prepare(`SELECT t.*, c.name as category_name, c.icon as category_icon,
            fa.name as from_account_name, ta.name as to_account_name
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     LEFT JOIN accounts fa ON t.from_account_id = fa.id
     LEFT JOIN accounts ta ON t.to_account_id = ta.id
     WHERE t.id = ?`).get(l);return _.NextResponse.json(u,{status:201})});e.s(["GET",0,O,"POST",0,A],61375);var U=e.i(61375);let I=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/transactions/route",pathname:"/api/transactions",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/transactions/route.ts",nextConfigOutput:"",userland:U,...{}}),{workAsyncStorage:h,workUnitAsyncStorage:f,serverHooks:x}=I;async function b(e,t,n){n.requestMeta&&(0,r.setRequestMeta)(e,n.requestMeta),I.isDev&&(0,r.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let _="/api/transactions/route";_=_.replace(/\/index$/,"")||"/";let m=await I.prepare(e,t,{srcPage:_,multiZoneDraftMode:!1});if(!m)return t.statusCode=400,t.end("Bad Request"),null==n.waitUntil||n.waitUntil.call(n,Promise.resolve()),null;let{buildId:g,deploymentId:O,params:A,nextConfig:U,parsedUrl:h,isDraftMode:f,prerenderManifest:x,routerServerContext:b,isOnDemandRevalidate:C,revalidateOnlyGenerated:F,resolvedPathname:S,clientReferenceManifest:y,serverActionsManifest:v}=m,w=(0,i.normalizeAppPath)(_),D=!!(x.dynamicRoutes[w]||x.routes[S]),X=async()=>((null==b?void 0:b.render404)?await b.render404(e,t,h,!1):t.end("This page could not be found"),null);if(D&&!f){let e=!!x.routes[S],t=x.dynamicRoutes[w];if(t&&!1===t.fallback&&!e){if(U.adapterPath)return await X();throw new R.NoFallbackError}}let P=null;!D||I.isDev||f||(P="/index"===(P=S)?"/":P);let M=!0===I.isDev||!D,G=D&&!M;v&&y&&(0,s.setManifestsSingleton)({page:_,clientReferenceManifest:y,serverActionsManifest:v});let k=e.method||"GET",B=(0,o.getTracer)(),q=B.getActiveScopeSpan(),j=!!(null==b?void 0:b.isWrappedByNextServer),H=!!(0,r.getRequestMeta)(e,"minimalMode"),Y=(0,r.getRequestMeta)(e,"incrementalCache")||await I.getIncrementalCache(e,U,x,H);null==Y||Y.resetRequestCache(),globalThis.__incrementalCache=Y;let K={params:A,previewProps:x.preview,renderOpts:{experimental:{authInterrupts:!!U.experimental.authInterrupts},cacheComponents:!!U.cacheComponents,supportsDynamicResponse:M,incrementalCache:Y,cacheLifeProfiles:U.cacheLife,waitUntil:n.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,n,r)=>I.onRequestError(e,t,n,r,b)},sharedContext:{buildId:g,deploymentId:O}},$=new E.NodeNextRequest(e),W=new E.NodeNextResponse(t),V=d.NextRequestAdapter.fromNodeNextRequest($,(0,d.signalFromNodeResponse)(t));try{let r,s=async e=>I.handle(V,K).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=B.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=a.get("next.route");if(n){let t=`${k} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t),r&&r!==e&&(r.setAttribute("http.route",n),r.updateName(t))}else e.updateName(`${k} ${_}`)}),i=async r=>{var o,i;let E=async({previousCacheEntry:a})=>{try{if(!H&&C&&F&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let o=await s(r);e.fetchMetrics=K.renderOpts.fetchMetrics;let i=K.renderOpts.pendingWaitUntil;i&&n.waitUntil&&(n.waitUntil(i),i=void 0);let E=K.renderOpts.collectedTags;if(!D)return await (0,l.sendResponse)($,W,o,K.renderOpts.pendingWaitUntil),null;{let e=await o.blob(),t=(0,u.toNodeOutgoingHttpHeaders)(o.headers);E&&(t[N.NEXT_CACHE_TAGS_HEADER]=E),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==K.renderOpts.collectedRevalidate&&!(K.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&K.renderOpts.collectedRevalidate,n=void 0===K.renderOpts.collectedExpire||K.renderOpts.collectedExpire>=N.INFINITE_CACHE?void 0:K.renderOpts.collectedExpire;return{value:{kind:L.CachedRouteKind.APP_ROUTE,status:o.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:n}}}}catch(t){throw(null==a?void 0:a.isStale)&&await I.onRequestError(e,t,{routerKind:"App Router",routePath:_,routeType:"route",revalidateReason:(0,T.getRevalidateReason)({isStaticGeneration:G,isOnDemandRevalidate:C})},!1,b),t}},d=await I.handleResponse({req:e,nextConfig:U,cacheKey:P,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:x,isRoutePPREnabled:!1,isOnDemandRevalidate:C,revalidateOnlyGenerated:F,responseGenerator:E,waitUntil:n.waitUntil,isMinimalMode:H});if(!D)return null;if((null==d||null==(o=d.value)?void 0:o.kind)!==L.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(i=d.value)?void 0:i.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});H||t.setHeader("x-nextjs-cache",C?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),f&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let c=(0,u.fromNodeOutgoingHttpHeaders)(d.value.headers);return H&&D||c.delete(N.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||c.get("Cache-Control")||c.set("Cache-Control",(0,p.getCacheControlHeader)(d.cacheControl)),await (0,l.sendResponse)($,W,new Response(d.value.body,{headers:c,status:d.value.status||200})),null};j&&q?await i(q):(r=B.getActiveScopeSpan(),await B.withPropagatedContext(e.headers,()=>B.trace(c.BaseServerSpan.handleRequest,{spanName:`${k} ${_}`,kind:o.SpanKind.SERVER,attributes:{"http.method":k,"http.target":e.url}},i),void 0,!j))}catch(t){if(t instanceof R.NoFallbackError||await I.onRequestError(e,t,{routerKind:"App Router",routePath:w,routeType:"route",revalidateReason:(0,T.getRevalidateReason)({isStaticGeneration:G,isOnDemandRevalidate:C})},!1,b),D)throw t;return await (0,l.sendResponse)($,W,new Response(null,{status:500})),null}}e.s(["handler",0,b,"patchFetch",0,function(){return(0,n.patchFetch)({workAsyncStorage:h,workUnitAsyncStorage:f})},"routeModule",0,I,"serverHooks",0,x,"workAsyncStorage",0,h,"workUnitAsyncStorage",0,f],98683)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__193sc7i._.js.map