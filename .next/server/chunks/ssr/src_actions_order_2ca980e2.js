module.exports=[16284,a=>a.a(async(b,c)=>{try{var d=a.i(37936),e=a.i(66680),f=a.i(18558),g=a.i(58259),h=a.i(41154),i=a.i(13095),j=b([g,h]);function k(a,b=0){let c=Number.parseInt(String(a||""),10);return Number.isInteger(c)?c:b}function l(a,b=0){let c=Number.parseFloat(String(a||""));return Number.isFinite(c)?c:b}function m(a,b=255){return String(a||"").trim().slice(0,b)}function n(a){return String(a||"").replace(/[^\d]/g,"")}function o(a){let b=String(a||"").trim();return b&&/^https?:\/\//i.test(b)?b.replace(/\/+$/,""):""}function p(a){let b=m(a,40).toLowerCase();return b?"idexpress"===b||"id_express"===b||"id-express"===b?"ide":b:""}function q(a,b){let c=String(a||"").toLowerCase();return["diproses","dikirim","selesai"].includes(c)?c:"paid"===b?"paid":"pending"===b?"pending_payment":"expired"===b?"expired":"cancelled"===b||"failed"===b?"cancelled":"draft"}function r(a,b){let c=String(a||"").toLowerCase(),d=String(b||"").toLowerCase();return"settlement"===c?"paid":"capture"===c?"challenge"===d?"pending":"paid":"pending"===c?"pending":"expire"===c?"expired":"cancel"===c?"cancelled":"deny"===c||"failure"===c?"failed":"pending"}async function s(){let a=await (0,h.query)(`SELECT public_key, secret_key, endpoint_url
     FROM settings.api_integrations
     WHERE provider = 'midtrans'
       AND is_active = TRUE
     LIMIT 1`);if(0===a.rowCount)return null;let b=a.rows[0],c=o(b.endpoint_url)||"https://app.sandbox.midtrans.com/snap/v1/transactions";return{serverKey:m(b.secret_key,300),endpointUrl:c}}async function t(){let a=await (0,h.query)(`SELECT public_key, endpoint_url
     FROM settings.api_integrations
     WHERE provider = 'raja_ongkir'
       AND is_active = TRUE
     LIMIT 1`);if(0===a.rowCount)return null;let b=a.rows[0];return{apiKey:m(b.public_key,300),baseUrl:o(b.endpoint_url)||"https://rajaongkir.komerce.id/api/v1"}}async function u({awbNumber:a,courierCode:b,lastPhoneNumber:c}){let d=m(a,120).toUpperCase(),e=p(b);if(!d||!e)return{ok:!1,message:"Data resi atau kurir belum lengkap."};let f=await t();if(!f?.apiKey)return{ok:!1,message:"Integrasi RajaOngkir belum aktif atau API key belum diatur."};let g=new URLSearchParams({awb:d,courier:e});c&&g.set("last_phone_number",String(c));try{let a=`${f.baseUrl.replace(/\/+$/,"")}/track/waybill`,b=await fetch(a,{method:"POST",headers:{key:f.apiKey,"content-type":"application/x-www-form-urlencoded"},body:g,cache:"no-store"}),c=await b.json().catch(()=>({})),d=c?.meta?.status,e=String(d??"").toLowerCase();if(!b.ok||!0!==d&&1!==d&&"success"!==e&&"true"!==e||!c?.data)return{ok:!1,message:c?.meta?.message||c?.message||"Data pelacakan tidak ditemukan untuk resi ini."};return{ok:!0,message:m(c?.meta?.message,200)||"Pelacakan berhasil dimuat.",data:function(a={}){let b=a?.summary&&"object"==typeof a.summary?a.summary:{},c=a?.delivery_status&&"object"==typeof a.delivery_status?a.delivery_status:{},d=Array.isArray(a?.manifest)?a.manifest:[];return{delivered:!!a?.delivered,summary:{courierCode:m(b.courier_code,40).toLowerCase(),courierName:m(b.courier_name,120),waybillNumber:m(b.waybill_number,120),serviceCode:m(b.service_code,80),waybillDate:m(b.waybill_date,80),shipperName:m(b.shipper_name,160),receiverName:m(b.receiver_name,160),origin:m(b.origin,200),destination:m(b.destination,200),status:m(b.status,120)},deliveryStatus:{status:m(c.status,120),podReceiver:m(c.pod_receiver,160),podDate:m(c.pod_date,80),podTime:m(c.pod_time,80)},manifest:d.map(a=>({manifestCode:m(a?.manifest_code,80),manifestDescription:m(a?.manifest_description,300),manifestDate:m(a?.manifest_date,80),manifestTime:m(a?.manifest_time,80),cityName:m(a?.city_name,120)})).filter(a=>a.manifestDescription||a.manifestDate||a.manifestTime)}}(c.data)}}catch{return{ok:!1,message:"Terjadi kesalahan saat melacak pengiriman."}}}function v(a){return`Basic ${Buffer.from(`${a}:`).toString("base64")}`}async function w(a,b){let c=b.endpointUrl.includes("app.midtrans.com"),d=`${c?"https://api.midtrans.com/v2":"https://api.sandbox.midtrans.com/v2"}/${encodeURIComponent(a)}/status`,e=await fetch(d,{method:"GET",headers:{authorization:v(b.serverKey),accept:"application/json"},cache:"no-store"}),f=await e.json().catch(()=>({}));return e.ok?{ok:!0,data:f}:{ok:!1,message:f?.status_message||"Gagal mengambil status transaksi Midtrans."}}async function x(a={}){let b=m(a?.customerEmail,160).toLowerCase(),c=n(a?.customerWhatsapp);if(!b&&!c)return{ok:!0,found:!1,data:null};if(b&&!b.includes("@"))return{ok:!1,message:"Email tidak valid."};if(c&&c.length<9)return{ok:!1,message:"Nomor WhatsApp tidak valid."};try{let a=[],d=[];b&&(d.push(b),a.push(`LOWER(customer_email) = $${d.length}`)),c&&(d.push(c),a.push(`customer_whatsapp = $${d.length}`));let e=await (0,h.query)(`SELECT
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
       WHERE ${a.join(" OR ")}
       ORDER BY created_at DESC
       LIMIT 1`,d);if(0===e.rowCount)return{ok:!0,found:!1,data:null};let f=e.rows[0];return{ok:!0,found:!0,data:{provinceId:k(f.shipping_province_id),provinceName:m(f.shipping_province_name,120),cityId:k(f.shipping_city_id),cityName:m(f.shipping_city_name,120),districtId:k(f.shipping_district_id),districtName:m(f.shipping_district_name,120),subdistrictId:k(f.shipping_subdistrict_id),subdistrictName:m(f.shipping_subdistrict_name,120),shippingAddress:m(f.shipping_address,500),shippingPostalCode:m(f.shipping_postal_code,20)}}}catch(a){return{ok:!1,message:a?.message||"Gagal mencari alamat pengiriman."}}}async function y(a={}){let b=k(a?.merchandiseItemId),c=k(a?.quantity),d=m(a?.customerName,120),e=m(a?.customerEmail,160).toLowerCase(),f=n(a?.customerWhatsapp),g=k(a?.provinceId),i=m(a?.provinceName,120),j=k(a?.cityId),p=m(a?.cityName,120),q=k(a?.districtId),r=m(a?.districtName,120),t=k(a?.subdistrictId),u=m(a?.subdistrictName,120),w=m(a?.shippingAddress,500),x=m(a?.shippingPostalCode,20),z=m(a?.courierCode,30).toLowerCase(),A=m(a?.courierName,80),B=m(a?.serviceCode,30).toUpperCase(),C=m(a?.serviceName,120),D=m(a?.shippingEtd,80),E=l(a?.shippingCost),F=o(a?.originUrl);if(b<=0)return{ok:!1,message:"Produk tidak valid."};if(c<=0)return{ok:!1,message:"Jumlah order tidak valid."};if(!d)return{ok:!1,message:"Nama wajib diisi."};if(!e||!e.includes("@"))return{ok:!1,message:"Email tidak valid."};if(f.length<9)return{ok:!1,message:"Nomor WhatsApp tidak valid."};if(g<=0||j<=0||q<=0)return{ok:!1,message:"Lokasi pengiriman belum lengkap."};if(!w)return{ok:!1,message:"Alamat pengiriman wajib diisi."};if(!z||!B||E<=0)return{ok:!1,message:"Silakan hitung dan pilih layanan ongkir terlebih dahulu."};if(!F)return{ok:!1,message:"Origin URL tidak valid untuk redirect pembayaran."};try{let a,n,o,[y,G]=await Promise.all([(0,h.query)(`SELECT id, title, price_amount, min_order
         FROM content.merchandise_items
         WHERE id = $1
           AND is_active = TRUE
         LIMIT 1`,[b]),s()]);if(0===y.rowCount)return{ok:!1,message:"Produk tidak ditemukan atau tidak aktif."};if(!G?.serverKey||!G?.endpointUrl)return{ok:!1,message:"Integrasi Midtrans belum aktif atau konfigurasi belum lengkap."};let H=y.rows[0],I=k(H.min_order,1);if(c<I)return{ok:!1,message:`Minimum order untuk produk ini adalah ${I} pcs.`};let J=l(H.price_amount,0),K=J*c,L=K+E,M=(a=new Date,n=`${a.getUTCFullYear()}${String(a.getUTCMonth()+1).padStart(2,"0")}${String(a.getUTCDate()).padStart(2,"0")}${String(a.getUTCHours()).padStart(2,"0")}${String(a.getUTCMinutes()).padStart(2,"0")}${String(a.getUTCSeconds()).padStart(2,"0")}`,o=Math.random().toString(36).slice(2,6).toUpperCase(),`ORD-${n}-${o}`),N=`${F}/order-status?order_code=${encodeURIComponent(M)}`,O={transaction_details:{order_id:M,gross_amount:Math.round(L)},customer_details:{first_name:d,email:e,phone:f},item_details:[{id:String(H.id),name:m(H.title,50),price:Math.round(J),quantity:c},{id:`shipping-${z}`,name:m(`Ongkir ${A||z.toUpperCase()} ${B}`,50),price:Math.round(E),quantity:1}],callbacks:{finish:N,pending:N,error:N},custom_field1:String(b),custom_field2:String(c),custom_field3:z},P=await fetch(G.endpointUrl,{method:"POST",headers:{authorization:v(G.serverKey),"content-type":"application/json"},body:JSON.stringify(O),cache:"no-store"}),Q=await P.json().catch(()=>({}));if(!P.ok||!Q?.redirect_url)return{ok:!1,message:Q?.error_messages?.[0]||"Gagal membuat transaksi Midtrans."};let R=await (0,h.query)(`INSERT INTO sales.merchandise_orders (
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
       RETURNING id`,[M,b,d,e,f,c,J,K,g,i,j,p,q,r,t>0?t:null,u||null,w,x||null,z,A||z.toUpperCase(),B,C||B,D||null,E,L,m(Q?.token,200)||null,m(JSON.stringify(Q||{}),3e3)]);return{ok:!0,message:"Checkout Midtrans berhasil dibuat.",data:{id:Number(R.rows[0].id),order_code:M,redirect_url:m(Q?.redirect_url,500)}}}catch(a){return{ok:!1,message:a?.message||"Gagal membuat pesanan."}}}async function z(a={}){let b=m(a?.orderCode,80).toUpperCase();if(!b)return{ok:!1,message:"Kode order wajib diisi."};try{let a=async()=>(0,h.query)(`SELECT
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
         LIMIT 1`,[b]),c=await a();if(0===c.rowCount)return{ok:!1,message:"Order tidak ditemukan."};let d=c.rows[0],e=m(d.payment_status,30).toLowerCase();if("pending"===e){let e=await s();if(e?.serverKey){let f=await w(b,e);if(f?.ok){let e=f.data||{},g=r(e.transaction_status,e.fraud_status),i=m(e.transaction_id,120)||m(e.payment_type,80),j=m(e.expiry_time,80)||m(e.settlement_time,80)||m(e.transaction_time,80)||null,k=JSON.stringify({payment_type:m(e.payment_type,50)||null,transaction_status:m(e.transaction_status,50)||null,fraud_status:m(e.fraud_status,30)||null});await (0,h.query)(`UPDATE sales.merchandise_orders
             SET payment_status = $2,
                 order_status = $3,
                 payment_reference = COALESCE($4, payment_reference),
                 payment_due_at = $5,
                 notes = CASE WHEN COALESCE(notes, '') = '' THEN $6 ELSE notes || E'
' || $6 END,
                 updated_at = NOW()
             WHERE order_code = $1`,[b,g,q(d.order_status,g),i||null,j,k]),c=await a()}}}let f=c.rows[0];return{ok:!0,data:{orderCode:m(f.order_code,80),customerName:m(f.customer_name,120),customerEmail:m(f.customer_email,160),quantity:k(f.quantity),grandTotalAmount:l(f.grand_total_amount),orderId:Number(f.id),orderStatus:m(f.order_status,30),orderPaymentStatus:m(f.payment_status,30),paymentReference:m(f.payment_reference,200),paymentDueAt:f.payment_due_at,createdAt:f.created_at,updatedAt:f.updated_at}}}catch(a){return{ok:!1,message:a?.message||"Gagal memuat status order."}}}async function A(a={}){let b=m(a?.orderCode,80).toUpperCase(),c=n(a?.customerWhatsapp);if(!b)return{ok:!1,message:"Kode order wajib diisi."};if(c.length<9)return{ok:!1,message:"Nomor WhatsApp tidak valid."};try{let a=async()=>(0,h.query)(`SELECT
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
         LIMIT 1`,[b,c]),d=await a();if(0===d.rowCount)return{ok:!1,message:"Order tidak ditemukan. Periksa kode order dan nomor WhatsApp."};let e=d.rows[0],f=m(e.payment_status,30).toLowerCase();if("pending"===f){let c=await s();if(c?.serverKey){let f=await w(b,c);if(f?.ok){let c=f.data||{},g=r(c.transaction_status,c.fraud_status),i=m(c.transaction_id,120)||m(c.payment_type,80),j=m(c.expiry_time,80)||m(c.settlement_time,80)||m(c.transaction_time,80)||null,k=JSON.stringify({payment_type:m(c.payment_type,50)||null,transaction_status:m(c.transaction_status,50)||null,fraud_status:m(c.fraud_status,30)||null});await (0,h.query)(`UPDATE sales.merchandise_orders
             SET payment_status = $2,
                 order_status = $3,
                 payment_reference = COALESCE($4, payment_reference),
                 payment_due_at = $5,
                 notes = CASE WHEN COALESCE(notes, '') = '' THEN $6 ELSE notes || E'
' || $6 END,
                 updated_at = NOW()
             WHERE order_code = $1`,[b,g,q(e.order_status,g),i||null,j,k]),d=await a()}}}let g=d.rows[0];return{ok:!0,data:{orderCode:m(g.order_code,80),customerName:m(g.customer_name,120),customerEmail:m(g.customer_email,160),customerWhatsapp:n(g.customer_whatsapp),merchandiseItemId:k(g.merchandise_item_id),merchandiseTitle:m(g.merchandise_title,200),merchandiseDetail:m(g.merchandise_detail,500),merchandiseImageUrl:m(g.merchandise_image_url,500),quantity:k(g.quantity),unitPrice:l(g.unit_price),subtotalAmount:l(g.subtotal_amount),grandTotalAmount:l(g.grand_total_amount),orderStatus:m(g.order_status,30),paymentStatus:m(g.payment_status,30),paymentReference:m(g.payment_reference,200),paymentDueAt:g.payment_due_at,shippingCourierName:m(g.shipping_courier_name,80),shippingServiceName:m(g.shipping_service_name,120),shippingEtd:m(g.shipping_etd,80),shippingTrackingNumber:m(g.shipping_tracking_number,120),createdAt:g.created_at,updatedAt:g.updated_at}}}catch(a){return{ok:!1,message:a?.message||"Gagal memuat status order."}}}async function B(a={}){let b=m(a?.order_id,80).toUpperCase(),c=m(a?.status_code,10),d=m(a?.gross_amount,30),f=m(a?.signature_key,200),g=m(a?.transaction_status,50),i=m(a?.fraud_status,30),j=m(a?.payment_type,50),k=m(a?.transaction_time,80),l=m(a?.settlement_time,80),n=m(a?.expiry_time,80);if(!b)return{ok:!1,message:"Order ID tidak valid."};let o=await s();if(!o?.serverKey)return{ok:!1,message:"Konfigurasi Midtrans tidak tersedia."};let p=e.default.createHash("sha512").update(`${b}${c}${d}${o.serverKey}`).digest("hex");if(!f||f!==p)return{ok:!1,message:"Signature Midtrans tidak valid."};let t=r(g,i),u=m(a?.transaction_id,120)||m(a?.payment_type,80),v=n||l||k||null;try{return await (0,h.withTransaction)(async a=>{let c=await a.query(`SELECT *
         FROM sales.merchandise_orders
         WHERE order_code = $1
         LIMIT 1
         FOR UPDATE`,[b]);if(0===c.rowCount)return{ok:!1,message:"Order tidak ditemukan."};let d=JSON.stringify({payment_type:j||null,transaction_status:g||null,fraud_status:i||null});return await a.query(`UPDATE sales.merchandise_orders
         SET payment_status = $2,
             order_status = $3,
             payment_reference = COALESCE($4, payment_reference),
             payment_due_at = $5,
             notes = CASE WHEN COALESCE(notes, '') = '' THEN $6 ELSE notes || E'
' || $6 END,
             updated_at = NOW()
         WHERE order_code = $1`,[b,t,q(c.rows[0].order_status,t),u||null,v,d]),{ok:!0,message:"Notifikasi diproses."}})}catch(a){return{ok:!1,message:a?.message||"Gagal memproses notifikasi Midtrans."}}}async function C(a={}){return y(a)}async function D(a={}){let b=m(a?.orderCode,80).toUpperCase(),c=n(a?.customerWhatsapp);if(!b)return{ok:!1,message:"Kode order wajib diisi."};if(c.length<9)return{ok:!1,message:"Nomor WhatsApp tidak valid."};try{let a=await (0,h.query)(`SELECT
         order_code,
         customer_whatsapp,
         shipping_courier_code,
         shipping_courier_name,
         shipping_tracking_number
       FROM sales.merchandise_orders
       WHERE order_code = $1
         AND customer_whatsapp = $2
       LIMIT 1`,[b,c]);if(0===a.rowCount)return{ok:!1,message:"Order tidak ditemukan. Periksa kode order dan nomor WhatsApp."};let d=a.rows[0],e=m(d.shipping_tracking_number,120),f=p(d.shipping_courier_code),g=n(d.customer_whatsapp).slice(-5);if(!e)return{ok:!1,message:"Nomor resi belum tersedia untuk pesanan ini."};if(!f)return{ok:!1,message:"Kurir pesanan belum tersedia."};let i=await u({awbNumber:e,courierCode:f,lastPhoneNumber:g});if(!i?.ok)return i;return{ok:!0,data:{orderCode:b,courierCode:f,courierName:m(d.shipping_courier_name,120),awbNumber:e,...i.data}}}catch(a){return{ok:!1,message:a?.message||"Gagal melacak pengiriman."}}}async function E(){return await (0,g.requireRole)("admin"),(await (0,h.query)(`SELECT
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
     ORDER BY o.created_at DESC`)).rows.map(a=>({id:Number(a.id),order_code:m(a.order_code,80),merchandise_item_id:k(a.merchandise_item_id),merchandise_title:m(a.merchandise_title,160),customer_name:m(a.customer_name,120),customer_email:m(a.customer_email,160),customer_whatsapp:n(a.customer_whatsapp),quantity:k(a.quantity),unit_price:l(a.unit_price),subtotal_amount:l(a.subtotal_amount),shipping_province_id:k(a.shipping_province_id),shipping_province_name:m(a.shipping_province_name,120),shipping_city_id:k(a.shipping_city_id),shipping_city_name:m(a.shipping_city_name,120),shipping_district_id:k(a.shipping_district_id),shipping_district_name:m(a.shipping_district_name,120),shipping_subdistrict_id:k(a.shipping_subdistrict_id),shipping_subdistrict_name:m(a.shipping_subdistrict_name,120),shipping_address:m(a.shipping_address,500),shipping_postal_code:m(a.shipping_postal_code,20),shipping_courier_code:m(a.shipping_courier_code,30),shipping_courier_name:m(a.shipping_courier_name,80),shipping_service_code:m(a.shipping_service_code,30),shipping_service_name:m(a.shipping_service_name,120),shipping_etd:m(a.shipping_etd,80),shipping_tracking_number:m(a.shipping_tracking_number,120),shipping_cost_amount:l(a.shipping_cost_amount),grand_total_amount:l(a.grand_total_amount),order_status:m(a.order_status,40),payment_status:m(a.payment_status,40),payment_reference:m(a.payment_reference,200),payment_due_at:a.payment_due_at,notes:m(a.notes,3e3),created_at:a.created_at,updated_at:a.updated_at}))}async function F(a={}){await (0,g.requireRole)("admin");let b=k(a?.orderId),c=m(a?.trackingNumber,120).toUpperCase();if(b<=0)return{ok:!1,message:"ID order tidak valid."};if(!c)return{ok:!1,message:"Nomor resi wajib diisi."};try{let a=await (0,h.query)(`UPDATE sales.merchandise_orders
       SET shipping_tracking_number = $2,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, order_code, shipping_tracking_number`,[b,c]);if(0===a.rowCount)return{ok:!1,message:"Order tidak ditemukan."};return(0,f.revalidatePath)("/admin/order"),{ok:!0,message:"Nomor resi berhasil disimpan.",data:{id:Number(a.rows[0].id),order_code:m(a.rows[0].order_code,80),shipping_tracking_number:m(a.rows[0].shipping_tracking_number,120)}}}catch(a){return{ok:!1,message:a?.message||"Gagal menyimpan nomor resi."}}}async function G(a={}){await (0,g.requireRole)("admin");let b=k(a?.orderId),c=m(a?.status,40).toLowerCase(),d=new Set(["diproses","dikirim","selesai"]);if(b<=0)return{ok:!1,message:"ID order tidak valid."};if(!d.has(c))return{ok:!1,message:"Status order tidak didukung."};try{let a=await (0,h.query)(`UPDATE sales.merchandise_orders
       SET order_status = $2,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, order_code`,[b,c]);if(0===a.rowCount)return{ok:!1,message:"Order tidak ditemukan."};return(0,f.revalidatePath)("/admin/order"),{ok:!0,message:"Status order berhasil diperbarui.",data:{id:Number(a.rows[0].id),order_code:m(a.rows[0].order_code,80),order_status:c}}}catch(a){return{ok:!1,message:a?.message||"Gagal memperbarui status order."}}}async function H(a={}){await (0,g.requireRole)("admin");let b=k(a?.orderId);if(b<=0)return{ok:!1,message:"ID order tidak valid."};try{let a=await (0,h.query)(`SELECT
         order_code,
         customer_whatsapp,
         shipping_courier_code,
         shipping_courier_name,
         shipping_tracking_number
       FROM sales.merchandise_orders
       WHERE id = $1
       LIMIT 1`,[b]);if(0===a.rowCount)return{ok:!1,message:"Order tidak ditemukan."};let c=a.rows[0],d=m(c.shipping_tracking_number,120),e=p(c.shipping_courier_code),f=n(c.customer_whatsapp).slice(-5);if(!d)return{ok:!1,message:"Nomor resi belum tersedia untuk order ini."};if(!e)return{ok:!1,message:"Kurir order belum tersedia."};let g=await u({awbNumber:d,courierCode:e,lastPhoneNumber:f});if(!g?.ok)return g;return{ok:!0,data:{orderId:b,orderCode:m(c.order_code,80),courierCode:e,courierName:m(c.shipping_courier_name,120),awbNumber:d,...g.data}}}catch(a){return{ok:!1,message:a?.message||"Gagal melacak pengiriman."}}}async function I(a={}){await (0,g.requireRole)("admin");let b=k(a?.orderId);if(b<=0)return{ok:!1,message:"ID order tidak valid."};try{let a=await (0,h.query)(`DELETE FROM sales.merchandise_orders
       WHERE id = $1
       RETURNING id, order_code`,[b]);if(0===a.rowCount)return{ok:!1,message:"Order tidak ditemukan."};return(0,f.revalidatePath)("/admin/order"),{ok:!0,message:"Order berhasil dihapus.",data:{id:Number(a.rows[0].id),order_code:m(a.rows[0].order_code,80)}}}catch(a){return{ok:!1,message:a?.message||"Gagal menghapus order."}}}[g,h]=j.then?(await j)():j,(0,i.ensureServerEntryExports)([x,y,z,A,B,C,D,E,F,G,H,I]),(0,d.registerServerReference)(x,"402722003891e071e9ee4d639edb9522018f464d46",null),(0,d.registerServerReference)(y,"409e6a76244ca7b62308b6919fc431a56f4c5735b7",null),(0,d.registerServerReference)(z,"40c47f3866b54e07a926a63ad7c8f97ac42354e2fc",null),(0,d.registerServerReference)(A,"4056477e47a477d9fe475c143bf3a0477d8a32be18",null),(0,d.registerServerReference)(B,"402864f8e3e33f7ca4434ace5b766172f8ea608851",null),(0,d.registerServerReference)(C,"40c4fb14d1bc248add28c75faab08b065fc0d9f79a",null),(0,d.registerServerReference)(D,"407408bf7a91fd6501408b9ab0b4b3806c0aabc85c",null),(0,d.registerServerReference)(E,"00cdf670fc47eaef12b0fa56fbecac8355bbadf140",null),(0,d.registerServerReference)(F,"404be0216f0a28093f85cf37b6406efd2cebdd3a03",null),(0,d.registerServerReference)(G,"4024d329993696d614b72f8d25d5c6b371b961d2c7",null),(0,d.registerServerReference)(H,"40ecbafe6b22cbfa0579b8a79e08cee512211e475a",null),(0,d.registerServerReference)(I,"407ddfdf646be63ac70e269d9832edb3586cb5a87e",null),a.s(["createMerchandiseOrderCheckoutAction",()=>y,"createMerchandiseOrderDraftAction",()=>C,"deleteAdminMerchandiseOrderAction",()=>I,"findCustomerLastShippingAddressAction",()=>x,"getAdminMerchandiseOrdersAction",()=>E,"getMerchandiseOrderPaymentStatusAction",()=>z,"getPublicOrderStatusByWhatsappAction",()=>A,"processMidtransNotificationAction",()=>B,"trackAdminMerchandiseOrderShipmentAction",()=>H,"trackPublicMerchandiseOrderShipmentAction",()=>D,"updateAdminMerchandiseOrderStatusAction",()=>G,"updateAdminMerchandiseOrderTrackingNumberAction",()=>F]),c()}catch(a){c(a)}},!1)];

//# sourceMappingURL=src_actions_order_2ca980e2.js.map