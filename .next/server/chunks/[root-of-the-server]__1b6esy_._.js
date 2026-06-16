module.exports=[93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},14747,(e,t,a)=>{t.exports=e.x("path",()=>require("path"))},18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},85148,(e,t,a)=>{t.exports=e.x("better-sqlite3-90e2652d1716b047",()=>require("better-sqlite3-90e2652d1716b047"))},22734,(e,t,a)=>{t.exports=e.x("fs",()=>require("fs"))},43793,32393,e=>{"use strict";var t=e.i(85148),a=e.i(14747),r=e.i(22734);let n=a.default.join(process.cwd(),"data"),s=a.default.join(n,"finance.db");function o(){if(globalThis.__db)try{return globalThis.__db.prepare("SELECT 1").get(),globalThis.__db}catch{try{globalThis.__db.close()}catch{}globalThis.__db=void 0}r.default.existsSync(n)||r.default.mkdirSync(n,{recursive:!0});let e=new t.default(s);return e.pragma("journal_mode = WAL"),e.pragma("foreign_keys = ON"),e.pragma("busy_timeout = 5000"),e.pragma("wal_autocheckpoint = 1000"),e.pragma("auto_vacuum = INCREMENTAL"),e.pragma("cache_size = -8000"),e.pragma("synchronous = NORMAL"),e.exec(`
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
  `),function(e){if(e.prepare("SELECT COUNT(*) as count FROM categories").get().count>0)return;let t=e.prepare("INSERT INTO categories (name, type, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)"),a=[["Food & Dining","expense","🍽️","#F97316",1],["Drinks & Snacks","expense","🧋","#FB923C",2],["Groceries","expense","🛒","#84CC16",3],["Transportation","expense","🚌","#3B82F6",4],["Shopping","expense","🛍️","#EC4899",5],["Bills & Utilities","expense","📄","#8B5CF6",6],["Subscriptions","expense","🔄","#A855F7",7],["Entertainment","expense","🎮","#F43F5E",8],["Education","expense","📚","#0EA5E9",9],["Health & Fitness","expense","💊","#10B981",10],["Housing","expense","🏠","#6366F1",11],["Personal Care","expense","✨","#D946EF",12],["Donations","expense","❤️","#F87171",13],["Top Up","expense","📱","#14B8A6",14],["Administrative Fees","expense","📋","#94A3B8",15],["Emergency","expense","🚨","#EF4444",16],["Investment","expense","📈","#059669",17],["Other","expense","📦","#64748B",18]],r=[["Salary","income","💰","#10B981",1],["Freelance","income","💻","#3B82F6",2],["Gift","income","🎁","#EC4899",3],["Refund","income","↩️","#F59E0B",4],["Bonus","income","🎉","#8B5CF6",5],["Side Income","income","📊","#14B8A6",6],["Other Income","income","📥","#64748B",7]];e.transaction(()=>{for(let e of a)t.run(...e);for(let e of r)t.run(...e)})();let n=e.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");n.run("admin_fee_as_expense","true"),n.run("default_account_id",""),n.run("app_name","Kanemori"),n.run("hide_all_balances","false")}(e),globalThis.__db=e,e}e.s(["checkpointForBackup",0,function(){return o().pragma("wal_checkpoint(TRUNCATE)"),s},"getDb",0,o,"invalidateDbConnection",0,function(){if(globalThis.__db){try{globalThis.__db.pragma("wal_checkpoint(TRUNCATE)"),globalThis.__db.close()}catch{}globalThis.__db=void 0}}],43793);var i=e.i(89171);e.s(["safeHandler",0,function(e){return async(...t)=>{try{return await e(...t)}catch(r){let e=r instanceof Error?r:Error(String(r)),t=e.message||"Internal server error",a=e.code;if(console.error(`[API Error] ${t}`,e.stack||""),"ERR_DLOPEN_FAILED"===a)return i.NextResponse.json({error:"Database engine needs to be recompiled. Please run: npm rebuild better-sqlite3",code:"NATIVE_MODULE_ERROR"},{status:503});if(t.includes("database is locked")||t.includes("SQLITE_BUSY"))return i.NextResponse.json({error:"Database is busy, please try again",code:"DB_BUSY"},{status:503});if(t.includes("database disk image is malformed")||t.includes("SQLITE_CORRUPT"))return i.NextResponse.json({error:"Database may be corrupted. Please restore from backup.",code:"DB_CORRUPT"},{status:500});if(t.includes("Not found"))return i.NextResponse.json({error:"Not found"},{status:404});return i.NextResponse.json({error:"Something went wrong. Please try again."},{status:500})}}}],32393)},28535,e=>{"use strict";var t=e.i(47909),a=e.i(74017),r=e.i(96250),n=e.i(59756),s=e.i(61916),o=e.i(74677),i=e.i(69741),E=e.i(16795),T=e.i(87718),d=e.i(95169),l=e.i(47587),c=e.i(66012),p=e.i(70101),u=e.i(26937),N=e.i(10372),R=e.i(93695);e.i(52474);var L=e.i(220),m=e.i(89171),O=e.i(43793),A=e.i(32393),U=e.i(65387),_=e.i(54895),g=e.i(70035);let C=(0,A.safeHandler)(async e=>{let t=(0,O.getDb)(),{searchParams:a}=new URL(e.url),r=a.get("month")||(0,U.format)(new Date,"yyyy-MM"),n=(0,_.parseISO)(`${r}-01`),s="false"!==Object.fromEntries(t.prepare("SELECT key, value FROM settings").all().map(e=>[e.key,e.value])).admin_fee_as_expense,o=t.prepare("SELECT COALESCE(SUM(amount),0) as t FROM transactions WHERE type='income' AND strftime('%Y-%m',date)=?").get(r).t,i=t.prepare("SELECT COALESCE(SUM(amount),0) as t FROM transactions WHERE type='expense' AND strftime('%Y-%m',date)=?").get(r).t,E=s?t.prepare("SELECT COALESCE(SUM(admin_fee),0) as t FROM transactions WHERE type='transfer' AND admin_fee > 0 AND strftime('%Y-%m',date)=?").get(r).t:0,T=t.prepare(`SELECT c.name,c.icon,c.color,COALESCE(SUM(t.amount),0) as total
     FROM transactions t JOIN categories c ON t.category_id=c.id
     WHERE t.type='expense' AND strftime('%Y-%m',t.date)=?
     GROUP BY c.id ORDER BY total DESC`).all(r),d=t.prepare(`SELECT c.name,c.icon,c.color,COALESCE(SUM(t.amount),0) as total
     FROM transactions t JOIN categories c ON t.category_id=c.id
     WHERE t.type='income' AND strftime('%Y-%m',t.date)=?
     GROUP BY c.id ORDER BY total DESC`).all(r),l=[];for(let e=5;e>=0;e--){let a=(0,g.subMonths)(n,e),r=(0,U.format)(a,"yyyy-MM"),o=(0,U.format)(a,"MMM"),i=t.prepare("SELECT COALESCE(SUM(amount),0) as t FROM transactions WHERE type='income' AND strftime('%Y-%m',date)=?").get(r).t,E=t.prepare("SELECT COALESCE(SUM(amount),0) as t FROM transactions WHERE type='expense' AND strftime('%Y-%m',date)=?").get(r).t,T=s?t.prepare("SELECT COALESCE(SUM(admin_fee),0) as t FROM transactions WHERE type='transfer' AND admin_fee > 0 AND strftime('%Y-%m',date)=?").get(r).t:0;l.push({month:o,income:i,expense:E+T})}return m.NextResponse.json({totalIncome:o,totalExpense:i+E,expenseByCategory:T,incomeByCategory:d,monthlyTrend:l})});e.s(["GET",0,C],68547);var f=e.i(68547);let h=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/reports/route",pathname:"/api/reports",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/reports/route.ts",nextConfigOutput:"",userland:f,...{}}),{workAsyncStorage:x,workUnitAsyncStorage:I,serverHooks:S}=h;async function y(e,t,r){r.requestMeta&&(0,n.setRequestMeta)(e,r.requestMeta),h.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let m="/api/reports/route";m=m.replace(/\/index$/,"")||"/";let O=await h.prepare(e,t,{srcPage:m,multiZoneDraftMode:!1});if(!O)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:A,deploymentId:U,params:_,nextConfig:g,parsedUrl:C,isDraftMode:f,prerenderManifest:x,routerServerContext:I,isOnDemandRevalidate:S,revalidateOnlyGenerated:y,resolvedPathname:b,clientReferenceManifest:F,serverActionsManifest:v}=O,D=(0,i.normalizeAppPath)(m),w=!!(x.dynamicRoutes[D]||x.routes[b]),M=async()=>((null==I?void 0:I.render404)?await I.render404(e,t,C,!1):t.end("This page could not be found"),null);if(w&&!f){let e=!!x.routes[b],t=x.dynamicRoutes[D];if(t&&!1===t.fallback&&!e){if(g.adapterPath)return await M();throw new R.NoFallbackError}}let X=null;!w||h.isDev||f||(X="/index"===(X=b)?"/":X);let P=!0===h.isDev||!w,G=w&&!P;v&&F&&(0,o.setManifestsSingleton)({page:m,clientReferenceManifest:F,serverActionsManifest:v});let B=e.method||"GET",k=(0,s.getTracer)(),Y=k.getActiveScopeSpan(),q=!!(null==I?void 0:I.isWrappedByNextServer),H=!!(0,n.getRequestMeta)(e,"minimalMode"),j=(0,n.getRequestMeta)(e,"incrementalCache")||await h.getIncrementalCache(e,g,x,H);null==j||j.resetRequestCache(),globalThis.__incrementalCache=j;let K={params:_,previewProps:x.preview,renderOpts:{experimental:{authInterrupts:!!g.experimental.authInterrupts},cacheComponents:!!g.cacheComponents,supportsDynamicResponse:P,incrementalCache:j,cacheLifeProfiles:g.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,n)=>h.onRequestError(e,t,r,n,I)},sharedContext:{buildId:A,deploymentId:U}},W=new E.NodeNextRequest(e),$=new E.NodeNextResponse(t),V=T.NextRequestAdapter.fromNodeNextRequest(W,(0,T.signalFromNodeResponse)(t));try{let n,o=async e=>h.handle(V,K).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=k.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==d.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${B} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",r),n.updateName(t))}else e.updateName(`${B} ${m}`)}),i=async n=>{var s,i;let E=async({previousCacheEntry:a})=>{try{if(!H&&S&&y&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await o(n);e.fetchMetrics=K.renderOpts.fetchMetrics;let i=K.renderOpts.pendingWaitUntil;i&&r.waitUntil&&(r.waitUntil(i),i=void 0);let E=K.renderOpts.collectedTags;if(!w)return await (0,c.sendResponse)(W,$,s,K.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,p.toNodeOutgoingHttpHeaders)(s.headers);E&&(t[N.NEXT_CACHE_TAGS_HEADER]=E),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==K.renderOpts.collectedRevalidate&&!(K.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&K.renderOpts.collectedRevalidate,r=void 0===K.renderOpts.collectedExpire||K.renderOpts.collectedExpire>=N.INFINITE_CACHE?void 0:K.renderOpts.collectedExpire;return{value:{kind:L.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==a?void 0:a.isStale)&&await h.onRequestError(e,t,{routerKind:"App Router",routePath:m,routeType:"route",revalidateReason:(0,l.getRevalidateReason)({isStaticGeneration:G,isOnDemandRevalidate:S})},!1,I),t}},T=await h.handleResponse({req:e,nextConfig:g,cacheKey:X,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:x,isRoutePPREnabled:!1,isOnDemandRevalidate:S,revalidateOnlyGenerated:y,responseGenerator:E,waitUntil:r.waitUntil,isMinimalMode:H});if(!w)return null;if((null==T||null==(s=T.value)?void 0:s.kind)!==L.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==T||null==(i=T.value)?void 0:i.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});H||t.setHeader("x-nextjs-cache",S?"REVALIDATED":T.isMiss?"MISS":T.isStale?"STALE":"HIT"),f&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let d=(0,p.fromNodeOutgoingHttpHeaders)(T.value.headers);return H&&w||d.delete(N.NEXT_CACHE_TAGS_HEADER),!T.cacheControl||t.getHeader("Cache-Control")||d.get("Cache-Control")||d.set("Cache-Control",(0,u.getCacheControlHeader)(T.cacheControl)),await (0,c.sendResponse)(W,$,new Response(T.value.body,{headers:d,status:T.value.status||200})),null};q&&Y?await i(Y):(n=k.getActiveScopeSpan(),await k.withPropagatedContext(e.headers,()=>k.trace(d.BaseServerSpan.handleRequest,{spanName:`${B} ${m}`,kind:s.SpanKind.SERVER,attributes:{"http.method":B,"http.target":e.url}},i),void 0,!q))}catch(t){if(t instanceof R.NoFallbackError||await h.onRequestError(e,t,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,l.getRevalidateReason)({isStaticGeneration:G,isOnDemandRevalidate:S})},!1,I),w)throw t;return await (0,c.sendResponse)(W,$,new Response(null,{status:500})),null}}e.s(["handler",0,y,"patchFetch",0,function(){return(0,r.patchFetch)({workAsyncStorage:x,workUnitAsyncStorage:I})},"routeModule",0,h,"serverHooks",0,S,"workAsyncStorage",0,x,"workUnitAsyncStorage",0,I],28535)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__1b6esy_._.js.map