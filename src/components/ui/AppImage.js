"use client";

import Image from "next/image";
import { resolveAssetUrl } from "@/utils/media";

export default function AppImage({ src, unoptimized = true, ...props }) {
  const normalizedSrc =
    typeof src === "string" ? resolveAssetUrl(src) : src;

  return <Image {...props} src={normalizedSrc} unoptimized={unoptimized} />;
}
