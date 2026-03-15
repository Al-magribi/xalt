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
           WHERE id = $2`,[c+1,b[c]])}),l(),{ok:!0,message:"Urutan FAQ berhasil diperbarui."}}catch(a){return{ok:!1,message:a?.message||"Gagal mengubah urutan FAQ."}}}[f]=h.then?(await h)():h,(0,g.ensureServerEntryExports)([m,n,o,p,q,r]),(0,d.registerServerReference)(m,"00cff18b3c5b186755c0ee8a25cbe06f6973ea88ea",null),(0,d.registerServerReference)(n,"00abb62ac2eab7d6872bb9399c92ba3b57b86c5980",null),(0,d.registerServerReference)(o,"6044b631717671c854961d0bc2c7d368f33b3ed641",null),(0,d.registerServerReference)(p,"60671cb473a541b2527be4c9d9d211bc089c2c35ee",null),(0,d.registerServerReference)(q,"6075c036d2b173850f5e1e58000a3723a7362b5aff",null),(0,d.registerServerReference)(r,"407b8b1bee3282229b0a25f77800008f0da311f446",null),a.s(["addFaqAction",()=>o,"deleteFaqAction",()=>q,"getActiveFaqs",()=>n,"getAdminFaqs",()=>m,"reorderFaqsAction",()=>r,"updateFaqAction",()=>p]),c()}catch(a){c(a)}},!1),14895,a=>a.a(async(b,c)=>{try{var d=a.i(37936),e=a.i(18558),f=a.i(41154),g=a.i(13095),h=b([f]);function i(a,b=!1){if(null==a)return b;let c=String(a).toLowerCase();return"1"===c||"true"===c||"on"===c}function j(a,b=0){let c=Number.parseInt(String(a??""),10);return Number.isInteger(c)?c:b}function k(a){return{id:Number(a.id),client_name:a.client_name||"",title:a.title||"",quote:a.quote||"",link_url:a.link_url||"",rating:Number(a.rating||5),sort_order:Number(a.sort_order||0),is_active:!!a.is_active,created_at:a.created_at,updated_at:a.updated_at}}function l(){(0,e.revalidatePath)("/"),(0,e.revalidatePath)("/admin/setting")}async function m(){return(await (0,f.query)(`SELECT
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
           WHERE id = $2`,[c+1,b[c]])}),l(),{ok:!0,message:"Urutan testimoni berhasil diperbarui."}}catch(a){return{ok:!1,message:a?.message||"Gagal mengubah urutan testimoni."}}}[f]=h.then?(await h)():h,(0,g.ensureServerEntryExports)([m,n,o,p,q,r]),(0,d.registerServerReference)(m,"00a1c3208bcb13c0547bbd370b632735dc228a8c3c",null),(0,d.registerServerReference)(n,"00cd4e08c7307db849a455b9a5e47a2419dbc6a025",null),(0,d.registerServerReference)(o,"603fb3d2a388435610790c4994e0f8e8d4ca670230",null),(0,d.registerServerReference)(p,"60b1e6729b82f3c3a4d8e9514dc02138f32ce65d62",null),(0,d.registerServerReference)(q,"6015f1284278a38cd26f3dc1be34f2743eefe0459b",null),(0,d.registerServerReference)(r,"4037cd932ceaa7e4ac0a4eaacb4d8b17a8bc7363d9",null),a.s(["addTestimonialAction",()=>o,"deleteTestimonialAction",()=>q,"getActiveTestimonials",()=>n,"getAdminTestimonials",()=>m,"reorderTestimonialsAction",()=>r,"updateTestimonialAction",()=>p]),c()}catch(a){c(a)}},!1),93096,a=>a.a(async(b,c)=>{try{var d=a.i(64054),e=a.i(58259),f=a.i(80735),g=a.i(19347),h=a.i(14895),i=a.i(72654),j=b([d,e,f,g,h,i]);[d,e,f,g,h,i]=j.then?(await j)():j,a.s([]),c()}catch(a){c(a)}},!1),27075,a=>a.a(async(b,c)=>{try{var d=a.i(93096),e=a.i(64054),f=a.i(58259),g=a.i(80735),h=a.i(19347),i=a.i(14895),j=a.i(72654),k=b([d,e,f,g,h,i,j]);[d,e,f,g,h,i,j]=k.then?(await k)():k,a.s(["000908452b9ce98bb4921e1cd3fbf41cd327ffd58f",()=>e.getActiveMerchandiseForHome,"001512fc84372275cf2c249f6a4f72bc67c521d301",()=>e.getAdminMerchandiseItems,"002ce157234da6c4b5a2da7f526fdc137544d032a7",()=>e.getAdminCatalogKits,"002fef0fe51ae333e884828bafb21e2ab1613b72c7",()=>h.getAdminSettingsData,"0035b83483181045d482e671a73f65a3c9869f052c",()=>e.getActiveKitsForHome,"0058e754c29634419ceb92490a28042fdc51565a97",()=>f.logoutAction,"0062d9fa7a5b092490d5ff37e85cf9321be4035417",()=>e.getAdminCatalogFiles,"009c06666d52120d821f2960c73455c6acf074dc62",()=>e.getActiveCatalogFile,"00a1c3208bcb13c0547bbd370b632735dc228a8c3c",()=>i.getAdminTestimonials,"00abb62ac2eab7d6872bb9399c92ba3b57b86c5980",()=>g.getActiveFaqs,"00ae63c0e98e7cff520585929333d32765cbd3e328",()=>h.getTrustedLogos,"00cd4e08c7307db849a455b9a5e47a2419dbc6a025",()=>i.getActiveTestimonials,"00cff18b3c5b186755c0ee8a25cbe06f6973ea88ea",()=>g.getAdminFaqs,"00d4b48d2a5b6a55075658c6679ed1bcf5e0c08c74",()=>h.getWebsiteBranding,"00e6dd315e43e8040570efef3ab8c8cf9dad471e14",()=>f.getCurrentUser,"00f19faae1ce69ea2e7fb270fe247a39a0ca688cbe",()=>f.requireUser,"00f910771d4f6357b5a96b168c0b664acbdc93ec9a",()=>f.getAdminProfileData,"4004e0f555a1195a701448b383f87573ae99502af6",()=>f.activateAccountByToken,"4037cd932ceaa7e4ac0a4eaacb4d8b17a8bc7363d9",()=>i.reorderTestimonialsAction,"40620a904639a0e3ccdd5a7adb3a7f6bc1c4d896ab",()=>f.requireRole,"406cd6e307a682d045a67391f0307d44c3517f96c2",()=>j.trackVisitorPageView,"407b8b1bee3282229b0a25f77800008f0da311f446",()=>g.reorderFaqsAction,"40ac09b887fd59f9e54b626c66df9f97e9fa31e981",()=>e.getMerchandiseDetailBySlug,"40b263ce896f1d0fc4b7f7e7cd19eadea56625cbe8",()=>e.requestCatalogDownloadAction,"40b2b868dbaf773720b071fb9cae8c12ff9c3a0c70",()=>j.getAdminAnalyticsData,"40f718fcf352f722f578ebb0cec717bf57c37a406c",()=>e.getKitDetailBySlug,"60001532b93c88e147c1810b7b6951e1c0ccfe4d4d",()=>e.updateMerchandiseAction,"6006b8044e3b3583b50cab30733671884fdf2f8fb8",()=>h.addTrustedLogoAction,"600e5d14d42db370785ef86f6a1a06c593a596c7cd",()=>e.createMerchandiseAction,"6015f1284278a38cd26f3dc1be34f2743eefe0459b",()=>i.deleteTestimonialAction,"6016206cc9944206b228244449a313a55fd1270543",()=>h.updateWebsiteConfigAction,"6016a3f09ce0ca5c397524489aeb0d0cd6f2a368c5",()=>h.updateSmtpConfigAction,"6030c5880607fe2233c2a2feb79c62145973e2b5f6",()=>f.registerAction,"6033a974362dc0c9d7e6384f3a8b051e9584ba461e",()=>e.deleteKitAction,"6035e108d4232ef22b41f126e5f352878a650823a0",()=>h.updateSeoMetadataAction,"60375707cb231710b0630c6b5a91531c30e5a0fe63",()=>h.deleteTrustedLogoAction,"603fb3d2a388435610790c4994e0f8e8d4ca670230",()=>i.addTestimonialAction,"6044b631717671c854961d0bc2c7d368f33b3ed641",()=>g.addFaqAction,"604bf75c774aef1bae5e69c73bdc490afc124545dd",()=>h.updateApiIntegrationAction,"60597bf7109e583ef1297c57c0521a799d8e39c707",()=>f.resetPasswordAction,"60671cb473a541b2527be4c9d9d211bc089c2c35ee",()=>g.updateFaqAction,"60676bf7efd5ebb06737131b08fc27fdbdeb093fed",()=>h.updateTrustedLogoAction,"6070aed6f39020707b0de14d81859be063148c4800",()=>f.updateAdminProfileAction,"6075c036d2b173850f5e1e58000a3723a7362b5aff",()=>g.deleteFaqAction,"60a7f2ca3f7190746c93810297a97b9d710dfd5167",()=>j.deleteAdminLeadAction,"60b1e6729b82f3c3a4d8e9514dc02138f32ce65d62",()=>i.updateTestimonialAction,"60e9aaf4c155faa0b9541602fc0f462417ad668aa1",()=>e.createKitAction,"60e9c325247a38f06c63bfae66afc6717482e2c827",()=>e.uploadCatalogFileAction,"60ec05da384d8d9f85bbb9d213cbe5edebc1218f1b",()=>f.requestPasswordResetAction,"60eebcf9324fd1b716d4ed71a6b9d18db3c673cd4a",()=>e.deleteMerchandiseAction,"60f9316620c8d88c6bdb906e05023427b76abfe2f5",()=>e.updateKitAction,"60fbdf291446aefedd9b3a7973fd7b665c9ac3b7bb",()=>f.loginAction]),c()}catch(a){c(a)}},!1)];

//# sourceMappingURL=_ba9aa6b4._.js.map