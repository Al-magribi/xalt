"use server";

import crypto from "node:crypto";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireRole } from "@/actions/auth";
import { query, withTransaction } from "@/config/db";
import { resolveAssetUrl } from "@/utils/media";

const require = createRequire(import.meta.url);
let geoipModule = null;
let geoipUnavailable = false;

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const PUBLIC_KIT_UPLOAD_PREFIX = "/public/uploads/kits/";
const LEGACY_KIT_UPLOAD_PREFIX = "/uploads/kits/";
const KIT_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "kits");
const PUBLIC_MERCH_UPLOAD_PREFIX = "/public/uploads/merchandise/";
const LEGACY_MERCH_UPLOAD_PREFIX = "/uploads/merchandise/";
const MERCH_UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "merchandise",
);
const PUBLIC_CATALOG_UPLOAD_PREFIX = "/public/uploads/catalog/";
const LEGACY_CATALOG_UPLOAD_PREFIX = "/uploads/catalog/";
const CATALOG_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "catalog");

function toSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseBoolean(value, defaultValue = false) {
  if (value == null) return defaultValue;
  const normalized = String(value).toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "on";
}

function normalizeStringList(value) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => String(entry || "").trim())
      .filter(Boolean);
  }

  return String(value || "")
    .split(/[\r\n,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function toSafeExt(fileName = "") {
  const ext = path.extname(fileName).toLowerCase();
  if (!ext) return ".jpg";
  return ext.replace(/[^.a-z0-9]/g, "") || ".jpg";
}

function isLocalUploadUrl(url) {
  if (typeof url !== "string") return false;
  return (
    url.startsWith(PUBLIC_KIT_UPLOAD_PREFIX) ||
    url.startsWith(LEGACY_KIT_UPLOAD_PREFIX) ||
    url.startsWith(PUBLIC_MERCH_UPLOAD_PREFIX) ||
    url.startsWith(LEGACY_MERCH_UPLOAD_PREFIX) ||
    url.startsWith(PUBLIC_CATALOG_UPLOAD_PREFIX) ||
    url.startsWith(LEGACY_CATALOG_UPLOAD_PREFIX)
  );
}

function toLocalFilePath(url) {
  if (!isLocalUploadUrl(url)) return null;
  const relative = url
    .replace(/^\/public\//i, "")
    .replace(/^\//, "");
  return path.join(process.cwd(), "public", relative);
}

async function deleteFileIfExists(url) {
  const filePath = toLocalFilePath(url);
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }
}

async function deleteFilesBestEffort(urls) {
  for (const url of urls) {
    await deleteFileIfExists(url);
  }
}

async function saveImageFile(file) {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!file.type?.startsWith("image/")) {
    throw new Error("File harus berupa gambar.");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("Ukuran file melebihi 10MB.");
  }

  await fs.mkdir(KIT_UPLOAD_DIR, { recursive: true });

  const ext = toSafeExt(file.name);
  const fileName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
  const filePath = path.join(KIT_UPLOAD_DIR, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(filePath, buffer);
  return `${PUBLIC_KIT_UPLOAD_PREFIX}${fileName}`;
}

async function saveMerchImageFile(file) {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!file.type?.startsWith("image/")) {
    throw new Error("File harus berupa gambar.");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("Ukuran file melebihi 10MB.");
  }

  await fs.mkdir(MERCH_UPLOAD_DIR, { recursive: true });

  const ext = toSafeExt(file.name);
  const fileName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
  const filePath = path.join(MERCH_UPLOAD_DIR, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(filePath, buffer);
  return `${PUBLIC_MERCH_UPLOAD_PREFIX}${fileName}`;
}

async function saveCatalogPdfFile(file) {
  if (!(file instanceof File) || file.size === 0) return null;

  const fileName = String(file.name || "").toLowerCase();
  const mimeType = String(file.type || "").toLowerCase();
  const isPdf = fileName.endsWith(".pdf") || mimeType === "application/pdf";

  if (!isPdf) {
    throw new Error("File katalog harus berformat PDF.");
  }

  await fs.mkdir(CATALOG_UPLOAD_DIR, { recursive: true });

  const safeName = `${Date.now()}-${crypto.randomUUID()}.pdf`;
  const filePath = path.join(CATALOG_UPLOAD_DIR, safeName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(filePath, buffer);
  return `${PUBLIC_CATALOG_UPLOAD_PREFIX}${safeName}`;
}

function normalizeGalleryRows(rows) {
  return rows.map((row) => ({
    id: Number(row.id),
    image_url: resolveAssetUrl(row.image_url),
    sort_order: Number(row.sort_order || 0),
  }));
}

function mapKitForPublic(row) {
  return {
    id: Number(row.id),
    slug: row.slug,
    title: row.title,
    description: row.description,
    image: resolveAssetUrl(row.hero_image_url),
    gallery: Array.isArray(row.gallery)
      ? row.gallery.map((item) => resolveAssetUrl(item))
      : [],
  };
}

function mapKitForAdmin(row) {
  return {
    id: Number(row.id),
    slug: row.slug,
    title: row.title,
    description: row.description,
    hero_image_url: resolveAssetUrl(row.hero_image_url),
    is_active: Boolean(row.is_active),
    created_at: row.created_at,
    updated_at: row.updated_at,
    gallery: normalizeGalleryRows(row.gallery || []),
  };
}

function mapMerchandiseForAdmin(row) {
  const gallery = normalizeGalleryRows(row.gallery || []);
  return {
    id: Number(row.id),
    slug: row.slug,
    title: row.title,
    detail: row.detail,
    price_amount: Number(row.price_amount || 0),
    min_order: Number(row.min_order || 1),
    weight_gram: Number(row.weight_gram || 0),
    size_options: normalizeStringList(row.size_options),
    material_options: normalizeStringList(row.material_options),
    currency: row.currency,
    image_url: resolveAssetUrl(row.image_url),
    gallery,
    is_active: Boolean(row.is_active),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapMerchandiseForHome(row) {
  const gallery = normalizeStringList(row.gallery);
  return {
    id: Number(row.id),
    slug: row.slug,
    title: row.title,
    description: row.detail,
    price_amount: Number(row.price_amount || 0),
    min_order: Number(row.min_order || 1),
    weight_gram: Number(row.weight_gram || 0),
    size_options: normalizeStringList(row.size_options),
    material_options: normalizeStringList(row.material_options),
    currency: row.currency,
    image: resolveAssetUrl(row.image_url),
    images: [resolveAssetUrl(row.image_url), ...gallery.map((item) => resolveAssetUrl(item))].filter(Boolean),
  };
}

function mapCatalogFileForAdmin(row) {
  return {
    id: Number(row.id),
    title: row.title,
    file_url: resolveAssetUrl(row.file_url),
    file_name: row.file_name,
    mime_type: row.mime_type,
    is_active: Boolean(row.is_active),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function revalidateKitPaths(slug) {
  revalidatePath("/");
  revalidatePath("/admin/catalog");
  revalidatePath("/catalog/[slug]", "page");
  if (slug) {
    revalidatePath(`/catalog/${slug}`);
  }
}

function revalidateMerchandisePaths(slug) {
  revalidatePath("/");
  revalidatePath("/admin/catalog");
  revalidatePath("/merchandise");
  revalidatePath("/merchandise/[slug]", "page");
  if (slug) {
    revalidatePath(`/merchandise/${slug}`);
  }
}

function revalidateCatalogPaths() {
  revalidatePath("/");
  revalidatePath("/admin/catalog");
  revalidatePath("/download-katalog");
}

export async function getAdminCatalogKits() {
  const result = await query(
    `SELECT
       k.id,
       k.slug,
       k.title,
       k.description,
       k.hero_image_url,
       k.is_active,
       k.created_at,
       k.updated_at,
       COALESCE(
         json_agg(
           json_build_object(
             'id', g.id,
             'image_url', g.image_url,
             'sort_order', g.sort_order
           )
           ORDER BY g.sort_order ASC, g.id ASC
         ) FILTER (WHERE g.id IS NOT NULL),
         '[]'::json
       ) AS gallery
     FROM content.kits k
     LEFT JOIN content.kit_gallery_images g ON g.kit_id = k.id
     GROUP BY k.id
     ORDER BY k.updated_at DESC, k.id DESC`,
  );

  return result.rows.map(mapKitForAdmin);
}

export async function getActiveKitsForHome() {
  const result = await query(
    `SELECT
       k.id,
       k.slug,
       k.title,
       k.description,
       k.hero_image_url,
       COALESCE(
         array_agg(g.image_url ORDER BY g.sort_order ASC, g.id ASC)
           FILTER (WHERE g.id IS NOT NULL),
         ARRAY[]::text[]
       ) AS gallery
     FROM content.kits k
     LEFT JOIN content.kit_gallery_images g ON g.kit_id = k.id
     WHERE k.is_active = TRUE
     GROUP BY k.id
     ORDER BY k.updated_at DESC, k.id DESC`,
  );

  return result.rows.map(mapKitForPublic);
}

export async function getAdminMerchandiseItems() {
  const result = await query(
    `SELECT
       m.id,
       m.slug,
       m.title,
       m.detail,
       m.price_amount,
       m.min_order,
       m.weight_gram,
       m.size_options,
       m.material_options,
       m.currency,
       m.image_url,
       m.is_active,
       m.created_at,
       m.updated_at,
       COALESCE(
         json_agg(
           json_build_object(
             'id', g.id,
             'image_url', g.image_url,
             'sort_order', g.sort_order
           )
           ORDER BY g.sort_order ASC, g.id ASC
         ) FILTER (WHERE g.id IS NOT NULL),
         '[]'::json
       ) AS gallery
     FROM content.merchandise_items m
     LEFT JOIN content.merchandise_gallery_images g ON g.merchandise_item_id = m.id
     GROUP BY m.id
     ORDER BY m.updated_at DESC, m.id DESC`,
  );

  return result.rows.map(mapMerchandiseForAdmin);
}

export async function getActiveMerchandiseForHome() {
  const result = await query(
    `SELECT
       m.id,
       m.slug,
       m.title,
       m.detail,
       m.price_amount,
       m.min_order,
       m.weight_gram,
       m.size_options,
       m.material_options,
       m.currency,
       m.image_url,
       COALESCE(
         array_agg(g.image_url ORDER BY g.sort_order ASC, g.id ASC)
           FILTER (WHERE g.id IS NOT NULL),
         ARRAY[]::text[]
       ) AS gallery
     FROM content.merchandise_items m
     LEFT JOIN content.merchandise_gallery_images g ON g.merchandise_item_id = m.id
     WHERE m.is_active = TRUE
     GROUP BY m.id
     ORDER BY  m.updated_at DESC, m.id DESC`,
  );

  return result.rows.map(mapMerchandiseForHome);
}

export async function getMerchandiseDetailBySlug(slug) {
  const result = await query(
    `SELECT
       m.id,
       m.slug,
       m.title,
       m.detail,
       m.price_amount,
       m.min_order,
       m.weight_gram,
       m.size_options,
       m.material_options,
       m.currency,
       m.image_url,
       COALESCE(
         array_agg(g.image_url ORDER BY g.sort_order ASC, g.id ASC)
           FILTER (WHERE g.id IS NOT NULL),
         ARRAY[]::text[]
       ) AS gallery
     FROM content.merchandise_items m
     LEFT JOIN content.merchandise_gallery_images g ON g.merchandise_item_id = m.id
     WHERE m.slug = $1
       AND m.is_active = TRUE
     GROUP BY m.id
     LIMIT 1`,
    [slug],
  );

  if (result.rowCount === 0) return null;
  return mapMerchandiseForHome(result.rows[0]);
}

export async function getAdminCatalogFiles() {
  await requireRole("admin");

  const result = await query(
    `SELECT
       id,
       title,
       file_url,
       file_name,
       mime_type,
       is_active,
       created_at,
       updated_at
     FROM content.catalog_files
     ORDER BY is_active DESC, updated_at DESC, id DESC`,
  );

  return result.rows.map(mapCatalogFileForAdmin);
}

export async function getActiveCatalogFile() {
  const result = await query(
    `SELECT
       id,
       title,
       file_url,
       file_name,
       mime_type,
       is_active,
       created_at,
       updated_at
     FROM content.catalog_files
     WHERE is_active = TRUE
     ORDER BY updated_at DESC, id DESC
     LIMIT 1`,
  );

  if (result.rowCount === 0) return null;
  return mapCatalogFileForAdmin(result.rows[0]);
}

export async function uploadCatalogFileAction(_prevState, formData) {
  await requireRole("admin");

  const title = String(formData.get("title") || "").trim();
  const catalogFile = formData.get("catalogFile");

  if (!(catalogFile instanceof File) || catalogFile.size === 0) {
    return { ok: false, message: "File katalog wajib dipilih." };
  }

  const uploadedUrls = [];
  let currentActiveUrls = [];

  try {
    const fileUrl = await saveCatalogPdfFile(catalogFile);
    uploadedUrls.push(fileUrl);

    const currentActiveResult = await query(
      `SELECT file_url
       FROM content.catalog_files
       WHERE is_active = TRUE`,
    );
    currentActiveUrls = currentActiveResult.rows.map((row) => row.file_url).filter(Boolean);

    await withTransaction(async (client) => {
      await client.query(
        `UPDATE content.catalog_files
         SET is_active = FALSE,
             updated_at = NOW()
         WHERE is_active = TRUE`,
      );

      await client.query(
        `INSERT INTO content.catalog_files (
           title,
           file_url,
           file_name,
           mime_type,
           is_active,
           updated_at
         )
         VALUES ($1, $2, $3, $4, TRUE, NOW())`,
        [
          title || path.parse(catalogFile.name || "").name || "Katalog Produk",
          fileUrl,
          String(catalogFile.name || "").trim() || "catalog.pdf",
          "application/pdf",
        ],
      );
    });

    await deleteFilesBestEffort(currentActiveUrls);
    revalidateCatalogPaths();
    return { ok: true, message: "File katalog berhasil diupload." };
  } catch (error) {
    await deleteFilesBestEffort(uploadedUrls);
    return {
      ok: false,
      message: error?.message || "Gagal upload file katalog.",
    };
  }
}

function sanitizePhoneNumber(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

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
      // Ignore API fallback failures.
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }

  return null;
}

export async function requestCatalogDownloadAction(payload) {
  try {
    const fullName = String(payload?.name || "").trim();
    const email = String(payload?.email || "")
      .trim()
      .toLowerCase();
    const whatsapp = sanitizePhoneNumber(payload?.whatsapp);

    if (!fullName) return { ok: false, message: "Nama wajib diisi." };
    if (!isValidEmail(email)) return { ok: false, message: "Email tidak valid." };
    if (whatsapp.length < 9) return { ok: false, message: "Nomor WhatsApp tidak valid." };

    const activeCatalog = await getActiveCatalogFile();
    if (!activeCatalog?.file_url) {
      return { ok: false, message: "File katalog belum tersedia." };
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
       VALUES ($1, $2, '/download-katalog', 'catalog_download', $3, $4, 'new', $5::inet, $6)`,
      [
        fullName,
        `Request download katalog: ${activeCatalog.title || activeCatalog.file_name || "Katalog"}`,
        whatsapp,
        email,
        detectedIp,
        cityName,
      ],
    );
    return {
      ok: true,
      downloadUrl: activeCatalog.file_url,
      message: "Data Anda berhasil dicatat. Silakan download katalog sekarang.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error?.message || "Gagal memproses permintaan katalog.",
    };
  }
}

export async function getKitDetailBySlug(slug) {
  const result = await query(
    `SELECT
       k.id,
       k.slug,
       k.title,
       k.description,
       k.hero_image_url,
       COALESCE(
         array_agg(g.image_url ORDER BY g.sort_order ASC, g.id ASC)
           FILTER (WHERE g.id IS NOT NULL),
         ARRAY[]::text[]
       ) AS gallery
     FROM content.kits k
     LEFT JOIN content.kit_gallery_images g ON g.kit_id = k.id
     WHERE k.slug = $1
       AND k.is_active = TRUE
     GROUP BY k.id
     LIMIT 1`,
    [slug],
  );

  if (result.rowCount === 0) return null;
  return mapKitForPublic(result.rows[0]);
}

export async function createKitAction(_prevState, formData) {
  const title = String(formData.get("title") || "").trim();
  const rawSlug = String(formData.get("slug") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const isActive = parseBoolean(formData.get("isActive"), true);
  const heroImageFile = formData.get("heroImage");
  const galleryFiles = formData.getAll("galleryImages");

  if (!title) return { ok: false, message: "Judul kit wajib diisi." };
  if (!description) return { ok: false, message: "Deskripsi kit wajib diisi." };

  const slug = toSlug(rawSlug || title);
  if (!slug) return { ok: false, message: "Slug tidak valid." };

  if (!(heroImageFile instanceof File) || heroImageFile.size === 0) {
    return { ok: false, message: "Hero image wajib diisi." };
  }

  const uploadedUrls = [];

  try {
    const heroImageUrl = await saveImageFile(heroImageFile);
    uploadedUrls.push(heroImageUrl);

    const galleryUrls = [];
    for (const file of galleryFiles) {
      if (!(file instanceof File) || file.size === 0) continue;
      const uploaded = await saveImageFile(file);
      galleryUrls.push(uploaded);
      uploadedUrls.push(uploaded);
    }

    await withTransaction(async (client) => {
      const insertKitResult = await client.query(
        `INSERT INTO content.kits (slug, title, description, hero_image_url, is_active, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING id`,
        [slug, title, description, heroImageUrl, isActive],
      );

      const kitId = insertKitResult.rows[0].id;
      for (let index = 0; index < galleryUrls.length; index += 1) {
        await client.query(
          `INSERT INTO content.kit_gallery_images (kit_id, image_url, sort_order)
           VALUES ($1, $2, $3)`,
          [kitId, galleryUrls[index], index + 1],
        );
      }
    });

    revalidateKitPaths(slug);
    return { ok: true, message: "Kit berhasil dibuat." };
  } catch (error) {
    await deleteFilesBestEffort(uploadedUrls);

    if (error?.code === "23505") {
      return { ok: false, message: "Slug sudah digunakan. Gunakan slug lain." };
    }

    return {
      ok: false,
      message: error?.message || "Gagal membuat kit.",
    };
  }
}

export async function updateKitAction(_prevState, formData) {
  const id = Number.parseInt(String(formData.get("id") || ""), 10);
  const title = String(formData.get("title") || "").trim();
  const rawSlug = String(formData.get("slug") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const isActive = parseBoolean(formData.get("isActive"), false);
  const heroImageFile = formData.get("heroImage");
  const galleryFiles = formData.getAll("galleryImages");
  const removeGalleryIds = formData
    .getAll("removeGalleryIds")
    .map((value) => Number.parseInt(String(value), 10))
    .filter((value) => Number.isInteger(value) && value > 0);

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: "ID kit tidak valid." };
  }
  if (!title) return { ok: false, message: "Judul kit wajib diisi." };
  if (!description) return { ok: false, message: "Deskripsi kit wajib diisi." };

  const slug = toSlug(rawSlug || title);
  if (!slug) return { ok: false, message: "Slug tidak valid." };

  const uploadedUrls = [];
  const deletedUrls = [];

  try {
    const currentKitResult = await query(
      `SELECT id, slug, hero_image_url
       FROM content.kits
       WHERE id = $1
       LIMIT 1`,
      [id],
    );

    if (currentKitResult.rowCount === 0) {
      return { ok: false, message: "Kit tidak ditemukan." };
    }

    const currentKit = currentKitResult.rows[0];
    let nextHeroImageUrl = currentKit.hero_image_url;

    if (heroImageFile instanceof File && heroImageFile.size > 0) {
      const uploadedHero = await saveImageFile(heroImageFile);
      uploadedUrls.push(uploadedHero);
      nextHeroImageUrl = uploadedHero;
    }

    const addedGalleryUrls = [];
    for (const file of galleryFiles) {
      if (!(file instanceof File) || file.size === 0) continue;
      const uploaded = await saveImageFile(file);
      addedGalleryUrls.push(uploaded);
      uploadedUrls.push(uploaded);
    }

    await withTransaction(async (client) => {
      await client.query(
        `UPDATE content.kits
         SET slug = $1,
             title = $2,
             description = $3,
             hero_image_url = $4,
             is_active = $5,
             updated_at = NOW()
         WHERE id = $6`,
        [slug, title, description, nextHeroImageUrl, isActive, id],
      );

      if (removeGalleryIds.length > 0) {
        const deletedGalleryResult = await client.query(
          `DELETE FROM content.kit_gallery_images
           WHERE kit_id = $1
             AND id = ANY($2::bigint[])
           RETURNING image_url`,
          [id, removeGalleryIds],
        );
        for (const row of deletedGalleryResult.rows) {
          deletedUrls.push(row.image_url);
        }
      }

      if (addedGalleryUrls.length > 0) {
        const maxSortResult = await client.query(
          `SELECT COALESCE(MAX(sort_order), 0) AS max_sort
           FROM content.kit_gallery_images
           WHERE kit_id = $1`,
          [id],
        );
        let nextSortOrder = Number(maxSortResult.rows[0]?.max_sort || 0);

        for (const imageUrl of addedGalleryUrls) {
          nextSortOrder += 1;
          await client.query(
            `INSERT INTO content.kit_gallery_images (kit_id, image_url, sort_order)
             VALUES ($1, $2, $3)`,
            [id, imageUrl, nextSortOrder],
          );
        }
      }
    });

    if (nextHeroImageUrl !== currentKit.hero_image_url) {
      deletedUrls.push(currentKit.hero_image_url);
    }

    await deleteFilesBestEffort(deletedUrls);
    revalidateKitPaths(slug);
    if (currentKit.slug && currentKit.slug !== slug) {
      revalidatePath(`/catalog/${currentKit.slug}`);
    }

    return { ok: true, message: "Kit berhasil diperbarui." };
  } catch (error) {
    await deleteFilesBestEffort(uploadedUrls);

    if (error?.code === "23505") {
      return { ok: false, message: "Slug sudah digunakan. Gunakan slug lain." };
    }

    return {
      ok: false,
      message: error?.message || "Gagal memperbarui kit.",
    };
  }
}

export async function deleteKitAction(_prevState, formData) {
  const id = Number.parseInt(String(formData.get("id") || ""), 10);
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: "ID kit tidak valid." };
  }

  try {
    const detailResult = await query(
      `SELECT
         k.slug,
         k.hero_image_url,
         COALESCE(
           array_agg(g.image_url ORDER BY g.sort_order ASC, g.id ASC)
             FILTER (WHERE g.id IS NOT NULL),
           ARRAY[]::text[]
         ) AS gallery
       FROM content.kits k
       LEFT JOIN content.kit_gallery_images g ON g.kit_id = k.id
       WHERE k.id = $1
       GROUP BY k.id
       LIMIT 1`,
      [id],
    );

    if (detailResult.rowCount === 0) {
      return { ok: false, message: "Kit tidak ditemukan." };
    }

    const targetKit = detailResult.rows[0];
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM content.kits WHERE id = $1`, [id]);
    });

    const urls = [targetKit.hero_image_url, ...(targetKit.gallery || [])];
    await deleteFilesBestEffort(urls);

    revalidateKitPaths(targetKit.slug);
    return { ok: true, message: "Kit berhasil dihapus." };
  } catch (error) {
    return {
      ok: false,
      message: error?.message || "Gagal menghapus kit.",
    };
  }
}

export async function createMerchandiseAction(_prevState, formData) {
  const title = String(formData.get("title") || "").trim();
  const rawSlug = String(formData.get("slug") || "").trim();
  const detail = String(formData.get("detail") || "").trim();
  const sizeOptions = normalizeStringList(formData.get("sizeOptions"));
  const materialOptions = normalizeStringList(formData.get("materialOptions"));
  const currency = String(formData.get("currency") || "IDR")
    .trim()
    .toUpperCase();
  const priceAmount = Number.parseFloat(
    String(formData.get("priceAmount") || ""),
  );
  const minOrder = Number.parseInt(String(formData.get("minOrder") || ""), 10);
  const isActive = parseBoolean(formData.get("isActive"), true);
  const imageFiles = formData
    .getAll("images")
    .filter((file) => file instanceof File && file.size > 0);

  if (!title) return { ok: false, message: "Judul merchandise wajib diisi." };
  if (!detail) return { ok: false, message: "Detail merchandise wajib diisi." };
  if (!Number.isFinite(priceAmount) || priceAmount < 0) {
    return { ok: false, message: "Harga tidak valid." };
  }
  if (!Number.isInteger(minOrder) || minOrder < 1) {
    return { ok: false, message: "Minimum order tidak valid." };
  }
  if (!/^[A-Z]{3}$/.test(currency)) {
    return { ok: false, message: "Currency harus 3 huruf, contoh: IDR." };
  }

  const slug = toSlug(rawSlug || title);
  if (!slug) return { ok: false, message: "Slug tidak valid." };

  if (imageFiles.length === 0) {
    return { ok: false, message: "Minimal satu gambar merchandise wajib diisi." };
  }

  const uploadedUrls = [];

  try {
    for (const file of imageFiles) {
      const imageUrl = await saveMerchImageFile(file);
      uploadedUrls.push(imageUrl);
    }

    const mainImageUrl = uploadedUrls[0];
    const galleryUrls = uploadedUrls.slice(1);

    await withTransaction(async (client) => {
      const insertedMerchandise = await client.query(
        `INSERT INTO content.merchandise_items (
           slug,
           title,
           detail,
           price_amount,
           min_order,
           weight_gram,
           size_options,
           material_options,
           currency,
           image_url,
           is_active,
           updated_at
         )
         VALUES ($1, $2, $3, $4, $5, 0, $6::text[], $7::text[], $8, $9, $10, NOW())
         RETURNING id`,
        [
          slug,
          title,
          detail,
          priceAmount,
          minOrder,
          sizeOptions,
          materialOptions,
          currency,
          mainImageUrl,
          isActive,
        ],
      );

      const merchandiseId = insertedMerchandise.rows[0].id;
      for (let index = 0; index < galleryUrls.length; index += 1) {
        await client.query(
          `INSERT INTO content.merchandise_gallery_images (merchandise_item_id, image_url, sort_order)
           VALUES ($1, $2, $3)`,
          [merchandiseId, galleryUrls[index], index + 1],
        );
      }
    });

    revalidateMerchandisePaths(slug);
    return { ok: true, message: "Merchandise berhasil dibuat." };
  } catch (error) {
    await deleteFilesBestEffort(uploadedUrls);

    if (error?.code === "23505") {
      return { ok: false, message: "Slug sudah digunakan. Gunakan slug lain." };
    }

    return {
      ok: false,
      message: error?.message || "Gagal membuat merchandise.",
    };
  }
}

export async function updateMerchandiseAction(_prevState, formData) {
  const id = Number.parseInt(String(formData.get("id") || ""), 10);
  const title = String(formData.get("title") || "").trim();
  const rawSlug = String(formData.get("slug") || "").trim();
  const detail = String(formData.get("detail") || "").trim();
  const sizeOptions = normalizeStringList(formData.get("sizeOptions"));
  const materialOptions = normalizeStringList(formData.get("materialOptions"));
  const currency = String(formData.get("currency") || "IDR")
    .trim()
    .toUpperCase();
  const priceAmount = Number.parseFloat(
    String(formData.get("priceAmount") || ""),
  );
  const minOrder = Number.parseInt(String(formData.get("minOrder") || ""), 10);
  const isActive = parseBoolean(formData.get("isActive"), false);
  const primaryImageFile = formData.get("primaryImage");
  const imageFiles = formData
    .getAll("images")
    .filter((file) => file instanceof File && file.size > 0);
  const removeImageIds = formData
    .getAll("removeImageIds")
    .map((value) => Number.parseInt(String(value), 10))
    .filter((value) => Number.isInteger(value) && value > 0);

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: "ID merchandise tidak valid." };
  }
  if (!title) return { ok: false, message: "Judul merchandise wajib diisi." };
  if (!detail) return { ok: false, message: "Detail merchandise wajib diisi." };
  if (!Number.isFinite(priceAmount) || priceAmount < 0) {
    return { ok: false, message: "Harga tidak valid." };
  }
  if (!Number.isInteger(minOrder) || minOrder < 1) {
    return { ok: false, message: "Minimum order tidak valid." };
  }
  if (!/^[A-Z]{3}$/.test(currency)) {
    return { ok: false, message: "Currency harus 3 huruf, contoh: IDR." };
  }

  const slug = toSlug(rawSlug || title);
  if (!slug) return { ok: false, message: "Slug tidak valid." };

  const uploadedUrls = [];
  const deletedUrls = [];

  try {
    const currentResult = await query(
      `SELECT id, slug, image_url
       FROM content.merchandise_items
       WHERE id = $1
       LIMIT 1`,
      [id],
    );

    if (currentResult.rowCount === 0) {
      return { ok: false, message: "Merchandise tidak ditemukan." };
    }

    const current = currentResult.rows[0];
    let nextImageUrl = current.image_url;

    if (primaryImageFile instanceof File && primaryImageFile.size > 0) {
      const uploaded = await saveMerchImageFile(primaryImageFile);
      uploadedUrls.push(uploaded);
      nextImageUrl = uploaded;
    }

    const addedGalleryUrls = [];
    for (const file of imageFiles) {
      const uploaded = await saveMerchImageFile(file);
      addedGalleryUrls.push(uploaded);
      uploadedUrls.push(uploaded);
    }

    await withTransaction(async (client) => {
      await client.query(
        `UPDATE content.merchandise_items
         SET slug = $1,
             title = $2,
             detail = $3,
             price_amount = $4,
             min_order = $5,
             size_options = $6::text[],
             material_options = $7::text[],
             currency = $8,
             image_url = $9,
             is_active = $10,
             updated_at = NOW()
         WHERE id = $11`,
        [
          slug,
          title,
          detail,
          priceAmount,
          minOrder,
          sizeOptions,
          materialOptions,
          currency,
          nextImageUrl,
          isActive,
          id,
        ],
      );

      if (removeImageIds.length > 0) {
        const deletedGalleryResult = await client.query(
          `DELETE FROM content.merchandise_gallery_images
           WHERE merchandise_item_id = $1
             AND id = ANY($2::bigint[])
           RETURNING image_url`,
          [id, removeImageIds],
        );

        for (const row of deletedGalleryResult.rows) {
          deletedUrls.push(row.image_url);
        }
      }

      if (addedGalleryUrls.length > 0) {
        const maxSortResult = await client.query(
          `SELECT COALESCE(MAX(sort_order), 0) AS max_sort
           FROM content.merchandise_gallery_images
           WHERE merchandise_item_id = $1`,
          [id],
        );
        let nextSortOrder = Number(maxSortResult.rows[0]?.max_sort || 0);

        for (const imageUrl of addedGalleryUrls) {
          nextSortOrder += 1;
          await client.query(
            `INSERT INTO content.merchandise_gallery_images (merchandise_item_id, image_url, sort_order)
             VALUES ($1, $2, $3)`,
            [id, imageUrl, nextSortOrder],
          );
        }
      }
    });

    if (nextImageUrl !== current.image_url) {
      deletedUrls.push(current.image_url);
    }

    await deleteFilesBestEffort(deletedUrls);
    revalidateMerchandisePaths(slug);
    if (current.slug && current.slug !== slug) {
      revalidatePath(`/merchandise/${current.slug}`);
    }

    return { ok: true, message: "Merchandise berhasil diperbarui." };
  } catch (error) {
    await deleteFilesBestEffort(uploadedUrls);

    if (error?.code === "23505") {
      return { ok: false, message: "Slug sudah digunakan. Gunakan slug lain." };
    }

    return {
      ok: false,
      message: error?.message || "Gagal memperbarui merchandise.",
    };
  }
}

export async function deleteMerchandiseAction(_prevState, formData) {
  const id = Number.parseInt(String(formData.get("id") || ""), 10);
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: "ID merchandise tidak valid." };
  }

  try {
    const detailResult = await query(
      `SELECT
         m.id,
         m.slug,
         m.image_url,
         COALESCE(
           array_agg(g.image_url ORDER BY g.sort_order ASC, g.id ASC)
             FILTER (WHERE g.id IS NOT NULL),
           ARRAY[]::text[]
         ) AS gallery
       FROM content.merchandise_items m
       LEFT JOIN content.merchandise_gallery_images g ON g.merchandise_item_id = m.id
       WHERE m.id = $1
       GROUP BY m.id
       LIMIT 1`,
      [id],
    );

    if (detailResult.rowCount === 0) {
      return { ok: false, message: "Merchandise tidak ditemukan." };
    }

    const target = detailResult.rows[0];
    await withTransaction(async (client) => {
      await client.query(
        `DELETE FROM content.merchandise_items WHERE id = $1`,
        [id],
      );
    });

    await deleteFilesBestEffort([target.image_url, ...(target.gallery || [])]);
    revalidateMerchandisePaths(target.slug);

    return { ok: true, message: "Merchandise berhasil dihapus." };
  } catch (error) {
    return {
      ok: false,
      message: error?.message || "Gagal menghapus merchandise.",
    };
  }
}
