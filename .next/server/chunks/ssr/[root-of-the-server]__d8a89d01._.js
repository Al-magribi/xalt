module.exports=[50227,(a,b,c)=>{b.exports=a.x("node:path",()=>require("node:path"))},12714,(a,b,c)=>{b.exports=a.x("node:fs/promises",()=>require("node:fs/promises"))},37936,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"registerServerReference",{enumerable:!0,get:function(){return d.registerServerReference}});let d=a.r(11857)},13095,(a,b,c)=>{"use strict";function d(a){for(let b=0;b<a.length;b++){let c=a[b];if("function"!=typeof c)throw Object.defineProperty(Error(`A "use server" file can only export async functions, found ${typeof c}.
Read more: https://nextjs.org/docs/messages/invalid-use-server-value`),"__NEXT_ERROR_CODE",{value:"E352",enumerable:!1,configurable:!0})}}Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"ensureServerEntryExports",{enumerable:!0,get:function(){return d}})},80769,(a,b,c)=>{b.exports=a.x("bcrypt-a3fecf8c027c10c9",()=>require("bcrypt-a3fecf8c027c10c9"))},27699,(a,b,c)=>{b.exports=a.x("events",()=>require("events"))},92509,(a,b,c)=>{b.exports=a.x("url",()=>require("url"))},21517,(a,b,c)=>{b.exports=a.x("http",()=>require("http"))},24836,(a,b,c)=>{b.exports=a.x("https",()=>require("https"))},6461,(a,b,c)=>{b.exports=a.x("zlib",()=>require("zlib"))},88947,(a,b,c)=>{b.exports=a.x("stream",()=>require("stream"))},63818,a=>{a.v({name:"nodemailer",version:"8.0.1",description:"Easy as cake e-mail sending from your Node.js applications",main:"lib/nodemailer.js",scripts:{test:"node --test --test-concurrency=1 test/**/*.test.js test/**/*-test.js","test:coverage":"c8 node --test --test-concurrency=1 test/**/*.test.js test/**/*-test.js",format:'prettier --write "**/*.{js,json,md}"',"format:check":'prettier --check "**/*.{js,json,md}"',lint:"eslint .","lint:fix":"eslint . --fix",update:"rm -rf node_modules/ package-lock.json && ncu -u && npm install"},repository:{type:"git",url:"https://github.com/nodemailer/nodemailer.git"},keywords:["Nodemailer"],author:"Andris Reinman",license:"MIT-0",bugs:{url:"https://github.com/nodemailer/nodemailer/issues"},homepage:"https://nodemailer.com/",devDependencies:{"@aws-sdk/client-sesv2":"3.985.0",bunyan:"1.8.15",c8:"10.1.3",eslint:"10.0.0","eslint-config-prettier":"10.1.8",globals:"17.3.0",libbase64:"1.3.0",libmime:"5.3.7",libqp:"2.1.1","nodemailer-ntlm-auth":"1.0.4",prettier:"3.8.1",proxy:"1.0.2","proxy-test-server":"1.0.0","smtp-server":"3.18.1"},engines:{node:">=6.0.0"}})},4446,(a,b,c)=>{b.exports=a.x("net",()=>require("net"))},79594,(a,b,c)=>{b.exports=a.x("dns",()=>require("dns"))},55004,(a,b,c)=>{b.exports=a.x("tls",()=>require("tls"))},55381,a=>{a.v(JSON.parse('{"1und1":{"description":"1&1 Mail (German hosting provider)","host":"smtp.1und1.de","port":465,"secure":true,"authMethod":"LOGIN"},"126":{"description":"126 Mail (NetEase)","host":"smtp.126.com","port":465,"secure":true},"163":{"description":"163 Mail (NetEase)","host":"smtp.163.com","port":465,"secure":true},"Aliyun":{"description":"Alibaba Cloud Mail","domains":["aliyun.com"],"host":"smtp.aliyun.com","port":465,"secure":true},"AliyunQiye":{"description":"Alibaba Cloud Enterprise Mail","host":"smtp.qiye.aliyun.com","port":465,"secure":true},"AOL":{"description":"AOL Mail","domains":["aol.com"],"host":"smtp.aol.com","port":587},"Aruba":{"description":"Aruba PEC (Italian email provider)","domains":["aruba.it","pec.aruba.it"],"aliases":["Aruba PEC"],"host":"smtps.aruba.it","port":465,"secure":true,"authMethod":"LOGIN"},"Bluewin":{"description":"Bluewin (Swiss email provider)","host":"smtpauths.bluewin.ch","domains":["bluewin.ch"],"port":465},"BOL":{"description":"BOL Mail (Brazilian provider)","domains":["bol.com.br"],"host":"smtp.bol.com.br","port":587,"requireTLS":true},"DebugMail":{"description":"DebugMail (email testing service)","host":"debugmail.io","port":25},"Disroot":{"description":"Disroot (privacy-focused provider)","domains":["disroot.org"],"host":"disroot.org","port":587,"secure":false,"authMethod":"LOGIN"},"DynectEmail":{"description":"Dyn Email Delivery","aliases":["Dynect"],"host":"smtp.dynect.net","port":25},"ElasticEmail":{"description":"Elastic Email","aliases":["Elastic Email"],"host":"smtp.elasticemail.com","port":465,"secure":true},"Ethereal":{"description":"Ethereal Email (email testing service)","aliases":["ethereal.email"],"host":"smtp.ethereal.email","port":587},"FastMail":{"description":"FastMail","domains":["fastmail.fm"],"host":"smtp.fastmail.com","port":465,"secure":true},"Feishu Mail":{"description":"Feishu Mail (Lark)","aliases":["Feishu","FeishuMail"],"domains":["www.feishu.cn"],"host":"smtp.feishu.cn","port":465,"secure":true},"Forward Email":{"description":"Forward Email (email forwarding service)","aliases":["FE","ForwardEmail"],"domains":["forwardemail.net"],"host":"smtp.forwardemail.net","port":465,"secure":true},"GandiMail":{"description":"Gandi Mail","aliases":["Gandi","Gandi Mail"],"host":"mail.gandi.net","port":587},"Gmail":{"description":"Gmail","aliases":["Google Mail"],"domains":["gmail.com","googlemail.com"],"host":"smtp.gmail.com","port":465,"secure":true},"GmailWorkspace":{"description":"Gmail Workspace","aliases":["Google Workspace Mail"],"host":"smtp-relay.gmail.com","port":465,"secure":true},"GMX":{"description":"GMX Mail","domains":["gmx.com","gmx.net","gmx.de"],"host":"mail.gmx.com","port":587},"Godaddy":{"description":"GoDaddy Email (US)","host":"smtpout.secureserver.net","port":25},"GodaddyAsia":{"description":"GoDaddy Email (Asia)","host":"smtp.asia.secureserver.net","port":25},"GodaddyEurope":{"description":"GoDaddy Email (Europe)","host":"smtp.europe.secureserver.net","port":25},"hot.ee":{"description":"Hot.ee (Estonian email provider)","host":"mail.hot.ee"},"Hotmail":{"description":"Outlook.com / Hotmail","aliases":["Outlook","Outlook.com","Hotmail.com"],"domains":["hotmail.com","outlook.com"],"host":"smtp-mail.outlook.com","port":587},"iCloud":{"description":"iCloud Mail","aliases":["Me","Mac"],"domains":["me.com","mac.com"],"host":"smtp.mail.me.com","port":587},"Infomaniak":{"description":"Infomaniak Mail (Swiss hosting provider)","host":"mail.infomaniak.com","domains":["ik.me","ikmail.com","etik.com"],"port":587},"KolabNow":{"description":"KolabNow (secure email service)","domains":["kolabnow.com"],"aliases":["Kolab"],"host":"smtp.kolabnow.com","port":465,"secure":true,"authMethod":"LOGIN"},"Loopia":{"description":"Loopia (Swedish hosting provider)","host":"mailcluster.loopia.se","port":465},"Loops":{"description":"Loops","host":"smtp.loops.so","port":587},"mail.ee":{"description":"Mail.ee (Estonian email provider)","host":"smtp.mail.ee"},"Mail.ru":{"description":"Mail.ru","host":"smtp.mail.ru","port":465,"secure":true},"Mailcatch.app":{"description":"Mailcatch (email testing service)","host":"sandbox-smtp.mailcatch.app","port":2525},"Maildev":{"description":"MailDev (local email testing)","port":1025,"ignoreTLS":true},"MailerSend":{"description":"MailerSend","host":"smtp.mailersend.net","port":587},"Mailgun":{"description":"Mailgun","host":"smtp.mailgun.org","port":465,"secure":true},"Mailjet":{"description":"Mailjet","host":"in.mailjet.com","port":587},"Mailosaur":{"description":"Mailosaur (email testing service)","host":"mailosaur.io","port":25},"Mailtrap":{"description":"Mailtrap","host":"live.smtp.mailtrap.io","port":587},"Mandrill":{"description":"Mandrill (by Mailchimp)","host":"smtp.mandrillapp.com","port":587},"Naver":{"description":"Naver Mail (Korean email provider)","host":"smtp.naver.com","port":587},"OhMySMTP":{"description":"OhMySMTP (email delivery service)","host":"smtp.ohmysmtp.com","port":587,"secure":false},"One":{"description":"One.com Email","host":"send.one.com","port":465,"secure":true},"OpenMailBox":{"description":"OpenMailBox","aliases":["OMB","openmailbox.org"],"host":"smtp.openmailbox.org","port":465,"secure":true},"Outlook365":{"description":"Microsoft 365 / Office 365","host":"smtp.office365.com","port":587,"secure":false},"Postmark":{"description":"Postmark","aliases":["PostmarkApp"],"host":"smtp.postmarkapp.com","port":2525},"Proton":{"description":"Proton Mail","aliases":["ProtonMail","Proton.me","Protonmail.com","Protonmail.ch"],"domains":["proton.me","protonmail.com","pm.me","protonmail.ch"],"host":"smtp.protonmail.ch","port":587,"requireTLS":true},"qiye.aliyun":{"description":"Alibaba Mail Enterprise Edition","host":"smtp.mxhichina.com","port":"465","secure":true},"QQ":{"description":"QQ Mail","domains":["qq.com"],"host":"smtp.qq.com","port":465,"secure":true},"QQex":{"description":"QQ Enterprise Mail","aliases":["QQ Enterprise"],"domains":["exmail.qq.com"],"host":"smtp.exmail.qq.com","port":465,"secure":true},"Resend":{"description":"Resend","host":"smtp.resend.com","port":465,"secure":true},"Runbox":{"description":"Runbox (Norwegian email provider)","domains":["runbox.com"],"host":"smtp.runbox.com","port":465,"secure":true},"SendCloud":{"description":"SendCloud (Chinese email delivery)","host":"smtp.sendcloud.net","port":2525},"SendGrid":{"description":"SendGrid","host":"smtp.sendgrid.net","port":587},"SendinBlue":{"description":"Brevo (formerly Sendinblue)","aliases":["Brevo"],"host":"smtp-relay.brevo.com","port":587},"SendPulse":{"description":"SendPulse","host":"smtp-pulse.com","port":465,"secure":true},"SES":{"description":"AWS SES US East (N. Virginia)","host":"email-smtp.us-east-1.amazonaws.com","port":465,"secure":true},"SES-AP-NORTHEAST-1":{"description":"AWS SES Asia Pacific (Tokyo)","host":"email-smtp.ap-northeast-1.amazonaws.com","port":465,"secure":true},"SES-AP-NORTHEAST-2":{"description":"AWS SES Asia Pacific (Seoul)","host":"email-smtp.ap-northeast-2.amazonaws.com","port":465,"secure":true},"SES-AP-NORTHEAST-3":{"description":"AWS SES Asia Pacific (Osaka)","host":"email-smtp.ap-northeast-3.amazonaws.com","port":465,"secure":true},"SES-AP-SOUTH-1":{"description":"AWS SES Asia Pacific (Mumbai)","host":"email-smtp.ap-south-1.amazonaws.com","port":465,"secure":true},"SES-AP-SOUTHEAST-1":{"description":"AWS SES Asia Pacific (Singapore)","host":"email-smtp.ap-southeast-1.amazonaws.com","port":465,"secure":true},"SES-AP-SOUTHEAST-2":{"description":"AWS SES Asia Pacific (Sydney)","host":"email-smtp.ap-southeast-2.amazonaws.com","port":465,"secure":true},"SES-CA-CENTRAL-1":{"description":"AWS SES Canada (Central)","host":"email-smtp.ca-central-1.amazonaws.com","port":465,"secure":true},"SES-EU-CENTRAL-1":{"description":"AWS SES Europe (Frankfurt)","host":"email-smtp.eu-central-1.amazonaws.com","port":465,"secure":true},"SES-EU-NORTH-1":{"description":"AWS SES Europe (Stockholm)","host":"email-smtp.eu-north-1.amazonaws.com","port":465,"secure":true},"SES-EU-WEST-1":{"description":"AWS SES Europe (Ireland)","host":"email-smtp.eu-west-1.amazonaws.com","port":465,"secure":true},"SES-EU-WEST-2":{"description":"AWS SES Europe (London)","host":"email-smtp.eu-west-2.amazonaws.com","port":465,"secure":true},"SES-EU-WEST-3":{"description":"AWS SES Europe (Paris)","host":"email-smtp.eu-west-3.amazonaws.com","port":465,"secure":true},"SES-SA-EAST-1":{"description":"AWS SES South America (São Paulo)","host":"email-smtp.sa-east-1.amazonaws.com","port":465,"secure":true},"SES-US-EAST-1":{"description":"AWS SES US East (N. Virginia)","host":"email-smtp.us-east-1.amazonaws.com","port":465,"secure":true},"SES-US-EAST-2":{"description":"AWS SES US East (Ohio)","host":"email-smtp.us-east-2.amazonaws.com","port":465,"secure":true},"SES-US-GOV-EAST-1":{"description":"AWS SES GovCloud (US-East)","host":"email-smtp.us-gov-east-1.amazonaws.com","port":465,"secure":true},"SES-US-GOV-WEST-1":{"description":"AWS SES GovCloud (US-West)","host":"email-smtp.us-gov-west-1.amazonaws.com","port":465,"secure":true},"SES-US-WEST-1":{"description":"AWS SES US West (N. California)","host":"email-smtp.us-west-1.amazonaws.com","port":465,"secure":true},"SES-US-WEST-2":{"description":"AWS SES US West (Oregon)","host":"email-smtp.us-west-2.amazonaws.com","port":465,"secure":true},"Seznam":{"description":"Seznam Email (Czech email provider)","aliases":["Seznam Email"],"domains":["seznam.cz","email.cz","post.cz","spoluzaci.cz"],"host":"smtp.seznam.cz","port":465,"secure":true},"SMTP2GO":{"description":"SMTP2GO","host":"mail.smtp2go.com","port":2525},"Sparkpost":{"description":"SparkPost","aliases":["SparkPost","SparkPost Mail"],"domains":["sparkpost.com"],"host":"smtp.sparkpostmail.com","port":587,"secure":false},"Tipimail":{"description":"Tipimail (email delivery service)","host":"smtp.tipimail.com","port":587},"Tutanota":{"description":"Tutanota (Tuta Mail)","domains":["tutanota.com","tuta.com","tutanota.de","tuta.io"],"host":"smtp.tutanota.com","port":465,"secure":true},"Yahoo":{"description":"Yahoo Mail","domains":["yahoo.com"],"host":"smtp.mail.yahoo.com","port":465,"secure":true},"Yandex":{"description":"Yandex Mail","domains":["yandex.ru"],"host":"smtp.yandex.ru","port":465,"secure":true},"Zimbra":{"description":"Zimbra Mail Server","aliases":["Zimbra Collaboration"],"host":"smtp.zimbra.com","port":587,"requireTLS":true},"Zoho":{"description":"Zoho Mail","host":"smtp.zoho.com","port":465,"secure":true,"authMethod":"LOGIN"}}'))},33405,(a,b,c)=>{b.exports=a.x("child_process",()=>require("child_process"))},66680,(a,b,c)=>{b.exports=a.x("node:crypto",()=>require("node:crypto"))},57764,(a,b,c)=>{b.exports=a.x("node:url",()=>require("node:url"))},72654,a=>a.a(async(b,c)=>{try{var d=a.i(37936),e=a.i(66680),f=a.i(18558),g=a.i(5246),h=a.i(58259),i=a.i(41154),j=a.i(13095),k=b([h,i]);[h,i]=k.then?(await k)():k;let w={fetchedAt:0,value:null};function l(a){return String(a||"").trim()||null}function m(a,b="/"){let c=l(a);return c?c.startsWith("/")?c:`/${c}`:b}function n(a,b){let c=l(a.get(b));return c&&c.split(",")[0]?.trim()||null}function o(a){let b=l(a);if(!b)return null;if(b.includes(".")&&b.includes(":")){let[a]=b.split(":");return a||null}return b}async function p(){let a=Date.now();if(a-w.fetchedAt<6e4)return w.value;try{let b=(await (0,i.query)(`SELECT public_key, secret_key, environment, additional_config, endpoint_url
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
       RETURNING id`,[d]);if(0===a.rowCount)return{ok:!1,message:"Lead tidak ditemukan atau sudah dihapus."};return(0,f.revalidatePath)("/admin/analytic"),(0,f.revalidatePath)("/admin/dashboard"),{ok:!0,message:"Lead berhasil dihapus."}}catch(a){return{ok:!1,message:a?.message||"Gagal menghapus lead."}}}(0,j.ensureServerEntryExports)([r,u,v]),(0,d.registerServerReference)(r,"40bc622a4205d54f0650f1316f964859272bb08e59",null),(0,d.registerServerReference)(u,"4065e06357b2b40cf9a707782fdd6645958ceb02fe",null),(0,d.registerServerReference)(v,"6043fbc0ed0b1c0bcb52fecbc876aede104d4fdb8e",null),a.s(["deleteAdminLeadAction",()=>v,"getAdminAnalyticsData",()=>u,"trackVisitorPageView",()=>r]),c()}catch(a){c(a)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__d8a89d01._.js.map