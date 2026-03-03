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
           WHERE id = $2`,[c+1,b[c]])}),l(),{ok:!0,message:"Urutan FAQ berhasil diperbarui."}}catch(a){return{ok:!1,message:a?.message||"Gagal mengubah urutan FAQ."}}}[f]=h.then?(await h)():h,(0,g.ensureServerEntryExports)([m,n,o,p,q,r]),(0,d.registerServerReference)(m,"00cf5f57369cda547bb9a10d61ada9f5b1521b4f74",null),(0,d.registerServerReference)(n,"0086d594d87363cf3766da5714515aa9cb384e0f9b",null),(0,d.registerServerReference)(o,"605b6e6457a4409dc78767719427ced9acb3d14d01",null),(0,d.registerServerReference)(p,"605bdb91809d51e458d9623b1b915f94fcc528183c",null),(0,d.registerServerReference)(q,"60d693e7a21b7c286fb1c14175895278cc41321f38",null),(0,d.registerServerReference)(r,"407b06af12dd6626b1f4bec544367e4a0e60c70880",null),a.s(["addFaqAction",()=>o,"deleteFaqAction",()=>q,"getActiveFaqs",()=>n,"getAdminFaqs",()=>m,"reorderFaqsAction",()=>r,"updateFaqAction",()=>p]),c()}catch(a){c(a)}},!1),14895,a=>a.a(async(b,c)=>{try{var d=a.i(37936),e=a.i(18558),f=a.i(41154),g=a.i(13095),h=b([f]);function i(a,b=!1){if(null==a)return b;let c=String(a).toLowerCase();return"1"===c||"true"===c||"on"===c}function j(a,b=0){let c=Number.parseInt(String(a??""),10);return Number.isInteger(c)?c:b}function k(a){return{id:Number(a.id),client_name:a.client_name||"",title:a.title||"",quote:a.quote||"",link_url:a.link_url||"",rating:Number(a.rating||5),sort_order:Number(a.sort_order||0),is_active:!!a.is_active,created_at:a.created_at,updated_at:a.updated_at}}function l(){(0,e.revalidatePath)("/"),(0,e.revalidatePath)("/admin/setting")}async function m(){return(await (0,f.query)(`SELECT
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
           WHERE id = $2`,[c+1,b[c]])}),l(),{ok:!0,message:"Urutan testimoni berhasil diperbarui."}}catch(a){return{ok:!1,message:a?.message||"Gagal mengubah urutan testimoni."}}}[f]=h.then?(await h)():h,(0,g.ensureServerEntryExports)([m,n,o,p,q,r]),(0,d.registerServerReference)(m,"001515cb8de19ed64147f2b6ac6740804594469f40",null),(0,d.registerServerReference)(n,"000ed5f8f6e77660f663eb7ff4a253df094316f84e",null),(0,d.registerServerReference)(o,"6010314823aa8e5e6e15f7daa53ea1131110772d78",null),(0,d.registerServerReference)(p,"607dccd12733fc5fd41c42fb6a9d384b52627e8841",null),(0,d.registerServerReference)(q,"60ed5d4622098cc10da62684047dd52dc99684a2b2",null),(0,d.registerServerReference)(r,"40c100e06b0ed49601c55f68bc2bdcab55307cf0a1",null),a.s(["addTestimonialAction",()=>o,"deleteTestimonialAction",()=>q,"getActiveTestimonials",()=>n,"getAdminTestimonials",()=>m,"reorderTestimonialsAction",()=>r,"updateTestimonialAction",()=>p]),c()}catch(a){c(a)}},!1),93096,a=>a.a(async(b,c)=>{try{var d=a.i(64054),e=a.i(58259),f=a.i(80735),g=a.i(19347),h=a.i(14895),i=a.i(72654),j=b([d,e,f,g,h,i]);[d,e,f,g,h,i]=j.then?(await j)():j,a.s([]),c()}catch(a){c(a)}},!1),27075,a=>a.a(async(b,c)=>{try{var d=a.i(93096),e=a.i(64054),f=a.i(58259),g=a.i(80735),h=a.i(19347),i=a.i(14895),j=a.i(72654),k=b([d,e,f,g,h,i,j]);[d,e,f,g,h,i,j]=k.then?(await k)():k,a.s(["000ed5f8f6e77660f663eb7ff4a253df094316f84e",()=>i.getActiveTestimonials,"001515cb8de19ed64147f2b6ac6740804594469f40",()=>i.getAdminTestimonials,"001e0ba6e66ea45214babe178b28cd244f17a6719b",()=>e.getActiveCatalogFile,"002e6a22597031f8262fc5ca815d8e90bf3dbfe78f",()=>h.getTrustedLogos,"00332fe3340d364fbbc18e45d7322114bc55e2f954",()=>h.getWebsiteBranding,"004afc51aa44c9e7c237b8cf4c0159ea5be6b3a338",()=>e.getAdminCatalogKits,"0059725dfb467e990d73c3517d408beff55c8573e5",()=>f.logoutAction,"0086d594d87363cf3766da5714515aa9cb384e0f9b",()=>g.getActiveFaqs,"009e01cc1a3e5e85f0b80919d21fa5ab474c14d342",()=>f.requireUser,"00a5a810a9892f318238535320a8c2897d096c8b6d",()=>e.getActiveKitsForHome,"00b3c54f5c643fd75c606cc6766eb3c0a3ed839a33",()=>e.getActiveMerchandiseForHome,"00b4eec0c1d351bcd4515ed91732092e485439e07c",()=>f.getCurrentUser,"00cbcb5cf404fc667566a4175783e1b68171ee0ece",()=>e.getAdminMerchandiseItems,"00cce3e472bbf87f28dccd7a25da74253eeace7aa6",()=>h.getAdminSettingsData,"00cf5f57369cda547bb9a10d61ada9f5b1521b4f74",()=>g.getAdminFaqs,"00de3466b5ff18cbe9c04d4f4987fbc0da7fb7df69",()=>e.getAdminCatalogFiles,"00f668e9c2f3fccfc252df7e6016c4ff08ba39a3a5",()=>f.getAdminProfileData,"401c976f0728f757e0c91f1b1e6f0c857a11d1d5bd",()=>f.requireRole,"40220be82a6086fa5f97f96a9cf67dc0bbc13a1d5c",()=>j.getAdminAnalyticsData,"4035714d493ae1fc4abdf186340e4ee9a3e7a23770",()=>f.activateAccountByToken,"4068ff4f1981bccd96da4abc2020b64de2cd922c73",()=>e.getMerchandiseDetailBySlug,"407b06af12dd6626b1f4bec544367e4a0e60c70880",()=>g.reorderFaqsAction,"408e328ff441146821ab07fd76fd075949f1048a70",()=>j.trackVisitorPageView,"40c100e06b0ed49601c55f68bc2bdcab55307cf0a1",()=>i.reorderTestimonialsAction,"40d87c1ebe0f23b16e0ae19d77107664119e16c74c",()=>e.getKitDetailBySlug,"40f2ac31aeb4940bf78bdc2013c5ed8833f5c934cd",()=>e.requestCatalogDownloadAction,"6001a4a5e4f7bcdd18a77ce3a63d9adebe1a546fd0",()=>f.resetPasswordAction,"6002795e6b2f7e5a2d0a082dd138551f412570deba",()=>f.requestPasswordResetAction,"600bbc8c78f0ea80602db8e2e8cca84f2fcef4cf08",()=>h.deleteTrustedLogoAction,"6010314823aa8e5e6e15f7daa53ea1131110772d78",()=>i.addTestimonialAction,"6017024524824af757ee28b852fcd4a0e288f279cf",()=>e.updateKitAction,"60181f06f75c4ca4b1166c8e2045b77a847b68f0c4",()=>e.updateMerchandiseAction,"601f1f6e89762c61f9bb5e2f4acc9652bc8ba4c593",()=>e.createMerchandiseAction,"6024c2ecbd9feae5156b37b25c46d17123dedf97aa",()=>h.updateTrustedLogoAction,"6028d71f0b62f2f16acc13447bf63f7f6d5772e444",()=>h.updateSmtpConfigAction,"602a86c4e98d2fce7e8dc7cd901cceb7452b347c6e",()=>h.updateSeoMetadataAction,"602c263ff7231fc21c419c508d4d62f1f26800ba39",()=>e.uploadCatalogFileAction,"602d9bc1241e60c823cefde378b60b6364ede8202d",()=>e.createKitAction,"60361e2f702ecc0dee7722fd46ace47d6961b2b96a",()=>f.registerAction,"60566c8f867348c5af2cb17aad2ec0950d81974e0a",()=>h.updateWebsiteConfigAction,"605b6e6457a4409dc78767719427ced9acb3d14d01",()=>g.addFaqAction,"605bdb91809d51e458d9623b1b915f94fcc528183c",()=>g.updateFaqAction,"606c09bf695be7298eb698c0d006b784a538f67465",()=>h.updateApiIntegrationAction,"6073d23a7ac570005799a40e64b91632c9f1ce3b50",()=>f.updateAdminProfileAction,"607407960579eb45ec4087ac2c0eee6a76926ed794",()=>f.loginAction,"607a7d5b77ce65c55bd628ec7593d1d8c16f7bf0ec",()=>h.addTrustedLogoAction,"607dccd12733fc5fd41c42fb6a9d384b52627e8841",()=>i.updateTestimonialAction,"6086aac55bd10378735c812f6d50a833cec4d795e1",()=>e.deleteMerchandiseAction,"60d693e7a21b7c286fb1c14175895278cc41321f38",()=>g.deleteFaqAction,"60eb9fcf23e67ada6153575ab51fffa758c6d957db",()=>e.deleteKitAction,"60ed5d4622098cc10da62684047dd52dc99684a2b2",()=>i.deleteTestimonialAction,"60f96d6a91b61c09921b6eee6ef4e1b5b300c0d597",()=>j.deleteAdminLeadAction]),c()}catch(a){c(a)}},!1)];

//# sourceMappingURL=_ba9aa6b4._.js.map