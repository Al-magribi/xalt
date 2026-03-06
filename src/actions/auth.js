"use server";

import bcrypt from "bcrypt";
import crypto from "crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { query, withTransaction } from "@/config/db";
import { sendActivationEmail, sendResetEmail } from "@/utils/email";
import { getDashboardPathByRole } from "@/utils/auth";
import {
  activationTokenSchema,
  forgotSchema,
  loginSchema,
  registerSchema,
  resetSchema,
} from "@/utils/validation";

const SESSION_COOKIE_NAME = "xalt_session";
const SESSION_DAYS_DEFAULT = 7;
const SESSION_DAYS_REMEMBER = 30;
const RESET_TOKEN_HOURS = 1;
const ACTIVATION_TOKEN_HOURS = 24;
const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
const PROFILE_UPLOAD_PREFIX = "/public/uploads/profile/";
const LEGACY_PROFILE_UPLOAD_PREFIX = "/uploads/profile/";
const PROFILE_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "profile");

const DUMMY_HASH =
  "$2b$12$4dA2JCGH1c0CZ4eN36sC2u7DZXA9fVv2oydQ3GTRT5yfP8gQ1h88u";

function makeToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function toSafeExt(fileName = "") {
  const ext = path.extname(fileName).toLowerCase();
  if (!ext) return ".png";
  return ext.replace(/[^.a-z0-9]/g, "") || ".png";
}

function isLocalAvatarUrl(url) {
  if (typeof url !== "string") return false;
  return (
    url.startsWith(PROFILE_UPLOAD_PREFIX) ||
    url.startsWith(LEGACY_PROFILE_UPLOAD_PREFIX)
  );
}

function toLocalAvatarPath(url) {
  if (!isLocalAvatarUrl(url)) return null;
  const relative = url
    .replace(/^\/public\//i, "")
    .replace(/^\//, "");
  return path.join(process.cwd(), "public", relative);
}

async function deleteAvatarIfExists(url) {
  const filePath = toLocalAvatarPath(url);
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }
}

async function saveAvatarFile(file) {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!file.type?.startsWith("image/")) {
    throw new Error("Avatar harus berupa file gambar.");
  }
  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    throw new Error("Ukuran avatar melebihi 2MB.");
  }

  await fs.mkdir(PROFILE_UPLOAD_DIR, { recursive: true });

  const ext = toSafeExt(file.name);
  const fileName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
  const filePath = path.join(PROFILE_UPLOAD_DIR, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(filePath, buffer);
  return `${PROFILE_UPLOAD_PREFIX}${fileName}`;
}

async function getBaseUrl() {
  const result = await query(
    `SELECT app_url
     FROM settings.website_config
     WHERE id = 1
     LIMIT 1`,
  );

  const rawUrl = String(result.rows?.[0]?.app_url || "").trim();
  if (!rawUrl) {
    throw new Error("App URL belum diatur. Silakan isi App URL pada Website Configuration.");
  }

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("App URL tidak valid. Perbarui App URL pada Website Configuration.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("App URL harus menggunakan protokol http:// atau https://.");
  }

  return rawUrl.replace(/\/$/, "");
}

async function setSessionCookie(rawToken, days) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: days * 24 * 60 * 60,
  });
}

async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

async function getSessionTokenFromCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
}

async function createSession(userId, remember) {
  const sessionDays = remember ? SESSION_DAYS_REMEMBER : SESSION_DAYS_DEFAULT;
  const rawToken = makeToken(32);
  const tokenHash = sha256(rawToken);

  await query(
    `INSERT INTO auth.sessions (user_id, refresh_token_hash, expires_at)
     VALUES ($1, $2, NOW() + ($3 || ' days')::interval)`,
    [userId, tokenHash, String(sessionDays)],
  );

  await setSessionCookie(rawToken, sessionDays);
}

export async function getCurrentUser() {
  const token = await getSessionTokenFromCookie();
  if (!token) return null;

  const tokenHash = sha256(token);
  const result = await query(
    `SELECT u.id, u.email, u.full_name, u.role, u.avatar_url
     FROM auth.sessions s
     JOIN auth.users u ON u.id = s.user_id
     WHERE s.refresh_token_hash = $1
       AND s.revoked_at IS NULL
       AND s.expires_at > NOW()
       AND u.is_active = TRUE
     LIMIT 1`,
    [tokenHash],
  );

  if (result.rowCount === 0) {
    await clearSessionCookie();
    return null;
  }

  return result.rows[0];
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");
  return user;
}

export async function requireRole(role) {
  const user = await requireUser();
  if (user.role !== role) {
    redirect(getDashboardPathByRole(user.role));
  }

  return user;
}

export async function getAdminProfileData() {
  const user = await requireRole("admin");

  const result = await query(
    `SELECT
       id,
       email,
       full_name,
       role,
       is_active,
       phone_number,
       avatar_url,
       created_at,
       updated_at
     FROM auth.users
     WHERE id = $1
     LIMIT 1`,
    [user.id],
  );

  if (result.rowCount === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: Number(row.id),
    email: row.email || "",
    full_name: row.full_name || "",
    role: row.role || "admin",
    is_active: Boolean(row.is_active),
    phone_number: row.phone_number || "",
    avatar_url: row.avatar_url || "",
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function updateAdminProfileAction(_prevState, formData) {
  const user = await requireRole("admin");
  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const phoneNumber = String(formData.get("phone_number") || "").trim();
  const avatarFile = formData.get("avatar_file");
  const currentPassword = String(formData.get("current_password") || "");
  const newPassword = String(formData.get("new_password") || "");
  const confirmPassword = String(formData.get("confirm_password") || "");

  if (!fullName) {
    return { ok: false, message: "Nama lengkap wajib diisi." };
  }
  if (!email) {
    return { ok: false, message: "Email wajib diisi." };
  }

  const wantsPasswordChange =
    currentPassword.length > 0 ||
    newPassword.length > 0 ||
    confirmPassword.length > 0;

  if (wantsPasswordChange) {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return {
        ok: false,
        message:
          "Untuk ubah password, isi password saat ini, password baru, dan konfirmasi password.",
      };
    }
    if (newPassword.length < 8) {
      return {
        ok: false,
        message: "Password baru minimal 8 karakter.",
      };
    }
    if (newPassword !== confirmPassword) {
      return { ok: false, message: "Konfirmasi password tidak sama." };
    }
  }

  const uploadedFiles = [];
  try {
    const conflictResult = await query(
      `SELECT id
       FROM auth.users
       WHERE email = $1
         AND id <> $2
       LIMIT 1`,
      [email, user.id],
    );

    if (conflictResult.rowCount > 0) {
      return { ok: false, message: "Email sudah digunakan akun lain." };
    }

    const currentResult = await query(
      `SELECT password_hash, avatar_url
       FROM auth.users
       WHERE id = $1
       LIMIT 1`,
      [user.id],
    );

    if (currentResult.rowCount === 0) {
      return { ok: false, message: "Akun admin tidak ditemukan." };
    }

    const currentUser = currentResult.rows[0];
    let nextPasswordHash = null;
    let nextAvatarUrl = currentUser.avatar_url || null;

    if (wantsPasswordChange) {
      const passwordMatch = await bcrypt.compare(
        currentPassword,
        currentUser.password_hash,
      );

      if (!passwordMatch) {
        return { ok: false, message: "Password saat ini tidak sesuai." };
      }

      nextPasswordHash = await bcrypt.hash(newPassword, 12);
    }

    if (avatarFile instanceof File && avatarFile.size > 0) {
      nextAvatarUrl = await saveAvatarFile(avatarFile);
      uploadedFiles.push(nextAvatarUrl);
    }

    if (nextPasswordHash) {
      await query(
        `UPDATE auth.users
         SET full_name = $1,
             email = $2,
             phone_number = $3,
             avatar_url = $4,
             password_hash = $5,
             updated_at = NOW()
         WHERE id = $6`,
        [
          fullName,
          email,
          phoneNumber || null,
          nextAvatarUrl,
          nextPasswordHash,
          user.id,
        ],
      );
    } else {
      await query(
        `UPDATE auth.users
         SET full_name = $1,
             email = $2,
             phone_number = $3,
             avatar_url = $4,
             updated_at = NOW()
         WHERE id = $5`,
        [fullName, email, phoneNumber || null, nextAvatarUrl, user.id],
      );
    }

    if (
      currentUser.avatar_url &&
      nextAvatarUrl &&
      currentUser.avatar_url !== nextAvatarUrl
    ) {
      await deleteAvatarIfExists(currentUser.avatar_url);
    }

    revalidatePath("/admin/profile");
    return { ok: true, message: "Profil admin berhasil diperbarui." };
  } catch (error) {
    for (const fileUrl of uploadedFiles) {
      await deleteAvatarIfExists(fileUrl);
    }
    return { ok: false, message: error?.message || "Gagal memperbarui profil admin." };
  }
}

export async function loginAction(_prevState, formData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    remember: formData.get("remember") === "on",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "Input tidak valid.",
    };
  }

  const { email, password, remember } = parsed.data;

  const userResult = await query(
    `SELECT id, email, password_hash, is_active, role
     FROM auth.users
     WHERE email = $1
     LIMIT 1`,
    [email.toLowerCase()],
  );

  const user = userResult.rows[0];
  const hash = user?.password_hash || DUMMY_HASH;
  const passwordOk = await bcrypt.compare(password, hash);

  if (!user || !passwordOk) {
    return { ok: false, message: "Email atau kata sandi salah." };
  }

  if (!user.is_active) {
    return {
      ok: false,
      message: "Akun belum aktif. Silakan cek email untuk link aktivasi.",
    };
  }

  await createSession(user.id, remember);
  redirect(getDashboardPathByRole(user.role));
}

export async function registerAction(_prevState, formData) {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "Input tidak valid.",
    };
  }

  const { fullName, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();
  const existing = await query(
    `SELECT id, is_active
     FROM auth.users
     WHERE email = $1
     LIMIT 1`,
    [normalizedEmail],
  );

  if (existing.rowCount > 0 && existing.rows[0].is_active) {
    return { ok: false, message: "Email sudah terdaftar. Silakan login." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  let userId;
  await withTransaction(async (client) => {
    const upsertResult = await client.query(
      `INSERT INTO auth.users (email, password_hash, full_name, role, is_active, updated_at)
       VALUES ($1, $2, $3, 'user', FALSE, NOW())
       ON CONFLICT (email)
       DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         full_name = EXCLUDED.full_name,
         is_active = FALSE,
         updated_at = NOW()
       RETURNING id`,
      [normalizedEmail, passwordHash, fullName],
    );

    userId = upsertResult.rows[0].id;

    await client.query(
      `UPDATE auth.activation_tokens
       SET used_at = NOW()
       WHERE user_id = $1
         AND used_at IS NULL`,
      [userId],
    );
  });

  const rawToken = makeToken(32);
  const tokenHash = sha256(rawToken);

  await query(
    `INSERT INTO auth.activation_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, NOW() + ($3 || ' hours')::interval)`,
    [userId, tokenHash, String(ACTIVATION_TOKEN_HOURS)],
  );

  const activationLink = `${await getBaseUrl()}/auth/activate?token=${rawToken}`;
  await sendActivationEmail(normalizedEmail, activationLink);

  return {
    ok: true,
    message:
      "Registrasi berhasil. Cek email untuk aktivasi akun sebelum login.",
  };
}

export async function activateAccountByToken(rawToken) {
  const parsed = activationTokenSchema.safeParse({ token: rawToken });
  if (!parsed.success) {
    return { ok: false, message: "Token aktivasi tidak valid." };
  }

  const tokenHash = sha256(parsed.data.token);
  const tokenResult = await query(
    `SELECT t.id, t.user_id
     FROM auth.activation_tokens t
     JOIN auth.users u ON u.id = t.user_id
     WHERE t.token_hash = $1
       AND t.used_at IS NULL
       AND t.expires_at > NOW()
       AND u.is_active = FALSE
     ORDER BY t.created_at DESC
     LIMIT 1`,
    [tokenHash],
  );

  if (tokenResult.rowCount === 0) {
    return {
      ok: false,
      message: "Token aktivasi tidak valid atau sudah kedaluwarsa.",
    };
  }

  const target = tokenResult.rows[0];
  await withTransaction(async (client) => {
    await client.query(
      `UPDATE auth.users
       SET is_active = TRUE, updated_at = NOW()
       WHERE id = $1`,
      [target.user_id],
    );

    await client.query(
      `UPDATE auth.activation_tokens
       SET used_at = NOW()
       WHERE id = $1`,
      [target.id],
    );
  });

  return { ok: true, message: "Akun berhasil diaktivasi. Silakan login." };
}

export async function logoutAction() {
  const token = await getSessionTokenFromCookie();
  if (token) {
    await query(
      `UPDATE auth.sessions
       SET revoked_at = NOW()
       WHERE refresh_token_hash = $1
         AND revoked_at IS NULL`,
      [sha256(token)],
    );
  }

  await clearSessionCookie();
  redirect("/");
}

export async function requestPasswordResetAction(_prevState, formData) {
  const parsed = forgotSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "Input tidak valid.",
    };
  }

  const email = parsed.data.email.toLowerCase();
  const userResult = await query(
    `SELECT id, email
     FROM auth.users
     WHERE email = $1
       AND is_active = TRUE
     LIMIT 1`,
    [email],
  );

  if (userResult.rowCount > 0) {
    const user = userResult.rows[0];
    const rawToken = makeToken(32);
    const tokenHash = sha256(rawToken);

    await query(
      `INSERT INTO auth.password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + ($3 || ' hours')::interval)`,
      [user.id, tokenHash, String(RESET_TOKEN_HOURS)],
    );

    const resetLink = `${await getBaseUrl()}/auth/reset-password?token=${rawToken}`;
    await sendResetEmail(user.email, resetLink);
  }

  return {
    ok: true,
    message:
      "Jika email terdaftar, kami sudah mengirimkan link reset password.",
  };
}

export async function resetPasswordAction(_prevState, formData) {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "Input tidak valid.",
    };
  }

  const { token, password } = parsed.data;
  const tokenHash = sha256(token);

  const tokenResult = await query(
    `SELECT t.id, t.user_id
     FROM auth.password_reset_tokens t
     JOIN auth.users u ON u.id = t.user_id
     WHERE t.token_hash = $1
       AND t.used_at IS NULL
       AND t.expires_at > NOW()
       AND u.is_active = TRUE
     ORDER BY t.created_at DESC
     LIMIT 1`,
    [tokenHash],
  );

  if (tokenResult.rowCount === 0) {
    return {
      ok: false,
      message: "Token reset tidak valid atau sudah kedaluwarsa.",
    };
  }

  const target = tokenResult.rows[0];
  const passwordHash = await bcrypt.hash(password, 12);

  await withTransaction(async (client) => {
    await client.query(
      `UPDATE auth.users
       SET password_hash = $1, updated_at = NOW()
       WHERE id = $2`,
      [passwordHash, target.user_id],
    );

    await client.query(
      `UPDATE auth.password_reset_tokens
       SET used_at = NOW()
       WHERE id = $1`,
      [target.id],
    );

    await client.query(
      `UPDATE auth.sessions
       SET revoked_at = NOW()
       WHERE user_id = $1
         AND revoked_at IS NULL`,
      [target.user_id],
    );
  });

  return {
    ok: true,
    message: "Password berhasil direset. Silakan login kembali.",
  };
}
