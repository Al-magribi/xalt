module.exports=[80735,a=>a.a(async(b,c)=>{try{var d=a.i(37936),e=a.i(18558),f=a.i(41154),g=a.i(13095),h=b([f]);function i(a,b=!1){if(null==a)return b;let c=String(a).toLowerCase();return"1"===c||"true"===c||"on"===c}function j(a,b=0){let c=Number.parseInt(String(a??""),10);return Number.isInteger(c)?c:b}function k(a){return{id:Number(a.id),question:a.question||"",answer:a.answer||"",sort_order:Number(a.sort_order||0),is_active:!!a.is_active,created_at:a.created_at,updated_at:a.updated_at}}function l(){(0,e.revalidatePath)("/"),(0,e.revalidatePath)("/admin/setting")}async function m(){return(await (0,f.query)(`SELECT
       id,
       question,
       answer,
       sort_order,
       is_active,
       created_at,
       updated_at
     FROM content.faqs
     ORDER BY sort_order ASC, id ASC`)).rows.map(k)}async function n(){return(await (0,f.query)(`SELECT
       id,
       question,
       answer,
       sort_order,
       is_active,
       created_at,
       updated_at
     FROM content.faqs
     WHERE is_active = TRUE
     ORDER BY sort_order ASC, id ASC`)).rows.map(k)}async function o(a,b){let c=String(b.get("faq_question")||"").trim(),d=String(b.get("faq_answer")||"").trim(),e=i(b.get("faq_is_active"),!0);if(!c)return{ok:!1,message:"Pertanyaan FAQ wajib diisi."};if(!d)return{ok:!1,message:"Jawaban FAQ wajib diisi."};try{let a=await (0,f.query)(`SELECT COALESCE(MAX(sort_order), 0) AS max_sort
       FROM content.faqs`),b=Number(a.rows[0]?.max_sort||0)+1;return await (0,f.query)(`INSERT INTO content.faqs
       (question, answer, sort_order, is_active, updated_at)
       VALUES ($1, $2, $3, $4, NOW())`,[c,d,b,e]),l(),{ok:!0,message:"FAQ berhasil ditambahkan."}}catch(a){return{ok:!1,message:a?.message||"Gagal menambahkan FAQ."}}}async function p(a,b){let c=j(b.get("faq_id"),0),d=String(b.get("faq_question")||"").trim(),e=String(b.get("faq_answer")||"").trim(),g=i(b.get("faq_is_active"),!1);if(!Number.isInteger(c)||c<=0)return{ok:!1,message:"ID FAQ tidak valid."};if(!d)return{ok:!1,message:"Pertanyaan FAQ wajib diisi."};if(!e)return{ok:!1,message:"Jawaban FAQ wajib diisi."};try{let a=await (0,f.query)(`SELECT id
       FROM content.faqs
       WHERE id = $1
       LIMIT 1`,[c]);if(0===a.rowCount)return{ok:!1,message:"FAQ tidak ditemukan."};return await (0,f.query)(`UPDATE content.faqs
       SET question = $1,
           answer = $2,
           is_active = $3,
           updated_at = NOW()
       WHERE id = $4`,[d,e,g,c]),l(),{ok:!0,message:"FAQ berhasil diperbarui."}}catch(a){return{ok:!1,message:a?.message||"Gagal memperbarui FAQ."}}}async function q(a,b){let c=j(b.get("faq_id"),0);if(!Number.isInteger(c)||c<=0)return{ok:!1,message:"ID FAQ tidak valid."};try{let a=await (0,f.query)(`DELETE FROM content.faqs
       WHERE id = $1`,[c]);if(0===a.rowCount)return{ok:!1,message:"FAQ tidak ditemukan."};return l(),{ok:!0,message:"FAQ berhasil dihapus."}}catch(a){return{ok:!1,message:a?.message||"Gagal menghapus FAQ."}}}async function r(a=[]){let b=Array.isArray(a)?a.map(a=>j(a,0)).filter(a=>Number.isInteger(a)&&a>0):[];if(0===b.length)return{ok:!1,message:"Urutan FAQ tidak valid."};try{return await (0,f.withTransaction)(async a=>{if((await a.query(`SELECT id
         FROM content.faqs
         WHERE id = ANY($1::bigint[])`,[b])).rowCount!==b.length)throw Error("Sebagian FAQ tidak ditemukan.");for(let c=0;c<b.length;c+=1)await a.query(`UPDATE content.faqs
           SET sort_order = $1,
               updated_at = NOW()
           WHERE id = $2`,[c+1,b[c]])}),l(),{ok:!0,message:"Urutan FAQ berhasil diperbarui."}}catch(a){return{ok:!1,message:a?.message||"Gagal mengubah urutan FAQ."}}}[f]=h.then?(await h)():h,(0,g.ensureServerEntryExports)([m,n,o,p,q,r]),(0,d.registerServerReference)(m,"0042dbcadff61a976853c63af3bdabeaaa0924a2a1",null),(0,d.registerServerReference)(n,"00892e45dc3e291bc3e3abd8d1dac0255e0858b7b9",null),(0,d.registerServerReference)(o,"6067e939907b30e12dd175bc843b51447a5268fffb",null),(0,d.registerServerReference)(p,"60de28c4d5e443ab05202b9362d7e68ce906328dbf",null),(0,d.registerServerReference)(q,"601b4086897392722a5cdbf5e88f8150c4278beb32",null),(0,d.registerServerReference)(r,"40187dc69138e698d3ae0b79da3f64b295bfb4b2c2",null),a.s(["addFaqAction",()=>o,"deleteFaqAction",()=>q,"getActiveFaqs",()=>n,"getAdminFaqs",()=>m,"reorderFaqsAction",()=>r,"updateFaqAction",()=>p]),c()}catch(a){c(a)}},!1),14895,a=>a.a(async(b,c)=>{try{var d=a.i(37936),e=a.i(18558),f=a.i(41154),g=a.i(13095),h=b([f]);function i(a,b=!1){if(null==a)return b;let c=String(a).toLowerCase();return"1"===c||"true"===c||"on"===c}function j(a,b=0){let c=Number.parseInt(String(a??""),10);return Number.isInteger(c)?c:b}function k(a){return{id:Number(a.id),client_name:a.client_name||"",title:a.title||"",quote:a.quote||"",link_url:a.link_url||"",rating:Number(a.rating||5),sort_order:Number(a.sort_order||0),is_active:!!a.is_active,created_at:a.created_at,updated_at:a.updated_at}}function l(){(0,e.revalidatePath)("/"),(0,e.revalidatePath)("/admin/setting")}async function m(){return(await (0,f.query)(`SELECT
       id,
       client_name,
       title,
       quote,
       link_url,
       rating,
       sort_order,
       is_active,
       created_at,
       updated_at
     FROM content.testimonials
     ORDER BY sort_order ASC, id ASC`)).rows.map(k)}async function n(){return(await (0,f.query)(`SELECT
       id,
       client_name,
       title,
       quote,
       link_url,
       rating,
       sort_order,
       is_active,
       created_at,
       updated_at
     FROM content.testimonials
     WHERE is_active = TRUE
     ORDER BY sort_order ASC, id ASC`)).rows.map(k)}async function o(a,b){let c=String(b.get("testimonial_client_name")||"").trim(),d=String(b.get("testimonial_title")||"").trim(),e=String(b.get("testimonial_quote")||"").trim(),g=String(b.get("testimonial_link_url")||"").trim(),h=j(b.get("testimonial_rating"),5),k=Math.max(1,Math.min(5,h||5)),m=i(b.get("testimonial_is_active"),!0);if(!c)return{ok:!1,message:"Nama klien wajib diisi."};if(!d)return{ok:!1,message:"Judul testimoni wajib diisi."};if(!e)return{ok:!1,message:"Isi testimoni wajib diisi."};try{let a=await (0,f.query)(`SELECT COALESCE(MAX(sort_order), 0) AS max_sort
       FROM content.testimonials`),b=Number(a.rows[0]?.max_sort||0)+1;return await (0,f.query)(`INSERT INTO content.testimonials
       (client_name, title, quote, link_url, rating, sort_order, is_active, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,[c,d,e,g||null,k,b,m]),l(),{ok:!0,message:"Testimoni berhasil ditambahkan."}}catch(a){return{ok:!1,message:a?.message||"Gagal menambahkan testimoni."}}}async function p(a,b){let c=j(b.get("testimonial_id"),0),d=String(b.get("testimonial_client_name")||"").trim(),e=String(b.get("testimonial_title")||"").trim(),g=String(b.get("testimonial_quote")||"").trim(),h=String(b.get("testimonial_link_url")||"").trim(),k=j(b.get("testimonial_rating"),5),m=Math.max(1,Math.min(5,k||5)),n=i(b.get("testimonial_is_active"),!1);if(!Number.isInteger(c)||c<=0)return{ok:!1,message:"ID testimoni tidak valid."};if(!d)return{ok:!1,message:"Nama klien wajib diisi."};if(!e)return{ok:!1,message:"Judul testimoni wajib diisi."};if(!g)return{ok:!1,message:"Isi testimoni wajib diisi."};try{let a=await (0,f.query)(`SELECT id
       FROM content.testimonials
       WHERE id = $1
       LIMIT 1`,[c]);if(0===a.rowCount)return{ok:!1,message:"Testimoni tidak ditemukan."};return await (0,f.query)(`UPDATE content.testimonials
       SET client_name = $1,
           title = $2,
           quote = $3,
           link_url = $4,
           rating = $5,
           is_active = $6,
           updated_at = NOW()
       WHERE id = $7`,[d,e,g,h||null,m,n,c]),l(),{ok:!0,message:"Testimoni berhasil diperbarui."}}catch(a){return{ok:!1,message:a?.message||"Gagal memperbarui testimoni."}}}async function q(a,b){let c=j(b.get("testimonial_id"),0);if(!Number.isInteger(c)||c<=0)return{ok:!1,message:"ID testimoni tidak valid."};try{let a=await (0,f.query)(`DELETE FROM content.testimonials
       WHERE id = $1`,[c]);if(0===a.rowCount)return{ok:!1,message:"Testimoni tidak ditemukan."};return l(),{ok:!0,message:"Testimoni berhasil dihapus."}}catch(a){return{ok:!1,message:a?.message||"Gagal menghapus testimoni."}}}async function r(a=[]){let b=Array.isArray(a)?a.map(a=>j(a,0)).filter(a=>Number.isInteger(a)&&a>0):[];if(0===b.length)return{ok:!1,message:"Urutan testimoni tidak valid."};try{return await (0,f.withTransaction)(async a=>{if((await a.query(`SELECT id
         FROM content.testimonials
         WHERE id = ANY($1::bigint[])`,[b])).rowCount!==b.length)throw Error("Sebagian testimoni tidak ditemukan.");for(let c=0;c<b.length;c+=1)await a.query(`UPDATE content.testimonials
           SET sort_order = $1,
               updated_at = NOW()
           WHERE id = $2`,[c+1,b[c]])}),l(),{ok:!0,message:"Urutan testimoni berhasil diperbarui."}}catch(a){return{ok:!1,message:a?.message||"Gagal mengubah urutan testimoni."}}}[f]=h.then?(await h)():h,(0,g.ensureServerEntryExports)([m,n,o,p,q,r]),(0,d.registerServerReference)(m,"00ab0e8f7e630d1a0a8ce6029676936aed4b6c7f02",null),(0,d.registerServerReference)(n,"005aa84f9017644ca37da7219394444a5f7e3be072",null),(0,d.registerServerReference)(o,"601ead201136e72ca41fac8d29f5ed43a204c49d1a",null),(0,d.registerServerReference)(p,"605fac2f9551c724e2444739fe283dfc9ecbe5d7d7",null),(0,d.registerServerReference)(q,"60b443572f35a7c617ef0d71dd4ebd2689c536c9b0",null),(0,d.registerServerReference)(r,"40f5e1afeda2ad0a64397aa85fb602e3547e567a51",null),a.s(["addTestimonialAction",()=>o,"deleteTestimonialAction",()=>q,"getActiveTestimonials",()=>n,"getAdminTestimonials",()=>m,"reorderTestimonialsAction",()=>r,"updateTestimonialAction",()=>p]),c()}catch(a){c(a)}},!1),93096,a=>a.a(async(b,c)=>{try{var d=a.i(64054),e=a.i(58259),f=a.i(80735),g=a.i(19347),h=a.i(14895),i=a.i(72654),j=b([d,e,f,g,h,i]);[d,e,f,g,h,i]=j.then?(await j)():j,a.s([]),c()}catch(a){c(a)}},!1),27075,a=>a.a(async(b,c)=>{try{var d=a.i(93096),e=a.i(64054),f=a.i(58259),g=a.i(80735),h=a.i(19347),i=a.i(14895),j=a.i(72654),k=b([d,e,f,g,h,i,j]);[d,e,f,g,h,i,j]=k.then?(await k)():k,a.s(["000b83b9856e05f76f330c0e0c5d0c9031abf0ba9d",()=>f.getAdminProfileData,"001ad19d67a9c9963ec149e1168cbd9a375462265a",()=>e.getAdminMerchandiseItems,"00299ae5c2c41932b61a6685beeedb8da96ec9639e",()=>h.getWebsiteBranding,"002ba862042de92d3347ff580ed6258193293e1499",()=>f.getCurrentUser,"003e66490fbd52c5bff4a9ecda7ac827e8001bc290",()=>f.logoutAction,"0042dbcadff61a976853c63af3bdabeaaa0924a2a1",()=>g.getAdminFaqs,"004eb2388fe9eb231eed99163019e1510b8f30d8c4",()=>e.getAdminCatalogKits,"005aa84f9017644ca37da7219394444a5f7e3be072",()=>i.getActiveTestimonials,"005e95eaace87ea58f8320ce1be70139a7c21b0138",()=>f.requireUser,"008184eb57f3a8781e1172eddb57d4af265f546198",()=>e.getActiveCatalogFile,"00892e45dc3e291bc3e3abd8d1dac0255e0858b7b9",()=>g.getActiveFaqs,"0093aa68c3dbf71160142223bfc284262c8245f479",()=>e.getActiveMerchandiseForHome,"00ab0e8f7e630d1a0a8ce6029676936aed4b6c7f02",()=>i.getAdminTestimonials,"00aca41becf05d8995bcacf55cb13ec9f840d331c6",()=>h.getAdminSettingsData,"00da228bf57ea2b7929f036587c4bb713e7b48e810",()=>e.getAdminCatalogFiles,"00e496a1f31ecbed1e9bcc694202b08765d98653bd",()=>h.getTrustedLogos,"00fc229ff3ea4f57e2879262916f60dcd340b463fb",()=>e.getActiveKitsForHome,"40187dc69138e698d3ae0b79da3f64b295bfb4b2c2",()=>g.reorderFaqsAction,"402f640b0ee30956514dd7b971fb00b7325664f57d",()=>e.getKitDetailBySlug,"403b10d9f76ad6b17c1d765298001a28a1593cb069",()=>j.getAdminAnalyticsData,"403d10f8e93039042933b972156e9f6c904b79a5de",()=>e.getMerchandiseDetailBySlug,"4070fdf1393aae03bbf7fdfcb8395c5a0ffce93a71",()=>f.requireRole,"409338d11a381f0786a47aa81942ea97736b4f80a7",()=>j.trackVisitorPageView,"40b8706f6e92ab7c005e448a06afed34a8a6cbb611",()=>e.requestCatalogDownloadAction,"40e4462e73545f872bd7dab04c023f891b1e8f2d57",()=>f.activateAccountByToken,"40f5e1afeda2ad0a64397aa85fb602e3547e567a51",()=>i.reorderTestimonialsAction,"60182cb9a4e996299d6990c3810e7d8686d7f6afc5",()=>h.deleteTrustedLogoAction,"601b4086897392722a5cdbf5e88f8150c4278beb32",()=>g.deleteFaqAction,"601ead201136e72ca41fac8d29f5ed43a204c49d1a",()=>i.addTestimonialAction,"602ed37ab5ffc3225f379b81c6cc76ed764ebc3936",()=>e.createKitAction,"6035ef0f82f488df77c847a7417536cab6060c33b2",()=>h.updateApiIntegrationAction,"603d59f98d849202b78d92960650e5c2cba330baef",()=>f.updateAdminProfileAction,"60458543d249981a6fff95825b0243385a0eced89d",()=>h.updateSeoMetadataAction,"604f5d595d7747e77687d34f91584eb54005349dd2",()=>e.uploadCatalogFileAction,"605285065193912998ed75a769a3fcb065eebdfa67",()=>f.loginAction,"605f79f1bcfd30a1bfce6160a4efe5ff112bc44a66",()=>f.requestPasswordResetAction,"605fac2f9551c724e2444739fe283dfc9ecbe5d7d7",()=>i.updateTestimonialAction,"6067e939907b30e12dd175bc843b51447a5268fffb",()=>g.addFaqAction,"607a916fa001c392a337cd9fd15f75d49717183c21",()=>f.resetPasswordAction,"607e2233ad1b656c959dcef8ec69576e57de691097",()=>e.updateKitAction,"608946e54e30fb395e9d4a92a25037103c348b64b4",()=>h.addTrustedLogoAction,"609c9344ca5c1b288c3fd72ef6e9cfa3bee32fa9c0",()=>h.updateSmtpConfigAction,"609eaa9eb6e952d759285c47a565ece9213146242d",()=>e.deleteKitAction,"60b443572f35a7c617ef0d71dd4ebd2689c536c9b0",()=>i.deleteTestimonialAction,"60becde9516a57c39e0fbc3623244153331059a1a3",()=>j.deleteAdminLeadAction,"60c8f9c89847d60b4aa7c037d2eef17847e25ff11c",()=>e.updateMerchandiseAction,"60ca1648c8a033eb3b2f34626d00c986d5a88f1b16",()=>e.createMerchandiseAction,"60cbdd7b53d1387b52875f1daa1d5791efa51cc328",()=>f.registerAction,"60cbe5ddcc15bda29369ac7625f05f4269b3565089",()=>h.updateTrustedLogoAction,"60d0ec23eef6f7ca2f89b251d66b269af6732952b2",()=>h.updateWebsiteConfigAction,"60de28c4d5e443ab05202b9362d7e68ce906328dbf",()=>g.updateFaqAction,"60e18384a32db240446751e6ab55133447af89e21e",()=>e.deleteMerchandiseAction]),c()}catch(a){c(a)}},!1)];

//# sourceMappingURL=_ba9aa6b4._.js.map