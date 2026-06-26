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
           WHERE id = $2`,[c+1,b[c]])}),l(),{ok:!0,message:"Urutan FAQ berhasil diperbarui."}}catch(a){return{ok:!1,message:a?.message||"Gagal mengubah urutan FAQ."}}}[f]=h.then?(await h)():h,(0,g.ensureServerEntryExports)([m,n,o,p,q,r]),(0,d.registerServerReference)(m,"00940b3ace73a9edc4c60a6e24cf6cac661a9e1c75",null),(0,d.registerServerReference)(n,"00507783a3a07eea1c0bcb4a30c46df3c3dfd83f70",null),(0,d.registerServerReference)(o,"60575e6dbe3e50b30466ac18747a4b3179dbc5ee21",null),(0,d.registerServerReference)(p,"60c4b8cd34060849fdd123535889a62dfe20d9d2ac",null),(0,d.registerServerReference)(q,"607c0c5fbada6514b1df59c65042c6465fc71b417d",null),(0,d.registerServerReference)(r,"406decbe9d439b1e0a8bf31932655afc22c30c25ce",null),a.s(["addFaqAction",()=>o,"deleteFaqAction",()=>q,"getActiveFaqs",()=>n,"getAdminFaqs",()=>m,"reorderFaqsAction",()=>r,"updateFaqAction",()=>p]),c()}catch(a){c(a)}},!1),14895,a=>a.a(async(b,c)=>{try{var d=a.i(37936),e=a.i(18558),f=a.i(41154),g=a.i(13095),h=b([f]);function i(a,b=!1){if(null==a)return b;let c=String(a).toLowerCase();return"1"===c||"true"===c||"on"===c}function j(a,b=0){let c=Number.parseInt(String(a??""),10);return Number.isInteger(c)?c:b}function k(a){return{id:Number(a.id),client_name:a.client_name||"",title:a.title||"",quote:a.quote||"",link_url:a.link_url||"",rating:Number(a.rating||5),sort_order:Number(a.sort_order||0),is_active:!!a.is_active,created_at:a.created_at,updated_at:a.updated_at}}function l(){(0,e.revalidatePath)("/"),(0,e.revalidatePath)("/admin/setting")}async function m(){return(await (0,f.query)(`SELECT
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
           WHERE id = $2`,[c+1,b[c]])}),l(),{ok:!0,message:"Urutan testimoni berhasil diperbarui."}}catch(a){return{ok:!1,message:a?.message||"Gagal mengubah urutan testimoni."}}}[f]=h.then?(await h)():h,(0,g.ensureServerEntryExports)([m,n,o,p,q,r]),(0,d.registerServerReference)(m,"0091b6641894f6542e4d651bd9955cba58822b2531",null),(0,d.registerServerReference)(n,"00ffd86bbc4f75fde4ec9240ae42732df7d3eaf2ac",null),(0,d.registerServerReference)(o,"60072ac7383c7547c0174fc39ac6fc54be721d6bf3",null),(0,d.registerServerReference)(p,"608544f6dc80f025224d9dc367eb088d9c179b1c53",null),(0,d.registerServerReference)(q,"6057673a915ca32e2b0f09a0096c8042cd07f6e4d1",null),(0,d.registerServerReference)(r,"40e765e5a967fae8fe6921c3b99af60938bdc2df8f",null),a.s(["addTestimonialAction",()=>o,"deleteTestimonialAction",()=>q,"getActiveTestimonials",()=>n,"getAdminTestimonials",()=>m,"reorderTestimonialsAction",()=>r,"updateTestimonialAction",()=>p]),c()}catch(a){c(a)}},!1),93096,a=>a.a(async(b,c)=>{try{var d=a.i(64054),e=a.i(58259),f=a.i(80735),g=a.i(19347),h=a.i(14895),i=a.i(72654),j=b([d,e,f,g,h,i]);[d,e,f,g,h,i]=j.then?(await j)():j,a.s([]),c()}catch(a){c(a)}},!1),27075,a=>a.a(async(b,c)=>{try{var d=a.i(93096),e=a.i(64054),f=a.i(58259),g=a.i(80735),h=a.i(19347),i=a.i(14895),j=a.i(72654),k=b([d,e,f,g,h,i,j]);[d,e,f,g,h,i,j]=k.then?(await k)():k,a.s(["001201c33620f9e77164a095b18eaa540b755cb257",()=>e.getAdminCatalogFiles,"001eca86e8d9a15a3e6292fbcf1c2647bdb29353e1",()=>f.logoutAction,"0021d7d8d0e554f76ffa084d5417e7ed35a344f789",()=>h.getAdminSettingsData,"00268f3b7bc0a6ff2a5185fcd0ebfe45b8f6336f5a",()=>e.getAdminMerchandiseItems,"00507783a3a07eea1c0bcb4a30c46df3c3dfd83f70",()=>g.getActiveFaqs,"007efc72e3e015891cdb3ce2616d3014ba2a881b72",()=>f.getCurrentUser,"00871c9771948265d05b1971f57750c01a0b575bb0",()=>e.getActiveCatalogFile,"009033665fa1dd2ac9aa22e9e26dc4e0377549c2fd",()=>f.requireUser,"0091b6641894f6542e4d651bd9955cba58822b2531",()=>i.getAdminTestimonials,"00940b3ace73a9edc4c60a6e24cf6cac661a9e1c75",()=>g.getAdminFaqs,"00961f70d653d0f56c276daf7259942e4778d62456",()=>f.getAdminProfileData,"00b02af445fe0f13b1adb948e133bb082fa2325f6b",()=>e.getActiveKitsForHome,"00d2c4c45379d3dac4dff68cc896bf8636c502aec9",()=>h.getTrustedLogos,"00d7b6f5e7326330ed9bfc0acb7867b5b421b9ac7d",()=>h.getWebsiteBranding,"00f7d483c14d2c7e9c159cf890a4003ba1f2cb94f0",()=>e.getAdminCatalogKits,"00fbca73fd37a504aaf281ca211f9637bd43c7c36c",()=>e.getActiveMerchandiseForHome,"00ffd86bbc4f75fde4ec9240ae42732df7d3eaf2ac",()=>i.getActiveTestimonials,"400d225af772e42201bc815544ba0d8bbc85cc7233",()=>e.requestCatalogDownloadAction,"4021c9d9124c35ec786c63a35af361a9e6fcd93411",()=>j.trackVisitorPageView,"406decbe9d439b1e0a8bf31932655afc22c30c25ce",()=>g.reorderFaqsAction,"406e138ec195e9b3ac3deec868409a6bf828a64149",()=>f.requireRole,"40d945b8c505d394f977e98f19a5b2cef648a371f8",()=>e.getKitDetailBySlug,"40e0464127efae3c197ae9acf07e0979a9eb82adfa",()=>j.getAdminAnalyticsData,"40e765e5a967fae8fe6921c3b99af60938bdc2df8f",()=>i.reorderTestimonialsAction,"40f30831e43a3bcfa002c6e5d0b6e5c9808d830103",()=>f.activateAccountByToken,"40fa4ef02e81161b02b7b5dbc5507222e01909c76c",()=>e.getMerchandiseDetailBySlug,"600054a6296343a04576a6417ebd8264e35d17b197",()=>e.updateKitAction,"6005551f7c20b01d35bc1a7bf4dfeb32c0bce29b05",()=>f.resetPasswordAction,"60072ac7383c7547c0174fc39ac6fc54be721d6bf3",()=>i.addTestimonialAction,"60088e98ef49e110659c06a2407c2e85aead94d4d3",()=>e.updateMerchandiseAction,"60156cdb9ec2291c5fc4a8a7da8d36ad45d611ab95",()=>e.createMerchandiseAction,"601a93b8b718c236abfded4292211d717642bb902b",()=>h.updateApiIntegrationAction,"6021f612d85cd85970d1100fd3aa03029298005e0b",()=>f.loginAction,"60266b4abf1c799f2578ab7204dbef277de3c5fd93",()=>h.updateSeoMetadataAction,"6040677147a21ffefb43a040cc2780fd688af86d3c",()=>e.createKitAction,"60490690e87200a9bb97c83f76e7b33970cab6f3ca",()=>e.deleteMerchandiseAction,"60529d14b1631b083e2206ef20124c4fcb124099e5",()=>f.registerAction,"6056e3ec92b781f33a94acf04cf62e1b9081fefec6",()=>e.deleteKitAction,"60575e6dbe3e50b30466ac18747a4b3179dbc5ee21",()=>g.addFaqAction,"6057673a915ca32e2b0f09a0096c8042cd07f6e4d1",()=>i.deleteTestimonialAction,"605a7b6a5cddcf2c0f624cf01b838fd19ed712d10c",()=>h.updateTrustedLogoAction,"605c61df5ca4df47ae8375dd291b2c73d65fff67db",()=>h.addTrustedLogoAction,"6071181009414029e85ac430ba1ad08d4041835661",()=>j.deleteAdminLeadAction,"607553357be6ca0233d4dc6f49290fbdeae18998b3",()=>f.updateAdminProfileAction,"607c0c5fbada6514b1df59c65042c6465fc71b417d",()=>g.deleteFaqAction,"6080c640dde55cfd70c38cb255e6467366e47ffce6",()=>f.requestPasswordResetAction,"608544f6dc80f025224d9dc367eb088d9c179b1c53",()=>i.updateTestimonialAction,"60a3777f5751f1e8a28d8243991befe8869713949e",()=>e.uploadCatalogFileAction,"60c4b8cd34060849fdd123535889a62dfe20d9d2ac",()=>g.updateFaqAction,"60c6fe261bbd7b0d252644a54053b07721028de6c2",()=>h.deleteTrustedLogoAction,"60e51e11f74096ca80a4a0a0c95ccf9d8864426249",()=>h.updateWebsiteConfigAction,"60eb48960905b63fe10f80ef7995179f8a6542695b",()=>h.updateSmtpConfigAction]),c()}catch(a){c(a)}},!1)];

//# sourceMappingURL=_ba9aa6b4._.js.map