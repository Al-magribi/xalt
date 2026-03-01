"use server";

import bcrypt from "bcrypt";
import crypto from "crypto";
import { cookies } from "next/headers";
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

const DUMMY_HASH =
  "$2b$12$4dA2JCGH1c0CZ4eN36sC2u7DZXA9fVv2oydQ3GTRT5yfP8gQ1h88u";

function makeToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
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
    `SELECT u.id, u.email, u.full_name, u.role
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
