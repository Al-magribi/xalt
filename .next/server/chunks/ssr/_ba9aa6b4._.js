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
           WHERE id = $2`,[c+1,b[c]])}),l(),{ok:!0,message:"Urutan FAQ berhasil diperbarui."}}catch(a){return{ok:!1,message:a?.message||"Gagal mengubah urutan FAQ."}}}[f]=h.then?(await h)():h,(0,g.ensureServerEntryExports)([m,n,o,p,q,r]),(0,d.registerServerReference)(m,"0070a03ab5b30a2449132480e51335475f9c002a61",null),(0,d.registerServerReference)(n,"007ffb0f7b0e8e1c841f0ede230319584ce2b07aab",null),(0,d.registerServerReference)(o,"601b54697d2fff020258528e7248ea20fa34be51be",null),(0,d.registerServerReference)(p,"6066eced19215b1b4734a2e0f4f2fedb7eb0bd0dae",null),(0,d.registerServerReference)(q,"60fc4aa13231290c1ceb7aefe19da29c920234dbd3",null),(0,d.registerServerReference)(r,"40f834af36943e492f27179a07af3d03f623a49296",null),a.s(["addFaqAction",()=>o,"deleteFaqAction",()=>q,"getActiveFaqs",()=>n,"getAdminFaqs",()=>m,"reorderFaqsAction",()=>r,"updateFaqAction",()=>p]),c()}catch(a){c(a)}},!1),14895,a=>a.a(async(b,c)=>{try{var d=a.i(37936),e=a.i(18558),f=a.i(41154),g=a.i(13095),h=b([f]);function i(a,b=!1){if(null==a)return b;let c=String(a).toLowerCase();return"1"===c||"true"===c||"on"===c}function j(a,b=0){let c=Number.parseInt(String(a??""),10);return Number.isInteger(c)?c:b}function k(a){return{id:Number(a.id),client_name:a.client_name||"",title:a.title||"",quote:a.quote||"",link_url:a.link_url||"",rating:Number(a.rating||5),sort_order:Number(a.sort_order||0),is_active:!!a.is_active,created_at:a.created_at,updated_at:a.updated_at}}function l(){(0,e.revalidatePath)("/"),(0,e.revalidatePath)("/admin/setting")}async function m(){return(await (0,f.query)(`SELECT
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
           WHERE id = $2`,[c+1,b[c]])}),l(),{ok:!0,message:"Urutan testimoni berhasil diperbarui."}}catch(a){return{ok:!1,message:a?.message||"Gagal mengubah urutan testimoni."}}}[f]=h.then?(await h)():h,(0,g.ensureServerEntryExports)([m,n,o,p,q,r]),(0,d.registerServerReference)(m,"007c1411f4b6001bb18f817c0d35ecc1c6121e0c74",null),(0,d.registerServerReference)(n,"008472e967df40cb3997058d35c5302308898790c8",null),(0,d.registerServerReference)(o,"60b930a6e1ece27cd7ae72c7c9094070f4b4a1c4e4",null),(0,d.registerServerReference)(p,"609c4a43a9e13502e3cef4f7428a9232ddc57ba43f",null),(0,d.registerServerReference)(q,"607a0f94abd4693b55eb083085f6ab2f1f2bb1e00f",null),(0,d.registerServerReference)(r,"40c6c4cbf0817d801ab2958bdb46cbd0c80d126141",null),a.s(["addTestimonialAction",()=>o,"deleteTestimonialAction",()=>q,"getActiveTestimonials",()=>n,"getAdminTestimonials",()=>m,"reorderTestimonialsAction",()=>r,"updateTestimonialAction",()=>p]),c()}catch(a){c(a)}},!1),93096,a=>a.a(async(b,c)=>{try{var d=a.i(64054),e=a.i(58259),f=a.i(80735),g=a.i(19347),h=a.i(14895),i=a.i(72654),j=b([d,e,f,g,h,i]);[d,e,f,g,h,i]=j.then?(await j)():j,a.s([]),c()}catch(a){c(a)}},!1),27075,a=>a.a(async(b,c)=>{try{var d=a.i(93096),e=a.i(64054),f=a.i(58259),g=a.i(80735),h=a.i(19347),i=a.i(14895),j=a.i(72654),k=b([d,e,f,g,h,i,j]);[d,e,f,g,h,i,j]=k.then?(await k)():k,a.s(["0012dc69f8f0826697e0b0ddede9d299814def1e45",()=>e.getAdminCatalogKits,"00374a34c5f5c845e04d4af81d5d15f084e302c5e7",()=>f.getCurrentUser,"004d67081a9e6fe695ed907f7b4750f53031c517a8",()=>e.getAdminMerchandiseItems,"005feda9c32639bba844235d1cb900c0de16430429",()=>e.getAdminCatalogFiles,"0070a03ab5b30a2449132480e51335475f9c002a61",()=>g.getAdminFaqs,"007c1411f4b6001bb18f817c0d35ecc1c6121e0c74",()=>i.getAdminTestimonials,"007d05750e687f740ed7e18b419c727abcb62e025d",()=>e.getActiveCatalogFile,"007e1054e79b3ad60fdc234fecd6fb5b19bcd63e15",()=>e.getActiveMerchandiseForHome,"007ffb0f7b0e8e1c841f0ede230319584ce2b07aab",()=>g.getActiveFaqs,"008472e967df40cb3997058d35c5302308898790c8",()=>i.getActiveTestimonials,"00959c7e8f1b0d3b3f4854ba0a9d89b4eba543999e",()=>h.getWebsiteBranding,"009ad6b49fdcca246769060584030432f3dede3075",()=>h.getAdminSettingsData,"00a413c30bc6ba285412954ede1567e1918f3a4260",()=>h.getTrustedLogos,"00cfd8c18e0bee416f2b90c270ec0aecf8a77a8756",()=>f.logoutAction,"00d0a795c85998cddef16d710964c2a93d4896e4e4",()=>f.requireUser,"00dce9fc92931b6ebf51a733bdb0fd8941e9918a9c",()=>e.getActiveKitsForHome,"00f1b948a65ae54a2439ac10b5e7a347cd197cd827",()=>f.getAdminProfileData,"401975be364d8fb0cbc52ac921ec77c07d9c6d4d29",()=>f.requireRole,"402b85314c57a064c68e6b10d09ad06a36e7ec651e",()=>e.getKitDetailBySlug,"407dab6b3c5c11b5841faeb93c71c3075a1745cd3f",()=>f.activateAccountByToken,"409ac45bc2d75c6d03ff5f09ee7ba780cd1349802e",()=>j.trackVisitorPageView,"40a73d51ceb6354fac5a69d245995d61e0833765c8",()=>j.getAdminAnalyticsData,"40c6c4cbf0817d801ab2958bdb46cbd0c80d126141",()=>i.reorderTestimonialsAction,"40dce8a34e7f9797fdc422f31ddb95afd87ff6b759",()=>e.requestCatalogDownloadAction,"40f210cdc8b4d357d9b2b24dba383de3db6e9616a8",()=>e.getMerchandiseDetailBySlug,"40f834af36943e492f27179a07af3d03f623a49296",()=>g.reorderFaqsAction,"600943f960ba26e78e2c8f85b7ad0084931f3676e6",()=>e.updateMerchandiseAction,"600b8fc3cc3edf306b3ed8a28c593c643eddccd536",()=>h.addTrustedLogoAction,"600e941dc84c070419ef94d73b7d806aaa24d6e94e",()=>e.deleteKitAction,"600f6d6fdfa1cd8fb4c71197a2dbc5ae5852bd4cc7",()=>h.updateWebsiteConfigAction,"601b54697d2fff020258528e7248ea20fa34be51be",()=>g.addFaqAction,"602933e9bb6ef0f8104f4463b1ab677c4b65d9fa77",()=>e.updateKitAction,"602dcdb04a738189d8a29ff82baaf411386eabd823",()=>e.uploadCatalogFileAction,"6037253b8d0d1f2364491fcbb59f51e1c1e5e8578a",()=>h.updateTrustedLogoAction,"603a8180418a2646851d1feb35f80b6e50e8722b7c",()=>j.deleteAdminLeadAction,"606097c085bec330a22f016ecfdba4bd1f0b280366",()=>h.updateApiIntegrationAction,"6066753f60c6fdd9e6d0963457a726ee38b455d704",()=>e.createMerchandiseAction,"6066eced19215b1b4734a2e0f4f2fedb7eb0bd0dae",()=>g.updateFaqAction,"60696ae9df9f267560a8c4f5dd5636a660a973868c",()=>f.updateAdminProfileAction,"606bbba9c0cc5db522c48c5d43bc6b697aa135b264",()=>h.deleteTrustedLogoAction,"606d895086d731b0f6794a03cdc90b1215211299c8",()=>e.createKitAction,"6074f566844aea4fb3e1df8b032d19c90a57a4c8d5",()=>h.updateSmtpConfigAction,"60785c35690484b4331f5188cd58705f1cfb08af24",()=>f.registerAction,"607a0f94abd4693b55eb083085f6ab2f1f2bb1e00f",()=>i.deleteTestimonialAction,"609c4a43a9e13502e3cef4f7428a9232ddc57ba43f",()=>i.updateTestimonialAction,"60ac236a121c2ace30b3cef9dbe0d954b1a10deb6d",()=>h.updateSeoMetadataAction,"60b930a6e1ece27cd7ae72c7c9094070f4b4a1c4e4",()=>i.addTestimonialAction,"60c24d624fed7c2142d472b32546fc6512a66a3f53",()=>f.requestPasswordResetAction,"60c57ccfb76ae3562492b0c265738c6dc9294c6da1",()=>f.resetPasswordAction,"60e1f53b3352eda5f196057d19b6d6ff8a508c21d9",()=>e.deleteMerchandiseAction,"60fc4aa13231290c1ceb7aefe19da29c920234dbd3",()=>g.deleteFaqAction,"60fddefcc79f53b2aeb02b4bd410ad162bd37e7244",()=>f.loginAction]),c()}catch(a){c(a)}},!1)];

//# sourceMappingURL=_ba9aa6b4._.js.map