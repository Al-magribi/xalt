"use server";

import { query } from "@/config/db";

function toInt(value) {
  return Number.parseInt(value, 10) || 0;
}

export async function getAdminDashboardData() {
  const [statsResult, leadsResult] = await Promise.all([
    query(
      `SELECT
         (SELECT COUNT(*) FROM content.kits WHERE is_active = TRUE) AS kits_count,
         (SELECT COUNT(*) FROM content.merchandise_items WHERE is_active = TRUE) AS merchandise_count,
         (SELECT COUNT(*) FROM sales.contact_leads) AS leads_count,
         (SELECT COUNT(*) FROM analytics.visitor_sessions) AS visitor_sessions_count,
         (SELECT COUNT(*) FROM analytics.visit_events) AS visit_events_count`,
    ),
    query(
      `SELECT id, name, email, status, channel, created_at
       FROM sales.contact_leads
       ORDER BY created_at DESC
       LIMIT 5`,
    ),
  ]);

  const statsRow = statsResult.rows[0] || {};

  return {
    stats: {
      kits: toInt(statsRow.kits_count),
      merchandise: toInt(statsRow.merchandise_count),
      leads: toInt(statsRow.leads_count),
      visitorSessions: toInt(statsRow.visitor_sessions_count),
      visitEvents: toInt(statsRow.visit_events_count),
    },
    recentLeads: leadsResult.rows,
  };
}

export async function getAdminNavItems() {
  return [
    { id: "catalog", label: "Catalog", href: "/admin/catalog", sort_order: 1 },
    { id: "order", label: "Order", href: "/admin/order", sort_order: 2 },
    { id: "analytic", label: "Analytic", href: "/admin/analytic", sort_order: 3 },
    { id: "setting", label: "Setting", href: "/admin/setting", sort_order: 4 },
    { id: "profile", label: "Profile", href: "/admin/profile", sort_order: 5 },
  ];
}
