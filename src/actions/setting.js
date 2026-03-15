"use server";

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { query } from "@/config/db";
import { resolveAssetUrl } from "@/utils/media";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const SETTINGS_UPLOAD_PREFIX = "/uploads/settings/";
const LEGACY_SETTINGS_UPLOAD_PREFIX = "/public/uploads/settings/";
const SETTINGS_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "settings");

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeObject(value) {
  if (!value) return {};
  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function mapWebsiteConfig(row) {
  if (!row) return null;

  return {
    id: Number(row.id),
    site_name: row.site_name || "",
    site_tagline: row.site_tagline || "",
    logo_url: resolveAssetUrl(row.logo_url),
    favicon_url: resolveAssetUrl(row.favicon_url),
    hero_title: row.hero_title || "",
    hero_description: row.hero_description || "",
    hero_note: row.hero_note || "",
    hero_image_url: resolveAssetUrl(row.hero_image_url),
    hero_badge_title: row.hero_badge_title || "",
    hero_badge_text: row.hero_badge_text || "",
    default_language: row.default_language || "id",
    app_url: row.app_url || "",
    support_email: row.support_email || "",
    support_phone: row.support_phone || "",
    whatsapp_number: row.whatsapp_number || "",
    instagram_url: row.instagram_url || "",
    linkedin_url: row.linkedin_url || "",
    updated_at: row.updated_at,
  };
}

function mapSeoMetadata(row) {
  return {
    id: Number(row.id),
    page_key: row.page_key,
    page_path: row.page_path,
    meta_title: row.meta_title,
    meta_description: row.meta_description,
    meta_keywords: normalizeArray(row.meta_keywords),
    canonical_url: row.canonical_url || "",
    robots_index: Boolean(row.robots_index),
    robots_follow: Boolean(row.robots_follow),
    og_title: row.og_title || "",
    og_description: row.og_description || "",
    og_image_url: row.og_image_url || "",
    og_type: row.og_type || "website",
    twitter_card: row.twitter_card || "summary_large_image",
    twitter_title: row.twitter_title || "",
    twitter_description: row.twitter_description || "",
    twitter_image_url: row.twitter_image_url || "",
    updated_at: row.updated_at,
  };
}

function mapApiIntegration(row) {
  return {
    id: Number(row.id),
    provider: row.provider,
    display_name: row.display_name,
    environment: row.environment,
    is_active: Boolean(row.is_active),
    public_key: row.public_key || "",
    secret_key: row.secret_key || "",
    merchant_id: row.merchant_id || "",
    endpoint_url: row.endpoint_url || "",
    additional_config: normalizeObject(row.additional_config),
    last_tested_at: row.last_tested_at,
    updated_at: row.updated_at,
  };
}

function mapSmtpConfig(row) {
  if (!row) return null;

  return {
    id: Number(row.id),
    provider: row.provider || "smtp",
    host: row.host || "",
    port: Number(row.port || 0),
    secure: Boolean(row.secure),
    encryption: row.encryption || "tls",
    username: row.username || "",
    password: row.password || "",
    from_name: row.from_name || "",
    from_email: row.from_email || "",
    reply_to_email: row.reply_to_email || "",
    is_active: Boolean(row.is_active),
    last_tested_at: row.last_tested_at,
    updated_at: row.updated_at,
  };
}

function mapTrustedLogo(row) {
  return {
    id: Number(row.id),
    brand_name: row.brand_name || "",
    logo_url: resolveAssetUrl(row.logo_url),
    sort_order: Number(row.sort_order || 0),
    is_active: Boolean(row.is_active),
  };
}

function mapFaq(row) {
  return {
    id: Number(row.id),
    question: row.question || "",
    answer: row.answer || "",
    sort_order: Number(row.sort_order || 0),
    is_active: Boolean(row.is_active),
    updated_at: row.updated_at,
  };
}

function mapTestimonial(row) {
  return {
    id: Number(row.id),
    client_name: row.client_name || "",
    title: row.title || "",
    quote: row.quote || "",
    link_url: row.link_url || "",
    rating: Number(row.rating || 5),
    sort_order: Number(row.sort_order || 0),
    is_active: Boolean(row.is_active),
    updated_at: row.updated_at,
  };
}

function parseBoolean(value, defaultValue = false) {
  if (value == null) return defaultValue;
  const normalized = String(value).toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "on";
}

function toInt(value, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(parsed) ? parsed : fallback;
}

function normalizeKeywords(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toSafeExt(fileName = "") {
  const ext = path.extname(fileName).toLowerCase();
  if (!ext) return ".png";
  return ext.replace(/[^.a-z0-9]/g, "") || ".png";
}

function isLocalUploadUrl(url) {
  if (typeof url !== "string") return false;
  return (
    url.startsWith(SETTINGS_UPLOAD_PREFIX) ||
    url.startsWith(LEGACY_SETTINGS_UPLOAD_PREFIX)
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

async function saveSettingImageFile(file) {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!file.type?.startsWith("image/")) {
    throw new Error("File harus berupa gambar.");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("Ukuran file melebihi 5MB.");
  }

  await fs.mkdir(SETTINGS_UPLOAD_DIR, { recursive: true });

  const ext = toSafeExt(file.name);
  const fileName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
  const filePath = path.join(SETTINGS_UPLOAD_DIR, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(filePath, buffer);
  return `${SETTINGS_UPLOAD_PREFIX}${fileName}`;
}

function revalidateSettingPaths() {
  revalidatePath("/admin/setting");
}

function revalidateHomePaths() {
  revalidatePath("/");
  revalidatePath("/admin/setting");
}

export async function getWebsiteBranding() {
  const result = await query(
    `SELECT
       site_name,
       app_url,
       logo_url,
       favicon_url,
       site_tagline,
       hero_title,
       hero_description,
       hero_note,
       hero_image_url,
       hero_badge_title,
       hero_badge_text,
       whatsapp_number,
       support_email,
       instagram_url,
       linkedin_url
     FROM settings.website_config
     WHERE id = 1
     LIMIT 1`,
  );

  const row = result.rows[0] || {};
  return {
    site_name: row.site_name || "X-ALT",
    app_url: row.app_url || "",
    logo_url: resolveAssetUrl(row.logo_url),
    favicon_url: resolveAssetUrl(row.favicon_url),
    site_tagline: row.site_tagline || "",
    hero_title: row.hero_title || "",
    hero_description: row.hero_description || "",
    hero_note: row.hero_note || "",
    hero_image_url: resolveAssetUrl(row.hero_image_url),
    hero_badge_title: row.hero_badge_title || "",
    hero_badge_text: row.hero_badge_text || "",
    whatsapp_number: row.whatsapp_number || "",
    support_email: row.support_email || "",
    instagram_url: row.instagram_url || "",
    linkedin_url: row.linkedin_url || "",
  };
}

export async function getTrustedLogos() {
  const result = await query(
    `SELECT
       id,
       brand_name,
       logo_url,
       sort_order,
       is_active
     FROM content.trusted_logos
     WHERE is_active = TRUE
     ORDER BY sort_order ASC, id ASC`,
  );

  return result.rows.map(mapTrustedLogo);
}

export async function getAdminSettingsData() {
  const [websiteResult, seoResult, integrationResult, smtpResult, trustedLogoResult, faqResult, testimonialResult] =
    await Promise.all([
      query(
        `SELECT
           id,
           site_name,
           site_tagline,
           app_url,
           logo_url,
           favicon_url,
           hero_title,
           hero_description,
           hero_note,
           hero_image_url,
           hero_badge_title,
           hero_badge_text,
           default_language,
           support_email,
           support_phone,
           whatsapp_number,
           instagram_url,
           linkedin_url,
           updated_at
         FROM settings.website_config
         WHERE id = 1
         LIMIT 1`,
      ),
      query(
        `SELECT
           id,
           page_key,
           page_path,
           meta_title,
           meta_description,
           meta_keywords,
           canonical_url,
           robots_index,
           robots_follow,
           og_title,
           og_description,
           og_image_url,
           og_type,
           twitter_card,
           twitter_title,
           twitter_description,
           twitter_image_url,
           updated_at
         FROM settings.seo_metadata
         ORDER BY updated_at DESC, id DESC`,
      ),
      query(
        `SELECT
           id,
           provider,
           display_name,
           environment,
           is_active,
           public_key,
           secret_key,
           merchant_id,
           endpoint_url,
           additional_config,
           last_tested_at,
           updated_at
         FROM settings.api_integrations
         ORDER BY display_name ASC`,
      ),
      query(
        `SELECT
           id,
           provider,
           host,
           port,
           secure,
           encryption,
           username,
           password,
           from_name,
           from_email,
           reply_to_email,
           is_active,
           last_tested_at,
           updated_at
         FROM settings.smtp_config
         WHERE id = 1
         LIMIT 1`,
      ),
      query(
        `SELECT
           id,
           brand_name,
           logo_url,
           sort_order,
           is_active
         FROM content.trusted_logos
         ORDER BY sort_order ASC, id ASC`,
      ),
      query(
        `SELECT
           id,
           question,
           answer,
           sort_order,
           is_active,
           updated_at
         FROM content.faqs
         ORDER BY sort_order ASC, id ASC`,
      ),
      query(
        `SELECT
           id,
           client_name,
           title,
           quote,
           link_url,
           rating,
           sort_order,
           is_active,
           updated_at
         FROM content.testimonials
         ORDER BY sort_order ASC, id ASC`,
      ),
    ]);

  return {
    websiteConfig: mapWebsiteConfig(websiteResult.rows[0]),
    seoMetadata: seoResult.rows.map(mapSeoMetadata),
    apiIntegrations: integrationResult.rows.map(mapApiIntegration),
    smtpConfig: mapSmtpConfig(smtpResult.rows[0]),
    trustedLogos: trustedLogoResult.rows.map(mapTrustedLogo),
    faqs: faqResult.rows.map(mapFaq),
    testimonials: testimonialResult.rows.map(mapTestimonial),
  };
}

export async function updateWebsiteConfigAction(_prevState, formData) {
  const siteName = String(formData.get("site_name") || "").trim();
  const siteTagline = String(formData.get("site_tagline") || "").trim();
  const appUrl = String(formData.get("app_url") || "").trim();
  const heroTitle = String(formData.get("hero_title") || "").trim();
  const heroDescription = String(formData.get("hero_description") || "").trim();
  const heroNote = String(formData.get("hero_note") || "").trim();
  const heroImageFile = formData.get("hero_image_file");
  const heroBadgeTitle = String(formData.get("hero_badge_title") || "").trim();
  const heroBadgeText = String(formData.get("hero_badge_text") || "").trim();
  const defaultLanguage = String(formData.get("default_language") || "id").trim();
  const supportEmail = String(formData.get("support_email") || "").trim();
  const supportPhone = String(formData.get("support_phone") || "").trim();
  const whatsappNumber = String(formData.get("whatsapp_number") || "").trim();
  const instagramUrl = String(formData.get("instagram_url") || "").trim();
  const linkedinUrl = String(formData.get("linkedin_url") || "").trim();
  const logoFile = formData.get("logo_file");
  const faviconFile = formData.get("favicon_file");

  if (!siteName) {
    return { ok: false, message: "Site name wajib diisi." };
  }
  if (!defaultLanguage) {
    return { ok: false, message: "Default language wajib diisi." };
  }
  if (appUrl) {
    try {
      const parsed = new URL(appUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return { ok: false, message: "App URL harus diawali http:// atau https://." };
      }
    } catch {
      return { ok: false, message: "Format App URL tidak valid." };
    }
  }
  if (instagramUrl) {
    try {
      const parsed = new URL(instagramUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return { ok: false, message: "Instagram URL harus diawali http:// atau https://." };
      }
    } catch {
      return { ok: false, message: "Format Instagram URL tidak valid." };
    }
  }
  if (linkedinUrl) {
    try {
      const parsed = new URL(linkedinUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return { ok: false, message: "LinkedIn URL harus diawali http:// atau https://." };
      }
    } catch {
      return { ok: false, message: "Format LinkedIn URL tidak valid." };
    }
  }

  const uploadedUrls = [];

  try {
    const currentResult = await query(
      `SELECT logo_url, favicon_url, hero_image_url
       FROM settings.website_config
       WHERE id = 1
       LIMIT 1`,
    );

    const current = currentResult.rows[0] || {};
    let nextLogoUrl = current.logo_url || null;
    let nextFaviconUrl = current.favicon_url || null;
    let nextHeroImageUrl = current.hero_image_url || null;

    if (logoFile instanceof File && logoFile.size > 0) {
      nextLogoUrl = await saveSettingImageFile(logoFile);
      uploadedUrls.push(nextLogoUrl);
    }

    if (faviconFile instanceof File && faviconFile.size > 0) {
      nextFaviconUrl = await saveSettingImageFile(faviconFile);
      uploadedUrls.push(nextFaviconUrl);
    }

    if (heroImageFile instanceof File && heroImageFile.size > 0) {
      nextHeroImageUrl = await saveSettingImageFile(heroImageFile);
      uploadedUrls.push(nextHeroImageUrl);
    }

    await query(
      `UPDATE settings.website_config
       SET site_name = $1,
           site_tagline = $2,
           app_url = $3,
           logo_url = $4,
           favicon_url = $5,
           hero_title = $6,
           hero_description = $7,
           hero_note = $8,
           hero_image_url = $9,
           hero_badge_title = $10,
           hero_badge_text = $11,
           default_language = $12,
           support_email = $13,
           support_phone = $14,
           whatsapp_number = $15,
           instagram_url = $16,
           linkedin_url = $17,
           updated_at = NOW()
       WHERE id = 1`,
      [
        siteName,
        siteTagline || null,
        appUrl || null,
        nextLogoUrl,
        nextFaviconUrl,
        heroTitle || null,
        heroDescription || null,
        heroNote || null,
        nextHeroImageUrl,
        heroBadgeTitle || null,
        heroBadgeText || null,
        defaultLanguage,
        supportEmail || null,
        supportPhone || null,
        whatsappNumber || null,
        instagramUrl || null,
        linkedinUrl || null,
      ],
    );

    if (current.logo_url && nextLogoUrl !== current.logo_url) {
      await deleteFileIfExists(current.logo_url);
    }
    if (current.favicon_url && nextFaviconUrl !== current.favicon_url) {
      await deleteFileIfExists(current.favicon_url);
    }
    if (current.hero_image_url && nextHeroImageUrl !== current.hero_image_url) {
      await deleteFileIfExists(current.hero_image_url);
    }

    revalidateHomePaths();
    return { ok: true, message: "Website config berhasil diperbarui." };
  } catch (error) {
    for (const url of uploadedUrls) {
      await deleteFileIfExists(url);
    }
    return { ok: false, message: error?.message || "Gagal memperbarui website config." };
  }
}

export async function addTrustedLogoAction(_prevState, formData) {
  const brandName = String(formData.get("trusted_brand_name") || "").trim();
  const logoFile = formData.get("trusted_logo_file");

  if (!brandName) {
    return { ok: false, message: "Nama brand wajib diisi." };
  }
  if (!(logoFile instanceof File) || logoFile.size === 0) {
    return { ok: false, message: "Logo wajib diunggah." };
  }

  const uploadedUrls = [];

  try {
    const logoUrl = await saveSettingImageFile(logoFile);
    if (!logoUrl) {
      return { ok: false, message: "Logo gagal diunggah." };
    }
    uploadedUrls.push(logoUrl);

    const sortResult = await query(
      `SELECT COALESCE(MAX(sort_order), 0) AS max_sort
       FROM content.trusted_logos`,
    );

    const nextSort = Number(sortResult.rows[0]?.max_sort || 0) + 1;

    await query(
      `INSERT INTO content.trusted_logos
       (brand_name, logo_url, sort_order, is_active, updated_at)
       VALUES ($1, $2, $3, TRUE, NOW())`,
      [brandName, logoUrl, nextSort],
    );

    revalidateHomePaths();
    return { ok: true, message: "Logo trusted company berhasil ditambahkan." };
  } catch (error) {
    for (const url of uploadedUrls) {
      await deleteFileIfExists(url);
    }
    return { ok: false, message: error?.message || "Gagal menambahkan logo." };
  }
}

export async function updateTrustedLogoAction(_prevState, formData) {
  const id = toInt(formData.get("trusted_logo_id"), 0);
  const brandName = String(formData.get("trusted_brand_name") || "").trim();
  const sortOrderRaw = toInt(formData.get("trusted_sort_order"), 0);
  const sortOrder = sortOrderRaw < 0 ? 0 : sortOrderRaw;
  const isActive = parseBoolean(formData.get("trusted_is_active"), false);
  const logoFile = formData.get("trusted_logo_file");

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: "ID logo tidak valid." };
  }
  if (!brandName) {
    return { ok: false, message: "Nama brand wajib diisi." };
  }

  const uploadedUrls = [];

  try {
    const currentResult = await query(
      `SELECT logo_url
       FROM content.trusted_logos
       WHERE id = $1
       LIMIT 1`,
      [id],
    );

    if (currentResult.rowCount === 0) {
      return { ok: false, message: "Logo tidak ditemukan." };
    }

    const currentLogoUrl = currentResult.rows[0].logo_url || null;
    let nextLogoUrl = currentLogoUrl;

    if (logoFile instanceof File && logoFile.size > 0) {
      nextLogoUrl = await saveSettingImageFile(logoFile);
      uploadedUrls.push(nextLogoUrl);
    }

    await query(
      `UPDATE content.trusted_logos
       SET brand_name = $1,
           logo_url = $2,
           sort_order = $3,
           is_active = $4,
           updated_at = NOW()
       WHERE id = $5`,
      [brandName, nextLogoUrl, sortOrder, isActive, id],
    );

    if (currentLogoUrl && nextLogoUrl !== currentLogoUrl) {
      await deleteFileIfExists(currentLogoUrl);
    }

    revalidateHomePaths();
    return { ok: true, message: "Logo trusted company berhasil diperbarui." };
  } catch (error) {
    for (const url of uploadedUrls) {
      await deleteFileIfExists(url);
    }
    return { ok: false, message: error?.message || "Gagal memperbarui logo." };
  }
}

export async function deleteTrustedLogoAction(_prevState, formData) {
  const id = toInt(formData.get("trusted_logo_id"), 0);

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: "ID logo tidak valid." };
  }

  try {
    const currentResult = await query(
      `SELECT logo_url
       FROM content.trusted_logos
       WHERE id = $1
       LIMIT 1`,
      [id],
    );

    if (currentResult.rowCount === 0) {
      return { ok: false, message: "Logo tidak ditemukan." };
    }

    const currentLogoUrl = currentResult.rows[0].logo_url || null;

    await query(
      `DELETE FROM content.trusted_logos
       WHERE id = $1`,
      [id],
    );

    if (currentLogoUrl) {
      await deleteFileIfExists(currentLogoUrl);
    }

    revalidateHomePaths();
    return { ok: true, message: "Logo trusted company berhasil dihapus." };
  } catch (error) {
    return { ok: false, message: error?.message || "Gagal menghapus logo." };
  }
}

export async function updateSeoMetadataAction(_prevState, formData) {
  const id = toInt(formData.get("id"), 0);
  const pagePath = String(formData.get("page_path") || "").trim();
  const metaTitle = String(formData.get("meta_title") || "").trim();
  const metaDescription = String(formData.get("meta_description") || "").trim();
  const keywordsRaw = String(formData.get("meta_keywords") || "");
  const canonicalUrl = String(formData.get("canonical_url") || "").trim();
  const robotsIndex = parseBoolean(formData.get("robots_index"), false);
  const robotsFollow = parseBoolean(formData.get("robots_follow"), false);
  const ogTitle = String(formData.get("og_title") || "").trim();
  const ogDescription = String(formData.get("og_description") || "").trim();
  const ogImageUrl = String(formData.get("og_image_url") || "").trim();
  const ogType = String(formData.get("og_type") || "website").trim();
  const twitterCard = String(formData.get("twitter_card") || "summary_large_image").trim();
  const twitterTitle = String(formData.get("twitter_title") || "").trim();
  const twitterDescription = String(formData.get("twitter_description") || "").trim();
  const twitterImageUrl = String(formData.get("twitter_image_url") || "").trim();

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: "ID SEO tidak valid." };
  }
  if (!pagePath || !metaTitle || !metaDescription) {
    return { ok: false, message: "Path, meta title, dan meta description wajib diisi." };
  }

  try {
    await query(
      `UPDATE settings.seo_metadata
       SET page_path = $1,
           meta_title = $2,
           meta_description = $3,
           meta_keywords = $4::text[],
           canonical_url = $5,
           robots_index = $6,
           robots_follow = $7,
           og_title = $8,
           og_description = $9,
           og_image_url = $10,
           og_type = $11,
           twitter_card = $12,
           twitter_title = $13,
           twitter_description = $14,
           twitter_image_url = $15,
           updated_at = NOW()
       WHERE id = $16`,
      [
        pagePath,
        metaTitle,
        metaDescription,
        normalizeKeywords(keywordsRaw),
        canonicalUrl || null,
        robotsIndex,
        robotsFollow,
        ogTitle || null,
        ogDescription || null,
        ogImageUrl || null,
        ogType || "website",
        twitterCard || "summary_large_image",
        twitterTitle || null,
        twitterDescription || null,
        twitterImageUrl || null,
        id,
      ],
    );

    revalidateSettingPaths();
    return { ok: true, message: "SEO metadata berhasil diperbarui." };
  } catch (error) {
    return { ok: false, message: error?.message || "Gagal memperbarui SEO metadata." };
  }
}

export async function updateApiIntegrationAction(_prevState, formData) {
  const id = toInt(formData.get("id"), 0);
  const displayName = String(formData.get("display_name") || "").trim();
  const environment = String(formData.get("environment") || "sandbox").trim();
  const isActive = parseBoolean(formData.get("is_active"), false);
  const publicKey = String(formData.get("public_key") || "").trim();
  const secretKey = String(formData.get("secret_key") || "").trim();
  const merchantId = String(formData.get("merchant_id") || "").trim();
  const metaTestEventCode = String(formData.get("meta_test_event_code") || "").trim();
  const providerFromForm = String(formData.get("provider") || "").trim();
  const storeProvinceId = toInt(formData.get("store_province_id"), 0);
  const storeProvinceName = String(formData.get("store_province_name") || "").trim();
  const storeCityId = toInt(formData.get("store_city_id"), 0);
  const storeCityName = String(formData.get("store_city_name") || "").trim();
  const storeDistrictId = toInt(formData.get("store_district_id"), 0);
  const storeDistrictName = String(formData.get("store_district_name") || "").trim();
  const storeSubdistrictId = toInt(formData.get("store_subdistrict_id"), 0);
  const storeSubdistrictName = String(formData.get("store_subdistrict_name") || "").trim();
  const courierJne = parseBoolean(formData.get("courier_jne"), false);
  const courierSap = parseBoolean(formData.get("courier_sap"), false);
  const courierIdExpress = parseBoolean(formData.get("courier_idexpress"), false);
  const courierSiCepat = parseBoolean(formData.get("courier_sicepat"), false);

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: "ID integration tidak valid." };
  }
  if (!displayName) {
    return { ok: false, message: "Display name wajib diisi." };
  }
  if (!["sandbox", "production"].includes(environment)) {
    return { ok: false, message: "Environment harus sandbox atau production." };
  }

  try {
    const providerResult = await query(
      `SELECT provider, additional_config
       FROM settings.api_integrations
       WHERE id = $1
       LIMIT 1`,
      [id],
    );

    if (providerResult.rowCount === 0) {
      return { ok: false, message: "Provider integrasi tidak ditemukan." };
    }

    const provider = providerResult.rows[0].provider;
    const currentAdditionalConfig = normalizeObject(providerResult.rows[0].additional_config);
    if (providerFromForm && providerFromForm !== provider) {
      return { ok: false, message: "Provider tidak valid." };
    }

    let nextPublicKey = null;
    let nextSecretKey = null;
    let nextMerchantId = null;
    let nextEndpointUrl = null;
    let nextAdditionalConfig = { ...currentAdditionalConfig };

    if (provider === "meta_pixel" || provider === "google_ads" || provider === "raja_ongkir") {
      if (!publicKey) {
        const keyLabel = provider === "meta_pixel" ? "Pixel ID" : "API key";
        return { ok: false, message: `${keyLabel} wajib diisi.` };
      }
      nextPublicKey = publicKey;
    }

    if (provider === "meta_pixel") {
      nextSecretKey = secretKey || null;
      nextAdditionalConfig = {
        ...nextAdditionalConfig,
        test_event_code: metaTestEventCode || null,
      };
    }

    if (provider === "midtrans") {
      if (!publicKey || !secretKey || !merchantId) {
        return { ok: false, message: "Public key, secret key, dan merchant ID wajib untuk Midtrans." };
      }
      nextPublicKey = publicKey;
      nextSecretKey = secretKey;
      nextMerchantId = merchantId;
      nextEndpointUrl =
        environment === "production"
          ? "https://app.midtrans.com/snap/v1/transactions"
          : "https://app.sandbox.midtrans.com/snap/v1/transactions";
    }

    if (provider === "raja_ongkir") {
      nextEndpointUrl = "https://rajaongkir.komerce.id/api/v1";
      const selectedCouriers = {
        jne: courierJne,
        sap: courierSap,
        idexpress: courierIdExpress,
        sicepat: courierSiCepat,
      };

      if (
        isActive &&
        (!storeProvinceId || !storeCityId || !storeDistrictId || !storeSubdistrictId)
      ) {
        return {
          ok: false,
          message:
            "Saat RajaOngkir aktif, alamat toko (provinsi, kota, kecamatan, kelurahan) wajib dipilih.",
        };
      }
      if (isActive && !Object.values(selectedCouriers).some(Boolean)) {
        return {
          ok: false,
          message: "Saat RajaOngkir aktif, minimal satu courier harus diaktifkan.",
        };
      }

      nextAdditionalConfig = {
        ...nextAdditionalConfig,
        store_origin: {
          province_id: storeProvinceId || null,
          province_name: storeProvinceName || null,
          city_id: storeCityId || null,
          city_name: storeCityName || null,
          district_id: storeDistrictId || null,
          district_name: storeDistrictName || null,
          subdistrict_id: storeSubdistrictId || null,
          subdistrict_name: storeSubdistrictName || null,
        },
        couriers: selectedCouriers,
      };
    }

    await query(
      `UPDATE settings.api_integrations
       SET display_name = $1,
           environment = $2,
           is_active = $3,
           public_key = $4,
           secret_key = $5,
           merchant_id = $6,
           endpoint_url = $7,
           additional_config = $8::jsonb,
           updated_at = NOW()
       WHERE id = $9`,
      [
        displayName,
        environment,
        isActive,
        nextPublicKey,
        nextSecretKey,
        nextMerchantId,
        nextEndpointUrl,
        JSON.stringify(nextAdditionalConfig),
        id,
      ],
    );

    revalidateSettingPaths();
    return { ok: true, message: "API integration berhasil diperbarui." };
  } catch (error) {
    return { ok: false, message: error?.message || "Gagal memperbarui API integration." };
  }
}

export async function updateSmtpConfigAction(_prevState, formData) {
  const provider = String(formData.get("provider") || "smtp").trim();
  const host = String(formData.get("host") || "").trim();
  const port = toInt(formData.get("port"), 0);
  const encryption = String(formData.get("encryption") || "tls").trim();
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const fromName = String(formData.get("from_name") || "").trim();
  const fromEmail = String(formData.get("from_email") || "").trim();
  const replyToEmail = String(formData.get("reply_to_email") || "").trim();
  const isActive = parseBoolean(formData.get("is_active"), false);

  if (!host) return { ok: false, message: "Host SMTP wajib diisi." };
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return { ok: false, message: "Port SMTP tidak valid." };
  }
  if (!["none", "ssl", "tls"].includes(encryption)) {
    return { ok: false, message: "Encryption harus none, ssl, atau tls." };
  }
  if (encryption === "ssl" && port === 25) {
    return {
      ok: false,
      message: "Port 25 tidak cocok untuk SSL. Gunakan port 465 (SSL) atau ubah encryption ke TLS dengan port 587.",
    };
  }
  if (!fromName || !fromEmail) {
    return { ok: false, message: "From name dan from email wajib diisi." };
  }

  const secure = encryption === "ssl";

  try {
    await query(
      `UPDATE settings.smtp_config
       SET provider = $1,
           host = $2,
           port = $3,
           secure = $4,
           encryption = $5,
           username = $6,
           password = $7,
           from_name = $8,
           from_email = $9,
           reply_to_email = $10,
           is_active = $11,
           updated_at = NOW()
       WHERE id = 1`,
      [
        provider,
        host,
        port,
        secure,
        encryption,
        username || null,
        password || null,
        fromName,
        fromEmail,
        replyToEmail || null,
        isActive,
      ],
    );

    revalidateSettingPaths();
    return { ok: true, message: "SMTP config berhasil diperbarui." };
  } catch (error) {
    return { ok: false, message: error?.message || "Gagal memperbarui SMTP config." };
  }
}
