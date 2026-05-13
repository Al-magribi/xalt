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
           WHERE id = $2`,[c+1,b[c]])}),l(),{ok:!0,message:"Urutan FAQ berhasil diperbarui."}}catch(a){return{ok:!1,message:a?.message||"Gagal mengubah urutan FAQ."}}}[f]=h.then?(await h)():h,(0,g.ensureServerEntryExports)([m,n,o,p,q,r]),(0,d.registerServerReference)(m,"0062c122f3b983844b98e61d3836d953893e9f6263",null),(0,d.registerServerReference)(n,"0059545c3b374a07a2de6fcf2839b86ad7d9c78bb8",null),(0,d.registerServerReference)(o,"6042ee41c8865fddb52bbc47b25d121c415c7ec384",null),(0,d.registerServerReference)(p,"60175cde299cc25d4fb9fe1e6a35396d9e3fa9bd22",null),(0,d.registerServerReference)(q,"601c87ca794785869f886f214640186312e60cff57",null),(0,d.registerServerReference)(r,"40f6ad8f584c63212b17d1c408ba9afad60f7a5f8c",null),a.s(["addFaqAction",()=>o,"deleteFaqAction",()=>q,"getActiveFaqs",()=>n,"getAdminFaqs",()=>m,"reorderFaqsAction",()=>r,"updateFaqAction",()=>p]),c()}catch(a){c(a)}},!1),14895,a=>a.a(async(b,c)=>{try{var d=a.i(37936),e=a.i(18558),f=a.i(41154),g=a.i(13095),h=b([f]);function i(a,b=!1){if(null==a)return b;let c=String(a).toLowerCase();return"1"===c||"true"===c||"on"===c}function j(a,b=0){let c=Number.parseInt(String(a??""),10);return Number.isInteger(c)?c:b}function k(a){return{id:Number(a.id),client_name:a.client_name||"",title:a.title||"",quote:a.quote||"",link_url:a.link_url||"",rating:Number(a.rating||5),sort_order:Number(a.sort_order||0),is_active:!!a.is_active,created_at:a.created_at,updated_at:a.updated_at}}function l(){(0,e.revalidatePath)("/"),(0,e.revalidatePath)("/admin/setting")}async function m(){return(await (0,f.query)(`SELECT
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
           WHERE id = $2`,[c+1,b[c]])}),l(),{ok:!0,message:"Urutan testimoni berhasil diperbarui."}}catch(a){return{ok:!1,message:a?.message||"Gagal mengubah urutan testimoni."}}}[f]=h.then?(await h)():h,(0,g.ensureServerEntryExports)([m,n,o,p,q,r]),(0,d.registerServerReference)(m,"004284bc8b31a8ef81850858026ad66d1ba88d4f25",null),(0,d.registerServerReference)(n,"00e865c4d9d52ca60da8405e33d347c6d1445c64f7",null),(0,d.registerServerReference)(o,"60ce7fc6a75347c328244b77cb6cce95a933e601e8",null),(0,d.registerServerReference)(p,"60603126089e3363d1976c0d02bf1f6df240ddd2c8",null),(0,d.registerServerReference)(q,"60172d117109ac7f59401efbb97260c3db216e80d9",null),(0,d.registerServerReference)(r,"4045ad14003ddb6076aa9e09f06e63e67181eb3126",null),a.s(["addTestimonialAction",()=>o,"deleteTestimonialAction",()=>q,"getActiveTestimonials",()=>n,"getAdminTestimonials",()=>m,"reorderTestimonialsAction",()=>r,"updateTestimonialAction",()=>p]),c()}catch(a){c(a)}},!1),93096,a=>a.a(async(b,c)=>{try{var d=a.i(64054),e=a.i(58259),f=a.i(80735),g=a.i(19347),h=a.i(14895),i=a.i(72654),j=b([d,e,f,g,h,i]);[d,e,f,g,h,i]=j.then?(await j)():j,a.s([]),c()}catch(a){c(a)}},!1),27075,a=>a.a(async(b,c)=>{try{var d=a.i(93096),e=a.i(64054),f=a.i(58259),g=a.i(80735),h=a.i(19347),i=a.i(14895),j=a.i(72654),k=b([d,e,f,g,h,i,j]);[d,e,f,g,h,i,j]=k.then?(await k)():k,a.s(["000e1fc0e828d64deceab23f169028e6eb6bbcef51",()=>f.logoutAction,"001cbc38ed6b7538289a032a1fbb5448e8c046b10b",()=>f.getAdminProfileData,"004284bc8b31a8ef81850858026ad66d1ba88d4f25",()=>i.getAdminTestimonials,"0059545c3b374a07a2de6fcf2839b86ad7d9c78bb8",()=>g.getActiveFaqs,"0062c122f3b983844b98e61d3836d953893e9f6263",()=>g.getAdminFaqs,"006b75970f91e002b18e1c18796ed41ab5fecc3c1d",()=>h.getWebsiteBranding,"008176ea5d328632d03c62facebfa7a2bb7eeba62b",()=>e.getAdminCatalogKits,"00849c5e9ea671eeb7bd0a25b5a6f68268ada3f143",()=>e.getActiveCatalogFile,"008b06012fd2f23fa95551aa7e895df5095d920880",()=>h.getAdminSettingsData,"009196a1dc896b995f62390b67dd62a88db8ae2e50",()=>f.getCurrentUser,"00964d437c7d90f0f43e89787a5c7376bbe8dfaea9",()=>e.getActiveMerchandiseForHome,"00ad3fbb4e7e9c94d1cae700966bf65de2c3f6c729",()=>h.getTrustedLogos,"00ae57bbfb751f356a93f42d8e1a1e95cd4e8b1774",()=>f.requireUser,"00ba2b63270808790e9a38032015a835984a37d924",()=>e.getAdminMerchandiseItems,"00e7f470c635564b50b7b6d1f63476a7c329234741",()=>e.getAdminCatalogFiles,"00e865c4d9d52ca60da8405e33d347c6d1445c64f7",()=>i.getActiveTestimonials,"00ffedc3e5f2f26f900cbb8c9082f5b94cb1f77290",()=>e.getActiveKitsForHome,"401687a9ef1c75002300d7c721ec6dc1509910bea1",()=>f.requireRole,"4045ad14003ddb6076aa9e09f06e63e67181eb3126",()=>i.reorderTestimonialsAction,"404c2382fbf8d57601a6c4fd217c461b0a347cb793",()=>f.activateAccountByToken,"4056b8a8d3f2e00601abf3489e715c8ade509ba1c0",()=>e.getKitDetailBySlug,"4065e06357b2b40cf9a707782fdd6645958ceb02fe",()=>j.getAdminAnalyticsData,"40bc622a4205d54f0650f1316f964859272bb08e59",()=>j.trackVisitorPageView,"40c18729a6bc210b2b44bd3597b92782d232092c28",()=>e.getMerchandiseDetailBySlug,"40d9f5fa6fee25a1da69bbcec50f3b66d690559e32",()=>e.requestCatalogDownloadAction,"40f6ad8f584c63212b17d1c408ba9afad60f7a5f8c",()=>g.reorderFaqsAction,"600e05d0f2b218f5278681613f7b78e3630784eaf1",()=>e.updateKitAction,"60172d117109ac7f59401efbb97260c3db216e80d9",()=>i.deleteTestimonialAction,"60175cde299cc25d4fb9fe1e6a35396d9e3fa9bd22",()=>g.updateFaqAction,"601c860a0e024b3b08ecb20484f8a0f5fedc7e6158",()=>e.updateMerchandiseAction,"601c87ca794785869f886f214640186312e60cff57",()=>g.deleteFaqAction,"602c580fed69a77d2a0699a3b8228c7f25773a68b8",()=>h.updateSeoMetadataAction,"6042ee41c8865fddb52bbc47b25d121c415c7ec384",()=>g.addFaqAction,"6043fbc0ed0b1c0bcb52fecbc876aede104d4fdb8e",()=>j.deleteAdminLeadAction,"60446a38059d60ca80db2b55acde611c77e9578a82",()=>h.updateApiIntegrationAction,"604bc93ffebd417f3b4510d74b5e4e441b33934ad1",()=>f.updateAdminProfileAction,"60564347ff5d00e6777b01c8b4f2161bee0a546499",()=>h.updateSmtpConfigAction,"60594efccc0f8da50f43d0e7ce42435a7cd33e8ad5",()=>e.uploadCatalogFileAction,"605dd0d500a41a7ebf5f354376319a09ccdacb1ac0",()=>f.resetPasswordAction,"60603126089e3363d1976c0d02bf1f6df240ddd2c8",()=>i.updateTestimonialAction,"608076eb09e3996127228899fdcc081dd5d2fa633c",()=>h.updateWebsiteConfigAction,"6083563cfd405b521dd82c12476a196be039d41d87",()=>e.createKitAction,"60a69118e013d6fdc224d288aab3b117bcd4218d2e",()=>e.deleteMerchandiseAction,"60b310a436016be3cdf83850a08d6f2b7f286e5222",()=>h.updateTrustedLogoAction,"60c5114c11d3dc1f02208d6b100e1aebbf6f9f8831",()=>e.createMerchandiseAction,"60ce7fc6a75347c328244b77cb6cce95a933e601e8",()=>i.addTestimonialAction,"60d29e43c21818fc500713379c970b20fee08b6fb8",()=>e.deleteKitAction,"60d75246e1a18b6fa005dff0baaf68bf7737beb6b2",()=>f.registerAction,"60dc6d6285ae68f31e3a8dbad44dfbf181913e93bc",()=>h.deleteTrustedLogoAction,"60eae53fe113c4ea6dbb8c595dbdb08eec0d322070",()=>f.requestPasswordResetAction,"60eddd900d32b1f92bc0bedc5f8126aaf4781752f3",()=>h.addTrustedLogoAction,"60f01da19125c41979067d6cc594c3782356f9c465",()=>f.loginAction]),c()}catch(a){c(a)}},!1)];

//# sourceMappingURL=_ba9aa6b4._.js.map