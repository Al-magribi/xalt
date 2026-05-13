export function resolveAssetUrl(value, fallback = "") {
  if (typeof value !== "string") return fallback;

  const raw = value.trim();
  if (!raw) return fallback;

  if (
    raw.startsWith("blob:") ||
    raw.startsWith("data:") ||
    /^https?:\/\//i.test(raw) ||
    raw.startsWith("//")
  ) {
    return raw;
  }

  const normalized = raw.replace(/\\/g, "/");
  if (/^\/?public\//i.test(normalized)) {
    return `/${normalized.replace(/^\/?public\//i, "")}`;
  }

  const publicSegment = "/public/";
  const publicSegmentIndex = normalized
    .toLowerCase()
    .indexOf(publicSegment);
  if (publicSegmentIndex >= 0) {
    return normalized.slice(publicSegmentIndex + "/public".length);
  }

  if (/^\.?\/?public\//i.test(normalized)) {
    return `/${normalized.replace(/^\.?\/?public\//i, "")}`;
  }

  if (/^uploads\//i.test(normalized)) {
    return `/${normalized}`;
  }

  if (normalized.startsWith("/")) return normalized;

  return `/${normalized.replace(/^\.?\//, "")}`;
}
