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

function mapFaq(row) {
  return {
    id: Number(row.id),
    question: row.question || "",
    answer: row.answer || "",
    sort_order: Number(row.sort_order || 0),
    is_active: Boolean(row.is_active),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function revalidateFaqPaths() {
  revalidatePath("/");
  revalidatePath("/admin/setting");
}

export async function getAdminFaqs() {
  const result = await query(
    `SELECT
       id,
       question,
       answer,
       sort_order,
       is_active,
       created_at,
       updated_at
     FROM content.faqs
     ORDER BY sort_order ASC, id ASC`,
  );

  return result.rows.map(mapFaq);
}

export async function getActiveFaqs() {
  const result = await query(
    `SELECT
       id,
       question,
       answer,
       sort_order,
       is_active,
       created_at,
       updated_at
     FROM content.faqs
     WHERE is_active = TRUE
     ORDER BY sort_order ASC, id ASC`,
  );

  return result.rows.map(mapFaq);
}

export async function addFaqAction(_prevState, formData) {
  const question = String(formData.get("faq_question") || "").trim();
  const answer = String(formData.get("faq_answer") || "").trim();
  const isActive = parseBoolean(formData.get("faq_is_active"), true);

  if (!question) {
    return { ok: false, message: "Pertanyaan FAQ wajib diisi." };
  }
  if (!answer) {
    return { ok: false, message: "Jawaban FAQ wajib diisi." };
  }

  try {
    const sortResult = await query(
      `SELECT COALESCE(MAX(sort_order), 0) AS max_sort
       FROM content.faqs`,
    );
    const nextSort = Number(sortResult.rows[0]?.max_sort || 0) + 1;

    await query(
      `INSERT INTO content.faqs
       (question, answer, sort_order, is_active, updated_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [question, answer, nextSort, isActive],
    );

    revalidateFaqPaths();
    return { ok: true, message: "FAQ berhasil ditambahkan." };
  } catch (error) {
    return { ok: false, message: error?.message || "Gagal menambahkan FAQ." };
  }
}

export async function updateFaqAction(_prevState, formData) {
  const id = toInt(formData.get("faq_id"), 0);
  const question = String(formData.get("faq_question") || "").trim();
  const answer = String(formData.get("faq_answer") || "").trim();
  const isActive = parseBoolean(formData.get("faq_is_active"), false);

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: "ID FAQ tidak valid." };
  }
  if (!question) {
    return { ok: false, message: "Pertanyaan FAQ wajib diisi." };
  }
  if (!answer) {
    return { ok: false, message: "Jawaban FAQ wajib diisi." };
  }

  try {
    const existsResult = await query(
      `SELECT id
       FROM content.faqs
       WHERE id = $1
       LIMIT 1`,
      [id],
    );

    if (existsResult.rowCount === 0) {
      return { ok: false, message: "FAQ tidak ditemukan." };
    }

    await query(
      `UPDATE content.faqs
       SET question = $1,
           answer = $2,
           is_active = $3,
           updated_at = NOW()
       WHERE id = $4`,
      [question, answer, isActive, id],
    );

    revalidateFaqPaths();
    return { ok: true, message: "FAQ berhasil diperbarui." };
  } catch (error) {
    return { ok: false, message: error?.message || "Gagal memperbarui FAQ." };
  }
}

export async function deleteFaqAction(_prevState, formData) {
  const id = toInt(formData.get("faq_id"), 0);

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: "ID FAQ tidak valid." };
  }

  try {
    const deleteResult = await query(
      `DELETE FROM content.faqs
       WHERE id = $1`,
      [id],
    );

    if (deleteResult.rowCount === 0) {
      return { ok: false, message: "FAQ tidak ditemukan." };
    }

    revalidateFaqPaths();
    return { ok: true, message: "FAQ berhasil dihapus." };
  } catch (error) {
    return { ok: false, message: error?.message || "Gagal menghapus FAQ." };
  }
}

export async function reorderFaqsAction(faqIds = []) {
  const normalizedIds = Array.isArray(faqIds)
    ? faqIds
        .map((id) => toInt(id, 0))
        .filter((id) => Number.isInteger(id) && id > 0)
    : [];

  if (normalizedIds.length === 0) {
    return { ok: false, message: "Urutan FAQ tidak valid." };
  }

  try {
    await withTransaction(async (client) => {
      const existingResult = await client.query(
        `SELECT id
         FROM content.faqs
         WHERE id = ANY($1::bigint[])`,
        [normalizedIds],
      );

      if (existingResult.rowCount !== normalizedIds.length) {
        throw new Error("Sebagian FAQ tidak ditemukan.");
      }

      for (let index = 0; index < normalizedIds.length; index += 1) {
        await client.query(
          `UPDATE content.faqs
           SET sort_order = $1,
               updated_at = NOW()
           WHERE id = $2`,
          [index + 1, normalizedIds[index]],
        );
      }
    });

    revalidateFaqPaths();
    return { ok: true, message: "Urutan FAQ berhasil diperbarui." };
  } catch (error) {
    return { ok: false, message: error?.message || "Gagal mengubah urutan FAQ." };
  }
}
