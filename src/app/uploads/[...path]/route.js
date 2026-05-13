import fs from "node:fs/promises";
import { NextResponse } from "next/server";
import {
  findUploadFile,
  getMimeTypeFromFilePath,
} from "@/utils/upload-storage";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { path = [] } = await params;
  const filePath = await findUploadFile(path);

  if (!filePath) {
    return NextResponse.json({ message: "File tidak ditemukan." }, { status: 404 });
  }

  const fileBuffer = await fs.readFile(filePath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": getMimeTypeFromFilePath(filePath),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
