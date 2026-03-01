"use server";

import { createRequire } from "node:module";
import { headers } from "next/headers";
import { query } from "@/config/db";

const require = createRequire(import.meta.url);
let geoipModule = null;
let geoipUnavailable = false;

function parseForwardedHeader(value) {
  return String(value || "")
    .split(",")
    .map((entry) => {
      const match = entry.match(/for=([^;]+)/i);
      return match ? match[1] : "";
    })
    .filter(Boolean);
}

function normalizeCandidateIp(rawValue) {
  const value = String(rawValue || "")
    .trim()
    .replace(/^"|"$/g, "")
    .replace(/^\[|\]$/g, "");

  if (!value || value.toLowerCase() === "unknown") return "";

  if (value.startsWith("::ffff:")) {
    return value.slice(7);
  }

  if (/^\d{1,3}(\.\d{1,3}){3}:\d+$/.test(value)) {
    return value.split(":")[0];
  }

  return value;
}

function getClientIpFromHeaders(headerStore) {
  const forwarded = String(headerStore.get("x-forwarded-for") || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const standardForwarded = parseForwardedHeader(headerStore.get("forwarded"));
  const realIp = String(headerStore.get("x-real-ip") || "").trim();
  const cfConnectingIp = String(headerStore.get("cf-connecting-ip") || "").trim();
  const trueClientIp = String(headerStore.get("true-client-ip") || "").trim();
  const fastlyClientIp = String(headerStore.get("fastly-client-ip") || "").trim();
  const vercelForwardedFor = String(headerStore.get("x-vercel-forwarded-for") || "").trim();
  const clientIp = String(headerStore.get("x-client-ip") || "").trim();
  const clusterClientIp = String(headerStore.get("x-cluster-client-ip") || "").trim();
  const flyClientIp = String(headerStore.get("fly-client-ip") || "").trim();
  const netlifyClientIp = String(headerStore.get("x-nf-client-connection-ip") || "").trim();
  const doConnectingIp = String(headerStore.get("do-connecting-ip") || "").trim();

  const candidates = [
    ...forwarded,
    ...standardForwarded,
    vercelForwardedFor,
    realIp,
    cfConnectingIp,
    trueClientIp,
    fastlyClientIp,
    clientIp,
    clusterClientIp,
    flyClientIp,
    netlifyClientIp,
    doConnectingIp,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeCandidateIp(candidate);
    if (normalized) return normalized;
  }

  return "";
}

function normalizeIp(ip) {
  const value = String(ip || "").trim();
  if (!value) return null;
  if (value === "::1") return "127.0.0.1";
  return value.toLowerCase() === "unknown" ? null : value;
}

function getCityFromHeaders(headerStore) {
  const headerCandidates = [
    "x-vercel-ip-city",
    "cf-ipcity",
    "x-geo-city",
    "x-appengine-city",
    "fly-client-city",
  ];

  for (const headerName of headerCandidates) {
    const value = String(headerStore.get(headerName) || "").trim();
    if (value) return value;
  }

  return null;
}

async function lookupCityByExternalApi(ip) {
  if (!ip || ip === "127.0.0.1") return null;

  const endpointCandidates = [
    `https://ipapi.co/${encodeURIComponent(ip)}/json/`,
    `https://ipwho.is/${encodeURIComponent(ip)}`,
  ];

  for (const endpoint of endpointCandidates) {
    let timeout = null;
    try {
      const controller = new AbortController();
      timeout = setTimeout(() => controller.abort(), 1500);
      const response = await fetch(endpoint, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });

      if (!response.ok) continue;
      const json = await response.json();

      const city =
        String(json?.city || json?.data?.city || "")
          .trim() || null;

      if (city) return city;
    } catch {
      // Ignore API fallback failures and continue with next source.
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }

  return null;
}

function lookupCityByIp(ip) {
  if (!ip || geoipUnavailable) return null;

  if (!geoipModule) {
    try {
      geoipModule = require("geoip-lite");
    } catch {
      geoipUnavailable = true;
      return null;
    }
  }

  try {
    const geo = geoipModule.lookup(ip);
    return String(geo?.city || "").trim() || null;
  } catch {
    return null;
  }
}

function sanitizePhone(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function buildWhatsappMessage({ productTitle, message, name }) {
  const subject = productTitle ? `produk ${productTitle}` : "kebutuhan merchandise";
  return `Halo X-ALT, saya ${name}. Saya ingin diskusi ${subject}. ${message}`;
}

export async function submitWhatsappLeadAction(payload) {
  try {
    const name = String(payload?.name || "").trim();
    const email = String(payload?.email || "")
      .trim()
      .toLowerCase();
    const whatsapp = sanitizePhone(payload?.whatsapp);
    const message = String(payload?.message || "").trim();
    const sourcePage = String(payload?.sourcePage || "").trim() || null;
    const productSlug = String(payload?.productSlug || "").trim() || null;
    const productTitle = String(payload?.productTitle || "").trim() || null;
    const websiteWhatsappNumber = sanitizePhone(payload?.websiteWhatsappNumber);

    if (!name) return { ok: false, message: "Nama wajib diisi." };
    if (!isValidEmail(email)) return { ok: false, message: "Email tidak valid." };
    if (whatsapp.length < 9) return { ok: false, message: "Nomor WhatsApp tidak valid." };
    if (!message) return { ok: false, message: "Pesan wajib diisi." };
    if (!websiteWhatsappNumber) {
      return { ok: false, message: "Nomor WhatsApp website belum tersedia." };
    }

    const requestHeaders = await headers();
    const detectedIp = normalizeIp(getClientIpFromHeaders(requestHeaders)) || "127.0.0.1";
    const headerCity = getCityFromHeaders(requestHeaders);
    const geoipCity = lookupCityByIp(detectedIp);
    const externalCity = !headerCity && !geoipCity
      ? await lookupCityByExternalApi(detectedIp)
      : null;
    const cityName =
      headerCity ||
      geoipCity ||
      externalCity ||
      (detectedIp === "127.0.0.1" ? "Localhost" : "Unknown");

    await query(
      `INSERT INTO sales.contact_leads (
         name,
         message,
         source_page,
         channel,
         phone,
         email,
         status,
         real_ip,
         city_name
       )
       VALUES ($1, $2, $3, 'whatsapp', $4, $5, 'new', $6::inet, $7)`,
      [name, message, sourcePage, whatsapp, email, detectedIp, cityName],
    );

    const whatsappText = buildWhatsappMessage({ productTitle, message, name });
    const redirectUrl = `https://wa.me/${websiteWhatsappNumber}?text=${encodeURIComponent(whatsappText)}`;

    return {
      ok: true,
      message: "Data berhasil disimpan.",
      data: {
        redirectUrl,
        ip: detectedIp,
        cityName,
        productSlug,
      },
    };
  } catch (error) {
    return { ok: false, message: error?.message || "Gagal menyimpan data kontak." };
  }
}
