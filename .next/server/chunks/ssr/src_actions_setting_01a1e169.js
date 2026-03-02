module.exports=[19347,a=>a.a(async(b,c)=>{try{var d=a.i(37936),e=a.i(66680),f=a.i(12714),g=a.i(50227),h=a.i(18558),i=a.i(41154),j=a.i(13095),k=b([i]);[i]=k.then?(await k)():k;let H="/uploads/settings/",I=g.default.join(process.cwd(),"public","uploads","settings");function l(a){if(!a)return{};if("object"==typeof a)return a;try{return JSON.parse(a)}catch{return{}}}function m(a){var b;return{id:Number(a.id),page_key:a.page_key,page_path:a.page_path,meta_title:a.meta_title,meta_description:a.meta_description,meta_keywords:(b=a.meta_keywords,Array.isArray(b)?b:[]),canonical_url:a.canonical_url||"",robots_index:!!a.robots_index,robots_follow:!!a.robots_follow,og_title:a.og_title||"",og_description:a.og_description||"",og_image_url:a.og_image_url||"",og_type:a.og_type||"website",twitter_card:a.twitter_card||"summary_large_image",twitter_title:a.twitter_title||"",twitter_description:a.twitter_description||"",twitter_image_url:a.twitter_image_url||"",updated_at:a.updated_at}}function n(a){return{id:Number(a.id),provider:a.provider,display_name:a.display_name,environment:a.environment,is_active:!!a.is_active,public_key:a.public_key||"",secret_key:a.secret_key||"",merchant_id:a.merchant_id||"",endpoint_url:a.endpoint_url||"",additional_config:l(a.additional_config),last_tested_at:a.last_tested_at,updated_at:a.updated_at}}function o(a){return{id:Number(a.id),brand_name:a.brand_name||"",logo_url:a.logo_url||"",sort_order:Number(a.sort_order||0),is_active:!!a.is_active}}function p(a){return{id:Number(a.id),question:a.question||"",answer:a.answer||"",sort_order:Number(a.sort_order||0),is_active:!!a.is_active,updated_at:a.updated_at}}function q(a){return{id:Number(a.id),client_name:a.client_name||"",title:a.title||"",quote:a.quote||"",link_url:a.link_url||"",rating:Number(a.rating||5),sort_order:Number(a.sort_order||0),is_active:!!a.is_active,updated_at:a.updated_at}}function r(a,b=!1){if(null==a)return b;let c=String(a).toLowerCase();return"1"===c||"true"===c||"on"===c}function s(a,b=0){let c=Number.parseInt(String(a??""),10);return Number.isInteger(c)?c:b}async function t(a){let b=function(a){if(!("string"==typeof a&&a.startsWith(H)))return null;let b=a.replace(/^\//,"");return g.default.join(process.cwd(),"public",b)}(a);if(b)try{await f.default.unlink(b)}catch(a){if(a?.code!=="ENOENT")throw a}}async function u(a){if(!(a instanceof File)||0===a.size)return null;if(!a.type?.startsWith("image/"))throw Error("File harus berupa gambar.");if(a.size>5242880)throw Error("Ukuran file melebihi 5MB.");await f.default.mkdir(I,{recursive:!0});let b=function(a=""){let b=g.default.extname(a).toLowerCase();return b&&b.replace(/[^.a-z0-9]/g,"")||".png"}(a.name),c=`${Date.now()}-${e.default.randomUUID()}${b}`,d=g.default.join(I,c),h=Buffer.from(await a.arrayBuffer());return await f.default.writeFile(d,h),`${H}${c}`}function v(){(0,h.revalidatePath)("/admin/setting")}function w(){(0,h.revalidatePath)("/"),(0,h.revalidatePath)("/admin/setting")}async function x(){let a=(await (0,i.query)(`SELECT
       site_name,
       app_url,
       logo_url,
       favicon_url,
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
     LIMIT 1`)).rows[0]||{};return{site_name:a.site_name||"X-ALT",app_url:a.app_url||"",logo_url:a.logo_url||"",favicon_url:a.favicon_url||"",site_tagline:a.site_tagline||"",hero_title:a.hero_title||"",hero_description:a.hero_description||"",hero_note:a.hero_note||"",hero_image_url:a.hero_image_url||"",hero_badge_title:a.hero_badge_title||"",hero_badge_text:a.hero_badge_text||"",whatsapp_number:a.whatsapp_number||"",support_email:a.support_email||"",instagram_url:a.instagram_url||"",linkedin_url:a.linkedin_url||""}}async function y(){return(await (0,i.query)(`SELECT
       id,
       brand_name,
       logo_url,
       sort_order,
       is_active
     FROM content.trusted_logos
     WHERE is_active = TRUE
     ORDER BY sort_order ASC, id ASC`)).rows.map(o)}async function z(){var a,b;let[c,d,e,f,g,h,j]=await Promise.all([(0,i.query)(`SELECT
           id,
           site_name,
           site_tagline,
           app_url,
           logo_url,
           favicon_url,
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
         LIMIT 1`),(0,i.query)(`SELECT
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
         ORDER BY updated_at DESC, id DESC`),(0,i.query)(`SELECT
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
         ORDER BY display_name ASC`),(0,i.query)(`SELECT
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
         LIMIT 1`),(0,i.query)(`SELECT
           id,
           brand_name,
           logo_url,
           sort_order,
           is_active
         FROM content.trusted_logos
         ORDER BY sort_order ASC, id ASC`),(0,i.query)(`SELECT
           id,
           question,
           answer,
           sort_order,
           is_active,
           updated_at
         FROM content.faqs
         ORDER BY sort_order ASC, id ASC`),(0,i.query)(`SELECT
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
         ORDER BY sort_order ASC, id ASC`)]);return{websiteConfig:(a=c.rows[0])?{id:Number(a.id),site_name:a.site_name||"",site_tagline:a.site_tagline||"",logo_url:a.logo_url||"",favicon_url:a.favicon_url||"",hero_title:a.hero_title||"",hero_description:a.hero_description||"",hero_note:a.hero_note||"",hero_image_url:a.hero_image_url||"",hero_badge_title:a.hero_badge_title||"",hero_badge_text:a.hero_badge_text||"",default_language:a.default_language||"id",app_url:a.app_url||"",support_email:a.support_email||"",support_phone:a.support_phone||"",whatsapp_number:a.whatsapp_number||"",instagram_url:a.instagram_url||"",linkedin_url:a.linkedin_url||"",updated_at:a.updated_at}:null,seoMetadata:d.rows.map(m),apiIntegrations:e.rows.map(n),smtpConfig:(b=f.rows[0])?{id:Number(b.id),provider:b.provider||"smtp",host:b.host||"",port:Number(b.port||0),secure:!!b.secure,encryption:b.encryption||"tls",username:b.username||"",password:b.password||"",from_name:b.from_name||"",from_email:b.from_email||"",reply_to_email:b.reply_to_email||"",is_active:!!b.is_active,last_tested_at:b.last_tested_at,updated_at:b.updated_at}:null,trustedLogos:g.rows.map(o),faqs:h.rows.map(p),testimonials:j.rows.map(q)}}async function A(a,b){let c=String(b.get("site_name")||"").trim(),d=String(b.get("site_tagline")||"").trim(),e=String(b.get("app_url")||"").trim(),f=String(b.get("hero_title")||"").trim(),g=String(b.get("hero_description")||"").trim(),h=String(b.get("hero_note")||"").trim(),j=b.get("hero_image_file"),k=String(b.get("hero_badge_title")||"").trim(),l=String(b.get("hero_badge_text")||"").trim(),m=String(b.get("default_language")||"id").trim(),n=String(b.get("support_email")||"").trim(),o=String(b.get("support_phone")||"").trim(),p=String(b.get("whatsapp_number")||"").trim(),q=String(b.get("instagram_url")||"").trim(),r=String(b.get("linkedin_url")||"").trim(),s=b.get("logo_file"),v=b.get("favicon_file");if(!c)return{ok:!1,message:"Site name wajib diisi."};if(!m)return{ok:!1,message:"Default language wajib diisi."};if(e)try{let a=new URL(e);if(!["http:","https:"].includes(a.protocol))return{ok:!1,message:"App URL harus diawali http:// atau https://."}}catch{return{ok:!1,message:"Format App URL tidak valid."}}if(q)try{let a=new URL(q);if(!["http:","https:"].includes(a.protocol))return{ok:!1,message:"Instagram URL harus diawali http:// atau https://."}}catch{return{ok:!1,message:"Format Instagram URL tidak valid."}}if(r)try{let a=new URL(r);if(!["http:","https:"].includes(a.protocol))return{ok:!1,message:"LinkedIn URL harus diawali http:// atau https://."}}catch{return{ok:!1,message:"Format LinkedIn URL tidak valid."}}let x=[];try{let a=(await (0,i.query)(`SELECT logo_url, favicon_url, hero_image_url
       FROM settings.website_config
       WHERE id = 1
       LIMIT 1`)).rows[0]||{},b=a.logo_url||null,y=a.favicon_url||null,z=a.hero_image_url||null;return s instanceof File&&s.size>0&&(b=await u(s),x.push(b)),v instanceof File&&v.size>0&&(y=await u(v),x.push(y)),j instanceof File&&j.size>0&&(z=await u(j),x.push(z)),await (0,i.query)(`UPDATE settings.website_config
       SET site_name = $1,
           site_tagline = $2,
           app_url = $3,
           logo_url = $4,
           favicon_url = $5,
           hero_title = $6,
           hero_description = $7,
           hero_note = $8,
           hero_image_url = $9,
           hero_badge_title = $10,
           hero_badge_text = $11,
           default_language = $12,
           support_email = $13,
           support_phone = $14,
           whatsapp_number = $15,
           instagram_url = $16,
           linkedin_url = $17,
           updated_at = NOW()
       WHERE id = 1`,[c,d||null,e||null,b,y,f||null,g||null,h||null,z,k||null,l||null,m,n||null,o||null,p||null,q||null,r||null]),a.logo_url&&b!==a.logo_url&&await t(a.logo_url),a.favicon_url&&y!==a.favicon_url&&await t(a.favicon_url),a.hero_image_url&&z!==a.hero_image_url&&await t(a.hero_image_url),w(),{ok:!0,message:"Website config berhasil diperbarui."}}catch(a){for(let a of x)await t(a);return{ok:!1,message:a?.message||"Gagal memperbarui website config."}}}async function B(a,b){let c=String(b.get("trusted_brand_name")||"").trim(),d=b.get("trusted_logo_file");if(!c)return{ok:!1,message:"Nama brand wajib diisi."};if(!(d instanceof File)||0===d.size)return{ok:!1,message:"Logo wajib diunggah."};let e=[];try{let a=await u(d);if(!a)return{ok:!1,message:"Logo gagal diunggah."};e.push(a);let b=await (0,i.query)(`SELECT COALESCE(MAX(sort_order), 0) AS max_sort
       FROM content.trusted_logos`),f=Number(b.rows[0]?.max_sort||0)+1;return await (0,i.query)(`INSERT INTO content.trusted_logos
       (brand_name, logo_url, sort_order, is_active, updated_at)
       VALUES ($1, $2, $3, TRUE, NOW())`,[c,a,f]),w(),{ok:!0,message:"Logo trusted company berhasil ditambahkan."}}catch(a){for(let a of e)await t(a);return{ok:!1,message:a?.message||"Gagal menambahkan logo."}}}async function C(a,b){let c=s(b.get("trusted_logo_id"),0),d=String(b.get("trusted_brand_name")||"").trim(),e=s(b.get("trusted_sort_order"),0),f=r(b.get("trusted_is_active"),!1),g=b.get("trusted_logo_file");if(!Number.isInteger(c)||c<=0)return{ok:!1,message:"ID logo tidak valid."};if(!d)return{ok:!1,message:"Nama brand wajib diisi."};let h=[];try{let a=await (0,i.query)(`SELECT logo_url
       FROM content.trusted_logos
       WHERE id = $1
       LIMIT 1`,[c]);if(0===a.rowCount)return{ok:!1,message:"Logo tidak ditemukan."};let b=a.rows[0].logo_url||null,j=b;return g instanceof File&&g.size>0&&(j=await u(g),h.push(j)),await (0,i.query)(`UPDATE content.trusted_logos
       SET brand_name = $1,
           logo_url = $2,
           sort_order = $3,
           is_active = $4,
           updated_at = NOW()
       WHERE id = $5`,[d,j,e<0?0:e,f,c]),b&&j!==b&&await t(b),w(),{ok:!0,message:"Logo trusted company berhasil diperbarui."}}catch(a){for(let a of h)await t(a);return{ok:!1,message:a?.message||"Gagal memperbarui logo."}}}async function D(a,b){let c=s(b.get("trusted_logo_id"),0);if(!Number.isInteger(c)||c<=0)return{ok:!1,message:"ID logo tidak valid."};try{let a=await (0,i.query)(`SELECT logo_url
       FROM content.trusted_logos
       WHERE id = $1
       LIMIT 1`,[c]);if(0===a.rowCount)return{ok:!1,message:"Logo tidak ditemukan."};let b=a.rows[0].logo_url||null;return await (0,i.query)(`DELETE FROM content.trusted_logos
       WHERE id = $1`,[c]),b&&await t(b),w(),{ok:!0,message:"Logo trusted company berhasil dihapus."}}catch(a){return{ok:!1,message:a?.message||"Gagal menghapus logo."}}}async function E(a,b){let c=s(b.get("id"),0),d=String(b.get("page_path")||"").trim(),e=String(b.get("meta_title")||"").trim(),f=String(b.get("meta_description")||"").trim(),g=String(b.get("meta_keywords")||""),h=String(b.get("canonical_url")||"").trim(),j=r(b.get("robots_index"),!1),k=r(b.get("robots_follow"),!1),l=String(b.get("og_title")||"").trim(),m=String(b.get("og_description")||"").trim(),n=String(b.get("og_image_url")||"").trim(),o=String(b.get("og_type")||"website").trim(),p=String(b.get("twitter_card")||"summary_large_image").trim(),q=String(b.get("twitter_title")||"").trim(),t=String(b.get("twitter_description")||"").trim(),u=String(b.get("twitter_image_url")||"").trim();if(!Number.isInteger(c)||c<=0)return{ok:!1,message:"ID SEO tidak valid."};if(!d||!e||!f)return{ok:!1,message:"Path, meta title, dan meta description wajib diisi."};try{return await (0,i.query)(`UPDATE settings.seo_metadata
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
       WHERE id = $16`,[d,e,f,String(g||"").split(",").map(a=>a.trim()).filter(Boolean),h||null,j,k,l||null,m||null,n||null,o||"website",p||"summary_large_image",q||null,t||null,u||null,c]),v(),{ok:!0,message:"SEO metadata berhasil diperbarui."}}catch(a){return{ok:!1,message:a?.message||"Gagal memperbarui SEO metadata."}}}async function F(a,b){let c=s(b.get("id"),0),d=String(b.get("display_name")||"").trim(),e=String(b.get("environment")||"sandbox").trim(),f=r(b.get("is_active"),!1),g=String(b.get("public_key")||"").trim(),h=String(b.get("secret_key")||"").trim(),j=String(b.get("merchant_id")||"").trim(),k=String(b.get("meta_test_event_code")||"").trim(),m=String(b.get("provider")||"").trim(),n=s(b.get("store_province_id"),0),o=String(b.get("store_province_name")||"").trim(),p=s(b.get("store_city_id"),0),q=String(b.get("store_city_name")||"").trim(),t=s(b.get("store_district_id"),0),u=String(b.get("store_district_name")||"").trim(),w=s(b.get("store_subdistrict_id"),0),x=String(b.get("store_subdistrict_name")||"").trim(),y=r(b.get("courier_jne"),!1),z=r(b.get("courier_sap"),!1),A=r(b.get("courier_idexpress"),!1),B=r(b.get("courier_sicepat"),!1);if(!Number.isInteger(c)||c<=0)return{ok:!1,message:"ID integration tidak valid."};if(!d)return{ok:!1,message:"Display name wajib diisi."};if(!["sandbox","production"].includes(e))return{ok:!1,message:"Environment harus sandbox atau production."};try{let a=await (0,i.query)(`SELECT provider, additional_config
       FROM settings.api_integrations
       WHERE id = $1
       LIMIT 1`,[c]);if(0===a.rowCount)return{ok:!1,message:"Provider integrasi tidak ditemukan."};let b=a.rows[0].provider,r=l(a.rows[0].additional_config);if(m&&m!==b)return{ok:!1,message:"Provider tidak valid."};let s=null,C=null,D=null,E=null,F={...r};if("meta_pixel"===b||"google_ads"===b||"raja_ongkir"===b){if(!g)return{ok:!1,message:`${"meta_pixel"===b?"Pixel ID":"API key"} wajib diisi.`};s=g}if("meta_pixel"===b&&(C=h||null,F={...F,test_event_code:k||null}),"midtrans"===b){if(!g||!h||!j)return{ok:!1,message:"Public key, secret key, dan merchant ID wajib untuk Midtrans."};s=g,C=h,D=j,E="production"===e?"https://app.midtrans.com/snap/v1/transactions":"https://app.sandbox.midtrans.com/snap/v1/transactions"}if("raja_ongkir"===b){E="https://rajaongkir.komerce.id/api/v1";let a={jne:y,sap:z,idexpress:A,sicepat:B};if(f&&(!n||!p||!t||!w))return{ok:!1,message:"Saat RajaOngkir aktif, alamat toko (provinsi, kota, kecamatan, kelurahan) wajib dipilih."};if(f&&!Object.values(a).some(Boolean))return{ok:!1,message:"Saat RajaOngkir aktif, minimal satu courier harus diaktifkan."};F={...F,store_origin:{province_id:n||null,province_name:o||null,city_id:p||null,city_name:q||null,district_id:t||null,district_name:u||null,subdistrict_id:w||null,subdistrict_name:x||null},couriers:a}}return await (0,i.query)(`UPDATE settings.api_integrations
       SET display_name = $1,
           environment = $2,
           is_active = $3,
           public_key = $4,
           secret_key = $5,
           merchant_id = $6,
           endpoint_url = $7,
           additional_config = $8::jsonb,
           updated_at = NOW()
       WHERE id = $9`,[d,e,f,s,C,D,E,JSON.stringify(F),c]),v(),{ok:!0,message:"API integration berhasil diperbarui."}}catch(a){return{ok:!1,message:a?.message||"Gagal memperbarui API integration."}}}async function G(a,b){let c=String(b.get("provider")||"smtp").trim(),d=String(b.get("host")||"").trim(),e=s(b.get("port"),0),f=String(b.get("encryption")||"tls").trim(),g=String(b.get("username")||"").trim(),h=String(b.get("password")||"").trim(),j=String(b.get("from_name")||"").trim(),k=String(b.get("from_email")||"").trim(),l=String(b.get("reply_to_email")||"").trim(),m=r(b.get("is_active"),!1);if(!d)return{ok:!1,message:"Host SMTP wajib diisi."};if(!Number.isInteger(e)||e<1||e>65535)return{ok:!1,message:"Port SMTP tidak valid."};if(!["none","ssl","tls"].includes(f))return{ok:!1,message:"Encryption harus none, ssl, atau tls."};if("ssl"===f&&25===e)return{ok:!1,message:"Port 25 tidak cocok untuk SSL. Gunakan port 465 (SSL) atau ubah encryption ke TLS dengan port 587."};if(!j||!k)return{ok:!1,message:"From name dan from email wajib diisi."};try{return await (0,i.query)(`UPDATE settings.smtp_config
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
       WHERE id = 1`,[c,d,e,"ssl"===f,f,g||null,h||null,j,k,l||null,m]),v(),{ok:!0,message:"SMTP config berhasil diperbarui."}}catch(a){return{ok:!1,message:a?.message||"Gagal memperbarui SMTP config."}}}(0,j.ensureServerEntryExports)([x,y,z,A,B,C,D,E,F,G]),(0,d.registerServerReference)(x,"00959c7e8f1b0d3b3f4854ba0a9d89b4eba543999e",null),(0,d.registerServerReference)(y,"00a413c30bc6ba285412954ede1567e1918f3a4260",null),(0,d.registerServerReference)(z,"009ad6b49fdcca246769060584030432f3dede3075",null),(0,d.registerServerReference)(A,"600f6d6fdfa1cd8fb4c71197a2dbc5ae5852bd4cc7",null),(0,d.registerServerReference)(B,"600b8fc3cc3edf306b3ed8a28c593c643eddccd536",null),(0,d.registerServerReference)(C,"6037253b8d0d1f2364491fcbb59f51e1c1e5e8578a",null),(0,d.registerServerReference)(D,"606bbba9c0cc5db522c48c5d43bc6b697aa135b264",null),(0,d.registerServerReference)(E,"60ac236a121c2ace30b3cef9dbe0d954b1a10deb6d",null),(0,d.registerServerReference)(F,"606097c085bec330a22f016ecfdba4bd1f0b280366",null),(0,d.registerServerReference)(G,"6074f566844aea4fb3e1df8b032d19c90a57a4c8d5",null),a.s(["addTrustedLogoAction",()=>B,"deleteTrustedLogoAction",()=>D,"getAdminSettingsData",()=>z,"getTrustedLogos",()=>y,"getWebsiteBranding",()=>x,"updateApiIntegrationAction",()=>F,"updateSeoMetadataAction",()=>E,"updateSmtpConfigAction",()=>G,"updateTrustedLogoAction",()=>C,"updateWebsiteConfigAction",()=>A]),c()}catch(a){c(a)}},!1)];

//# sourceMappingURL=src_actions_setting_01a1e169.js.map