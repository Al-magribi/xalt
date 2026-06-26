"use client";

import { useEffect, useMemo, useState } from "react";
import { resolveAssetUrl } from "@/utils/media";

function getInitials(nameOrEmail) {
  const text = String(nameOrEmail || "").trim();
  if (!text) return "AD";

  const words = text.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return text.slice(0, 2).toUpperCase();
}

export default function AdminAvatar({
  src,
  name,
  altLabel = "avatar",
  sizeClass = "h-10 w-10",
  roundedClass = "rounded-xl",
  textClass = "text-xs",
  imageClass = "object-contain",
}) {
  const normalizedSrc = useMemo(
    () => (typeof src === "string" ? resolveAssetUrl(src) : ""),
    [src],
  );
  const [hasError, setHasError] = useState(false);
  const initials = getInitials(name);

  useEffect(() => {
    setHasError(false);
  }, [normalizedSrc]);

  return (
    <div
      className={`inline-flex shrink-0 ${sizeClass} items-center justify-center overflow-hidden border border-slate-200 bg-white p-1.5 font-bold text-slate-700 shadow-sm ${roundedClass} ${textClass}`}
    >
      {normalizedSrc && !hasError ? (
        <img
          src={normalizedSrc}
          alt={`${name} ${altLabel}`}
          className={`max-h-full max-w-full ${imageClass}`}
          onError={() => setHasError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
