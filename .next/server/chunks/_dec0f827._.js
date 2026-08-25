module.exports=[28932,e=>{"use strict";function t(e,r=""){if("string"!=typeof e)return r;let i=e.trim();if(!i)return r;if(i.startsWith("blob:")||i.startsWith("data:")||/^https?:\/\//i.test(i)||i.startsWith("//"))return i;let a=i.replace(/\\/g,"/");if(/^\/?public\//i.test(a))return`/${a.replace(/^\/?public\//i,"")}`;let o=a.toLowerCase().indexOf("/public/");return o>=0?a.slice(o+7):/^\.?\/?public\//i.test(a)?`/${a.replace(/^\.?\/?public\//i,"")}`:/^uploads\//i.test(a)?`/${a}`:a.startsWith("/")?a:`/${a.replace(/^\.?\//,"")}`}e.s(["resolveAssetUrl",()=>t])},90092,e=>e.a(async(t,r)=>{try{var i=e.i(45015),a=e.i(66680),o=e.i(12714),n=e.i(50227),s=e.i(65044),l=e.i(78627),u=e.i(28932),_=e.i(95975),d=t([l]);[l]=d.then?(await d)():d;let M="/uploads/settings/",P=n.default.join(process.cwd(),"public","uploads","settings");function g(e){if(!e)return{};if("object"==typeof e)return e;try{return JSON.parse(e)}catch{return{}}}function m(e){var t;return{id:Number(e.id),page_key:e.page_key,page_path:e.page_path,meta_title:e.meta_title,meta_description:e.meta_description,meta_keywords:(t=e.meta_keywords,Array.isArray(t)?t:[]),canonical_url:e.canonical_url||"",robots_index:!!e.robots_index,robots_follow:!!e.robots_follow,og_title:e.og_title||"",og_description:e.og_description||"",og_image_url:e.og_image_url||"",og_type:e.og_type||"website",twitter_card:e.twitter_card||"summary_large_image",twitter_title:e.twitter_title||"",twitter_description:e.twitter_description||"",twitter_image_url:e.twitter_image_url||"",updated_at:e.updated_at}}function c(e){return{id:Number(e.id),provider:e.provider,display_name:e.display_name,environment:e.environment,is_active:!!e.is_active,public_key:e.public_key||"",secret_key:e.secret_key||"",merchant_id:e.merchant_id||"",endpoint_url:e.endpoint_url||"",additional_config:g(e.additional_config),last_tested_at:e.last_tested_at,updated_at:e.updated_at}}function p(e){return{id:Number(e.id),brand_name:e.brand_name||"",logo_url:(0,u.resolveAssetUrl)(e.logo_url),sort_order:Number(e.sort_order||0),is_active:!!e.is_active}}function f(e){return{id:Number(e.id),question:e.question||"",answer:e.answer||"",sort_order:Number(e.sort_order||0),is_active:!!e.is_active,updated_at:e.updated_at}}function h(e){return{id:Number(e.id),client_name:e.client_name||"",title:e.title||"",quote:e.quote||"",link_url:e.link_url||"",rating:Number(e.rating||5),sort_order:Number(e.sort_order||0),is_active:!!e.is_active,updated_at:e.updated_at}}function b(e,t=!1){if(null==e)return t;let r=String(e).toLowerCase();return"1"===r||"true"===r||"on"===r}function v(e,t=0){let r=Number.parseInt(String(e??""),10);return Number.isInteger(r)?r:t}async function w(e){let t=function(e){if(!("string"==typeof e&&(e.startsWith(M)||e.startsWith("/public/uploads/settings/"))))return null;let t=e.replace(/^\/public\//i,"").replace(/^\//,"");return n.default.join(process.cwd(),"public",t)}(e);if(t)try{await o.default.unlink(t)}catch(e){if(e?.code!=="ENOENT")throw e}}async function y(e){if(!(e instanceof File)||0===e.size)return null;if(!e.type?.startsWith("image/"))throw Error("File harus berupa gambar.");if(e.size>5242880)throw Error("Ukuran file melebihi 5MB.");await o.default.mkdir(P,{recursive:!0});let t=function(e=""){let t=n.default.extname(e).toLowerCase();return t&&t.replace(/[^.a-z0-9]/g,"")||".png"}(e.name),r=`${Date.now()}-${a.default.randomUUID()}${t}`,i=n.default.join(P,r),s=Buffer.from(await e.arrayBuffer());return await o.default.writeFile(i,s),`${M}${r}`}function k(){(0,s.revalidatePath)("/admin/setting"),(0,s.revalidatePath)("/"),(0,s.revalidatePath)("/merchandise"),(0,s.revalidatePath)("/robots.txt"),(0,s.revalidatePath)("/sitemap.xml")}function S(){(0,s.revalidatePath)("/"),(0,s.revalidatePath)("/admin/setting"),(0,s.revalidatePath)("/robots.txt"),(0,s.revalidatePath)("/sitemap.xml")}async function $(){let e=(await (0,l.query)(`SELECT
       site_name,
       app_url,
       logo_url,
       favicon_url,
       og_image_url,
       site_tagline,
       hero_title,
       hero_description,
       hero_note,
       hero_image_url,
       hero_badge_title,
       hero_badge_text,
       whatsapp_number,
       support_email,
       instagram_url,
       linkedin_url
     FROM settings.website_config
     WHERE id = 1
     LIMIT 1`)).rows[0]||{};return{site_name:e.site_name||"X-ALT",app_url:e.app_url||"",logo_url:(0,u.resolveAssetUrl)(e.logo_url),favicon_url:(0,u.resolveAssetUrl)(e.favicon_url),og_image_url:(0,u.resolveAssetUrl)(e.og_image_url),site_tagline:e.site_tagline||"",hero_title:e.hero_title||"",hero_description:e.hero_description||"",hero_note:e.hero_note||"",hero_image_url:(0,u.resolveAssetUrl)(e.hero_image_url),hero_badge_title:e.hero_badge_title||"",hero_badge_text:e.hero_badge_text||"",whatsapp_number:e.whatsapp_number||"",support_email:e.support_email||"",instagram_url:e.instagram_url||"",linkedin_url:e.linkedin_url||""}}async function E(e){if(!e)return null;try{let t=(await (0,l.query)(`SELECT
         id,
         page_key,
         page_path,
         meta_title,
         meta_description,
         meta_keywords,
         canonical_url,
         robots_index,
         robots_follow,
         og_title,
         og_description,
         og_image_url,
         og_type,
         twitter_card,
         twitter_title,
         twitter_description,
         twitter_image_url,
         updated_at
       FROM settings.seo_metadata
       WHERE page_key = $1
       LIMIT 1`,[e])).rows[0];return t?m(t):null}catch{return null}}async function R(){return(await (0,l.query)(`SELECT
       id,
       brand_name,
       logo_url,
       sort_order,
       is_active
     FROM content.trusted_logos
     WHERE is_active = TRUE
     ORDER BY sort_order ASC, id ASC`)).rows.map(p)}async function L(){var e,t;let[r,i,a,o,n,s,_]=await Promise.all([(0,l.query)(`SELECT
           id,
           site_name,
           site_tagline,
           app_url,
           logo_url,
           favicon_url,
           og_image_url,
           hero_title,
           hero_description,
           hero_note,
           hero_image_url,
           hero_badge_title,
           hero_badge_text,
           default_language,
           support_email,
           support_phone,
           whatsapp_number,
           instagram_url,
           linkedin_url,
           updated_at
         FROM settings.website_config
         WHERE id = 1
         LIMIT 1`),(0,l.query)(`SELECT
           id,
           page_key,
           page_path,
           meta_title,
           meta_description,
           meta_keywords,
           canonical_url,
           robots_index,
           robots_follow,
           og_title,
           og_description,
           og_image_url,
           og_type,
           twitter_card,
           twitter_title,
           twitter_description,
           twitter_image_url,
           updated_at
         FROM settings.seo_metadata
         ORDER BY updated_at DESC, id DESC`),(0,l.query)(`SELECT
           id,
           provider,
           display_name,
           environment,
           is_active,
           public_key,
           secret_key,
           merchant_id,
           endpoint_url,
           additional_config,
           last_tested_at,
           updated_at
         FROM settings.api_integrations
         ORDER BY display_name ASC`),(0,l.query)(`SELECT
           id,
           provider,
           host,
           port,
           secure,
           encryption,
           username,
           password,
           from_name,
           from_email,
           reply_to_email,
           is_active,
           last_tested_at,
           updated_at
         FROM settings.smtp_config
         WHERE id = 1
         LIMIT 1`),(0,l.query)(`SELECT
           id,
           brand_name,
           logo_url,
           sort_order,
           is_active
         FROM content.trusted_logos
         ORDER BY sort_order ASC, id ASC`),(0,l.query)(`SELECT
           id,
           question,
           answer,
           sort_order,
           is_active,
           updated_at
         FROM content.faqs
         ORDER BY sort_order ASC, id ASC`),(0,l.query)(`SELECT
           id,
           client_name,
           title,
           quote,
           link_url,
           rating,
           sort_order,
           is_active,
           updated_at
         FROM content.testimonials
         ORDER BY sort_order ASC, id ASC`)]);return{websiteConfig:(e=r.rows[0])?{id:Number(e.id),site_name:e.site_name||"",site_tagline:e.site_tagline||"",logo_url:(0,u.resolveAssetUrl)(e.logo_url),favicon_url:(0,u.resolveAssetUrl)(e.favicon_url),og_image_url:(0,u.resolveAssetUrl)(e.og_image_url),hero_title:e.hero_title||"",hero_description:e.hero_description||"",hero_note:e.hero_note||"",hero_image_url:(0,u.resolveAssetUrl)(e.hero_image_url),hero_badge_title:e.hero_badge_title||"",hero_badge_text:e.hero_badge_text||"",default_language:e.default_language||"id",app_url:e.app_url||"",support_email:e.support_email||"",support_phone:e.support_phone||"",whatsapp_number:e.whatsapp_number||"",instagram_url:e.instagram_url||"",linkedin_url:e.linkedin_url||"",updated_at:e.updated_at}:null,seoMetadata:i.rows.map(m),apiIntegrations:a.rows.map(c),smtpConfig:(t=o.rows[0])?{id:Number(t.id),provider:t.provider||"smtp",host:t.host||"",port:Number(t.port||0),secure:!!t.secure,encryption:t.encryption||"tls",username:t.username||"",password:t.password||"",from_name:t.from_name||"",from_email:t.from_email||"",reply_to_email:t.reply_to_email||"",is_active:!!t.is_active,last_tested_at:t.last_tested_at,updated_at:t.updated_at}:null,trustedLogos:n.rows.map(p),faqs:s.rows.map(f),testimonials:_.rows.map(h)}}async function O(e,t){let r=String(t.get("site_name")||"").trim(),i=String(t.get("site_tagline")||"").trim(),a=String(t.get("app_url")||"").trim(),o=String(t.get("hero_title")||"").trim(),n=String(t.get("hero_description")||"").trim(),s=String(t.get("hero_note")||"").trim(),u=t.get("hero_image_file"),_=String(t.get("hero_badge_title")||"").trim(),d=String(t.get("hero_badge_text")||"").trim(),g=String(t.get("default_language")||"id").trim(),m=String(t.get("support_email")||"").trim(),c=String(t.get("support_phone")||"").trim(),p=String(t.get("whatsapp_number")||"").trim(),f=String(t.get("instagram_url")||"").trim(),h=String(t.get("linkedin_url")||"").trim(),b=t.get("logo_file"),v=t.get("favicon_file"),k=t.get("og_image_file");if(!r)return{ok:!1,message:"Site name wajib diisi."};if(!g)return{ok:!1,message:"Default language wajib diisi."};if(a)try{let e=new URL(a);if(!["http:","https:"].includes(e.protocol))return{ok:!1,message:"App URL harus diawali http:// atau https://."}}catch{return{ok:!1,message:"Format App URL tidak valid."}}if(f)try{let e=new URL(f);if(!["http:","https:"].includes(e.protocol))return{ok:!1,message:"Instagram URL harus diawali http:// atau https://."}}catch{return{ok:!1,message:"Format Instagram URL tidak valid."}}if(h)try{let e=new URL(h);if(!["http:","https:"].includes(e.protocol))return{ok:!1,message:"LinkedIn URL harus diawali http:// atau https://."}}catch{return{ok:!1,message:"Format LinkedIn URL tidak valid."}}let $=[];try{let e=(await (0,l.query)(`SELECT logo_url, favicon_url, hero_image_url, og_image_url
       FROM settings.website_config
       WHERE id = 1
       LIMIT 1`)).rows[0]||{},t=e.logo_url||null,E=e.favicon_url||null,R=e.hero_image_url||null,L=e.og_image_url||null;return b instanceof File&&b.size>0&&(t=await y(b),$.push(t)),v instanceof File&&v.size>0&&(E=await y(v),$.push(E)),u instanceof File&&u.size>0&&(R=await y(u),$.push(R)),k instanceof File&&k.size>0&&(L=await y(k),$.push(L)),await (0,l.query)(`UPDATE settings.website_config
       SET site_name = $1,
           site_tagline = $2,
           app_url = $3,
           logo_url = $4,
           favicon_url = $5,
           og_image_url = $6,
           hero_title = $7,
           hero_description = $8,
           hero_note = $9,
           hero_image_url = $10,
           hero_badge_title = $11,
           hero_badge_text = $12,
           default_language = $13,
           support_email = $14,
           support_phone = $15,
           whatsapp_number = $16,
           instagram_url = $17,
           linkedin_url = $18,
           updated_at = NOW()
       WHERE id = 1`,[r,i||null,a||null,t,E,L,o||null,n||null,s||null,R,_||null,d||null,g,m||null,c||null,p||null,f||null,h||null]),e.logo_url&&t!==e.logo_url&&await w(e.logo_url),e.favicon_url&&E!==e.favicon_url&&await w(e.favicon_url),e.hero_image_url&&R!==e.hero_image_url&&await w(e.hero_image_url),e.og_image_url&&L!==e.og_image_url&&await w(e.og_image_url),L&&await (0,l.query)(`UPDATE settings.seo_metadata
         SET og_image_url = $1,
             twitter_image_url = COALESCE(twitter_image_url, $1),
             updated_at = NOW()
         WHERE page_key = 'home'`,[L]),S(),{ok:!0,message:"Website config berhasil diperbarui."}}catch(e){for(let e of $)await w(e);return{ok:!1,message:e?.message||"Gagal memperbarui website config."}}}async function A(e,t){let r=String(t.get("trusted_brand_name")||"").trim(),i=t.get("trusted_logo_file");if(!r)return{ok:!1,message:"Nama brand wajib diisi."};if(!(i instanceof File)||0===i.size)return{ok:!1,message:"Logo wajib diunggah."};let a=[];try{let e=await y(i);if(!e)return{ok:!1,message:"Logo gagal diunggah."};a.push(e);let t=await (0,l.query)(`SELECT COALESCE(MAX(sort_order), 0) AS max_sort
       FROM content.trusted_logos`),o=Number(t.rows[0]?.max_sort||0)+1;return await (0,l.query)(`INSERT INTO content.trusted_logos
       (brand_name, logo_url, sort_order, is_active, updated_at)
       VALUES ($1, $2, $3, TRUE, NOW())`,[r,e,o]),S(),{ok:!0,message:"Logo trusted company berhasil ditambahkan."}}catch(e){for(let e of a)await w(e);return{ok:!1,message:e?.message||"Gagal menambahkan logo."}}}async function x(e,t){let r=v(t.get("trusted_logo_id"),0),i=String(t.get("trusted_brand_name")||"").trim(),a=v(t.get("trusted_sort_order"),0),o=b(t.get("trusted_is_active"),!1),n=t.get("trusted_logo_file");if(!Number.isInteger(r)||r<=0)return{ok:!1,message:"ID logo tidak valid."};if(!i)return{ok:!1,message:"Nama brand wajib diisi."};let s=[];try{let e=await (0,l.query)(`SELECT logo_url
       FROM content.trusted_logos
       WHERE id = $1
       LIMIT 1`,[r]);if(0===e.rowCount)return{ok:!1,message:"Logo tidak ditemukan."};let t=e.rows[0].logo_url||null,u=t;return n instanceof File&&n.size>0&&(u=await y(n),s.push(u)),await (0,l.query)(`UPDATE content.trusted_logos
       SET brand_name = $1,
           logo_url = $2,
           sort_order = $3,
           is_active = $4,
           updated_at = NOW()
       WHERE id = $5`,[i,u,a<0?0:a,o,r]),t&&u!==t&&await w(t),S(),{ok:!0,message:"Logo trusted company berhasil diperbarui."}}catch(e){for(let e of s)await w(e);return{ok:!1,message:e?.message||"Gagal memperbarui logo."}}}async function T(e,t){let r=v(t.get("trusted_logo_id"),0);if(!Number.isInteger(r)||r<=0)return{ok:!1,message:"ID logo tidak valid."};try{let e=await (0,l.query)(`SELECT logo_url
       FROM content.trusted_logos
       WHERE id = $1
       LIMIT 1`,[r]);if(0===e.rowCount)return{ok:!1,message:"Logo tidak ditemukan."};let t=e.rows[0].logo_url||null;return await (0,l.query)(`DELETE FROM content.trusted_logos
       WHERE id = $1`,[r]),t&&await w(t),S(),{ok:!0,message:"Logo trusted company berhasil dihapus."}}catch(e){return{ok:!1,message:e?.message||"Gagal menghapus logo."}}}async function I(e,t){let r=v(t.get("id"),0),i=String(t.get("page_path")||"").trim(),a=String(t.get("meta_title")||"").trim(),o=String(t.get("meta_description")||"").trim(),n=String(t.get("meta_keywords")||""),u=String(t.get("canonical_url")||"").trim(),_=b(t.get("robots_index"),!1),d=b(t.get("robots_follow"),!1),g=String(t.get("og_title")||"").trim(),m=String(t.get("og_description")||"").trim(),c=String(t.get("og_image_url")||"").trim(),p=String(t.get("og_type")||"website").trim(),f=String(t.get("twitter_card")||"summary_large_image").trim(),h=String(t.get("twitter_title")||"").trim(),w=String(t.get("twitter_description")||"").trim(),y=String(t.get("twitter_image_url")||"").trim();if(!Number.isInteger(r)||r<=0)return{ok:!1,message:"ID SEO tidak valid."};if(!i||!a||!o)return{ok:!1,message:"Path, meta title, dan meta description wajib diisi."};try{return await (0,l.query)(`UPDATE settings.seo_metadata
       SET page_path = $1,
           meta_title = $2,
           meta_description = $3,
           meta_keywords = $4::text[],
           canonical_url = $5,
           robots_index = $6,
           robots_follow = $7,
           og_title = $8,
           og_description = $9,
           og_image_url = $10,
           og_type = $11,
           twitter_card = $12,
           twitter_title = $13,
           twitter_description = $14,
           twitter_image_url = $15,
           updated_at = NOW()
       WHERE id = $16`,[i,a,o,String(n||"").split(",").map(e=>e.trim()).filter(Boolean),u||null,_,d,g||null,m||null,c||null,p||"website",f||"summary_large_image",h||null,w||null,y||null,r]),k(),i&&(0,s.revalidatePath)(i),(0,s.revalidatePath)("/"),(0,s.revalidatePath)("/merchandise"),(0,s.revalidatePath)("/robots.txt"),(0,s.revalidatePath)("/sitemap.xml"),{ok:!0,message:"SEO metadata berhasil diperbarui."}}catch(e){return{ok:!1,message:e?.message||"Gagal memperbarui SEO metadata."}}}async function q(e,t){let r=v(t.get("id"),0),i=String(t.get("display_name")||"").trim(),a=String(t.get("environment")||"sandbox").trim(),o=b(t.get("is_active"),!1),n=String(t.get("public_key")||"").trim(),s=String(t.get("secret_key")||"").trim(),u=String(t.get("merchant_id")||"").trim(),_=String(t.get("meta_test_event_code")||"").trim(),d=String(t.get("provider")||"").trim(),m=v(t.get("store_province_id"),0),c=String(t.get("store_province_name")||"").trim(),p=v(t.get("store_city_id"),0),f=String(t.get("store_city_name")||"").trim(),h=v(t.get("store_district_id"),0),w=String(t.get("store_district_name")||"").trim(),y=v(t.get("store_subdistrict_id"),0),S=String(t.get("store_subdistrict_name")||"").trim(),$=b(t.get("courier_jne"),!1),E=b(t.get("courier_sap"),!1),R=b(t.get("courier_idexpress"),!1),L=b(t.get("courier_sicepat"),!1);if(!Number.isInteger(r)||r<=0)return{ok:!1,message:"ID integration tidak valid."};if(!i)return{ok:!1,message:"Display name wajib diisi."};if(!["sandbox","production"].includes(a))return{ok:!1,message:"Environment harus sandbox atau production."};try{let e=await (0,l.query)(`SELECT provider, additional_config
       FROM settings.api_integrations
       WHERE id = $1
       LIMIT 1`,[r]);if(0===e.rowCount)return{ok:!1,message:"Provider integrasi tidak ditemukan."};let t=e.rows[0].provider,b=g(e.rows[0].additional_config);if(d&&d!==t)return{ok:!1,message:"Provider tidak valid."};let v=null,O=null,A=null,x=null,T={...b};if("meta_pixel"===t||"google_ads"===t||"raja_ongkir"===t){if(!n)return{ok:!1,message:`${"meta_pixel"===t?"Pixel ID":"API key"} wajib diisi.`};v=n}if("meta_pixel"===t&&(O=s||null,T={...T,test_event_code:_||null}),"midtrans"===t){if(!n||!s||!u)return{ok:!1,message:"Public key, secret key, dan merchant ID wajib untuk Midtrans."};v=n,O=s,A=u,x="production"===a?"https://app.midtrans.com/snap/v1/transactions":"https://app.sandbox.midtrans.com/snap/v1/transactions"}if("raja_ongkir"===t){x="https://rajaongkir.komerce.id/api/v1";let e={jne:$,sap:E,idexpress:R,sicepat:L};if(o&&(!m||!p||!h||!y))return{ok:!1,message:"Saat RajaOngkir aktif, alamat toko (provinsi, kota, kecamatan, kelurahan) wajib dipilih."};if(o&&!Object.values(e).some(Boolean))return{ok:!1,message:"Saat RajaOngkir aktif, minimal satu courier harus diaktifkan."};T={...T,store_origin:{province_id:m||null,province_name:c||null,city_id:p||null,city_name:f||null,district_id:h||null,district_name:w||null,subdistrict_id:y||null,subdistrict_name:S||null},couriers:e}}return await (0,l.query)(`UPDATE settings.api_integrations
       SET display_name = $1,
           environment = $2,
           is_active = $3,
           public_key = $4,
           secret_key = $5,
           merchant_id = $6,
           endpoint_url = $7,
           additional_config = $8::jsonb,
           updated_at = NOW()
       WHERE id = $9`,[i,a,o,v,O,A,x,JSON.stringify(T),r]),k(),{ok:!0,message:"API integration berhasil diperbarui."}}catch(e){return{ok:!1,message:e?.message||"Gagal memperbarui API integration."}}}async function C(e,t){let r=String(t.get("provider")||"smtp").trim(),i=String(t.get("host")||"").trim(),a=v(t.get("port"),0),o=String(t.get("encryption")||"tls").trim(),n=String(t.get("username")||"").trim(),s=String(t.get("password")||"").trim(),u=String(t.get("from_name")||"").trim(),_=String(t.get("from_email")||"").trim(),d=String(t.get("reply_to_email")||"").trim(),g=b(t.get("is_active"),!1);if(!i)return{ok:!1,message:"Host SMTP wajib diisi."};if(!Number.isInteger(a)||a<1||a>65535)return{ok:!1,message:"Port SMTP tidak valid."};if(!["none","ssl","tls"].includes(o))return{ok:!1,message:"Encryption harus none, ssl, atau tls."};if("ssl"===o&&25===a)return{ok:!1,message:"Port 25 tidak cocok untuk SSL. Gunakan port 465 (SSL) atau ubah encryption ke TLS dengan port 587."};if(!u||!_)return{ok:!1,message:"From name dan from email wajib diisi."};try{return await (0,l.query)(`UPDATE settings.smtp_config
       SET provider = $1,
           host = $2,
           port = $3,
           secure = $4,
           encryption = $5,
           username = $6,
           password = $7,
           from_name = $8,
           from_email = $9,
           reply_to_email = $10,
           is_active = $11,
           updated_at = NOW()
       WHERE id = 1`,[r,i,a,"ssl"===o,o,n||null,s||null,u,_,d||null,g]),k(),{ok:!0,message:"SMTP config berhasil diperbarui."}}catch(e){return{ok:!1,message:e?.message||"Gagal memperbarui SMTP config."}}}(0,_.ensureServerEntryExports)([$,E,R,L,O,A,x,T,I,q,C]),(0,i.registerServerReference)($,"006118eb6db80d3f8dc7f452e39a3b1aba51309b1b",null),(0,i.registerServerReference)(E,"405301a48dc15a945be44dc4f82d5f07bf44bd8f46",null),(0,i.registerServerReference)(R,"00dd8ef374a8364abba2b76d7c389c982cd02973cf",null),(0,i.registerServerReference)(L,"00d3eea315d89e6dc617099e9c6ec216260f3fea7f",null),(0,i.registerServerReference)(O,"6099eec332da78f215f9ff34864f03a56f4bbe93af",null),(0,i.registerServerReference)(A,"605ed5dd78269040e16dcc378b7e26d2c7e1c6ceb5",null),(0,i.registerServerReference)(x,"60e9249f1a139fcfd50363bc1480e22c59f9231e83",null),(0,i.registerServerReference)(T,"600dcbd5d70f6363868a9e798c11f0fe481ebf0abe",null),(0,i.registerServerReference)(I,"60b37f152ebaa9b34b582d2eb4ceafdf0474ba00da",null),(0,i.registerServerReference)(q,"607a873ff07092ecbffc6f2640d492250625e4e05e",null),(0,i.registerServerReference)(C,"60879e4c74f1ee1234e9b96efaab9d8d79787f20a9",null),e.s(["getWebsiteBranding",()=>$]),r()}catch(e){r(e)}},!1),86518,e=>{"use strict";function t(e){let t="https://x-alt.id";if(!e||"string"!=typeof e)return t;try{let t=new URL(e.trim());if(["http:","https:"].includes(t.protocol))return t.origin}catch{}return t}function r(e,t){if(!t)return e;let r=String(t).trim();if(!r)return e;if(/^https?:\/\//i.test(r)||r.startsWith("//"))return r.startsWith("//")?`https:${r}`:r;let i=r.startsWith("/")?r:`/${r}`;return`${e.replace(/\/$/,"")}${i}`}e.i(28932),e.s(["absoluteUrl",()=>r,"resolveSiteOrigin",()=>t])},70943,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var i={getOrigin:function(){return s},resolveArray:function(){return o},resolveAsArrayOrUndefined:function(){return n}};for(var a in i)Object.defineProperty(r,a,{enumerable:!0,get:i[a]});function o(e){return Array.isArray(e)?e:[e]}function n(e){if(null!=e)return o(e)}function s(e){let t;if("string"==typeof e)try{t=(e=new URL(e)).origin}catch{}return t}},73853,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var i={resolveManifest:function(){return l},resolveRobots:function(){return n},resolveRouteData:function(){return u},resolveSitemap:function(){return s}};for(var a in i)Object.defineProperty(r,a,{enumerable:!0,get:i[a]});let o=e.r(70943);function n(e){let t="";for(let r of Array.isArray(e.rules)?e.rules:[e.rules]){for(let e of(0,o.resolveArray)(r.userAgent||["*"]))t+=`User-Agent: ${e}
`;if(r.allow)for(let e of(0,o.resolveArray)(r.allow))t+=`Allow: ${e}
`;if(r.disallow)for(let e of(0,o.resolveArray)(r.disallow))t+=`Disallow: ${e}
`;r.crawlDelay&&(t+=`Crawl-delay: ${r.crawlDelay}
`),t+="\n"}return e.host&&(t+=`Host: ${e.host}
`),e.sitemap&&(0,o.resolveArray)(e.sitemap).forEach(e=>{t+=`Sitemap: ${e}
`}),t}function s(e){let t=e.some(e=>Object.keys(e.alternates??{}).length>0),r=e.some(e=>{var t;return!!(null==(t=e.images)?void 0:t.length)}),i=e.some(e=>{var t;return!!(null==(t=e.videos)?void 0:t.length)}),a="";for(let l of(a+='<?xml version="1.0" encoding="UTF-8"?>\n',a+='<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',r&&(a+=' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'),i&&(a+=' xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"'),t?a+=' xmlns:xhtml="http://www.w3.org/1999/xhtml">\n':a+=">\n",e)){var o,n,s;a+="<url>\n",a+=`<loc>${l.url}</loc>
`;let e=null==(o=l.alternates)?void 0:o.languages;if(e&&Object.keys(e).length)for(let t in e)a+=`<xhtml:link rel="alternate" hreflang="${t}" href="${e[t]}" />
`;if(null==(n=l.images)?void 0:n.length)for(let e of l.images)a+=`<image:image>
<image:loc>${e}</image:loc>
</image:image>
`;if(null==(s=l.videos)?void 0:s.length)for(let e of l.videos)a+=["<video:video>",`<video:title>${e.title}</video:title>`,`<video:thumbnail_loc>${e.thumbnail_loc}</video:thumbnail_loc>`,`<video:description>${e.description}</video:description>`,e.content_loc&&`<video:content_loc>${e.content_loc}</video:content_loc>`,e.player_loc&&`<video:player_loc>${e.player_loc}</video:player_loc>`,e.duration&&`<video:duration>${e.duration}</video:duration>`,e.view_count&&`<video:view_count>${e.view_count}</video:view_count>`,e.tag&&`<video:tag>${e.tag}</video:tag>`,e.rating&&`<video:rating>${e.rating}</video:rating>`,e.expiration_date&&`<video:expiration_date>${e.expiration_date}</video:expiration_date>`,e.publication_date&&`<video:publication_date>${e.publication_date}</video:publication_date>`,e.family_friendly&&`<video:family_friendly>${e.family_friendly}</video:family_friendly>`,e.requires_subscription&&`<video:requires_subscription>${e.requires_subscription}</video:requires_subscription>`,e.live&&`<video:live>${e.live}</video:live>`,e.restriction&&`<video:restriction relationship="${e.restriction.relationship}">${e.restriction.content}</video:restriction>`,e.platform&&`<video:platform relationship="${e.platform.relationship}">${e.platform.content}</video:platform>`,e.uploader&&`<video:uploader${e.uploader.info&&` info="${e.uploader.info}"`}>${e.uploader.content}</video:uploader>`,`</video:video>
`].filter(Boolean).join("\n");if(l.lastModified){let e=l.lastModified instanceof Date?l.lastModified.toISOString():l.lastModified;a+=`<lastmod>${e}</lastmod>
`}l.changeFrequency&&(a+=`<changefreq>${l.changeFrequency}</changefreq>
`),"number"==typeof l.priority&&(a+=`<priority>${l.priority}</priority>
`),a+="</url>\n"}return a+"</urlset>\n"}function l(e){return JSON.stringify(e)}function u(e,t){return"robots"===t?n(e):"sitemap"===t?s(e):"manifest"===t?l(e):""}}];

//# sourceMappingURL=_dec0f827._.js.map