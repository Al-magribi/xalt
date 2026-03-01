import fs from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";
import { query } from "@/config/db";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderEmailTemplate({ preheader, title, intro, ctaLabel, ctaUrl, note }) {
  const safePreheader = escapeHtml(preheader);
  const safeTitle = escapeHtml(title);
  const safeIntro = escapeHtml(intro);
  const safeCtaLabel = escapeHtml(ctaLabel);
  const safeCtaUrl = escapeHtml(ctaUrl);
  const safeNote = escapeHtml(note);

  return `<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f7fb;font-family:Arial,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${safePreheader}
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f7fb;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(135deg,#06b6d4,#4f46e5);padding:28px 28px 22px 28px;">
                <p style="margin:0;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#dbeafe;font-weight:700;">XALT Account Security</p>
                <h1 style="margin:10px 0 0 0;font-size:24px;line-height:1.3;color:#ffffff;">${safeTitle}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:#334155;">${safeIntro}</p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:8px 0 20px 0;">
                  <tr>
                    <td style="border-radius:10px;background:#0f172a;">
                      <a href="${safeCtaUrl}" style="display:inline-block;padding:13px 20px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">
                        ${safeCtaLabel}
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 12px 0;font-size:13px;line-height:1.7;color:#64748b;">
                  Jika tombol tidak dapat diklik, salin dan buka URL berikut:
                </p>
                <p style="margin:0 0 18px 0;word-break:break-all;font-size:13px;line-height:1.6;color:#0f172a;">
                  <a href="${safeCtaUrl}" style="color:#0f172a;text-decoration:underline;">${safeCtaUrl}</a>
                </p>

                <div style="padding:12px 14px;border:1px solid #e2e8f0;background:#f8fafc;border-radius:10px;">
                  <p style="margin:0;font-size:12px;line-height:1.7;color:#475569;">
                    ${safeNote}
                  </p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 24px 28px;">
                <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 16px 0;" />
                <p style="margin:0;font-size:12px;line-height:1.7;color:#64748b;">
                  Email ini dikirim otomatis oleh sistem keamanan akun XALT.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function getSmtpConfigFromDb() {
  const result = await query(
    `SELECT host, port, secure, encryption, username, password, from_name, from_email, reply_to_email, is_active
     FROM settings.smtp_config
     WHERE id = 1
     LIMIT 1`,
  );

  if (result.rowCount === 0) return null;

  const row = result.rows[0];
  if (!row.is_active) return null;

  const encryption = String(row.encryption || "").toLowerCase();
  const rawPort = Number(row.port);
  const isSsl = encryption === "ssl";
  const isStartTls = encryption === "tls" || encryption === "starttls";

  let normalizedPort = Number.isInteger(rawPort) && rawPort > 0 ? rawPort : isSsl ? 465 : isStartTls ? 587 : 25;
  if (isSsl && normalizedPort === 25) {
    normalizedPort = 465;
  }
  if (isStartTls && normalizedPort === 465) {
    normalizedPort = 587;
  }

  return {
    host: row.host,
    port: normalizedPort,
    secure: isSsl,
    encryption,
    username: row.username || "",
    password: row.password || "",
    fromName: row.from_name,
    fromEmail: row.from_email,
    replyToEmail: row.reply_to_email || "",
  };
}

async function getMailerContext() {
  const smtpConfig = await getSmtpConfigFromDb();
  if (!smtpConfig) return null;

  const smtpHost = String(smtpConfig.host || "").trim();
  const forceIpv4 = process.env.SMTP_FORCE_IPV4 !== "0";
  const allowSelfSigned = process.env.SMTP_ALLOW_SELF_SIGNED === "1";
  const caCertPath = String(process.env.SMTP_CA_CERT_PATH || "").trim();
  let caBundle = null;

  if (caCertPath) {
    try {
      const content = await fs.readFile(caCertPath, "utf8");
      if (content.trim()) {
        caBundle = content;
      }
    } catch (error) {
      console.error(`[smtp] Failed to read CA bundle from ${caCertPath}:`, error);
    }
  }

  const tlsOptions = {
    servername: smtpHost,
    minVersion: "TLSv1.2",
    ...(allowSelfSigned ? { rejectUnauthorized: false } : {}),
    ...(caBundle ? { ca: caBundle } : {}),
  };
  const createTransporter = ({ port, secure, encryption, label }) => {
    const isStartTls = encryption === "tls" || encryption === "starttls";
    return {
      label,
      port,
      secure,
      encryption,
      transporter: nodemailer.createTransport({
        host: smtpHost,
        port,
        secure,
        requireTLS: !secure && isStartTls,
        family: forceIpv4 ? 4 : undefined,
        connectionTimeout: 15000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
        tls: tlsOptions,
        auth:
          smtpConfig.username && smtpConfig.password
            ? {
                user: smtpConfig.username,
                pass: smtpConfig.password,
              }
            : undefined,
      }),
    };
  };

  const transports = [
    createTransporter({
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      encryption: smtpConfig.encryption,
      label: "primary",
    }),
  ];

  if (smtpConfig.encryption === "ssl") {
    transports.push(
      createTransporter({
        port: 587,
        secure: false,
        encryption: "tls",
        label: "fallback-tls-587",
      }),
    );
  } else if (smtpConfig.encryption === "tls" || smtpConfig.encryption === "starttls") {
    transports.push(
      createTransporter({
        port: 465,
        secure: true,
        encryption: "ssl",
        label: "fallback-ssl-465",
      }),
    );
  }

  const uniqueTransports = [];
  const seen = new Set();
  for (const entry of transports) {
    const key = `${entry.port}:${entry.secure ? "secure" : "plain"}`;
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueTransports.push(entry);
  }

  const fromAddress = smtpConfig.fromName
    ? `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`
    : smtpConfig.fromEmail;

  return {
    smtpHost,
    transports: uniqueTransports,
    fromAddress,
    replyTo: smtpConfig.replyToEmail || undefined,
  };
}

async function getAppUrlFromDb() {
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

async function sendMailWithFallback(mailer, mailOptions) {
  let lastError = null;

  for (const entry of mailer.transports) {
    try {
      await entry.transporter.sendMail(mailOptions);
      return;
    } catch (error) {
      lastError = error;
      console.error(
        `[smtp] send attempt failed (${entry.label}) host=${mailer.smtpHost} port=${entry.port} secure=${entry.secure} code=${error?.code || "unknown"} message=${error?.message || "unknown"}`,
      );
    }
  }

  throw lastError || new Error("SMTP send failed.");
}

export async function sendResetEmail(toEmail, resetLink) {
  const mailer = await getMailerContext();
  if (!mailer) {
    console.log(`[auth] Reset link for ${toEmail}: ${resetLink}`);
    return;
  }

  const subject = "Reset Password XALT";
  const text =
    `Kami menerima permintaan reset password akun Anda.\n\n` +
    `Buka tautan berikut untuk melanjutkan:\n${resetLink}\n\n` +
    `Jika Anda tidak meminta reset password, abaikan email ini.`;
  const html = renderEmailTemplate({
    preheader: "Instruksi reset password akun XALT Anda.",
    title: "Reset Password Akun",
    intro:
      "Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda. Klik tombol di bawah untuk melanjutkan proses reset password.",
    ctaLabel: "Reset Password",
    ctaUrl: resetLink,
    note: "Demi keamanan, link reset berlaku terbatas dan hanya dapat digunakan satu kali.",
  });

  await sendMailWithFallback(mailer, {
    from: mailer.fromAddress,
    to: toEmail,
    replyTo: mailer.replyTo,
    subject,
    text,
    html,
  });
}

export async function sendActivationEmail(toEmail, activationLink) {
  const mailer = await getMailerContext();
  if (!mailer) {
    console.log(`[auth] Activation link for ${toEmail}: ${activationLink}`);
    return;
  }

  const subject = "Aktivasi Akun XALT";
  const text =
    `Selamat datang di XALT.\n\n` +
    `Aktifkan akun Anda melalui tautan berikut:\n${activationLink}\n\n` +
    `Jika Anda tidak merasa mendaftar, abaikan email ini.`;
  const html = renderEmailTemplate({
    preheader: "Aktifkan akun XALT Anda untuk mulai menggunakan platform.",
    title: "Aktivasi Akun",
    intro:
      "Terima kasih telah mendaftar. Aktifkan akun Anda terlebih dahulu agar dapat mengakses seluruh fitur di platform XALT.",
    ctaLabel: "Aktifkan Akun",
    ctaUrl: activationLink,
    note: "Jika Anda tidak merasa membuat akun, Anda dapat mengabaikan email ini.",
  });

  await sendMailWithFallback(mailer, {
    from: mailer.fromAddress,
    to: toEmail,
    replyTo: mailer.replyTo,
    subject,
    text,
    html,
  });
}

export async function sendCatalogDownloadEmail({
  toEmail,
  recipientName,
  catalogTitle,
  fileUrl,
  fileName,
}) {
  const mailer = await getMailerContext();
  if (!mailer) {
    throw new Error("Konfigurasi SMTP belum aktif. Silakan aktifkan SMTP terlebih dahulu.");
  }

  const normalizedFileUrl = String(fileUrl || "").trim();
  if (!normalizedFileUrl.startsWith("/")) {
    throw new Error("Lokasi file katalog tidak valid.");
  }

  const localPath = path.join(process.cwd(), "public", normalizedFileUrl.replace(/^\//, ""));
  await fs.access(localPath);

  const appUrl = await getAppUrlFromDb();
  const downloadUrl = `${appUrl}${normalizedFileUrl}`;
  const safeTitle = String(catalogTitle || "Katalog Produk").trim();
  const safeRecipient = String(recipientName || "Pelanggan").trim();

  const subject = `Download ${safeTitle}`;
  const text =
    `Halo ${safeRecipient},\n\n` +
    `Berikut kami kirim file ${safeTitle} sesuai permintaan Anda.\n` +
    `Jika lampiran tidak muncul, Anda bisa mengunduh dari link berikut:\n${downloadUrl}\n\n` +
    "Terima kasih.";

  const html = renderEmailTemplate({
    preheader: `File ${safeTitle} siap diunduh.`,
    title: "Katalog Berhasil Dikirim",
    intro: `Halo ${safeRecipient}, berikut kami kirim file ${safeTitle} melalui lampiran email ini.`,
    ctaLabel: "Download Katalog",
    ctaUrl: downloadUrl,
    note: "Jika Anda tidak meminta file ini, Anda dapat mengabaikan email ini.",
  });

  await sendMailWithFallback(mailer, {
    from: mailer.fromAddress,
    to: toEmail,
    replyTo: mailer.replyTo,
    subject,
    text,
    html,
    attachments: [
      {
        filename: String(fileName || "catalog.pdf").trim() || "catalog.pdf",
        path: localPath,
        contentType: "application/pdf",
      },
    ],
  });
}
