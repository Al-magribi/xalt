"use server";

import { revalidatePath } from "next/cache";
import { query, withTransaction } from "@/config/db";

function parseBoolean(value, defaultValue = false) {
  if (value == null) return defaultValue;
  const normalized = String(value).toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "on";
}

function toInt(value, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(parsed) ? parsed : fallback;
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
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function revalidateTestimonialPaths() {
  revalidatePath("/");
  revalidatePath("/admin/setting");
}

export async function getAdminTestimonials() {
  const result = await query(
    `SELECT
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
     ORDER BY sort_order ASC, id ASC`,
  );

  return result.rows.map(mapTestimonial);
}

export async function getActiveTestimonials() {
  const result = await query(
    `SELECT
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
     ORDER BY sort_order ASC, id ASC`,
  );

  return result.rows.map(mapTestimonial);
}

export async function addTestimonialAction(_prevState, formData) {
  const clientName = String(formData.get("testimonial_client_name") || "").trim();
  const title = String(formData.get("testimonial_title") || "").trim();
  const quote = String(formData.get("testimonial_quote") || "").trim();
  const linkUrl = String(formData.get("testimonial_link_url") || "").trim();
  const ratingRaw = toInt(formData.get("testimonial_rating"), 5);
  const rating = Math.max(1, Math.min(5, ratingRaw || 5));
  const isActive = parseBoolean(formData.get("testimonial_is_active"), true);

  if (!clientName) {
    return { ok: false, message: "Nama klien wajib diisi." };
  }
  if (!title) {
    return { ok: false, message: "Judul testimoni wajib diisi." };
  }
  if (!quote) {
    return { ok: false, message: "Isi testimoni wajib diisi." };
  }

  try {
    const sortResult = await query(
      `SELECT COALESCE(MAX(sort_order), 0) AS max_sort
       FROM content.testimonials`,
    );
    const nextSort = Number(sortResult.rows[0]?.max_sort || 0) + 1;

    await query(
      `INSERT INTO content.testimonials
       (client_name, title, quote, link_url, rating, sort_order, is_active, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [clientName, title, quote, linkUrl || null, rating, nextSort, isActive],
    );

    revalidateTestimonialPaths();
    return { ok: true, message: "Testimoni berhasil ditambahkan." };
  } catch (error) {
    return { ok: false, message: error?.message || "Gagal menambahkan testimoni." };
  }
}

export async function updateTestimonialAction(_prevState, formData) {
  const id = toInt(formData.get("testimonial_id"), 0);
  const clientName = String(formData.get("testimonial_client_name") || "").trim();
  const title = String(formData.get("testimonial_title") || "").trim();
  const quote = String(formData.get("testimonial_quote") || "").trim();
  const linkUrl = String(formData.get("testimonial_link_url") || "").trim();
  const ratingRaw = toInt(formData.get("testimonial_rating"), 5);
  const rating = Math.max(1, Math.min(5, ratingRaw || 5));
  const isActive = parseBoolean(formData.get("testimonial_is_active"), false);

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: "ID testimoni tidak valid." };
  }
  if (!clientName) {
    return { ok: false, message: "Nama klien wajib diisi." };
  }
  if (!title) {
    return { ok: false, message: "Judul testimoni wajib diisi." };
  }
  if (!quote) {
    return { ok: false, message: "Isi testimoni wajib diisi." };
  }

  try {
    const existsResult = await query(
      `SELECT id
       FROM content.testimonials
       WHERE id = $1
       LIMIT 1`,
      [id],
    );

    if (existsResult.rowCount === 0) {
      return { ok: false, message: "Testimoni tidak ditemukan." };
    }

    await query(
      `UPDATE content.testimonials
       SET client_name = $1,
           title = $2,
           quote = $3,
           link_url = $4,
           rating = $5,
           is_active = $6,
           updated_at = NOW()
       WHERE id = $7`,
      [clientName, title, quote, linkUrl || null, rating, isActive, id],
    );

    revalidateTestimonialPaths();
    return { ok: true, message: "Testimoni berhasil diperbarui." };
  } catch (error) {
    return { ok: false, message: error?.message || "Gagal memperbarui testimoni." };
  }
}

export async function deleteTestimonialAction(_prevState, formData) {
  const id = toInt(formData.get("testimonial_id"), 0);

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: "ID testimoni tidak valid." };
  }

  try {
    const deleteResult = await query(
      `DELETE FROM content.testimonials
       WHERE id = $1`,
      [id],
    );

    if (deleteResult.rowCount === 0) {
      return { ok: false, message: "Testimoni tidak ditemukan." };
    }

    revalidateTestimonialPaths();
    return { ok: true, message: "Testimoni berhasil dihapus." };
  } catch (error) {
    return { ok: false, message: error?.message || "Gagal menghapus testimoni." };
  }
}

export async function reorderTestimonialsAction(testimonialIds = []) {
  const normalizedIds = Array.isArray(testimonialIds)
    ? testimonialIds
        .map((id) => toInt(id, 0))
        .filter((id) => Number.isInteger(id) && id > 0)
    : [];

  if (normalizedIds.length === 0) {
    return { ok: false, message: "Urutan testimoni tidak valid." };
  }

  try {
    await withTransaction(async (client) => {
      const existingResult = await client.query(
        `SELECT id
         FROM content.testimonials
         WHERE id = ANY($1::bigint[])`,
        [normalizedIds],
      );

      if (existingResult.rowCount !== normalizedIds.length) {
        throw new Error("Sebagian testimoni tidak ditemukan.");
      }

      for (let index = 0; index < normalizedIds.length; index += 1) {
        await client.query(
          `UPDATE content.testimonials
           SET sort_order = $1,
               updated_at = NOW()
           WHERE id = $2`,
          [index + 1, normalizedIds[index]],
        );
      }
    });

    revalidateTestimonialPaths();
    return { ok: true, message: "Urutan testimoni berhasil diperbarui." };
  } catch (error) {
    return {
      ok: false,
      message: error?.message || "Gagal mengubah urutan testimoni.",
    };
  }
}
