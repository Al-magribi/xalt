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
           WHERE id = $2`,[c+1,b[c]])}),l(),{ok:!0,message:"Urutan FAQ berhasil diperbarui."}}catch(a){return{ok:!1,message:a?.message||"Gagal mengubah urutan FAQ."}}}[f]=h.then?(await h)():h,(0,g.ensureServerEntryExports)([m,n,o,p,q,r]),(0,d.registerServerReference)(m,"00bb21a5c76c9801af4de51221a780b9f4ae2c7ff4",null),(0,d.registerServerReference)(n,"003a93540c0817b860ead337244aa52e52c7990c7d",null),(0,d.registerServerReference)(o,"602d736011c45e36a88a8b65c52873229de028adc6",null),(0,d.registerServerReference)(p,"60b39bc6c3e4ec77309cb8c762c000ae4fe982beb5",null),(0,d.registerServerReference)(q,"601dbb739f4bcb41aa3557602d65ef81fad02de5a8",null),(0,d.registerServerReference)(r,"409c52e7d04451e43f7c1eda0e73742ee67b04208f",null),a.s(["addFaqAction",()=>o,"deleteFaqAction",()=>q,"getActiveFaqs",()=>n,"getAdminFaqs",()=>m,"reorderFaqsAction",()=>r,"updateFaqAction",()=>p]),c()}catch(a){c(a)}},!1),14895,a=>a.a(async(b,c)=>{try{var d=a.i(37936),e=a.i(18558),f=a.i(41154),g=a.i(13095),h=b([f]);function i(a,b=!1){if(null==a)return b;let c=String(a).toLowerCase();return"1"===c||"true"===c||"on"===c}function j(a,b=0){let c=Number.parseInt(String(a??""),10);return Number.isInteger(c)?c:b}function k(a){return{id:Number(a.id),client_name:a.client_name||"",title:a.title||"",quote:a.quote||"",link_url:a.link_url||"",rating:Number(a.rating||5),sort_order:Number(a.sort_order||0),is_active:!!a.is_active,created_at:a.created_at,updated_at:a.updated_at}}function l(){(0,e.revalidatePath)("/"),(0,e.revalidatePath)("/admin/setting")}async function m(){return(await (0,f.query)(`SELECT
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
           WHERE id = $2`,[c+1,b[c]])}),l(),{ok:!0,message:"Urutan testimoni berhasil diperbarui."}}catch(a){return{ok:!1,message:a?.message||"Gagal mengubah urutan testimoni."}}}[f]=h.then?(await h)():h,(0,g.ensureServerEntryExports)([m,n,o,p,q,r]),(0,d.registerServerReference)(m,"00dc3f08e0e601c8d2f0d6ddaf54dd3f6954501834",null),(0,d.registerServerReference)(n,"00d6bbd3530a65d188b60a7e5917070f4808c82aff",null),(0,d.registerServerReference)(o,"603ff988bc53c0c677695e4ecc77f940423eda6d21",null),(0,d.registerServerReference)(p,"608a7686bfcdb45b3eaafae177e9f790af45e3b6e6",null),(0,d.registerServerReference)(q,"60f50f8c79171e1b68159147a9b3b070a904aa4c90",null),(0,d.registerServerReference)(r,"40560a961f5872f3b9bb9e0b0bb3cdeb45ccaf9277",null),a.s(["addTestimonialAction",()=>o,"deleteTestimonialAction",()=>q,"getActiveTestimonials",()=>n,"getAdminTestimonials",()=>m,"reorderTestimonialsAction",()=>r,"updateTestimonialAction",()=>p]),c()}catch(a){c(a)}},!1),93096,a=>a.a(async(b,c)=>{try{var d=a.i(64054),e=a.i(58259),f=a.i(80735),g=a.i(19347),h=a.i(14895),i=a.i(72654),j=b([d,e,f,g,h,i]);[d,e,f,g,h,i]=j.then?(await j)():j,a.s([]),c()}catch(a){c(a)}},!1),27075,a=>a.a(async(b,c)=>{try{var d=a.i(93096),e=a.i(64054),f=a.i(58259),g=a.i(80735),h=a.i(19347),i=a.i(14895),j=a.i(72654),k=b([d,e,f,g,h,i,j]);[d,e,f,g,h,i,j]=k.then?(await k)():k,a.s(["00008ec82141541eb72f20dcf0cb7a6f02c7c8f3c4",()=>e.getAdminCatalogKits,"00020996d49dd7f19edd89f0fba9f755ea8ee501b9",()=>f.requireUser,"00038ebcae220a1cf2d5bb35bdf286c6105d4fcf5f",()=>e.getAdminCatalogFiles,"003a93540c0817b860ead337244aa52e52c7990c7d",()=>g.getActiveFaqs,"0070a2334a1f6a5cd3ad80292c539d54a6b360de1b",()=>e.getActiveMerchandiseForHome,"007cc76a864b94e730376dbdc3a2343a8199c104b4",()=>h.getTrustedLogos,"00847eaf925b0d95ce1782318eeb58783fe28decbd",()=>f.getAdminProfileData,"0094c6bf12991f67d5bb71627709195b061b1cd2bb",()=>e.getAdminMerchandiseItems,"009f4703bf47188527e79c3a9a9c8d686e24cbf483",()=>f.logoutAction,"00ac397b347e5a9c76fdeff3b6738b975b60bc8338",()=>e.getActiveCatalogFile,"00bb21a5c76c9801af4de51221a780b9f4ae2c7ff4",()=>g.getAdminFaqs,"00c943acba9f165faf35840acc9ee3a2899488b717",()=>h.getWebsiteBranding,"00d2e55446be30b621afbd2f4138c09711d2f0b994",()=>f.getCurrentUser,"00d6bbd3530a65d188b60a7e5917070f4808c82aff",()=>i.getActiveTestimonials,"00dc3f08e0e601c8d2f0d6ddaf54dd3f6954501834",()=>i.getAdminTestimonials,"00e34a9284c5a85e7c367cafc4987932c8fdaa5b11",()=>h.getAdminSettingsData,"00fc229adec9d0564b4e6e7ed23e19c8555910621f",()=>e.getActiveKitsForHome,"403ec74b146ec2abb01fb7976fd310b5f679d1f3ca",()=>f.requireRole,"40489e3201046726a23d0fa441044f0dfa7aa30384",()=>e.getMerchandiseDetailBySlug,"40560a961f5872f3b9bb9e0b0bb3cdeb45ccaf9277",()=>i.reorderTestimonialsAction,"4057c1bdac6748c51997d215108bbfec366a7f820d",()=>e.requestCatalogDownloadAction,"409c52e7d04451e43f7c1eda0e73742ee67b04208f",()=>g.reorderFaqsAction,"40b01e0cc54b22005d7330b0333ac931c1f3405b26",()=>j.trackVisitorPageView,"40b80194e8f911061c2b09797ef762a9bfc39b7dd5",()=>f.activateAccountByToken,"40d47b19fe45fabee72ecee1c273d37eddd8466ec9",()=>e.getKitDetailBySlug,"40efd5f9482107823f85216c24192f9becadd29d4a",()=>j.getAdminAnalyticsData,"60156a4ae910f9ac1c81c0ff9b6585a2354ebcfa9d",()=>h.updateApiIntegrationAction,"601dbb739f4bcb41aa3557602d65ef81fad02de5a8",()=>g.deleteFaqAction,"602d736011c45e36a88a8b65c52873229de028adc6",()=>g.addFaqAction,"602db1f7a9d6e3ac56b56b784c362fd0462da7cacd",()=>e.updateMerchandiseAction,"603644ad1bb3bd2326382e863e37b7cb01734e0b94",()=>h.updateWebsiteConfigAction,"603ff988bc53c0c677695e4ecc77f940423eda6d21",()=>i.addTestimonialAction,"604fa66a3268c7999bf80360eae01aee061a230fca",()=>e.createKitAction,"605a21a8e0bb6ad8622a74a308d97010f426ced3af",()=>h.updateTrustedLogoAction,"60637f375568e5fd9c02148b2ac7acaa38310bedf3",()=>j.deleteAdminLeadAction,"6067e6ee17479d3fe5c73905f704df6cd38430203c",()=>f.resetPasswordAction,"606aadcda36b45e7e5f87371aa6f9c517a47f749e7",()=>e.deleteKitAction,"608315f24ad7c720c25b8f0bea7be586d030341dfa",()=>h.deleteTrustedLogoAction,"6084d84e109a5d98da0167ffe10d63fc8895a8d53d",()=>e.uploadCatalogFileAction,"608a7686bfcdb45b3eaafae177e9f790af45e3b6e6",()=>i.updateTestimonialAction,"608b0ef955aba622950b3d790efadaa7917cf4f739",()=>h.addTrustedLogoAction,"609456fa391cfafab47007b63178ed2052d3ae54b2",()=>h.updateSeoMetadataAction,"609a24a82ac01fca58264085cd7543907a76bc8d4b",()=>f.requestPasswordResetAction,"60ad2f3443dc6fe5fae46aa8df9d2a34432c172531",()=>f.updateAdminProfileAction,"60b39bc6c3e4ec77309cb8c762c000ae4fe982beb5",()=>g.updateFaqAction,"60d8be3a2274a7f0ea74538f860ba2ad029537f950",()=>e.updateKitAction,"60e04abf81435c72102b49d50a639fade84c2d339c",()=>f.loginAction,"60e76ecc27c599688522eb572759b4d8522b1e2cb6",()=>e.deleteMerchandiseAction,"60ec3b18bf02d68374aefdcd9bc92948e45a86b6c2",()=>f.registerAction,"60ee6ad98139c577fae6fe056eee80cd765d5da9a3",()=>h.updateSmtpConfigAction,"60effe9f8b831b0e91ecc8745c10371762beb21c69",()=>e.createMerchandiseAction,"60f50f8c79171e1b68159147a9b3b070a904aa4c90",()=>i.deleteTestimonialAction]),c()}catch(a){c(a)}},!1)];

//# sourceMappingURL=_ba9aa6b4._.js.map