"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/actions/auth";
import { query, withTransaction } from "@/config/db";

function toInt(value, fallback = 0) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isInteger(parsed) ? parsed : fallback;
}

function toNumber(value, fallback = 0) {
  const parsed = Number.parseFloat(String(value || ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sanitizeText(value, maxLength = 255) {
  return String(value || "")
    .trim()
    .slice(0, maxLength);
}

function sanitizePhone(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

function sanitizeUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  if (!/^https?:\/\//i.test(url)) return "";
  return url.replace(/\/+$/, "");
}

function normalizeCourierCode(value) {
  const normalized = sanitizeText(value, 40).toLowerCase();
  if (!normalized) return "";
  if (normalized === "idexpress" || normalized === "id_express" || normalized === "id-express") {
    return "ide";
  }
  return normalized;
}

function normalizeRajaOngkirTrackingData(payload = {}) {
  const summary = payload?.summary && typeof payload.summary === "object" ? payload.summary : {};
  const deliveryStatus =
    payload?.delivery_status && typeof payload.delivery_status === "object" ? payload.delivery_status : {};
  const manifestRows = Array.isArray(payload?.manifest) ? payload.manifest : [];

  return {
    delivered: Boolean(payload?.delivered),
    summary: {
      courierCode: sanitizeText(summary.courier_code, 40).toLowerCase(),
      courierName: sanitizeText(summary.courier_name, 120),
      waybillNumber: sanitizeText(summary.waybill_number, 120),
      serviceCode: sanitizeText(summary.service_code, 80),
      waybillDate: sanitizeText(summary.waybill_date, 80),
      shipperName: sanitizeText(summary.shipper_name, 160),
      receiverName: sanitizeText(summary.receiver_name, 160),
      origin: sanitizeText(summary.origin, 200),
      destination: sanitizeText(summary.destination, 200),
      status: sanitizeText(summary.status, 120),
    },
    deliveryStatus: {
      status: sanitizeText(deliveryStatus.status, 120),
      podReceiver: sanitizeText(deliveryStatus.pod_receiver, 160),
      podDate: sanitizeText(deliveryStatus.pod_date, 80),
      podTime: sanitizeText(deliveryStatus.pod_time, 80),
    },
    manifest: manifestRows
      .map((row) => ({
        manifestCode: sanitizeText(row?.manifest_code, 80),
        manifestDescription: sanitizeText(row?.manifest_description, 300),
        manifestDate: sanitizeText(row?.manifest_date, 80),
        manifestTime: sanitizeText(row?.manifest_time, 80),
        cityName: sanitizeText(row?.city_name, 120),
      }))
      .filter((row) => row.manifestDescription || row.manifestDate || row.manifestTime),
  };
}

function buildOrderCode() {
  const now = new Date();
  const stamp = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(
    now.getUTCDate(),
  ).padStart(2, "0")}${String(now.getUTCHours()).padStart(2, "0")}${String(
    now.getUTCMinutes(),
  ).padStart(2, "0")}${String(now.getUTCSeconds()).padStart(2, "0")}`;
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${stamp}-${random}`;
}

function toOrderStatus(paymentStatus) {
  if (paymentStatus === "paid") return "paid";
  if (paymentStatus === "pending") return "pending_payment";
  if (paymentStatus === "expired") return "expired";
  if (paymentStatus === "cancelled" || paymentStatus === "failed") return "cancelled";
  return "draft";
}

function resolveOrderStatusAfterPaymentSync(currentOrderStatus, paymentStatus) {
  const current = String(currentOrderStatus || "").toLowerCase();
  if (["diproses", "dikirim", "selesai"].includes(current)) {
    return current;
  }
  return toOrderStatus(paymentStatus);
}

function mapMidtransTransactionStatus(transactionStatus, fraudStatus) {
  const tx = String(transactionStatus || "").toLowerCase();
  const fraud = String(fraudStatus || "").toLowerCase();

  if (tx === "settlement") return "paid";
  if (tx === "capture") return fraud === "challenge" ? "pending" : "paid";
  if (tx === "pending") return "pending";
  if (tx === "expire") return "expired";
  if (tx === "cancel") return "cancelled";
  if (tx === "deny" || tx === "failure") return "failed";
  return "pending";
}

async function getActiveMidtransConfig() {
  const result = await query(
    `SELECT public_key, secret_key, endpoint_url
     FROM settings.api_integrations
     WHERE provider = 'midtrans'
       AND is_active = TRUE
     LIMIT 1`,
  );

  if (result.rowCount === 0) return null;

  const row = result.rows[0];
  const endpointUrl = sanitizeUrl(row.endpoint_url) || "https://app.sandbox.midtrans.com/snap/v1/transactions";
  return {
    serverKey: sanitizeText(row.secret_key, 300),
    endpointUrl,
  };
}

async function getActiveRajaOngkirConfig() {
  const result = await query(
    `SELECT public_key, endpoint_url
     FROM settings.api_integrations
     WHERE provider = 'raja_ongkir'
       AND is_active = TRUE
     LIMIT 1`,
  );

  if (result.rowCount === 0) return null;

  const row = result.rows[0];
  return {
    apiKey: sanitizeText(row.public_key, 300),
    baseUrl: sanitizeUrl(row.endpoint_url) || "https://rajaongkir.komerce.id/api/v1",
  };
}

async function trackWaybillWithRajaOngkir({
  awbNumber,
  courierCode,
  lastPhoneNumber,
}) {
  const awb = sanitizeText(awbNumber, 120).toUpperCase();
  const courier = normalizeCourierCode(courierCode);

  if (!awb || !courier) {
    return { ok: false, message: "Data resi atau kurir belum lengkap." };
  }

  const config = await getActiveRajaOngkirConfig();
  if (!config?.apiKey) {
    return {
      ok: false,
      message: "Integrasi RajaOngkir belum aktif atau API key belum diatur.",
    };
  }

  const body = new URLSearchParams({
    awb,
    courier,
  });
  if (lastPhoneNumber) {
    body.set("last_phone_number", String(lastPhoneNumber));
  }

  try {
    const endpoint = `${config.baseUrl.replace(/\/+$/, "")}/track/waybill`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        key: config.apiKey,
        "content-type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    });
    const payload = await response.json().catch(() => ({}));

    const metaStatus = payload?.meta?.status;
    const normalizedMetaStatus = String(metaStatus ?? "").toLowerCase();
    const isMetaSuccess =
      metaStatus === true ||
      metaStatus === 1 ||
      normalizedMetaStatus === "success" ||
      normalizedMetaStatus === "true";
    if (!response.ok || !isMetaSuccess || !payload?.data) {
      return {
        ok: false,
        message:
          payload?.meta?.message ||
          payload?.message ||
          "Data pelacakan tidak ditemukan untuk resi ini.",
      };
    }

    return {
      ok: true,
      message: sanitizeText(payload?.meta?.message, 200) || "Pelacakan berhasil dimuat.",
      data: normalizeRajaOngkirTrackingData(payload.data),
    };
  } catch {
    return {
      ok: false,
      message: "Terjadi kesalahan saat melacak pengiriman.",
    };
  }
}

function buildMidtransAuthHeader(serverKey) {
  return `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`;
}

async function fetchMidtransTransactionStatus(orderCode, midtransConfig) {
  const isProduction = midtransConfig.endpointUrl.includes("app.midtrans.com");
  const statusBaseUrl = isProduction ? "https://api.midtrans.com/v2" : "https://api.sandbox.midtrans.com/v2";
  const url = `${statusBaseUrl}/${encodeURIComponent(orderCode)}/status`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      authorization: buildMidtransAuthHeader(midtransConfig.serverKey),
      accept: "application/json",
    },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { ok: false, message: payload?.status_message || "Gagal mengambil status transaksi Midtrans." };
  }

  return { ok: true, data: payload };
}

export async function findCustomerLastShippingAddressAction(input = {}) {
  const customerEmail = sanitizeText(input?.customerEmail, 160).toLowerCase();
  const customerWhatsapp = sanitizePhone(input?.customerWhatsapp);

  if (!customerEmail && !customerWhatsapp) {
    return { ok: true, found: false, data: null };
  }

  if (customerEmail && !customerEmail.includes("@")) {
    return { ok: false, message: "Email tidak valid." };
  }

  if (customerWhatsapp && customerWhatsapp.length < 9) {
    return { ok: false, message: "Nomor WhatsApp tidak valid." };
  }

  try {
    const whereClauses = [];
    const params = [];

    if (customerEmail) {
      params.push(customerEmail);
      whereClauses.push(`LOWER(customer_email) = $${params.length}`);
    }
    if (customerWhatsapp) {
      params.push(customerWhatsapp);
      whereClauses.push(`customer_whatsapp = $${params.length}`);
    }

    const result = await query(
      `SELECT
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
       WHERE ${whereClauses.join(" OR ")}
       ORDER BY created_at DESC
       LIMIT 1`,
      params,
    );

    if (result.rowCount === 0) {
      return { ok: true, found: false, data: null };
    }

    const row = result.rows[0];
    return {
      ok: true,
      found: true,
      data: {
        provinceId: toInt(row.shipping_province_id),
        provinceName: sanitizeText(row.shipping_province_name, 120),
        cityId: toInt(row.shipping_city_id),
        cityName: sanitizeText(row.shipping_city_name, 120),
        districtId: toInt(row.shipping_district_id),
        districtName: sanitizeText(row.shipping_district_name, 120),
        subdistrictId: toInt(row.shipping_subdistrict_id),
        subdistrictName: sanitizeText(row.shipping_subdistrict_name, 120),
        shippingAddress: sanitizeText(row.shipping_address, 500),
        shippingPostalCode: sanitizeText(row.shipping_postal_code, 20),
      },
    };
  } catch (error) {
    return {
      ok: false,
      message: error?.message || "Gagal mencari alamat pengiriman.",
    };
  }
}

export async function createMerchandiseOrderCheckoutAction(input = {}) {
  const merchandiseItemId = toInt(input?.merchandiseItemId);
  const quantity = toInt(input?.quantity);
  const customerName = sanitizeText(input?.customerName, 120);
  const customerEmail = sanitizeText(input?.customerEmail, 160).toLowerCase();
  const customerWhatsapp = sanitizePhone(input?.customerWhatsapp);
  const provinceId = toInt(input?.provinceId);
  const provinceName = sanitizeText(input?.provinceName, 120);
  const cityId = toInt(input?.cityId);
  const cityName = sanitizeText(input?.cityName, 120);
  const districtId = toInt(input?.districtId);
  const districtName = sanitizeText(input?.districtName, 120);
  const subdistrictId = toInt(input?.subdistrictId);
  const subdistrictName = sanitizeText(input?.subdistrictName, 120);
  const shippingAddress = sanitizeText(input?.shippingAddress, 500);
  const shippingPostalCode = sanitizeText(input?.shippingPostalCode, 20);
  const courierCode = sanitizeText(input?.courierCode, 30).toLowerCase();
  const courierName = sanitizeText(input?.courierName, 80);
  const serviceCode = sanitizeText(input?.serviceCode, 30).toUpperCase();
  const serviceName = sanitizeText(input?.serviceName, 120);
  const shippingEtd = sanitizeText(input?.shippingEtd, 80);
  const shippingCost = toNumber(input?.shippingCost);
  const originUrl = sanitizeUrl(input?.originUrl);

  if (merchandiseItemId <= 0)
    return { ok: false, message: "Produk tidak valid." };
  if (quantity <= 0) return { ok: false, message: "Jumlah order tidak valid." };
  if (!customerName) return { ok: false, message: "Nama wajib diisi." };
  if (!customerEmail || !customerEmail.includes("@"))
    return { ok: false, message: "Email tidak valid." };
  if (customerWhatsapp.length < 9)
    return { ok: false, message: "Nomor WhatsApp tidak valid." };
  if (provinceId <= 0 || cityId <= 0 || districtId <= 0) {
    return { ok: false, message: "Lokasi pengiriman belum lengkap." };
  }
  if (!shippingAddress)
    return { ok: false, message: "Alamat pengiriman wajib diisi." };
  if (!courierCode || !serviceCode || shippingCost <= 0) {
    return {
      ok: false,
      message: "Silakan hitung dan pilih layanan ongkir terlebih dahulu.",
    };
  }
  if (!originUrl) {
    return { ok: false, message: "Origin URL tidak valid untuk redirect pembayaran." };
  }

  try {
    const [itemResult, midtransConfig] = await Promise.all([
      query(
        `SELECT id, title, price_amount, min_order
         FROM content.merchandise_items
         WHERE id = $1
           AND is_active = TRUE
         LIMIT 1`,
        [merchandiseItemId],
      ),
      getActiveMidtransConfig(),
    ]);

    if (itemResult.rowCount === 0) {
      return { ok: false, message: "Produk tidak ditemukan atau tidak aktif." };
    }
    if (!midtransConfig?.serverKey || !midtransConfig?.endpointUrl) {
      return {
        ok: false,
        message: "Integrasi Midtrans belum aktif atau konfigurasi belum lengkap.",
      };
    }

    const item = itemResult.rows[0];
    const minOrder = toInt(item.min_order, 1);
    if (quantity < minOrder) {
      return {
        ok: false,
        message: `Minimum order untuk produk ini adalah ${minOrder} pcs.`,
      };
    }

    const unitPrice = toNumber(item.price_amount, 0);
    const subtotalAmount = unitPrice * quantity;
    const grandTotalAmount = subtotalAmount + shippingCost;

    const orderCode = buildOrderCode();
    const callbackUrl = `${originUrl}/order-status?order_code=${encodeURIComponent(orderCode)}`;

    const midtransPayload = {
      transaction_details: {
        order_id: orderCode,
        gross_amount: Math.round(grandTotalAmount),
      },
      customer_details: {
        first_name: customerName,
        email: customerEmail,
        phone: customerWhatsapp,
      },
      item_details: [
        {
          id: String(item.id),
          name: sanitizeText(item.title, 50),
          price: Math.round(unitPrice),
          quantity,
        },
        {
          id: `shipping-${courierCode}`,
          name: sanitizeText(`Ongkir ${courierName || courierCode.toUpperCase()} ${serviceCode}`, 50),
          price: Math.round(shippingCost),
          quantity: 1,
        },
      ],
      callbacks: {
        finish: callbackUrl,
        pending: callbackUrl,
        error: callbackUrl,
      },
      custom_field1: String(merchandiseItemId),
      custom_field2: String(quantity),
      custom_field3: courierCode,
    };

    const midtransResponse = await fetch(midtransConfig.endpointUrl, {
      method: "POST",
      headers: {
        authorization: buildMidtransAuthHeader(midtransConfig.serverKey),
        "content-type": "application/json",
      },
      body: JSON.stringify(midtransPayload),
      cache: "no-store",
    });

    const midtransResult = await midtransResponse.json().catch(() => ({}));
    if (!midtransResponse.ok || !midtransResult?.redirect_url) {
      return {
        ok: false,
        message: midtransResult?.error_messages?.[0] || "Gagal membuat transaksi Midtrans.",
      };
    }

    const insertResult = await query(
      `INSERT INTO sales.merchandise_orders (
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
       RETURNING id`,
      [
        orderCode,
        merchandiseItemId,
        customerName,
        customerEmail,
        customerWhatsapp,
        quantity,
        unitPrice,
        subtotalAmount,
        provinceId,
        provinceName,
        cityId,
        cityName,
        districtId,
        districtName,
        subdistrictId > 0 ? subdistrictId : null,
        subdistrictName || null,
        shippingAddress,
        shippingPostalCode || null,
        courierCode,
        courierName || courierCode.toUpperCase(),
        serviceCode,
        serviceName || serviceCode,
        shippingEtd || null,
        shippingCost,
        grandTotalAmount,
        sanitizeText(midtransResult?.token, 200) || null,
        sanitizeText(JSON.stringify(midtransResult || {}), 3000),
      ],
    );

    return {
      ok: true,
      message: "Checkout Midtrans berhasil dibuat.",
      data: {
        id: Number(insertResult.rows[0].id),
        order_code: orderCode,
        redirect_url: sanitizeText(midtransResult?.redirect_url, 500),
      },
    };
  } catch (error) {
    return {
      ok: false,
      message: error?.message || "Gagal membuat pesanan.",
    };
  }
}

export async function getMerchandiseOrderPaymentStatusAction(input = {}) {
  const orderCode = sanitizeText(input?.orderCode, 80).toUpperCase();
  if (!orderCode) {
    return { ok: false, message: "Kode order wajib diisi." };
  }

  try {
    const selectOrderByCode = async () =>
      query(
        `SELECT
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
         LIMIT 1`,
        [orderCode],
      );

    let result = await selectOrderByCode();

    if (result.rowCount === 0) {
      return { ok: false, message: "Order tidak ditemukan." };
    }

    const current = result.rows[0];
    const currentPaymentStatus = sanitizeText(current.payment_status, 30).toLowerCase();
    if (currentPaymentStatus === "pending") {
      const midtransConfig = await getActiveMidtransConfig();
      if (midtransConfig?.serverKey) {
        const midtransStatus = await fetchMidtransTransactionStatus(orderCode, midtransConfig);
        if (midtransStatus?.ok) {
          const payload = midtransStatus.data || {};
          const paymentStatus = mapMidtransTransactionStatus(payload.transaction_status, payload.fraud_status);
          const paymentReference =
            sanitizeText(payload.transaction_id, 120) || sanitizeText(payload.payment_type, 80);
          const paymentDueAt =
            sanitizeText(payload.expiry_time, 80) ||
            sanitizeText(payload.settlement_time, 80) ||
            sanitizeText(payload.transaction_time, 80) ||
            null;
          const mergedNotes = JSON.stringify({
            payment_type: sanitizeText(payload.payment_type, 50) || null,
            transaction_status: sanitizeText(payload.transaction_status, 50) || null,
            fraud_status: sanitizeText(payload.fraud_status, 30) || null,
          });

          await query(
            `UPDATE sales.merchandise_orders
             SET payment_status = $2,
                 order_status = $3,
                 payment_reference = COALESCE($4, payment_reference),
                 payment_due_at = $5,
                 notes = CASE WHEN COALESCE(notes, '') = '' THEN $6 ELSE notes || E'\n' || $6 END,
                 updated_at = NOW()
             WHERE order_code = $1`,
            [
              orderCode,
              paymentStatus,
              resolveOrderStatusAfterPaymentSync(current.order_status, paymentStatus),
              paymentReference || null,
              paymentDueAt,
              mergedNotes,
            ],
          );

          result = await selectOrderByCode();
        }
      }
    }

    const row = result.rows[0];
    return {
      ok: true,
      data: {
        orderCode: sanitizeText(row.order_code, 80),
        customerName: sanitizeText(row.customer_name, 120),
        customerEmail: sanitizeText(row.customer_email, 160),
        quantity: toInt(row.quantity),
        grandTotalAmount: toNumber(row.grand_total_amount),
        orderId: Number(row.id),
        orderStatus: sanitizeText(row.order_status, 30),
        orderPaymentStatus: sanitizeText(row.payment_status, 30),
        paymentReference: sanitizeText(row.payment_reference, 200),
        paymentDueAt: row.payment_due_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    };
  } catch (error) {
    return {
      ok: false,
      message: error?.message || "Gagal memuat status order.",
    };
  }
}

export async function getPublicOrderStatusByWhatsappAction(input = {}) {
  const orderCode = sanitizeText(input?.orderCode, 80).toUpperCase();
  const customerWhatsapp = sanitizePhone(input?.customerWhatsapp);

  if (!orderCode) {
    return { ok: false, message: "Kode order wajib diisi." };
  }
  if (customerWhatsapp.length < 9) {
    return { ok: false, message: "Nomor WhatsApp tidak valid." };
  }

  try {
    const selectOrder = async () =>
      query(
        `SELECT
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
         LIMIT 1`,
        [orderCode, customerWhatsapp],
      );

    let result = await selectOrder();
    if (result.rowCount === 0) {
      return { ok: false, message: "Order tidak ditemukan. Periksa kode order dan nomor WhatsApp." };
    }

    const current = result.rows[0];
    const currentPaymentStatus = sanitizeText(current.payment_status, 30).toLowerCase();

    if (currentPaymentStatus === "pending") {
      const midtransConfig = await getActiveMidtransConfig();
      if (midtransConfig?.serverKey) {
        const midtransStatus = await fetchMidtransTransactionStatus(orderCode, midtransConfig);
        if (midtransStatus?.ok) {
          const payload = midtransStatus.data || {};
          const paymentStatus = mapMidtransTransactionStatus(payload.transaction_status, payload.fraud_status);
          const paymentReference =
            sanitizeText(payload.transaction_id, 120) || sanitizeText(payload.payment_type, 80);
          const paymentDueAt =
            sanitizeText(payload.expiry_time, 80) ||
            sanitizeText(payload.settlement_time, 80) ||
            sanitizeText(payload.transaction_time, 80) ||
            null;
          const mergedNotes = JSON.stringify({
            payment_type: sanitizeText(payload.payment_type, 50) || null,
            transaction_status: sanitizeText(payload.transaction_status, 50) || null,
            fraud_status: sanitizeText(payload.fraud_status, 30) || null,
          });

          await query(
            `UPDATE sales.merchandise_orders
             SET payment_status = $2,
                 order_status = $3,
                 payment_reference = COALESCE($4, payment_reference),
                 payment_due_at = $5,
                 notes = CASE WHEN COALESCE(notes, '') = '' THEN $6 ELSE notes || E'\n' || $6 END,
                 updated_at = NOW()
             WHERE order_code = $1`,
            [
              orderCode,
              paymentStatus,
              resolveOrderStatusAfterPaymentSync(current.order_status, paymentStatus),
              paymentReference || null,
              paymentDueAt,
              mergedNotes,
            ],
          );

          result = await selectOrder();
        }
      }
    }

    const row = result.rows[0];
    return {
      ok: true,
      data: {
        orderCode: sanitizeText(row.order_code, 80),
        customerName: sanitizeText(row.customer_name, 120),
        customerEmail: sanitizeText(row.customer_email, 160),
        customerWhatsapp: sanitizePhone(row.customer_whatsapp),
        merchandiseItemId: toInt(row.merchandise_item_id),
        merchandiseTitle: sanitizeText(row.merchandise_title, 200),
        merchandiseDetail: sanitizeText(row.merchandise_detail, 500),
        merchandiseImageUrl: sanitizeText(row.merchandise_image_url, 500),
        quantity: toInt(row.quantity),
        unitPrice: toNumber(row.unit_price),
        subtotalAmount: toNumber(row.subtotal_amount),
        grandTotalAmount: toNumber(row.grand_total_amount),
        orderStatus: sanitizeText(row.order_status, 30),
        paymentStatus: sanitizeText(row.payment_status, 30),
        paymentReference: sanitizeText(row.payment_reference, 200),
        paymentDueAt: row.payment_due_at,
        shippingCourierName: sanitizeText(row.shipping_courier_name, 80),
        shippingServiceName: sanitizeText(row.shipping_service_name, 120),
        shippingEtd: sanitizeText(row.shipping_etd, 80),
        shippingTrackingNumber: sanitizeText(row.shipping_tracking_number, 120),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    };
  } catch (error) {
    return {
      ok: false,
      message: error?.message || "Gagal memuat status order.",
    };
  }
}

export async function processMidtransNotificationAction(payload = {}) {
  const orderCode = sanitizeText(payload?.order_id, 80).toUpperCase();
  const statusCode = sanitizeText(payload?.status_code, 10);
  const grossAmount = sanitizeText(payload?.gross_amount, 30);
  const signatureKey = sanitizeText(payload?.signature_key, 200);
  const transactionStatus = sanitizeText(payload?.transaction_status, 50);
  const fraudStatus = sanitizeText(payload?.fraud_status, 30);
  const paymentType = sanitizeText(payload?.payment_type, 50);
  const transactionTime = sanitizeText(payload?.transaction_time, 80);
  const settlementTime = sanitizeText(payload?.settlement_time, 80);
  const expiryTime = sanitizeText(payload?.expiry_time, 80);

  if (!orderCode) {
    return { ok: false, message: "Order ID tidak valid." };
  }

  const midtransConfig = await getActiveMidtransConfig();
  if (!midtransConfig?.serverKey) {
    return { ok: false, message: "Konfigurasi Midtrans tidak tersedia." };
  }

  const expectedSignature = crypto
    .createHash("sha512")
    .update(`${orderCode}${statusCode}${grossAmount}${midtransConfig.serverKey}`)
    .digest("hex");

  if (!signatureKey || signatureKey !== expectedSignature) {
    return { ok: false, message: "Signature Midtrans tidak valid." };
  }

  const paymentStatus = mapMidtransTransactionStatus(transactionStatus, fraudStatus);
  const paymentReference = sanitizeText(payload?.transaction_id, 120) || sanitizeText(payload?.payment_type, 80);
  const paymentDueAt = expiryTime || settlementTime || transactionTime || null;

  try {
    return await withTransaction(async (client) => {
      const orderResult = await client.query(
        `SELECT *
         FROM sales.merchandise_orders
         WHERE order_code = $1
         LIMIT 1
         FOR UPDATE`,
        [orderCode],
      );

      if (orderResult.rowCount === 0) {
        return { ok: false, message: "Order tidak ditemukan." };
      }

      const mergedNotes = JSON.stringify({
        payment_type: paymentType || null,
        transaction_status: transactionStatus || null,
        fraud_status: fraudStatus || null,
      });

      await client.query(
        `UPDATE sales.merchandise_orders
         SET payment_status = $2,
             order_status = $3,
             payment_reference = COALESCE($4, payment_reference),
             payment_due_at = $5,
             notes = CASE WHEN COALESCE(notes, '') = '' THEN $6 ELSE notes || E'\n' || $6 END,
             updated_at = NOW()
         WHERE order_code = $1`,
        [
          orderCode,
          paymentStatus,
          resolveOrderStatusAfterPaymentSync(orderResult.rows[0].order_status, paymentStatus),
          paymentReference || null,
          paymentDueAt,
          mergedNotes,
        ],
      );

      return { ok: true, message: "Notifikasi diproses." };
    });
  } catch (error) {
    return {
      ok: false,
      message: error?.message || "Gagal memproses notifikasi Midtrans.",
    };
  }
}

export async function createMerchandiseOrderDraftAction(input = {}) {
  return createMerchandiseOrderCheckoutAction(input);
}

export async function trackPublicMerchandiseOrderShipmentAction(input = {}) {
  const orderCode = sanitizeText(input?.orderCode, 80).toUpperCase();
  const customerWhatsapp = sanitizePhone(input?.customerWhatsapp);

  if (!orderCode) {
    return { ok: false, message: "Kode order wajib diisi." };
  }
  if (customerWhatsapp.length < 9) {
    return { ok: false, message: "Nomor WhatsApp tidak valid." };
  }

  try {
    const result = await query(
      `SELECT
         order_code,
         customer_whatsapp,
         shipping_courier_code,
         shipping_courier_name,
         shipping_tracking_number
       FROM sales.merchandise_orders
       WHERE order_code = $1
         AND customer_whatsapp = $2
       LIMIT 1`,
      [orderCode, customerWhatsapp],
    );

    if (result.rowCount === 0) {
      return { ok: false, message: "Order tidak ditemukan. Periksa kode order dan nomor WhatsApp." };
    }

    const row = result.rows[0];
    const awbNumber = sanitizeText(row.shipping_tracking_number, 120);
    const courierCode = normalizeCourierCode(row.shipping_courier_code);
    const lastPhoneNumber = sanitizePhone(row.customer_whatsapp).slice(-5);

    if (!awbNumber) {
      return { ok: false, message: "Nomor resi belum tersedia untuk pesanan ini." };
    }
    if (!courierCode) {
      return { ok: false, message: "Kurir pesanan belum tersedia." };
    }

    const tracking = await trackWaybillWithRajaOngkir({
      awbNumber,
      courierCode,
      lastPhoneNumber,
    });
    if (!tracking?.ok) {
      return tracking;
    }

    return {
      ok: true,
      data: {
        orderCode,
        courierCode,
        courierName: sanitizeText(row.shipping_courier_name, 120),
        awbNumber,
        ...tracking.data,
      },
    };
  } catch (error) {
    return {
      ok: false,
      message: error?.message || "Gagal melacak pengiriman.",
    };
  }
}

export async function getAdminMerchandiseOrdersAction() {
  await requireRole("admin");

  const result = await query(
    `SELECT
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
     ORDER BY o.created_at DESC`,
  );

  return result.rows.map((row) => ({
    id: Number(row.id),
    order_code: sanitizeText(row.order_code, 80),
    merchandise_item_id: toInt(row.merchandise_item_id),
    merchandise_title: sanitizeText(row.merchandise_title, 160),
    customer_name: sanitizeText(row.customer_name, 120),
    customer_email: sanitizeText(row.customer_email, 160),
    customer_whatsapp: sanitizePhone(row.customer_whatsapp),
    quantity: toInt(row.quantity),
    unit_price: toNumber(row.unit_price),
    subtotal_amount: toNumber(row.subtotal_amount),
    shipping_province_id: toInt(row.shipping_province_id),
    shipping_province_name: sanitizeText(row.shipping_province_name, 120),
    shipping_city_id: toInt(row.shipping_city_id),
    shipping_city_name: sanitizeText(row.shipping_city_name, 120),
    shipping_district_id: toInt(row.shipping_district_id),
    shipping_district_name: sanitizeText(row.shipping_district_name, 120),
    shipping_subdistrict_id: toInt(row.shipping_subdistrict_id),
    shipping_subdistrict_name: sanitizeText(row.shipping_subdistrict_name, 120),
    shipping_address: sanitizeText(row.shipping_address, 500),
    shipping_postal_code: sanitizeText(row.shipping_postal_code, 20),
    shipping_courier_code: sanitizeText(row.shipping_courier_code, 30),
    shipping_courier_name: sanitizeText(row.shipping_courier_name, 80),
    shipping_service_code: sanitizeText(row.shipping_service_code, 30),
    shipping_service_name: sanitizeText(row.shipping_service_name, 120),
    shipping_etd: sanitizeText(row.shipping_etd, 80),
    shipping_tracking_number: sanitizeText(row.shipping_tracking_number, 120),
    shipping_cost_amount: toNumber(row.shipping_cost_amount),
    grand_total_amount: toNumber(row.grand_total_amount),
    order_status: sanitizeText(row.order_status, 40),
    payment_status: sanitizeText(row.payment_status, 40),
    payment_reference: sanitizeText(row.payment_reference, 200),
    payment_due_at: row.payment_due_at,
    notes: sanitizeText(row.notes, 3000),
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export async function updateAdminMerchandiseOrderTrackingNumberAction(input = {}) {
  await requireRole("admin");

  const orderId = toInt(input?.orderId);
  const trackingNumber = sanitizeText(input?.trackingNumber, 120).toUpperCase();

  if (orderId <= 0) {
    return { ok: false, message: "ID order tidak valid." };
  }
  if (!trackingNumber) {
    return { ok: false, message: "Nomor resi wajib diisi." };
  }

  try {
    const result = await query(
      `UPDATE sales.merchandise_orders
       SET shipping_tracking_number = $2,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, order_code, shipping_tracking_number`,
      [orderId, trackingNumber],
    );

    if (result.rowCount === 0) {
      return { ok: false, message: "Order tidak ditemukan." };
    }

    revalidatePath("/admin/order");
    return {
      ok: true,
      message: "Nomor resi berhasil disimpan.",
      data: {
        id: Number(result.rows[0].id),
        order_code: sanitizeText(result.rows[0].order_code, 80),
        shipping_tracking_number: sanitizeText(result.rows[0].shipping_tracking_number, 120),
      },
    };
  } catch (error) {
    return { ok: false, message: error?.message || "Gagal menyimpan nomor resi." };
  }
}

export async function updateAdminMerchandiseOrderStatusAction(input = {}) {
  await requireRole("admin");

  const orderId = toInt(input?.orderId);
  const nextStatus = sanitizeText(input?.status, 40).toLowerCase();
  const allowedStatus = new Set(["diproses", "dikirim", "selesai"]);

  if (orderId <= 0) {
    return { ok: false, message: "ID order tidak valid." };
  }
  if (!allowedStatus.has(nextStatus)) {
    return { ok: false, message: "Status order tidak didukung." };
  }

  try {
    const result = await query(
      `UPDATE sales.merchandise_orders
       SET order_status = $2,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, order_code`,
      [orderId, nextStatus],
    );

    if (result.rowCount === 0) {
      return { ok: false, message: "Order tidak ditemukan." };
    }

    revalidatePath("/admin/order");
    return {
      ok: true,
      message: "Status order berhasil diperbarui.",
      data: {
        id: Number(result.rows[0].id),
        order_code: sanitizeText(result.rows[0].order_code, 80),
        order_status: nextStatus,
      },
    };
  } catch (error) {
    return { ok: false, message: error?.message || "Gagal memperbarui status order." };
  }
}

export async function trackAdminMerchandiseOrderShipmentAction(input = {}) {
  await requireRole("admin");

  const orderId = toInt(input?.orderId);
  if (orderId <= 0) {
    return { ok: false, message: "ID order tidak valid." };
  }

  try {
    const result = await query(
      `SELECT
         order_code,
         customer_whatsapp,
         shipping_courier_code,
         shipping_courier_name,
         shipping_tracking_number
       FROM sales.merchandise_orders
       WHERE id = $1
       LIMIT 1`,
      [orderId],
    );

    if (result.rowCount === 0) {
      return { ok: false, message: "Order tidak ditemukan." };
    }

    const row = result.rows[0];
    const awbNumber = sanitizeText(row.shipping_tracking_number, 120);
    const courierCode = normalizeCourierCode(row.shipping_courier_code);
    const lastPhoneNumber = sanitizePhone(row.customer_whatsapp).slice(-5);

    if (!awbNumber) {
      return { ok: false, message: "Nomor resi belum tersedia untuk order ini." };
    }
    if (!courierCode) {
      return { ok: false, message: "Kurir order belum tersedia." };
    }

    const tracking = await trackWaybillWithRajaOngkir({
      awbNumber,
      courierCode,
      lastPhoneNumber,
    });
    if (!tracking?.ok) {
      return tracking;
    }

    return {
      ok: true,
      data: {
        orderId,
        orderCode: sanitizeText(row.order_code, 80),
        courierCode,
        courierName: sanitizeText(row.shipping_courier_name, 120),
        awbNumber,
        ...tracking.data,
      },
    };
  } catch (error) {
    return {
      ok: false,
      message: error?.message || "Gagal melacak pengiriman.",
    };
  }
}

export async function deleteAdminMerchandiseOrderAction(input = {}) {
  await requireRole("admin");

  const orderId = toInt(input?.orderId);
  if (orderId <= 0) {
    return { ok: false, message: "ID order tidak valid." };
  }

  try {
    const result = await query(
      `DELETE FROM sales.merchandise_orders
       WHERE id = $1
       RETURNING id, order_code`,
      [orderId],
    );

    if (result.rowCount === 0) {
      return { ok: false, message: "Order tidak ditemukan." };
    }

    revalidatePath("/admin/order");
    return {
      ok: true,
      message: "Order berhasil dihapus.",
      data: {
        id: Number(result.rows[0].id),
        order_code: sanitizeText(result.rows[0].order_code, 80),
      },
    };
  } catch (error) {
    return { ok: false, message: error?.message || "Gagal menghapus order." };
  }
}
