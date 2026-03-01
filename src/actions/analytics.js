"use server";

import { createHash, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireRole } from "@/actions/auth";
import { query } from "@/config/db";

const SESSION_WINDOW_MINUTES = 30;
const META_GRAPH_API_VERSION = "v22.0";

let metaPixelCache = {
  fetchedAt: 0,
  value: null,
};

function normalizeText(value) {
  const result = String(value || "").trim();
  return result || null;
}

function normalizePath(value, fallback = "/") {
  const text = normalizeText(value);
  if (!text) return fallback;
  return text.startsWith("/") ? text : `/${text}`;
}

function firstHeaderValue(headerStore, key) {
  const value = normalizeText(headerStore.get(key));
  if (!value) return null;
  return value.split(",")[0]?.trim() || null;
}

function normalizeIpCandidate(value) {
  const raw = normalizeText(value);
  if (!raw) return null;

  if (raw.includes(".") && raw.includes(":")) {
    const [ip] = raw.split(":");
    return ip || null;
  }

  return raw;
}

function resolveIp(headerStore) {
  const chain = normalizeText(headerStore.get("x-forwarded-for"));
  const forwardedIp = normalizeIpCandidate(chain?.split(",")[0]);
  if (forwardedIp) {
    return {
      ip: forwardedIp,
      ipSource: "x-forwarded-for",
      forwardedForChain: chain,
    };
  }

  const xRealIp = normalizeIpCandidate(firstHeaderValue(headerStore, "x-real-ip"));
  if (xRealIp) {
    return {
      ip: xRealIp,
      ipSource: "x-real-ip",
      forwardedForChain: null,
    };
  }

  const cfConnectingIp = normalizeIpCandidate(firstHeaderValue(headerStore, "cf-connecting-ip"));
  if (cfConnectingIp) {
    return {
      ip: cfConnectingIp,
      ipSource: "cf-connecting-ip",
      forwardedForChain: null,
    };
  }

  return {
    ip: "0.0.0.0",
    ipSource: "fallback",
    forwardedForChain: null,
  };
}

function detectBot(userAgent) {
  const ua = String(userAgent || "").toLowerCase();
  if (!ua) return false;

  return /(bot|crawler|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegrambot)/i.test(ua);
}

function buildVisitorId({ ip, userAgent, acceptLanguage }) {
  const basis = `${ip || ""}|${userAgent || ""}|${acceptLanguage || ""}`;
  const hash = createHash("sha256").update(basis).digest("hex").slice(0, 32);
  return `v_${hash}`;
}

function parseCookieHeader(cookieHeader) {
  const parsed = {};
  const source = String(cookieHeader || "").trim();
  if (!source) return parsed;

  const chunks = source.split(";");
  for (const chunk of chunks) {
    const [keyPart, ...valuePart] = chunk.split("=");
    const key = String(keyPart || "").trim();
    if (!key) continue;
    parsed[key] = String(valuePart.join("=") || "").trim();
  }

  return parsed;
}

function parseQueryString(input) {
  const source = String(input || "").trim();
  if (!source) return new URLSearchParams();

  const queryOnly = source.startsWith("?") ? source.slice(1) : source;
  return new URLSearchParams(queryOnly);
}

function safeJsonObject(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) return value;

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    } catch {
      // Ignore parse error and fallback to empty object.
    }
  }

  return {};
}

function hashForMeta(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return null;
  return createHash("sha256").update(normalized).digest("hex");
}

function normalizeQueryParam(value) {
  return normalizeText(value);
}

function buildEventSourceUrl(headerStore, routePath, queryString) {
  const host =
    normalizeText(headerStore.get("x-forwarded-host")) ||
    normalizeText(headerStore.get("host")) ||
    "x-alt.id";
  const proto = normalizeText(headerStore.get("x-forwarded-proto")) || "https";
  const safePath = normalizePath(routePath, "/");
  const safeQuery = normalizeText(queryString);
  const queryPart = safeQuery ? (safeQuery.startsWith("?") ? safeQuery : `?${safeQuery}`) : "";

  return `${proto}://${host}${safePath}${queryPart}`;
}

async function getMetaPixelConfig() {
  const now = Date.now();
  if (now - metaPixelCache.fetchedAt < 60_000) {
    return metaPixelCache.value;
  }

  try {
    const result = await query(
      `SELECT public_key, secret_key, environment, additional_config, endpoint_url
       FROM settings.api_integrations
       WHERE provider = 'meta_pixel'
         AND is_active = TRUE
       LIMIT 1`,
    );

    const row = result.rows[0];
    if (!row?.public_key) {
      metaPixelCache = { fetchedAt: now, value: null };
      return null;
    }

    metaPixelCache = {
      fetchedAt: now,
      value: {
        pixelId: String(row.public_key || "").trim(),
        accessToken: String(row.secret_key || "").trim() || null,
        environment: String(row.environment || "production").trim(),
        additionalConfig: safeJsonObject(row.additional_config),
        endpointUrl: String(row.endpoint_url || "").trim() || null,
      },
    };
    return metaPixelCache.value;
  } catch {
    metaPixelCache = { fetchedAt: now, value: null };
    return null;
  }
}

async function sendMetaPageViewEvent({
  visitEventId,
  sessionId,
  visitorId,
  pageType,
  routePath,
  routeSlug,
  queryString,
  ip,
  userAgent,
  eventSourceUrl,
  fbp,
  fbc,
}) {
  const config = await getMetaPixelConfig();
  if (!config?.pixelId || !config?.accessToken) return;

  const eventId = randomUUID();
  const eventTime = Math.floor(Date.now() / 1000);
  const endpoint =
    config.endpointUrl ||
    `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${encodeURIComponent(config.pixelId)}/events`;
  const testEventCode = normalizeText(config.additionalConfig?.test_event_code);

  const payload = {
    data: [
      {
        event_name: "PageView",
        event_time: eventTime,
        event_id: eventId,
        action_source: "website",
        event_source_url: eventSourceUrl,
        user_data: {
          client_ip_address: ip,
          client_user_agent: userAgent || undefined,
          fbp: fbp || undefined,
          fbc: fbc || undefined,
          external_id: hashForMeta(visitorId) || undefined,
        },
        custom_data: {
          page_type: pageType || "other",
          route_path: routePath || "/",
          route_slug: routeSlug || undefined,
          query_string: queryString || undefined,
        },
      },
    ],
    access_token: config.accessToken,
  };

  if (config.environment === "sandbox" && testEventCode) {
    payload.test_event_code = testEventCode;
  }

  let responseStatus = null;
  let responseBody = null;
  let isSuccess = false;
  let errorMessage = null;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    responseStatus = response.status;

    try {
      responseBody = await response.json();
    } catch {
      responseBody = null;
    }

    isSuccess = response.ok && !responseBody?.error;
    if (!isSuccess) {
      errorMessage = normalizeText(responseBody?.error?.message) || `Meta API request failed (${response.status})`;
    }
  } catch (error) {
    errorMessage = normalizeText(error?.message) || "Meta API request failed";
  }

  try {
    await query(
      `INSERT INTO analytics.meta_pixel_events (
         visit_event_id,
         session_id,
         event_name,
         event_id,
         pixel_id,
         request_payload,
         response_status,
         response_body,
         is_success,
         error_message,
         created_at
       )
       VALUES ($1, $2::UUID, 'PageView', $3::UUID, $4, $5::jsonb, $6, $7::jsonb, $8, $9, NOW())`,
      [
        visitEventId,
        sessionId,
        eventId,
        config.pixelId,
        JSON.stringify(payload),
        responseStatus,
        responseBody ? JSON.stringify(responseBody) : null,
        isSuccess,
        errorMessage,
      ],
    );
  } catch {
    // Keep analytics resilient if log table is not migrated yet.
  }
}

export async function trackVisitorPageView({
  pageType,
  routePath,
  routeSlug = null,
  queryString = null,
  responseStatus = 200,
  requestMethod = "GET",
} = {}) {
  try {
    const headerStore = await headers();
    const normalizedPageType = normalizeText(pageType) || "other";
    const normalizedRoutePath = normalizePath(routePath, "/");
    const normalizedRouteSlug = normalizeText(routeSlug);
    const normalizedQueryString = normalizeText(queryString);
    const normalizedMethod = normalizeText(requestMethod) || "GET";
    const safeResponseStatus = Number.isInteger(responseStatus) ? responseStatus : null;

    const userAgent = normalizeText(headerStore.get("user-agent"));
    const acceptLanguage = normalizeText(headerStore.get("accept-language"));
    const referrer = normalizeText(headerStore.get("referer"));
    const cookieMap = parseCookieHeader(headerStore.get("cookie"));
    const normalizedFbp = normalizeText(cookieMap._fbp);
    const normalizedFbc = normalizeText(cookieMap._fbc);
    const parsedQuery = parseQueryString(normalizedQueryString);
    const fbclid = normalizeQueryParam(parsedQuery.get("fbclid"));
    const utmSource = normalizeQueryParam(parsedQuery.get("utm_source"));
    const utmMedium = normalizeQueryParam(parsedQuery.get("utm_medium"));
    const utmCampaign = normalizeQueryParam(parsedQuery.get("utm_campaign"));
    const utmTerm = normalizeQueryParam(parsedQuery.get("utm_term"));
    const utmContent = normalizeQueryParam(parsedQuery.get("utm_content"));
    const computedFbc = normalizedFbc || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : null);
    const { ip, ipSource, forwardedForChain } = resolveIp(headerStore);
    const visitorId = buildVisitorId({ ip, userAgent, acceptLanguage });
    const isBot = detectBot(userAgent);
    const eventSourceUrl = buildEventSourceUrl(headerStore, normalizedRoutePath, normalizedQueryString);

    const existingSessionResult = await query(
      `SELECT session_id
       FROM analytics.visitor_sessions
       WHERE visitor_id = $1
         AND last_seen_at >= NOW() - ($2::TEXT || ' minutes')::INTERVAL
       ORDER BY last_seen_at DESC
       LIMIT 1`,
      [visitorId, String(SESSION_WINDOW_MINUTES)],
    );

    const sessionId = existingSessionResult.rows[0]?.session_id || randomUUID();

    await query(
      `INSERT INTO analytics.visitor_sessions (
         session_id,
         visitor_id,
         first_seen_at,
         last_seen_at,
         landing_path,
         entry_referrer,
         first_ip,
         last_ip,
         user_agent,
         accept_language,
         is_bot,
         pageview_count,
         created_at,
         updated_at
       )
       VALUES (
         $1::UUID,
         $2,
         NOW(),
         NOW(),
         $3,
         $4,
         $5::INET,
         $5::INET,
         $6,
         $7,
         $8,
         1,
         NOW(),
         NOW()
       )
       ON CONFLICT (session_id)
       DO UPDATE SET
         last_seen_at = NOW(),
         last_ip = EXCLUDED.last_ip,
         user_agent = COALESCE(EXCLUDED.user_agent, analytics.visitor_sessions.user_agent),
         accept_language = COALESCE(EXCLUDED.accept_language, analytics.visitor_sessions.accept_language),
         is_bot = analytics.visitor_sessions.is_bot OR EXCLUDED.is_bot,
         pageview_count = analytics.visitor_sessions.pageview_count + 1,
         updated_at = NOW()`,
      [
        sessionId,
        visitorId,
        normalizedRoutePath,
        referrer,
        ip,
        userAgent,
        acceptLanguage,
        isBot,
      ],
    );

    const visitEventResult = await query(
      `INSERT INTO analytics.visit_events (
         session_id,
         visitor_id,
         occurred_at,
         page_type,
         route_path,
         route_slug,
         query_string,
         referrer,
         request_method,
         response_status,
         real_ip,
         ip_source,
         forwarded_for_chain,
         user_agent,
         accept_language,
         fbp,
         fbc,
         fbclid,
         utm_source,
         utm_medium,
         utm_campaign,
         utm_term,
         utm_content,
         created_at
       )
       VALUES (
         $1::UUID,
         $2,
         NOW(),
         $3,
         $4,
         $5,
         $6,
         $7,
         $8,
         $9,
         $10::INET,
         $11,
         $12,
         $13,
         $14,
         $15,
         $16,
         $17,
         $18,
         $19,
         $20,
         $21,
         $22,
         NOW()
       )
       RETURNING id`,
      [
        sessionId,
        visitorId,
        normalizedPageType,
        normalizedRoutePath,
        normalizedRouteSlug,
        normalizedQueryString,
        referrer,
        normalizedMethod,
        safeResponseStatus,
        ip,
        ipSource,
        forwardedForChain,
        userAgent,
        acceptLanguage,
        normalizedFbp,
        computedFbc,
        fbclid,
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        utmContent,
      ],
    );

    const visitEventId = Number(visitEventResult.rows?.[0]?.id || 0) || null;

    if (!isBot) {
      await sendMetaPageViewEvent({
        visitEventId,
        sessionId,
        visitorId,
        pageType: normalizedPageType,
        routePath: normalizedRoutePath,
        routeSlug: normalizedRouteSlug,
        queryString: normalizedQueryString,
        ip,
        userAgent,
        eventSourceUrl,
        fbp: normalizedFbp,
        fbc: computedFbc,
      });
    }
  } catch {
    // Keep page rendering resilient when analytics insert fails.
  }
}

function toInt(value) {
  return Number.parseInt(value, 10) || 0;
}

function toSafeLimit(value, fallback = 30) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(Math.max(parsed, 1), 200);
}

function toSafePage(value, fallback = 1) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.max(parsed, 1);
}

export async function getAdminAnalyticsData(input = {}) {
  await requireRole("admin");

  const leadLimit = toSafeLimit(input?.leadLimit, 10);
  const eventLimit = toSafeLimit(input?.eventLimit, 10);
  const leadPage = toSafePage(input?.leadPage, 1);
  const leadOffset = (leadPage - 1) * leadLimit;

  const [statsResult, leadsResult, visitEventsResult, leadStatusResult, topRouteResult] =
    await Promise.all([
      query(
        `SELECT
           (SELECT COUNT(*) FROM sales.contact_leads) AS leads_total,
           (SELECT COUNT(*) FROM sales.contact_leads WHERE created_at >= date_trunc('day', NOW())) AS leads_today,
           (SELECT COUNT(*) FROM analytics.visitor_sessions) AS visitor_sessions_total,
           (SELECT COUNT(*) FROM analytics.visitor_sessions WHERE first_seen_at >= date_trunc('day', NOW())) AS visitor_sessions_today,
           (SELECT COUNT(*) FROM analytics.visit_events) AS visit_events_total,
           (SELECT COUNT(*) FROM analytics.visit_events WHERE occurred_at >= date_trunc('day', NOW())) AS visit_events_today`,
      ),
      query(
        `SELECT
           id,
           name,
           email,
           phone,
           source_page,
           channel,
           status,
           real_ip,
           city_name,
           created_at
         FROM sales.contact_leads
         ORDER BY created_at DESC
         LIMIT $1
         OFFSET $2`,
        [leadLimit, leadOffset],
      ),
      query(
        `SELECT
           page_type,
           route_path,
           COUNT(*)::INT AS total,
           MAX(occurred_at) AS last_occurred_at
         FROM analytics.visit_events
         GROUP BY page_type, route_path
         ORDER BY total DESC, last_occurred_at DESC
         LIMIT $1`,
        [eventLimit],
      ),
      query(
        `SELECT status, COUNT(*)::INT AS total
         FROM sales.contact_leads
         GROUP BY status
         ORDER BY total DESC, status ASC`,
      ),
      query(
        `SELECT route_path, COUNT(*)::INT AS total
         FROM analytics.visit_events
         GROUP BY route_path
         ORDER BY total DESC, route_path ASC
         LIMIT 10`,
      ),
    ]);

  const stats = statsResult.rows[0] || {};
  const totalLeads = toInt(stats.leads_total);
  const totalLeadPages = Math.max(Math.ceil(totalLeads / leadLimit), 1);

  return {
    stats: {
      leadsTotal: totalLeads,
      leadsToday: toInt(stats.leads_today),
      visitorSessionsTotal: toInt(stats.visitor_sessions_total),
      visitorSessionsToday: toInt(stats.visitor_sessions_today),
      visitEventsTotal: toInt(stats.visit_events_total),
      visitEventsToday: toInt(stats.visit_events_today),
    },
    leads: leadsResult.rows,
    visitEvents: visitEventsResult.rows,
    leadByStatus: leadStatusResult.rows.map((row) => ({
      status: row.status || "unknown",
      total: toInt(row.total),
    })),
    topRoutes: topRouteResult.rows.map((row) => ({
      route_path: row.route_path || "/",
      total: toInt(row.total),
    })),
    leadPagination: {
      page: leadPage,
      pageSize: leadLimit,
      total: totalLeads,
      totalPages: totalLeadPages,
      hasPrev: leadPage > 1,
      hasNext: leadPage < totalLeadPages,
    },
  };
}

export async function deleteAdminLeadAction(formDataOrState, maybeFormData) {
  await requireRole("admin");

  const formData =
    maybeFormData && typeof maybeFormData.get === "function" ? maybeFormData : formDataOrState;

  const leadId = Number.parseInt(String(formData.get("lead_id") || ""), 10);
  if (!Number.isInteger(leadId) || leadId <= 0) {
    return { ok: false, message: "ID lead tidak valid." };
  }

  try {
    const result = await query(
      `DELETE FROM sales.contact_leads
       WHERE id = $1
       RETURNING id`,
      [leadId],
    );

    if (result.rowCount === 0) {
      return { ok: false, message: "Lead tidak ditemukan atau sudah dihapus." };
    }

    revalidatePath("/admin/analytic");
    revalidatePath("/admin/dashboard");

    return { ok: true, message: "Lead berhasil dihapus." };
  } catch (error) {
    return { ok: false, message: error?.message || "Gagal menghapus lead." };
  }
}
