module.exports=[72654,a=>a.a(async(b,c)=>{try{var d=a.i(37936),e=a.i(66680),f=a.i(18558),g=a.i(5246),h=a.i(58259),i=a.i(41154),j=a.i(13095),k=b([h,i]);[h,i]=k.then?(await k)():k;let w={fetchedAt:0,value:null};function l(a){return String(a||"").trim()||null}function m(a,b="/"){let c=l(a);return c?c.startsWith("/")?c:`/${c}`:b}function n(a,b){let c=l(a.get(b));return c&&c.split(",")[0]?.trim()||null}function o(a){let b=l(a);if(!b)return null;if(b.includes(".")&&b.includes(":")){let[a]=b.split(":");return a||null}return b}async function p(){let a=Date.now();if(a-w.fetchedAt<6e4)return w.value;try{let b=(await (0,i.query)(`SELECT public_key, secret_key, environment, additional_config, endpoint_url
       FROM settings.api_integrations
       WHERE provider = 'meta_pixel'
         AND is_active = TRUE
       LIMIT 1`)).rows[0];if(!b?.public_key)return w={fetchedAt:a,value:null},null;return(w={fetchedAt:a,value:{pixelId:String(b.public_key||"").trim(),accessToken:String(b.secret_key||"").trim()||null,environment:String(b.environment||"production").trim(),additionalConfig:function(a){if(a&&"object"==typeof a&&!Array.isArray(a))return a;if("string"==typeof a&&a.trim())try{let b=JSON.parse(a);if(b&&"object"==typeof b&&!Array.isArray(b))return b}catch{}return{}}(b.additional_config),endpointUrl:String(b.endpoint_url||"").trim()||null}}).value}catch{return w={fetchedAt:a,value:null},null}}async function q({visitEventId:a,sessionId:b,visitorId:c,pageType:d,routePath:f,routeSlug:g,queryString:h,ip:j,userAgent:k,eventSourceUrl:m,fbp:n,fbc:o}){let q,r=await p();if(!r?.pixelId||!r?.accessToken)return;let s=(0,e.randomUUID)(),t=Math.floor(Date.now()/1e3),u=r.endpointUrl||`https://graph.facebook.com/v22.0/${encodeURIComponent(r.pixelId)}/events`,v=l(r.additionalConfig?.test_event_code),w={data:[{event_name:"PageView",event_time:t,event_id:s,action_source:"website",event_source_url:m,user_data:{client_ip_address:j,client_user_agent:k||void 0,fbp:n||void 0,fbc:o||void 0,external_id:((q=String(c||"").trim().toLowerCase())?(0,e.createHash)("sha256").update(q).digest("hex"):null)||void 0},custom_data:{page_type:d||"other",route_path:f||"/",route_slug:g||void 0,query_string:h||void 0}}],access_token:r.accessToken};"sandbox"===r.environment&&v&&(w.test_event_code=v);let x=null,y=null,z=!1,A=null;try{let a=await fetch(u,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(w),cache:"no-store"});x=a.status;try{y=await a.json()}catch{y=null}(z=a.ok&&!y?.error)||(A=l(y?.error?.message)||`Meta API request failed (${a.status})`)}catch(a){A=l(a?.message)||"Meta API request failed"}try{await (0,i.query)(`INSERT INTO analytics.meta_pixel_events (
         visit_event_id,
         session_id,
         event_name,
         event_id,
         pixel_id,
         request_payload,
         response_status,
         response_body,
         is_success,
         error_message,
         created_at
       )
       VALUES ($1, $2::UUID, 'PageView', $3::UUID, $4, $5::jsonb, $6, $7::jsonb, $8, $9, NOW())`,[a,b,s,r.pixelId,JSON.stringify(w),x,y?JSON.stringify(y):null,z,A])}catch{}}async function r({pageType:a,routePath:b,routeSlug:c=null,queryString:d=null,responseStatus:f=200,requestMethod:h="GET"}={}){try{var j,k,p,s,t,u;let r,v,w,x,y,z,A=await (0,g.headers)(),B=l(a)||"other",C=m(b,"/"),D=l(c),E=l(d),F=l(h)||"GET",G=Number.isInteger(f)?f:null,H=l(A.get("user-agent")),I=l(A.get("accept-language")),J=l(A.get("referer")),K=function(a){let b={},c=String(a||"").trim();if(!c)return b;for(let a of c.split(";")){let[c,...d]=a.split("="),e=String(c||"").trim();e&&(b[e]=String(d.join("=")||"").trim())}return b}(A.get("cookie")),L=l(K._fbp),M=l(K._fbc),N=function(a){let b=String(a||"").trim();if(!b)return new URLSearchParams;let c=b.startsWith("?")?b.slice(1):b;return new URLSearchParams(c)}(E),O=(j=N.get("fbclid"),l(j)),P=(k=N.get("utm_source"),l(k)),Q=(p=N.get("utm_medium"),l(p)),R=(s=N.get("utm_campaign"),l(s)),S=(t=N.get("utm_term"),l(t)),T=(u=N.get("utm_content"),l(u)),U=M||(O?`fb.1.${Date.now()}.${O}`:null),{ip:V,ipSource:W,forwardedForChain:X}=function(a){let b=l(a.get("x-forwarded-for")),c=o(b?.split(",")[0]);if(c)return{ip:c,ipSource:"x-forwarded-for",forwardedForChain:b};let d=o(n(a,"x-real-ip"));if(d)return{ip:d,ipSource:"x-real-ip",forwardedForChain:null};let e=o(n(a,"cf-connecting-ip"));return e?{ip:e,ipSource:"cf-connecting-ip",forwardedForChain:null}:{ip:"0.0.0.0",ipSource:"fallback",forwardedForChain:null}}(A),Y=function({ip:a,userAgent:b,acceptLanguage:c}){let d=`${a||""}|${b||""}|${c||""}`,f=(0,e.createHash)("sha256").update(d).digest("hex").slice(0,32);return`v_${f}`}({ip:V,userAgent:H,acceptLanguage:I}),Z=!!(r=String(H||"").toLowerCase())&&/(bot|crawler|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegrambot)/i.test(r),$=(v=l(A.get("x-forwarded-host"))||l(A.get("host"))||"x-alt.id",w=l(A.get("x-forwarded-proto"))||"https",x=m(C,"/"),z=(y=l(E))?y.startsWith("?")?y:`?${y}`:"",`${w}://${v}${x}${z}`),_=await (0,i.query)(`SELECT session_id
       FROM analytics.visitor_sessions
       WHERE visitor_id = $1
         AND last_seen_at >= NOW() - ($2::TEXT || ' minutes')::INTERVAL
       ORDER BY last_seen_at DESC
       LIMIT 1`,[Y,String(30)]),aa=_.rows[0]?.session_id||(0,e.randomUUID)();await (0,i.query)(`INSERT INTO analytics.visitor_sessions (
         session_id,
         visitor_id,
         first_seen_at,
         last_seen_at,
         landing_path,
         entry_referrer,
         first_ip,
         last_ip,
         user_agent,
         accept_language,
         is_bot,
         pageview_count,
         created_at,
         updated_at
       )
       VALUES (
         $1::UUID,
         $2,
         NOW(),
         NOW(),
         $3,
         $4,
         $5::INET,
         $5::INET,
         $6,
         $7,
         $8,
         1,
         NOW(),
         NOW()
       )
       ON CONFLICT (session_id)
       DO UPDATE SET
         last_seen_at = NOW(),
         last_ip = EXCLUDED.last_ip,
         user_agent = COALESCE(EXCLUDED.user_agent, analytics.visitor_sessions.user_agent),
         accept_language = COALESCE(EXCLUDED.accept_language, analytics.visitor_sessions.accept_language),
         is_bot = analytics.visitor_sessions.is_bot OR EXCLUDED.is_bot,
         pageview_count = analytics.visitor_sessions.pageview_count + 1,
         updated_at = NOW()`,[aa,Y,C,J,V,H,I,Z]);let ab=await (0,i.query)(`INSERT INTO analytics.visit_events (
         session_id,
         visitor_id,
         occurred_at,
         page_type,
         route_path,
         route_slug,
         query_string,
         referrer,
         request_method,
         response_status,
         real_ip,
         ip_source,
         forwarded_for_chain,
         user_agent,
         accept_language,
         fbp,
         fbc,
         fbclid,
         utm_source,
         utm_medium,
         utm_campaign,
         utm_term,
         utm_content,
         created_at
       )
       VALUES (
         $1::UUID,
         $2,
         NOW(),
         $3,
         $4,
         $5,
         $6,
         $7,
         $8,
         $9,
         $10::INET,
         $11,
         $12,
         $13,
         $14,
         $15,
         $16,
         $17,
         $18,
         $19,
         $20,
         $21,
         $22,
         NOW()
       )
       RETURNING id`,[aa,Y,B,C,D,E,J,F,G,V,W,X,H,I,L,U,O,P,Q,R,S,T]),ac=Number(ab.rows?.[0]?.id||0)||null;Z||await q({visitEventId:ac,sessionId:aa,visitorId:Y,pageType:B,routePath:C,routeSlug:D,queryString:E,ip:V,userAgent:H,eventSourceUrl:$,fbp:L,fbc:U})}catch{}}function s(a){return Number.parseInt(a,10)||0}function t(a,b=30){let c=Number.parseInt(String(a),10);return Number.isInteger(c)?Math.min(Math.max(c,1),200):b}async function u(a={}){await (0,h.requireRole)("admin");let b=t(a?.leadLimit,10),c=t(a?.eventLimit,10),d=function(a,b=1){let c=Number.parseInt(String(a),10);return Number.isInteger(c)?Math.max(c,1):b}(a?.leadPage,1),[e,f,g,j,k]=await Promise.all([(0,i.query)(`SELECT
           (SELECT COUNT(*) FROM sales.contact_leads) AS leads_total,
           (SELECT COUNT(*) FROM sales.contact_leads WHERE created_at >= date_trunc('day', NOW())) AS leads_today,
           (SELECT COUNT(*) FROM analytics.visitor_sessions) AS visitor_sessions_total,
           (SELECT COUNT(*) FROM analytics.visitor_sessions WHERE first_seen_at >= date_trunc('day', NOW())) AS visitor_sessions_today,
           (SELECT COUNT(*) FROM analytics.visit_events) AS visit_events_total,
           (SELECT COUNT(*) FROM analytics.visit_events WHERE occurred_at >= date_trunc('day', NOW())) AS visit_events_today`),(0,i.query)(`SELECT
           id,
           name,
           email,
           phone,
           source_page,
           channel,
           status,
           real_ip,
           city_name,
           created_at
         FROM sales.contact_leads
         ORDER BY created_at DESC
         LIMIT $1
         OFFSET $2`,[b,(d-1)*b]),(0,i.query)(`SELECT
           page_type,
           route_path,
           COUNT(*)::INT AS total,
           MAX(occurred_at) AS last_occurred_at
         FROM analytics.visit_events
         GROUP BY page_type, route_path
         ORDER BY total DESC, last_occurred_at DESC
         LIMIT $1`,[c]),(0,i.query)(`SELECT status, COUNT(*)::INT AS total
         FROM sales.contact_leads
         GROUP BY status
         ORDER BY total DESC, status ASC`),(0,i.query)(`SELECT route_path, COUNT(*)::INT AS total
         FROM analytics.visit_events
         GROUP BY route_path
         ORDER BY total DESC, route_path ASC
         LIMIT 10`)]),l=e.rows[0]||{},m=s(l.leads_total),n=Math.max(Math.ceil(m/b),1);return{stats:{leadsTotal:m,leadsToday:s(l.leads_today),visitorSessionsTotal:s(l.visitor_sessions_total),visitorSessionsToday:s(l.visitor_sessions_today),visitEventsTotal:s(l.visit_events_total),visitEventsToday:s(l.visit_events_today)},leads:f.rows,visitEvents:g.rows,leadByStatus:j.rows.map(a=>({status:a.status||"unknown",total:s(a.total)})),topRoutes:k.rows.map(a=>({route_path:a.route_path||"/",total:s(a.total)})),leadPagination:{page:d,pageSize:b,total:m,totalPages:n,hasPrev:d>1,hasNext:d<n}}}async function v(a,b){await (0,h.requireRole)("admin");let c=b&&"function"==typeof b.get?b:a,d=Number.parseInt(String(c.get("lead_id")||""),10);if(!Number.isInteger(d)||d<=0)return{ok:!1,message:"ID lead tidak valid."};try{let a=await (0,i.query)(`DELETE FROM sales.contact_leads
       WHERE id = $1
       RETURNING id`,[d]);if(0===a.rowCount)return{ok:!1,message:"Lead tidak ditemukan atau sudah dihapus."};return(0,f.revalidatePath)("/admin/analytic"),(0,f.revalidatePath)("/admin/dashboard"),{ok:!0,message:"Lead berhasil dihapus."}}catch(a){return{ok:!1,message:a?.message||"Gagal menghapus lead."}}}(0,j.ensureServerEntryExports)([r,u,v]),(0,d.registerServerReference)(r,"40bc41cedd0716e522a17b5a1827879d484ec5cfc1",null),(0,d.registerServerReference)(u,"409de16d02a1d76c05408cd16031d8da9803cd392d",null),(0,d.registerServerReference)(v,"60ebc00825a076d3ff17c000edbab73d46b0259d6e",null),a.s(["deleteAdminLeadAction",()=>v,"getAdminAnalyticsData",()=>u,"trackVisitorPageView",()=>r]),c()}catch(a){c(a)}},!1),58146,a=>a.a(async(b,c)=>{try{var d=a.i(58259),e=a.i(44268),f=a.i(19347),g=a.i(72654),h=b([d,e,f,g]);[d,e,f,g]=h.then?(await h)():h,a.s([]),c()}catch(a){c(a)}},!1),57424,a=>a.a(async(b,c)=>{try{var d=a.i(58146),e=a.i(58259),f=a.i(44268),g=a.i(19347),h=a.i(72654),i=b([d,e,f,g,h]);[d,e,f,g,h]=i.then?(await i)():i,a.s(["00202d06ee8e1aaf06f574ea0368ce9769bed8b02d",()=>e.requireUser,"005596edf30cf7d1c5c19d551248ca994f48e852df",()=>f.getAdminDashboardData,"0058d8c19dd7a61362eefec97d349abbcc1bec9b1f",()=>e.getAdminProfileData,"006118eb6db80d3f8dc7f452e39a3b1aba51309b1b",()=>g.getWebsiteBranding,"00641e2d5dc3fe963aa2e3be4b0bfc023b8c6dbfc7",()=>e.getCurrentUser,"00b4f0dc03f7ee566b1c7302240137f951043dde9d",()=>e.logoutAction,"00d3eea315d89e6dc617099e9c6ec216260f3fea7f",()=>g.getAdminSettingsData,"00dd8ef374a8364abba2b76d7c389c982cd02973cf",()=>g.getTrustedLogos,"00f05c537a1fb86d2c561c1df9615072ac77838431",()=>f.getAdminNavItems,"4026c552bed6b0acec643ad2325d5b40a5e91728be",()=>e.requireRole,"405301a48dc15a945be44dc4f82d5f07bf44bd8f46",()=>g.getSeoMetadataByPageKey,"409de16d02a1d76c05408cd16031d8da9803cd392d",()=>h.getAdminAnalyticsData,"40bc41cedd0716e522a17b5a1827879d484ec5cfc1",()=>h.trackVisitorPageView,"40caea94dd9e60af4e8261b49b7336df6cf19647a4",()=>e.activateAccountByToken,"600c15eae3c6258b4859e8425204933647cccf871f",()=>e.loginAction,"600dcbd5d70f6363868a9e798c11f0fe481ebf0abe",()=>g.deleteTrustedLogoAction,"6018890a8517fb2ef1b682a6054fe2ccf923633209",()=>e.resetPasswordAction,"6055e03f1d578d95503e9d660950ba45045e7ba97d",()=>e.registerAction,"605ed5dd78269040e16dcc378b7e26d2c7e1c6ceb5",()=>g.addTrustedLogoAction,"606a730c4f3595da0f7aba0885a16767da9e6582a5",()=>e.requestPasswordResetAction,"607a873ff07092ecbffc6f2640d492250625e4e05e",()=>g.updateApiIntegrationAction,"6080bc3f6efe12959eeedf57b77aa4e61e0922326e",()=>e.updateAdminProfileAction,"60879e4c74f1ee1234e9b96efaab9d8d79787f20a9",()=>g.updateSmtpConfigAction,"6099eec332da78f215f9ff34864f03a56f4bbe93af",()=>g.updateWebsiteConfigAction,"60b37f152ebaa9b34b582d2eb4ceafdf0474ba00da",()=>g.updateSeoMetadataAction,"60e9249f1a139fcfd50363bc1480e22c59f9231e83",()=>g.updateTrustedLogoAction,"60ebc00825a076d3ff17c000edbab73d46b0259d6e",()=>h.deleteAdminLeadAction]),c()}catch(a){c(a)}},!1)];

//# sourceMappingURL=_e575d6d5._.js.map