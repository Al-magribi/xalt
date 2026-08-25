module.exports=[98727,e=>e.a(async(t,r)=>{try{var a=e.i(45015),i=e.i(66680),s=e.i(65044),n=e.i(61456),o=e.i(78627),d=e.i(95975),u=t([n,o]);function p(e,t=0){let r=Number.parseInt(String(e||""),10);return Number.isInteger(r)?r:t}function m(e,t=0){let r=Number.parseFloat(String(e||""));return Number.isFinite(r)?r:t}function c(e,t=255){return String(e||"").trim().slice(0,t)}function _(e){return String(e||"").replace(/[^\d]/g,"")}function l(e){let t=String(e||"").trim();return t&&/^https?:\/\//i.test(t)?t.replace(/\/+$/,""):""}function g(e){let t=c(e,40).toLowerCase();return t?"idexpress"===t||"id_express"===t||"id-express"===t?"ide":t:""}function h(e,t){let r=String(e||"").toLowerCase();return["diproses","dikirim","selesai"].includes(r)?r:"paid"===t?"paid":"pending"===t?"pending_payment":"expired"===t?"expired":"cancelled"===t||"failed"===t?"cancelled":"draft"}function f(e,t){let r=String(e||"").toLowerCase(),a=String(t||"").toLowerCase();return"settlement"===r?"paid":"capture"===r?"challenge"===a?"pending":"paid":"pending"===r?"pending":"expire"===r?"expired":"cancel"===r?"cancelled":"deny"===r||"failure"===r?"failed":"pending"}async function y(){let e=await (0,o.query)(`SELECT public_key, secret_key, endpoint_url
     FROM settings.api_integrations
     WHERE provider = 'midtrans'
       AND is_active = TRUE
     LIMIT 1`);if(0===e.rowCount)return null;let t=e.rows[0],r=l(t.endpoint_url)||"https://app.sandbox.midtrans.com/snap/v1/transactions";return{serverKey:c(t.secret_key,300),endpointUrl:r}}async function k(){let e=await (0,o.query)(`SELECT public_key, endpoint_url
     FROM settings.api_integrations
     WHERE provider = 'raja_ongkir'
       AND is_active = TRUE
     LIMIT 1`);if(0===e.rowCount)return null;let t=e.rows[0];return{apiKey:c(t.public_key,300),baseUrl:l(t.endpoint_url)||"https://rajaongkir.komerce.id/api/v1"}}async function b({awbNumber:e,courierCode:t,lastPhoneNumber:r}){let a=c(e,120).toUpperCase(),i=g(t);if(!a||!i)return{ok:!1,message:"Data resi atau kurir belum lengkap."};let s=await k();if(!s?.apiKey)return{ok:!1,message:"Integrasi RajaOngkir belum aktif atau API key belum diatur."};let n=new URLSearchParams({awb:a,courier:i});r&&n.set("last_phone_number",String(r));try{let e=`${s.baseUrl.replace(/\/+$/,"")}/track/waybill`,t=await fetch(e,{method:"POST",headers:{key:s.apiKey,"content-type":"application/x-www-form-urlencoded"},body:n,cache:"no-store"}),r=await t.json().catch(()=>({})),a=r?.meta?.status,i=String(a??"").toLowerCase();if(!t.ok||!0!==a&&1!==a&&"success"!==i&&"true"!==i||!r?.data)return{ok:!1,message:r?.meta?.message||r?.message||"Data pelacakan tidak ditemukan untuk resi ini."};return{ok:!0,message:c(r?.meta?.message,200)||"Pelacakan berhasil dimuat.",data:function(e={}){let t=e?.summary&&"object"==typeof e.summary?e.summary:{},r=e?.delivery_status&&"object"==typeof e.delivery_status?e.delivery_status:{},a=Array.isArray(e?.manifest)?e.manifest:[];return{delivered:!!e?.delivered,summary:{courierCode:c(t.courier_code,40).toLowerCase(),courierName:c(t.courier_name,120),waybillNumber:c(t.waybill_number,120),serviceCode:c(t.service_code,80),waybillDate:c(t.waybill_date,80),shipperName:c(t.shipper_name,160),receiverName:c(t.receiver_name,160),origin:c(t.origin,200),destination:c(t.destination,200),status:c(t.status,120)},deliveryStatus:{status:c(r.status,120),podReceiver:c(r.pod_receiver,160),podDate:c(r.pod_date,80),podTime:c(r.pod_time,80)},manifest:a.map(e=>({manifestCode:c(e?.manifest_code,80),manifestDescription:c(e?.manifest_description,300),manifestDate:c(e?.manifest_date,80),manifestTime:c(e?.manifest_time,80),cityName:c(e?.city_name,120)})).filter(e=>e.manifestDescription||e.manifestDate||e.manifestTime)}}(r.data)}}catch{return{ok:!1,message:"Terjadi kesalahan saat melacak pengiriman."}}}function E(e){return`Basic ${Buffer.from(`${e}:`).toString("base64")}`}async function w(e,t){let r=t.endpointUrl.includes("app.midtrans.com"),a=`${r?"https://api.midtrans.com/v2":"https://api.sandbox.midtrans.com/v2"}/${encodeURIComponent(e)}/status`,i=await fetch(a,{method:"GET",headers:{authorization:E(t.serverKey),accept:"application/json"},cache:"no-store"}),s=await i.json().catch(()=>({}));return i.ok?{ok:!0,data:s}:{ok:!1,message:s?.status_message||"Gagal mengambil status transaksi Midtrans."}}async function S(e={}){let t=c(e?.customerEmail,160).toLowerCase(),r=_(e?.customerWhatsapp);if(!t&&!r)return{ok:!0,found:!1,data:null};if(t&&!t.includes("@"))return{ok:!1,message:"Email tidak valid."};if(r&&r.length<9)return{ok:!1,message:"Nomor WhatsApp tidak valid."};try{let e=[],a=[];t&&(a.push(t),e.push(`LOWER(customer_email) = $${a.length}`)),r&&(a.push(r),e.push(`customer_whatsapp = $${a.length}`));let i=await (0,o.query)(`SELECT
         shipping_province_id,
         shipping_province_name,
         shipping_city_id,
         shipping_city_name,
         shipping_district_id,
         shipping_district_name,
         shipping_subdistrict_id,
         shipping_subdistrict_name,
         shipping_address,
         shipping_postal_code
       FROM sales.merchandise_orders
       WHERE ${e.join(" OR ")}
       ORDER BY created_at DESC
       LIMIT 1`,a);if(0===i.rowCount)return{ok:!0,found:!1,data:null};let s=i.rows[0];return{ok:!0,found:!0,data:{provinceId:p(s.shipping_province_id),provinceName:c(s.shipping_province_name,120),cityId:p(s.shipping_city_id),cityName:c(s.shipping_city_name,120),districtId:p(s.shipping_district_id),districtName:c(s.shipping_district_name,120),subdistrictId:p(s.shipping_subdistrict_id),subdistrictName:c(s.shipping_subdistrict_name,120),shippingAddress:c(s.shipping_address,500),shippingPostalCode:c(s.shipping_postal_code,20)}}}catch(e){return{ok:!1,message:e?.message||"Gagal mencari alamat pengiriman."}}}async function $(e={}){let t=p(e?.merchandiseItemId),r=p(e?.quantity),a=c(e?.customerName,120),i=c(e?.customerEmail,160).toLowerCase(),s=_(e?.customerWhatsapp),n=p(e?.provinceId),d=c(e?.provinceName,120),u=p(e?.cityId),g=c(e?.cityName,120),h=p(e?.districtId),f=c(e?.districtName,120),k=p(e?.subdistrictId),b=c(e?.subdistrictName,120),w=c(e?.shippingAddress,500),S=c(e?.shippingPostalCode,20),v=c(e?.courierCode,30).toLowerCase(),C=c(e?.courierName,80),N=c(e?.serviceCode,30).toUpperCase(),R=c(e?.serviceName,120),T=c(e?.shippingEtd,80),I=m(e?.shippingCost),O=l(e?.originUrl);if(t<=0)return{ok:!1,message:"Produk tidak valid."};if(r<=0)return{ok:!1,message:"Jumlah order tidak valid."};if(!a)return{ok:!1,message:"Nama wajib diisi."};if(!i||!i.includes("@"))return{ok:!1,message:"Email tidak valid."};if(s.length<9)return{ok:!1,message:"Nomor WhatsApp tidak valid."};if(n<=0||u<=0||h<=0)return{ok:!1,message:"Lokasi pengiriman belum lengkap."};if(!w)return{ok:!1,message:"Alamat pengiriman wajib diisi."};if(!v||!N||I<=0)return{ok:!1,message:"Silakan hitung dan pilih layanan ongkir terlebih dahulu."};if(!O)return{ok:!1,message:"Origin URL tidak valid untuk redirect pembayaran."};try{let e,_,l,[$,A]=await Promise.all([(0,o.query)(`SELECT id, title, price_amount, min_order
         FROM content.merchandise_items
         WHERE id = $1
           AND is_active = TRUE
         LIMIT 1`,[t]),y()]);if(0===$.rowCount)return{ok:!1,message:"Produk tidak ditemukan atau tidak aktif."};if(!A?.serverKey||!A?.endpointUrl)return{ok:!1,message:"Integrasi Midtrans belum aktif atau konfigurasi belum lengkap."};let L=$.rows[0],U=p(L.min_order,1);if(r<U)return{ok:!1,message:`Minimum order untuk produk ini adalah ${U} pcs.`};let D=m(L.price_amount,0),M=D*r,W=M+I,q=(e=new Date,_=`${e.getUTCFullYear()}${String(e.getUTCMonth()+1).padStart(2,"0")}${String(e.getUTCDate()).padStart(2,"0")}${String(e.getUTCHours()).padStart(2,"0")}${String(e.getUTCMinutes()).padStart(2,"0")}${String(e.getUTCSeconds()).padStart(2,"0")}`,l=Math.random().toString(36).slice(2,6).toUpperCase(),`ORD-${_}-${l}`),P=`${O}/order-status?order_code=${encodeURIComponent(q)}`,H={transaction_details:{order_id:q,gross_amount:Math.round(W)},customer_details:{first_name:a,email:i,phone:s},item_details:[{id:String(L.id),name:c(L.title,50),price:Math.round(D),quantity:r},{id:`shipping-${v}`,name:c(`Ongkir ${C||v.toUpperCase()} ${N}`,50),price:Math.round(I),quantity:1}],callbacks:{finish:P,pending:P,error:P},custom_field1:String(t),custom_field2:String(r),custom_field3:v},j=await fetch(A.endpointUrl,{method:"POST",headers:{authorization:E(A.serverKey),"content-type":"application/json"},body:JSON.stringify(H),cache:"no-store"}),F=await j.json().catch(()=>({}));if(!j.ok||!F?.redirect_url)return{ok:!1,message:F?.error_messages?.[0]||"Gagal membuat transaksi Midtrans."};let G=await (0,o.query)(`INSERT INTO sales.merchandise_orders (
         order_code,
         merchandise_item_id,
         customer_name,
         customer_email,
         customer_whatsapp,
         quantity,
         unit_price,
         subtotal_amount,
         shipping_province_id,
         shipping_province_name,
         shipping_city_id,
         shipping_city_name,
         shipping_district_id,
         shipping_district_name,
         shipping_subdistrict_id,
         shipping_subdistrict_name,
         shipping_address,
         shipping_postal_code,
         shipping_courier_code,
         shipping_courier_name,
         shipping_service_code,
         shipping_service_name,
         shipping_etd,
         shipping_cost_amount,
         grand_total_amount,
         order_status,
         payment_status,
         payment_reference,
         notes,
         updated_at
       )
       VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
         $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
         $21, $22, $23, $24, $25, 'pending_payment', 'pending', $26, $27, NOW()
       )
       RETURNING id`,[q,t,a,i,s,r,D,M,n,d,u,g,h,f,k>0?k:null,b||null,w,S||null,v,C||v.toUpperCase(),N,R||N,T||null,I,W,c(F?.token,200)||null,c(JSON.stringify(F||{}),3e3)]);return{ok:!0,message:"Checkout Midtrans berhasil dibuat.",data:{id:Number(G.rows[0].id),order_code:q,redirect_url:c(F?.redirect_url,500)}}}catch(e){return{ok:!1,message:e?.message||"Gagal membuat pesanan."}}}async function v(e={}){let t=c(e?.orderCode,80).toUpperCase();if(!t)return{ok:!1,message:"Kode order wajib diisi."};try{let e=async()=>(0,o.query)(`SELECT
           id,
           order_code,
           customer_name,
           customer_email,
           quantity,
           grand_total_amount,
           order_status,
           payment_status,
           payment_reference,
           payment_due_at,
           created_at,
           updated_at
         FROM sales.merchandise_orders
         WHERE order_code = $1
         LIMIT 1`,[t]),r=await e();if(0===r.rowCount)return{ok:!1,message:"Order tidak ditemukan."};let a=r.rows[0],i=c(a.payment_status,30).toLowerCase();if("pending"===i){let i=await y();if(i?.serverKey){let s=await w(t,i);if(s?.ok){let i=s.data||{},n=f(i.transaction_status,i.fraud_status),d=c(i.transaction_id,120)||c(i.payment_type,80),u=c(i.expiry_time,80)||c(i.settlement_time,80)||c(i.transaction_time,80)||null,p=JSON.stringify({payment_type:c(i.payment_type,50)||null,transaction_status:c(i.transaction_status,50)||null,fraud_status:c(i.fraud_status,30)||null});await (0,o.query)(`UPDATE sales.merchandise_orders
             SET payment_status = $2,
                 order_status = $3,
                 payment_reference = COALESCE($4, payment_reference),
                 payment_due_at = $5,
                 notes = CASE WHEN COALESCE(notes, '') = '' THEN $6 ELSE notes || E'
' || $6 END,
                 updated_at = NOW()
             WHERE order_code = $1`,[t,n,h(a.order_status,n),d||null,u,p]),r=await e()}}}let s=r.rows[0];return{ok:!0,data:{orderCode:c(s.order_code,80),customerName:c(s.customer_name,120),customerEmail:c(s.customer_email,160),quantity:p(s.quantity),grandTotalAmount:m(s.grand_total_amount),orderId:Number(s.id),orderStatus:c(s.order_status,30),orderPaymentStatus:c(s.payment_status,30),paymentReference:c(s.payment_reference,200),paymentDueAt:s.payment_due_at,createdAt:s.created_at,updatedAt:s.updated_at}}}catch(e){return{ok:!1,message:e?.message||"Gagal memuat status order."}}}async function C(e={}){let t=c(e?.orderCode,80).toUpperCase(),r=_(e?.customerWhatsapp);if(!t)return{ok:!1,message:"Kode order wajib diisi."};if(r.length<9)return{ok:!1,message:"Nomor WhatsApp tidak valid."};try{let e=async()=>(0,o.query)(`SELECT
           o.id,
           o.order_code,
           o.merchandise_item_id,
           m.title AS merchandise_title,
           m.detail AS merchandise_detail,
           m.image_url AS merchandise_image_url,
           o.customer_name,
           o.customer_email,
           o.customer_whatsapp,
           o.quantity,
           o.unit_price,
           o.subtotal_amount,
           o.grand_total_amount,
           o.order_status,
           o.payment_status,
           o.payment_reference,
           o.payment_due_at,
           o.shipping_courier_name,
           o.shipping_service_name,
           o.shipping_etd,
           o.shipping_tracking_number,
           o.created_at,
           o.updated_at
         FROM sales.merchandise_orders o
         LEFT JOIN content.merchandise_items m ON m.id = o.merchandise_item_id
         WHERE o.order_code = $1
           AND o.customer_whatsapp = $2
         LIMIT 1`,[t,r]),a=await e();if(0===a.rowCount)return{ok:!1,message:"Order tidak ditemukan. Periksa kode order dan nomor WhatsApp."};let i=a.rows[0],s=c(i.payment_status,30).toLowerCase();if("pending"===s){let r=await y();if(r?.serverKey){let s=await w(t,r);if(s?.ok){let r=s.data||{},n=f(r.transaction_status,r.fraud_status),d=c(r.transaction_id,120)||c(r.payment_type,80),u=c(r.expiry_time,80)||c(r.settlement_time,80)||c(r.transaction_time,80)||null,p=JSON.stringify({payment_type:c(r.payment_type,50)||null,transaction_status:c(r.transaction_status,50)||null,fraud_status:c(r.fraud_status,30)||null});await (0,o.query)(`UPDATE sales.merchandise_orders
             SET payment_status = $2,
                 order_status = $3,
                 payment_reference = COALESCE($4, payment_reference),
                 payment_due_at = $5,
                 notes = CASE WHEN COALESCE(notes, '') = '' THEN $6 ELSE notes || E'
' || $6 END,
                 updated_at = NOW()
             WHERE order_code = $1`,[t,n,h(i.order_status,n),d||null,u,p]),a=await e()}}}let n=a.rows[0];return{ok:!0,data:{orderCode:c(n.order_code,80),customerName:c(n.customer_name,120),customerEmail:c(n.customer_email,160),customerWhatsapp:_(n.customer_whatsapp),merchandiseItemId:p(n.merchandise_item_id),merchandiseTitle:c(n.merchandise_title,200),merchandiseDetail:c(n.merchandise_detail,500),merchandiseImageUrl:c(n.merchandise_image_url,500),quantity:p(n.quantity),unitPrice:m(n.unit_price),subtotalAmount:m(n.subtotal_amount),grandTotalAmount:m(n.grand_total_amount),orderStatus:c(n.order_status,30),paymentStatus:c(n.payment_status,30),paymentReference:c(n.payment_reference,200),paymentDueAt:n.payment_due_at,shippingCourierName:c(n.shipping_courier_name,80),shippingServiceName:c(n.shipping_service_name,120),shippingEtd:c(n.shipping_etd,80),shippingTrackingNumber:c(n.shipping_tracking_number,120),createdAt:n.created_at,updatedAt:n.updated_at}}}catch(e){return{ok:!1,message:e?.message||"Gagal memuat status order."}}}async function N(e={}){let t=c(e?.order_id,80).toUpperCase(),r=c(e?.status_code,10),a=c(e?.gross_amount,30),s=c(e?.signature_key,200),n=c(e?.transaction_status,50),d=c(e?.fraud_status,30),u=c(e?.payment_type,50),p=c(e?.transaction_time,80),m=c(e?.settlement_time,80),_=c(e?.expiry_time,80);if(!t)return{ok:!1,message:"Order ID tidak valid."};let l=await y();if(!l?.serverKey)return{ok:!1,message:"Konfigurasi Midtrans tidak tersedia."};let g=i.default.createHash("sha512").update(`${t}${r}${a}${l.serverKey}`).digest("hex");if(!s||s!==g)return{ok:!1,message:"Signature Midtrans tidak valid."};let k=f(n,d),b=c(e?.transaction_id,120)||c(e?.payment_type,80),E=_||m||p||null;try{return await (0,o.withTransaction)(async e=>{let r=await e.query(`SELECT *
         FROM sales.merchandise_orders
         WHERE order_code = $1
         LIMIT 1
         FOR UPDATE`,[t]);if(0===r.rowCount)return{ok:!1,message:"Order tidak ditemukan."};let a=JSON.stringify({payment_type:u||null,transaction_status:n||null,fraud_status:d||null});return await e.query(`UPDATE sales.merchandise_orders
         SET payment_status = $2,
             order_status = $3,
             payment_reference = COALESCE($4, payment_reference),
             payment_due_at = $5,
             notes = CASE WHEN COALESCE(notes, '') = '' THEN $6 ELSE notes || E'
' || $6 END,
             updated_at = NOW()
         WHERE order_code = $1`,[t,k,h(r.rows[0].order_status,k),b||null,E,a]),{ok:!0,message:"Notifikasi diproses."}})}catch(e){return{ok:!1,message:e?.message||"Gagal memproses notifikasi Midtrans."}}}async function R(e={}){return $(e)}async function T(e={}){let t=c(e?.orderCode,80).toUpperCase(),r=_(e?.customerWhatsapp);if(!t)return{ok:!1,message:"Kode order wajib diisi."};if(r.length<9)return{ok:!1,message:"Nomor WhatsApp tidak valid."};try{let e=await (0,o.query)(`SELECT
         order_code,
         customer_whatsapp,
         shipping_courier_code,
         shipping_courier_name,
         shipping_tracking_number
       FROM sales.merchandise_orders
       WHERE order_code = $1
         AND customer_whatsapp = $2
       LIMIT 1`,[t,r]);if(0===e.rowCount)return{ok:!1,message:"Order tidak ditemukan. Periksa kode order dan nomor WhatsApp."};let a=e.rows[0],i=c(a.shipping_tracking_number,120),s=g(a.shipping_courier_code),n=_(a.customer_whatsapp).slice(-5);if(!i)return{ok:!1,message:"Nomor resi belum tersedia untuk pesanan ini."};if(!s)return{ok:!1,message:"Kurir pesanan belum tersedia."};let d=await b({awbNumber:i,courierCode:s,lastPhoneNumber:n});if(!d?.ok)return d;return{ok:!0,data:{orderCode:t,courierCode:s,courierName:c(a.shipping_courier_name,120),awbNumber:i,...d.data}}}catch(e){return{ok:!1,message:e?.message||"Gagal melacak pengiriman."}}}async function I(){return await (0,n.requireRole)("admin"),(await (0,o.query)(`SELECT
       o.id,
       o.order_code,
       o.merchandise_item_id,
       m.title AS merchandise_title,
       o.customer_name,
       o.customer_email,
       o.customer_whatsapp,
       o.quantity,
       o.unit_price,
       o.subtotal_amount,
       o.shipping_province_id,
       o.shipping_province_name,
       o.shipping_city_id,
       o.shipping_city_name,
       o.shipping_district_id,
       o.shipping_district_name,
       o.shipping_subdistrict_id,
       o.shipping_subdistrict_name,
       o.shipping_address,
       o.shipping_postal_code,
       o.shipping_courier_code,
       o.shipping_courier_name,
       o.shipping_service_code,
       o.shipping_service_name,
       o.shipping_etd,
       o.shipping_tracking_number,
       o.shipping_cost_amount,
       o.grand_total_amount,
       o.order_status,
       o.payment_status,
       o.payment_reference,
       o.payment_due_at,
       o.notes,
       o.created_at,
       o.updated_at
     FROM sales.merchandise_orders o
     LEFT JOIN content.merchandise_items m ON m.id = o.merchandise_item_id
     ORDER BY o.created_at DESC`)).rows.map(e=>({id:Number(e.id),order_code:c(e.order_code,80),merchandise_item_id:p(e.merchandise_item_id),merchandise_title:c(e.merchandise_title,160),customer_name:c(e.customer_name,120),customer_email:c(e.customer_email,160),customer_whatsapp:_(e.customer_whatsapp),quantity:p(e.quantity),unit_price:m(e.unit_price),subtotal_amount:m(e.subtotal_amount),shipping_province_id:p(e.shipping_province_id),shipping_province_name:c(e.shipping_province_name,120),shipping_city_id:p(e.shipping_city_id),shipping_city_name:c(e.shipping_city_name,120),shipping_district_id:p(e.shipping_district_id),shipping_district_name:c(e.shipping_district_name,120),shipping_subdistrict_id:p(e.shipping_subdistrict_id),shipping_subdistrict_name:c(e.shipping_subdistrict_name,120),shipping_address:c(e.shipping_address,500),shipping_postal_code:c(e.shipping_postal_code,20),shipping_courier_code:c(e.shipping_courier_code,30),shipping_courier_name:c(e.shipping_courier_name,80),shipping_service_code:c(e.shipping_service_code,30),shipping_service_name:c(e.shipping_service_name,120),shipping_etd:c(e.shipping_etd,80),shipping_tracking_number:c(e.shipping_tracking_number,120),shipping_cost_amount:m(e.shipping_cost_amount),grand_total_amount:m(e.grand_total_amount),order_status:c(e.order_status,40),payment_status:c(e.payment_status,40),payment_reference:c(e.payment_reference,200),payment_due_at:e.payment_due_at,notes:c(e.notes,3e3),created_at:e.created_at,updated_at:e.updated_at}))}async function O(e={}){await (0,n.requireRole)("admin");let t=p(e?.orderId),r=c(e?.trackingNumber,120).toUpperCase();if(t<=0)return{ok:!1,message:"ID order tidak valid."};if(!r)return{ok:!1,message:"Nomor resi wajib diisi."};try{let e=await (0,o.query)(`UPDATE sales.merchandise_orders
       SET shipping_tracking_number = $2,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, order_code, shipping_tracking_number`,[t,r]);if(0===e.rowCount)return{ok:!1,message:"Order tidak ditemukan."};return(0,s.revalidatePath)("/admin/order"),{ok:!0,message:"Nomor resi berhasil disimpan.",data:{id:Number(e.rows[0].id),order_code:c(e.rows[0].order_code,80),shipping_tracking_number:c(e.rows[0].shipping_tracking_number,120)}}}catch(e){return{ok:!1,message:e?.message||"Gagal menyimpan nomor resi."}}}async function A(e={}){await (0,n.requireRole)("admin");let t=p(e?.orderId),r=c(e?.status,40).toLowerCase(),a=new Set(["diproses","dikirim","selesai"]);if(t<=0)return{ok:!1,message:"ID order tidak valid."};if(!a.has(r))return{ok:!1,message:"Status order tidak didukung."};try{let e=await (0,o.query)(`UPDATE sales.merchandise_orders
       SET order_status = $2,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, order_code`,[t,r]);if(0===e.rowCount)return{ok:!1,message:"Order tidak ditemukan."};return(0,s.revalidatePath)("/admin/order"),{ok:!0,message:"Status order berhasil diperbarui.",data:{id:Number(e.rows[0].id),order_code:c(e.rows[0].order_code,80),order_status:r}}}catch(e){return{ok:!1,message:e?.message||"Gagal memperbarui status order."}}}async function L(e={}){await (0,n.requireRole)("admin");let t=p(e?.orderId);if(t<=0)return{ok:!1,message:"ID order tidak valid."};try{let e=await (0,o.query)(`SELECT
         order_code,
         customer_whatsapp,
         shipping_courier_code,
         shipping_courier_name,
         shipping_tracking_number
       FROM sales.merchandise_orders
       WHERE id = $1
       LIMIT 1`,[t]);if(0===e.rowCount)return{ok:!1,message:"Order tidak ditemukan."};let r=e.rows[0],a=c(r.shipping_tracking_number,120),i=g(r.shipping_courier_code),s=_(r.customer_whatsapp).slice(-5);if(!a)return{ok:!1,message:"Nomor resi belum tersedia untuk order ini."};if(!i)return{ok:!1,message:"Kurir order belum tersedia."};let n=await b({awbNumber:a,courierCode:i,lastPhoneNumber:s});if(!n?.ok)return n;return{ok:!0,data:{orderId:t,orderCode:c(r.order_code,80),courierCode:i,courierName:c(r.shipping_courier_name,120),awbNumber:a,...n.data}}}catch(e){return{ok:!1,message:e?.message||"Gagal melacak pengiriman."}}}async function U(e={}){await (0,n.requireRole)("admin");let t=p(e?.orderId);if(t<=0)return{ok:!1,message:"ID order tidak valid."};try{let e=await (0,o.query)(`DELETE FROM sales.merchandise_orders
       WHERE id = $1
       RETURNING id, order_code`,[t]);if(0===e.rowCount)return{ok:!1,message:"Order tidak ditemukan."};return(0,s.revalidatePath)("/admin/order"),{ok:!0,message:"Order berhasil dihapus.",data:{id:Number(e.rows[0].id),order_code:c(e.rows[0].order_code,80)}}}catch(e){return{ok:!1,message:e?.message||"Gagal menghapus order."}}}[n,o]=u.then?(await u)():u,(0,d.ensureServerEntryExports)([S,$,v,C,N,R,T,I,O,A,L,U]),(0,a.registerServerReference)(S,"402722003891e071e9ee4d639edb9522018f464d46",null),(0,a.registerServerReference)($,"409e6a76244ca7b62308b6919fc431a56f4c5735b7",null),(0,a.registerServerReference)(v,"40c47f3866b54e07a926a63ad7c8f97ac42354e2fc",null),(0,a.registerServerReference)(C,"4056477e47a477d9fe475c143bf3a0477d8a32be18",null),(0,a.registerServerReference)(N,"402864f8e3e33f7ca4434ace5b766172f8ea608851",null),(0,a.registerServerReference)(R,"40c4fb14d1bc248add28c75faab08b065fc0d9f79a",null),(0,a.registerServerReference)(T,"407408bf7a91fd6501408b9ab0b4b3806c0aabc85c",null),(0,a.registerServerReference)(I,"00cdf670fc47eaef12b0fa56fbecac8355bbadf140",null),(0,a.registerServerReference)(O,"404be0216f0a28093f85cf37b6406efd2cebdd3a03",null),(0,a.registerServerReference)(A,"4024d329993696d614b72f8d25d5c6b371b961d2c7",null),(0,a.registerServerReference)(L,"40ecbafe6b22cbfa0579b8a79e08cee512211e475a",null),(0,a.registerServerReference)(U,"407ddfdf646be63ac70e269d9832edb3586cb5a87e",null),e.s(["getMerchandiseOrderPaymentStatusAction",()=>v,"processMidtransNotificationAction",()=>N]),r()}catch(e){r(e)}},!1)];

//# sourceMappingURL=src_actions_order_10cd5dc2.js.map