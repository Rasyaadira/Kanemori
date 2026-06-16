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
  `),function(e){if(e.prepare("SELECT COUNT(*) as count FROM categories").get().count>0)return;let t=e.prepare("INSERT INTO categories (name, type, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)"),a=[["Food & Dining","expense","🍽️","#F97316",1],["Drinks & Snacks","expense","🧋","#FB923C",2],["Groceries","expense","🛒","#84CC16",3],["Transportation","expense","🚌","#3B82F6",4],["Shopping","expense","🛍️","#EC4899",5],["Bills & Utilities","expense","📄","#8B5CF6",6],["Subscriptions","expense","🔄","#A855F7",7],["Entertainment","expense","🎮","#F43F5E",8],["Education","expense","📚","#0EA5E9",9],["Health & Fitness","expense","💊","#10B981",10],["Housing","expense","🏠","#6366F1",11],["Personal Care","expense","✨","#D946EF",12],["Donations","expense","❤️","#F87171",13],["Top Up","expense","📱","#14B8A6",14],["Administrative Fees","expense","📋","#94A3B8",15],["Emergency","expense","🚨","#EF4444",16],["Investment","expense","📈","#059669",17],["Other","expense","📦","#64748B",18]],r=[["Salary","income","💰","#10B981",1],["Freelance","income","💻","#3B82F6",2],["Gift","income","🎁","#EC4899",3],["Refund","income","↩️","#F59E0B",4],["Bonus","income","🎉","#8B5CF6",5],["Side Income","income","📊","#14B8A6",6],["Other Income","income","📥","#64748B",7]];e.transaction(()=>{for(let e of a)t.run(...e);for(let e of r)t.run(...e)})();let n=e.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");n.run("admin_fee_as_expense","true"),n.run("default_account_id",""),n.run("app_name","Kanemori"),n.run("hide_all_balances","false")}(e),globalThis.__db=e,e}e.s(["checkpointForBackup",0,function(){return s().pragma("wal_checkpoint(TRUNCATE)"),o},"getDb",0,s,"invalidateDbConnection",0,function(){if(globalThis.__db){try{globalThis.__db.pragma("wal_checkpoint(TRUNCATE)"),globalThis.__db.close()}catch{}globalThis.__db=void 0}}],43793);var i=e.i(89171);e.s(["safeHandler",0,function(e){return async(...t)=>{try{return await e(...t)}catch(r){let e=r instanceof Error?r:Error(String(r)),t=e.message||"Internal server error",a=e.code;if(console.error(`[API Error] ${t}`,e.stack||""),"ERR_DLOPEN_FAILED"===a)return i.NextResponse.json({error:"Database engine needs to be recompiled. Please run: npm rebuild better-sqlite3",code:"NATIVE_MODULE_ERROR"},{status:503});if(t.includes("database is locked")||t.includes("SQLITE_BUSY"))return i.NextResponse.json({error:"Database is busy, please try again",code:"DB_BUSY"},{status:503});if(t.includes("database disk image is malformed")||t.includes("SQLITE_CORRUPT"))return i.NextResponse.json({error:"Database may be corrupted. Please restore from backup.",code:"DB_CORRUPT"},{status:500});if(t.includes("Not found"))return i.NextResponse.json({error:"Not found"},{status:404});return i.NextResponse.json({error:"Something went wrong. Please try again."},{status:500})}}}],32393)},4287,e=>{"use strict";var t=e.i(47909),a=e.i(74017),r=e.i(96250),n=e.i(59756),o=e.i(61916),s=e.i(74677),i=e.i(69741),E=e.i(16795),d=e.i(87718),T=e.i(95169),l=e.i(47587),c=e.i(66012),u=e.i(70101),p=e.i(26937),N=e.i(10372),R=e.i(93695);e.i(52474);var L=e.i(220),_=e.i(89171),m=e.i(43793),A=e.i(32393);let U=(0,A.safeHandler)(async(e,{params:t})=>{let{id:a}=await t,r=(0,m.getDb)(),n=r.prepare("SELECT * FROM accounts WHERE id = ?").get(a);if(!n)return _.NextResponse.json({error:"Not found"},{status:404});let o=r.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE to_account_id = ?").get(a),s=r.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE from_account_id = ?").get(a),i=r.prepare("SELECT COALESCE(SUM(admin_fee), 0) as total FROM transactions WHERE from_account_id = ? AND type = 'transfer' AND admin_fee > 0").get(a),E=r.prepare(`SELECT COALESCE(SUM(dp.amount), 0) as total FROM debt_payments dp
     JOIN debts d ON dp.debt_id = d.id
     WHERE dp.account_id = ? AND d.type = 'debt'`).get(a),d=r.prepare(`SELECT COALESCE(SUM(dp.amount), 0) as total FROM debt_payments dp
     JOIN debts d ON dp.debt_id = d.id
     WHERE dp.account_id = ? AND d.type = 'receivable'`).get(a),T=o.total-s.total-i.total-E.total+d.total;return _.NextResponse.json({...n,tracked_balance:T})}),O=(0,A.safeHandler)(async(e,{params:t})=>{let{id:a}=await t,r=(0,m.getDb)(),{name:n,type:o,balance:s,is_active:i,notes:E,hide_balance:d}=await e.json();r.prepare(`UPDATE accounts SET name=?, type=?, balance=?, is_active=?, notes=?, hide_balance=?, updated_at=datetime('now')
     WHERE id=?`).run(n,o,s??0,i??1,E||null,d??0,a);let T=r.prepare("SELECT * FROM accounts WHERE id = ?").get(a);return _.NextResponse.json(T)}),g=(0,A.safeHandler)(async(e,{params:t})=>{let{id:a}=await t;return(0,m.getDb)().prepare("UPDATE accounts SET is_active = 0 WHERE id = ?").run(a),_.NextResponse.json({success:!0})});e.s(["DELETE",0,g,"GET",0,U,"PUT",0,O],38490);var h=e.i(38490);let x=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/accounts/[id]/route",pathname:"/api/accounts/[id]",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/accounts/[id]/route.ts",nextConfigOutput:"",userland:h,...{}}),{workAsyncStorage:I,workUnitAsyncStorage:C,serverHooks:f}=x;async function b(e,t,r){r.requestMeta&&(0,n.setRequestMeta)(e,r.requestMeta),x.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let _="/api/accounts/[id]/route";_=_.replace(/\/index$/,"")||"/";let m=await x.prepare(e,t,{srcPage:_,multiZoneDraftMode:!1});if(!m)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:A,deploymentId:U,params:O,nextConfig:g,parsedUrl:h,isDraftMode:I,prerenderManifest:C,routerServerContext:f,isOnDemandRevalidate:b,revalidateOnlyGenerated:S,resolvedPathname:v,clientReferenceManifest:F,serverActionsManifest:y}=m,w=(0,i.normalizeAppPath)(_),D=!!(C.dynamicRoutes[w]||C.routes[v]),X=async()=>((null==f?void 0:f.render404)?await f.render404(e,t,h,!1):t.end("This page could not be found"),null);if(D&&!I){let e=!!C.routes[v],t=C.dynamicRoutes[w];if(t&&!1===t.fallback&&!e){if(g.adapterPath)return await X();throw new R.NoFallbackError}}let M=null;!D||x.isDev||I||(M="/index"===(M=v)?"/":M);let P=!0===x.isDev||!D,G=D&&!P;y&&F&&(0,s.setManifestsSingleton)({page:_,clientReferenceManifest:F,serverActionsManifest:y});let k=e.method||"GET",B=(0,o.getTracer)(),H=B.getActiveScopeSpan(),j=!!(null==f?void 0:f.isWrappedByNextServer),q=!!(0,n.getRequestMeta)(e,"minimalMode"),Y=(0,n.getRequestMeta)(e,"incrementalCache")||await x.getIncrementalCache(e,g,C,q);null==Y||Y.resetRequestCache(),globalThis.__incrementalCache=Y;let K={params:O,previewProps:C.preview,renderOpts:{experimental:{authInterrupts:!!g.experimental.authInterrupts},cacheComponents:!!g.cacheComponents,supportsDynamicResponse:P,incrementalCache:Y,cacheLifeProfiles:g.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,n)=>x.onRequestError(e,t,r,n,f)},sharedContext:{buildId:A,deploymentId:U}},W=new E.NodeNextRequest(e),$=new E.NodeNextResponse(t),V=d.NextRequestAdapter.fromNodeNextRequest(W,(0,d.signalFromNodeResponse)(t));try{let n,s=async e=>x.handle(V,K).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=B.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==T.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${k} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",r),n.updateName(t))}else e.updateName(`${k} ${_}`)}),i=async n=>{var o,i;let E=async({previousCacheEntry:a})=>{try{if(!q&&b&&S&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let o=await s(n);e.fetchMetrics=K.renderOpts.fetchMetrics;let i=K.renderOpts.pendingWaitUntil;i&&r.waitUntil&&(r.waitUntil(i),i=void 0);let E=K.renderOpts.collectedTags;if(!D)return await (0,c.sendResponse)(W,$,o,K.renderOpts.pendingWaitUntil),null;{let e=await o.blob(),t=(0,u.toNodeOutgoingHttpHeaders)(o.headers);E&&(t[N.NEXT_CACHE_TAGS_HEADER]=E),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==K.renderOpts.collectedRevalidate&&!(K.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&K.renderOpts.collectedRevalidate,r=void 0===K.renderOpts.collectedExpire||K.renderOpts.collectedExpire>=N.INFINITE_CACHE?void 0:K.renderOpts.collectedExpire;return{value:{kind:L.CachedRouteKind.APP_ROUTE,status:o.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==a?void 0:a.isStale)&&await x.onRequestError(e,t,{routerKind:"App Router",routePath:_,routeType:"route",revalidateReason:(0,l.getRevalidateReason)({isStaticGeneration:G,isOnDemandRevalidate:b})},!1,f),t}},d=await x.handleResponse({req:e,nextConfig:g,cacheKey:M,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:C,isRoutePPREnabled:!1,isOnDemandRevalidate:b,revalidateOnlyGenerated:S,responseGenerator:E,waitUntil:r.waitUntil,isMinimalMode:q});if(!D)return null;if((null==d||null==(o=d.value)?void 0:o.kind)!==L.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(i=d.value)?void 0:i.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});q||t.setHeader("x-nextjs-cache",b?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),I&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let T=(0,u.fromNodeOutgoingHttpHeaders)(d.value.headers);return q&&D||T.delete(N.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||T.get("Cache-Control")||T.set("Cache-Control",(0,p.getCacheControlHeader)(d.cacheControl)),await (0,c.sendResponse)(W,$,new Response(d.value.body,{headers:T,status:d.value.status||200})),null};j&&H?await i(H):(n=B.getActiveScopeSpan(),await B.withPropagatedContext(e.headers,()=>B.trace(T.BaseServerSpan.handleRequest,{spanName:`${k} ${_}`,kind:o.SpanKind.SERVER,attributes:{"http.method":k,"http.target":e.url}},i),void 0,!j))}catch(t){if(t instanceof R.NoFallbackError||await x.onRequestError(e,t,{routerKind:"App Router",routePath:w,routeType:"route",revalidateReason:(0,l.getRevalidateReason)({isStaticGeneration:G,isOnDemandRevalidate:b})},!1,f),D)throw t;return await (0,c.sendResponse)(W,$,new Response(null,{status:500})),null}}e.s(["handler",0,b,"patchFetch",0,function(){return(0,r.patchFetch)({workAsyncStorage:I,workUnitAsyncStorage:C})},"routeModule",0,x,"serverHooks",0,f,"workAsyncStorage",0,I,"workUnitAsyncStorage",0,C],4287)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0quabbp._.js.map