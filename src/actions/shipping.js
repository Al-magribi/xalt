"use server";

import { query } from "@/config/db";

function toInt(value) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isInteger(parsed) ? parsed : 0;
}

function toPositiveNumber(value, fallback = 0) {
  const parsed = Number.parseFloat(String(value || ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeObject(value) {
  if (!value) return {};
  if (typeof value === "object") return value;

  try {
    return JSON.parse(String(value));
  } catch {
    return {};
  }
}

function mapRows(rows, idKey, nameKey) {
  return (Array.isArray(rows) ? rows : []).map((row) => ({
    value: Number(row[idKey]),
    label: String(row[nameKey] || "").trim(),
  }));
}

function buildEndpoint(level, parentId) {
  if (level === "province") {
    return "https://rajaongkir.komerce.id/api/v1/destination/province";
  }
  if (level === "city") {
    return `https://rajaongkir.komerce.id/api/v1/destination/city/${parentId}`;
  }
  if (level === "district") {
    return `https://rajaongkir.komerce.id/api/v1/destination/district/${parentId}`;
  }
  if (level === "subdistrict") {
    return `https://rajaongkir.komerce.id/api/v1/destination/sub-district/${parentId}`;
  }
  return "";
}

function mapCourierCode(code) {
  const normalized = String(code || "").toLowerCase();
  if (normalized === "jne") return "JNE";
  if (normalized === "sap") return "SAP Express";
  if (normalized === "ide") return "ID Express";
  if (normalized === "idexpress") return "ID Express";
  if (normalized === "sicepat") return "SiCepat";
  return normalized.toUpperCase();
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(toPositiveNumber(value, 0));
}

function normalizeRajaOngkirCouriers(couriersConfig) {
  const normalizeCourierCode = (code) => {
    const normalized = String(code || "").trim().toLowerCase();
    if (!normalized) return "";
    if (normalized === "idexpress" || normalized === "id_express" || normalized === "id-express") {
      return "ide";
    }
    return normalized;
  };

  if (Array.isArray(couriersConfig)) {
    return Array.from(new Set(couriersConfig.map((item) => normalizeCourierCode(item)).filter(Boolean)));
  }

  if (couriersConfig && typeof couriersConfig === "object") {
    return Array.from(
      new Set(
        Object.entries(couriersConfig)
      .filter(([, isEnabled]) => Boolean(isEnabled))
      .map(([code]) => normalizeCourierCode(code))
      .filter(Boolean),
      ),
    );
  }

  return [];
}

async function getActiveRajaOngkirConfig() {
  const result = await query(
    `SELECT public_key, endpoint_url, additional_config
     FROM settings.api_integrations
     WHERE provider = 'raja_ongkir'
       AND is_active = TRUE
     LIMIT 1`,
  );

  if (result.rowCount === 0) {
    return null;
  }

  const row = result.rows[0];
  const additionalConfig = normalizeObject(row.additional_config);
  const storeOrigin = normalizeObject(additionalConfig.store_origin);
  const couriers = normalizeRajaOngkirCouriers(additionalConfig.couriers);
  const fallbackCouriers = ["jne", "sap", "ide", "sicepat"];

  return {
    apiKey: String(row.public_key || "").trim(),
    baseUrl: String(row.endpoint_url || "https://rajaongkir.komerce.id/api/v1").trim(),
    storeOrigin,
    couriers: couriers.length > 0 ? couriers : fallbackCouriers,
  };
}

function toShippingOptions(data) {
  const options = [];
  const rows = Array.isArray(data) ? data : [];

  for (const row of rows) {
    const courierCode = String(row?.code || "").toLowerCase();
    const courierName = String(row?.name || mapCourierCode(courierCode)).trim();

    if (Array.isArray(row?.costs)) {
      for (const service of row.costs) {
        const serviceCode = String(service?.service || "").trim();
        const serviceName = String(service?.description || serviceCode || "").trim();
        const costRows = Array.isArray(service?.cost) ? service.cost : [];
        const firstCost = costRows[0] || {};
        const cost = toPositiveNumber(firstCost.value, 0);
        const etd = String(firstCost.etd || "").trim();

        if (!serviceCode || cost <= 0) {
          continue;
        }

        options.push({
          id: `${courierCode}:${serviceCode}`,
          courier_code: courierCode,
          courier_name: courierName || mapCourierCode(courierCode),
          service_code: serviceCode,
          service_name: serviceName || serviceCode,
          etd,
          cost,
          label: `${courierName || mapCourierCode(courierCode)} - ${serviceCode} (${formatRupiah(cost)}${
            etd ? `, estimasi ${etd} hari` : ""
          })`,
        });
      }
      continue;
    }

    const serviceCode = String(row?.service || "").trim();
    const serviceName = String(row?.description || serviceCode || "").trim();
    const cost = toPositiveNumber(row?.cost, 0);
    const etd = String(row?.etd || "").trim();

    if (!courierCode || !serviceCode || cost <= 0) {
      continue;
    }

    options.push({
      id: `${courierCode}:${serviceCode}`,
      courier_code: courierCode,
      courier_name: courierName || mapCourierCode(courierCode),
      service_code: serviceCode,
      service_name: serviceName || serviceCode,
      etd,
      cost,
      label: `${courierName || mapCourierCode(courierCode)} - ${serviceCode} (${formatRupiah(cost)}${
        etd ? `, estimasi ${etd} hari` : ""
      })`,
    });
  }

  return options.sort((left, right) => left.cost - right.cost);
}

export async function fetchRajaOngkirLocationsAction(input = {}) {
  const level = String(input?.level || "").trim();
  const apiKey = String(input?.apiKey || "").trim();
  const parentId = toInt(input?.parentId);

  if (!apiKey) {
    return { ok: false, status: 400, message: "API key RajaOngkir wajib diisi." };
  }
  if (!["province", "city", "district", "subdistrict"].includes(level)) {
    return { ok: false, status: 400, message: "Level lokasi tidak valid." };
  }
  if (level !== "province" && parentId <= 0) {
    return { ok: false, status: 400, message: "Parent lokasi tidak valid." };
  }

  try {
    const endpoint = buildEndpoint(level, parentId);
    const response = await fetch(endpoint, {
      method: "GET",
      headers: { key: apiKey },
      cache: "no-store",
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        ok: false,
        status: response.status || 500,
        message: payload?.meta?.message || payload?.message || "Gagal memuat lokasi RajaOngkir.",
      };
    }

    const rows = Array.isArray(payload?.data) ? payload.data : [];
    return { ok: true, status: 200, options: mapRows(rows, "id", "name") };
  } catch {
    return {
      ok: false,
      status: 500,
      message: "Terjadi kesalahan saat memuat lokasi RajaOngkir.",
    };
  }
}

export async function fetchOrderRajaOngkirLocationsAction(input = {}) {
  const level = String(input?.level || "").trim();
  const parentId = toInt(input?.parentId);

  if (!["province", "city", "district", "subdistrict"].includes(level)) {
    return { ok: false, status: 400, message: "Level lokasi tidak valid." };
  }
  if (level !== "province" && parentId <= 0) {
    return { ok: false, status: 400, message: "Parent lokasi tidak valid." };
  }

  try {
    const config = await getActiveRajaOngkirConfig();
    if (!config?.apiKey) {
      return {
        ok: false,
        status: 400,
        message: "Integrasi RajaOngkir belum aktif atau API key belum diatur.",
      };
    }

    const endpoint = buildEndpoint(level, parentId);
    const response = await fetch(endpoint, {
      method: "GET",
      headers: { key: config.apiKey },
      cache: "no-store",
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        ok: false,
        status: response.status || 500,
        message: payload?.meta?.message || payload?.message || "Gagal memuat lokasi RajaOngkir.",
      };
    }

    const rows = Array.isArray(payload?.data) ? payload.data : [];
    return { ok: true, status: 200, options: mapRows(rows, "id", "name") };
  } catch {
    return {
      ok: false,
      status: 500,
      message: "Terjadi kesalahan saat memuat lokasi RajaOngkir.",
    };
  }
}

export async function calculateOrderShippingAction(input = {}) {
  const destinationDistrictId = toInt(input?.destinationDistrictId);
  const weightGram = toInt(input?.weightGram);

  if (destinationDistrictId <= 0) {
    return { ok: false, status: 400, message: "Kecamatan tujuan tidak valid." };
  }
  if (weightGram <= 0) {
    return { ok: false, status: 400, message: "Berat kiriman harus lebih dari 0 gram." };
  }

  try {
    const config = await getActiveRajaOngkirConfig();
    if (!config?.apiKey) {
      return {
        ok: false,
        status: 400,
        message: "Integrasi RajaOngkir belum aktif atau API key belum diatur.",
      };
    }

    const originDistrictId = toInt(config?.storeOrigin?.district_id);
    if (originDistrictId <= 0) {
      return {
        ok: false,
        status: 400,
        message: "Origin toko RajaOngkir belum diset (minimal sampai kecamatan).",
      };
    }

    if (!Array.isArray(config.couriers) || config.couriers.length === 0) {
      return {
        ok: false,
        status: 400,
        message: "Belum ada courier RajaOngkir yang aktif.",
      };
    }

    const url = `${config.baseUrl.replace(/\/+$/, "")}/calculate/district/domestic-cost`;
    const body = new URLSearchParams({
      origin: String(originDistrictId),
      destination: String(destinationDistrictId),
      weight: String(weightGram),
      courier: config.couriers.join(":"),
      price: "lowest",
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        key: config.apiKey,
        "content-type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        ok: false,
        status: response.status || 500,
        message: payload?.meta?.message || payload?.message || "Gagal menghitung ongkir RajaOngkir.",
      };
    }

    const options = toShippingOptions(payload?.data);
    if (options.length === 0) {
      return {
        ok: false,
        status: 404,
        message: "Layanan pengiriman tidak tersedia untuk tujuan ini.",
      };
    }

    return {
      ok: true,
      status: 200,
      options,
    };
  } catch {
    return {
      ok: false,
      status: 500,
      message: "Terjadi kesalahan saat menghitung ongkir.",
    };
  }
}
