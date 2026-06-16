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
  `),function(e){if(e.prepare("SELECT COUNT(*) as count FROM categories").get().count>0)return;let t=e.prepare("INSERT INTO categories (name, type, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)"),a=[["Food & Dining","expense","🍽️","#F97316",1],["Drinks & Snacks","expense","🧋","#FB923C",2],["Groceries","expense","🛒","#84CC16",3],["Transportation","expense","🚌","#3B82F6",4],["Shopping","expense","🛍️","#EC4899",5],["Bills & Utilities","expense","📄","#8B5CF6",6],["Subscriptions","expense","🔄","#A855F7",7],["Entertainment","expense","🎮","#F43F5E",8],["Education","expense","📚","#0EA5E9",9],["Health & Fitness","expense","💊","#10B981",10],["Housing","expense","🏠","#6366F1",11],["Personal Care","expense","✨","#D946EF",12],["Donations","expense","❤️","#F87171",13],["Top Up","expense","📱","#14B8A6",14],["Administrative Fees","expense","📋","#94A3B8",15],["Emergency","expense","🚨","#EF4444",16],["Investment","expense","📈","#059669",17],["Other","expense","📦","#64748B",18]],r=[["Salary","income","💰","#10B981",1],["Freelance","income","💻","#3B82F6",2],["Gift","income","🎁","#EC4899",3],["Refund","income","↩️","#F59E0B",4],["Bonus","income","🎉","#8B5CF6",5],["Side Income","income","📊","#14B8A6",6],["Other Income","income","📥","#64748B",7]];e.transaction(()=>{for(let e of a)t.run(...e);for(let e of r)t.run(...e)})();let n=e.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");n.run("admin_fee_as_expense","true"),n.run("default_account_id",""),n.run("app_name","Kanemori"),n.run("hide_all_balances","false")}(e),globalThis.__db=e,e}e.s(["checkpointForBackup",0,function(){return s().pragma("wal_checkpoint(TRUNCATE)"),o},"getDb",0,s,"invalidateDbConnection",0,function(){if(globalThis.__db){try{globalThis.__db.pragma("wal_checkpoint(TRUNCATE)"),globalThis.__db.close()}catch{}globalThis.__db=void 0}}],43793);var i=e.i(89171);e.s(["safeHandler",0,function(e){return async(...t)=>{try{return await e(...t)}catch(r){let e=r instanceof Error?r:Error(String(r)),t=e.message||"Internal server error",a=e.code;if(console.error(`[API Error] ${t}`,e.stack||""),"ERR_DLOPEN_FAILED"===a)return i.NextResponse.json({error:"Database engine needs to be recompiled. Please run: npm rebuild better-sqlite3",code:"NATIVE_MODULE_ERROR"},{status:503});if(t.includes("database is locked")||t.includes("SQLITE_BUSY"))return i.NextResponse.json({error:"Database is busy, please try again",code:"DB_BUSY"},{status:503});if(t.includes("database disk image is malformed")||t.includes("SQLITE_CORRUPT"))return i.NextResponse.json({error:"Database may be corrupted. Please restore from backup.",code:"DB_CORRUPT"},{status:500});if(t.includes("Not found"))return i.NextResponse.json({error:"Not found"},{status:404});return i.NextResponse.json({error:"Something went wrong. Please try again."},{status:500})}}}],32393)},9338,e=>{"use strict";var t=e.i(47909),a=e.i(74017),r=e.i(96250),n=e.i(59756),o=e.i(61916),s=e.i(74677),i=e.i(69741),E=e.i(16795),T=e.i(87718),d=e.i(95169),l=e.i(47587),c=e.i(66012),u=e.i(70101),p=e.i(26937),N=e.i(10372),R=e.i(93695);e.i(52474);var L=e.i(220),m=e.i(89171),g=e.i(43793),_=e.i(32393);let A=(0,_.safeHandler)(async e=>{let t=(0,g.getDb)(),{searchParams:a}=new URL(e.url),r=a.get("month");if(!r)return m.NextResponse.json([]);let n=t.prepare(`SELECT b.*, c.name, c.icon, c.color,
            COALESCE((SELECT SUM(t.amount) FROM transactions t
             WHERE t.type = 'expense' AND t.category_id = b.category_id
             AND strftime('%Y-%m', t.date) = b.month), 0) as spent
     FROM budgets b JOIN categories c ON b.category_id = c.id
     WHERE b.month = ? ORDER BY spent DESC`).all(r);return m.NextResponse.json(n)}),U=(0,_.safeHandler)(async e=>{let t=(0,g.getDb)(),{category_id:a,month:r,amount:n}=await e.json();return t.prepare("INSERT OR REPLACE INTO budgets (category_id, month, amount) VALUES (?, ?, ?)").run(a,r,n),m.NextResponse.json({success:!0},{status:201})});e.s(["GET",0,A,"POST",0,U],73773);var O=e.i(73773);let h=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/budgets/route",pathname:"/api/budgets",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/budgets/route.ts",nextConfigOutput:"",userland:O,...{}}),{workAsyncStorage:I,workUnitAsyncStorage:x,serverHooks:b}=h;async function f(e,t,r){r.requestMeta&&(0,n.setRequestMeta)(e,r.requestMeta),h.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let m="/api/budgets/route";m=m.replace(/\/index$/,"")||"/";let g=await h.prepare(e,t,{srcPage:m,multiZoneDraftMode:!1});if(!g)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:_,deploymentId:A,params:U,nextConfig:O,parsedUrl:I,isDraftMode:x,prerenderManifest:b,routerServerContext:f,isOnDemandRevalidate:C,revalidateOnlyGenerated:S,resolvedPathname:v,clientReferenceManifest:F,serverActionsManifest:y}=g,w=(0,i.normalizeAppPath)(m),X=!!(b.dynamicRoutes[w]||b.routes[v]),D=async()=>((null==f?void 0:f.render404)?await f.render404(e,t,I,!1):t.end("This page could not be found"),null);if(X&&!x){let e=!!b.routes[v],t=b.dynamicRoutes[w];if(t&&!1===t.fallback&&!e){if(O.adapterPath)return await D();throw new R.NoFallbackError}}let P=null;!X||h.isDev||x||(P="/index"===(P=v)?"/":P);let G=!0===h.isDev||!X,M=X&&!G;y&&F&&(0,s.setManifestsSingleton)({page:m,clientReferenceManifest:F,serverActionsManifest:y});let k=e.method||"GET",B=(0,o.getTracer)(),q=B.getActiveScopeSpan(),j=!!(null==f?void 0:f.isWrappedByNextServer),H=!!(0,n.getRequestMeta)(e,"minimalMode"),Y=(0,n.getRequestMeta)(e,"incrementalCache")||await h.getIncrementalCache(e,O,b,H);null==Y||Y.resetRequestCache(),globalThis.__incrementalCache=Y;let K={params:U,previewProps:b.preview,renderOpts:{experimental:{authInterrupts:!!O.experimental.authInterrupts},cacheComponents:!!O.cacheComponents,supportsDynamicResponse:G,incrementalCache:Y,cacheLifeProfiles:O.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,n)=>h.onRequestError(e,t,r,n,f)},sharedContext:{buildId:_,deploymentId:A}},$=new E.NodeNextRequest(e),V=new E.NodeNextResponse(t),W=T.NextRequestAdapter.fromNodeNextRequest($,(0,T.signalFromNodeResponse)(t));try{let n,s=async e=>h.handle(W,K).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=B.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==d.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${k} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",r),n.updateName(t))}else e.updateName(`${k} ${m}`)}),i=async n=>{var o,i;let E=async({previousCacheEntry:a})=>{try{if(!H&&C&&S&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let o=await s(n);e.fetchMetrics=K.renderOpts.fetchMetrics;let i=K.renderOpts.pendingWaitUntil;i&&r.waitUntil&&(r.waitUntil(i),i=void 0);let E=K.renderOpts.collectedTags;if(!X)return await (0,c.sendResponse)($,V,o,K.renderOpts.pendingWaitUntil),null;{let e=await o.blob(),t=(0,u.toNodeOutgoingHttpHeaders)(o.headers);E&&(t[N.NEXT_CACHE_TAGS_HEADER]=E),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==K.renderOpts.collectedRevalidate&&!(K.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&K.renderOpts.collectedRevalidate,r=void 0===K.renderOpts.collectedExpire||K.renderOpts.collectedExpire>=N.INFINITE_CACHE?void 0:K.renderOpts.collectedExpire;return{value:{kind:L.CachedRouteKind.APP_ROUTE,status:o.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==a?void 0:a.isStale)&&await h.onRequestError(e,t,{routerKind:"App Router",routePath:m,routeType:"route",revalidateReason:(0,l.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:C})},!1,f),t}},T=await h.handleResponse({req:e,nextConfig:O,cacheKey:P,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:b,isRoutePPREnabled:!1,isOnDemandRevalidate:C,revalidateOnlyGenerated:S,responseGenerator:E,waitUntil:r.waitUntil,isMinimalMode:H});if(!X)return null;if((null==T||null==(o=T.value)?void 0:o.kind)!==L.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==T||null==(i=T.value)?void 0:i.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});H||t.setHeader("x-nextjs-cache",C?"REVALIDATED":T.isMiss?"MISS":T.isStale?"STALE":"HIT"),x&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let d=(0,u.fromNodeOutgoingHttpHeaders)(T.value.headers);return H&&X||d.delete(N.NEXT_CACHE_TAGS_HEADER),!T.cacheControl||t.getHeader("Cache-Control")||d.get("Cache-Control")||d.set("Cache-Control",(0,p.getCacheControlHeader)(T.cacheControl)),await (0,c.sendResponse)($,V,new Response(T.value.body,{headers:d,status:T.value.status||200})),null};j&&q?await i(q):(n=B.getActiveScopeSpan(),await B.withPropagatedContext(e.headers,()=>B.trace(d.BaseServerSpan.handleRequest,{spanName:`${k} ${m}`,kind:o.SpanKind.SERVER,attributes:{"http.method":k,"http.target":e.url}},i),void 0,!j))}catch(t){if(t instanceof R.NoFallbackError||await h.onRequestError(e,t,{routerKind:"App Router",routePath:w,routeType:"route",revalidateReason:(0,l.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:C})},!1,f),X)throw t;return await (0,c.sendResponse)($,V,new Response(null,{status:500})),null}}e.s(["handler",0,f,"patchFetch",0,function(){return(0,r.patchFetch)({workAsyncStorage:I,workUnitAsyncStorage:x})},"routeModule",0,h,"serverHooks",0,b,"workAsyncStorage",0,I,"workUnitAsyncStorage",0,x],9338)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0q2zxq_._.js.map