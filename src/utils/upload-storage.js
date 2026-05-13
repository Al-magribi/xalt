import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const UPLOADS_PREFIX = "/uploads/";
const LEGACY_PUBLIC_UPLOADS_PREFIX = "/public/uploads/";

const MIME_TYPES = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

function uniquePaths(paths) {
  return [...new Set(paths.map((value) => path.resolve(value)))];
}

function getProjectRoot() {
  const currentFile = fileURLToPath(import.meta.url);
  return path.resolve(path.dirname(currentFile), "..", "..");
}

export function getUploadsRootCandidates() {
  const cwd = process.cwd();
  const projectRoot = getProjectRoot();

  return uniquePaths([
    path.join(cwd, "public", "uploads"),
    path.join(cwd, "..", "public", "uploads"),
    path.join(cwd, "..", "..", "public", "uploads"),
    path.join(projectRoot, "public", "uploads"),
  ]);
}

export async function getPrimaryUploadsRoot() {
  const candidates = getUploadsRootCandidates();

  for (const candidate of candidates) {
    try {
      const stats = await fs.stat(candidate);
      if (stats.isDirectory()) {
        return candidate;
      }
    } catch {}
  }

  return candidates[candidates.length - 1];
}

export async function writeUploadFile(category, fileName, buffer) {
  const uploadsRoot = await getPrimaryUploadsRoot();
  const targetDir = path.join(uploadsRoot, category);

  await fs.mkdir(targetDir, { recursive: true });

  const filePath = path.join(targetDir, fileName);
  await fs.writeFile(filePath, buffer);

  return `${UPLOADS_PREFIX}${category}/${fileName}`;
}

export function isLocalUploadUrl(url) {
  if (typeof url !== "string") return false;
  return (
    url.startsWith(UPLOADS_PREFIX) || url.startsWith(LEGACY_PUBLIC_UPLOADS_PREFIX)
  );
}

function toUploadRelativePath(url) {
  if (!isLocalUploadUrl(url)) return null;

  return url
    .replace(/^\/public\/uploads\//i, "")
    .replace(/^\/uploads\//i, "")
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");
}

export async function deleteUploadByUrl(url) {
  const relativePath = toUploadRelativePath(url);
  if (!relativePath) return;

  const candidatePaths = getUploadsRootCandidates().map((root) =>
    path.join(root, relativePath),
  );

  for (const candidatePath of uniquePaths(candidatePaths)) {
    try {
      await fs.unlink(candidatePath);
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
    }
  }
}

export async function deleteUploadsByUrl(urls) {
  for (const url of urls) {
    await deleteUploadByUrl(url);
  }
}

export async function findUploadFile(pathSegments) {
  const relativePath = pathSegments
    .map((segment) => String(segment || "").replace(/\\/g, "/"))
    .join("/");

  for (const uploadsRoot of getUploadsRootCandidates()) {
    const filePath = path.resolve(uploadsRoot, relativePath);
    const rootPath = path.resolve(uploadsRoot);

    if (!filePath.startsWith(`${rootPath}${path.sep}`) && filePath !== rootPath) {
      continue;
    }

    try {
      const stats = await fs.stat(filePath);
      if (stats.isFile()) {
        return filePath;
      }
    } catch {}
  }

  return null;
}

export function getMimeTypeFromFilePath(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}
