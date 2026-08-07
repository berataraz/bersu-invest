import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ApiError } from "@/lib/http";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const accepted = new Map([
  ["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"], ["application/pdf", "pdf"],
]);

export async function saveLocalPropertyFile(propertyId: string, file: File) {
  const extension = accepted.get(file.type);
  if (!extension) throw new ApiError(400, "Desteklenmeyen dosya türü. JPG, PNG, WEBP veya PDF yükleyin.", "UNSUPPORTED_MEDIA_TYPE");
  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) throw new ApiError(400, "Dosya 10 MB sınırını aşmamalıdır.", "MEDIA_TOO_LARGE");
  if (process.env.NODE_ENV === "production" && !process.env.LOCAL_MEDIA_STORAGE_ENABLED) {
    throw new ApiError(503, "Üretim ortamı için S3 veya Cloudinary depolama sağlayıcısı yapılandırılmalıdır.", "MEDIA_STORAGE_UNAVAILABLE");
  }
  const filename = `${crypto.randomUUID()}.${extension}`;
  const storageKey = `uploads/properties/${propertyId}/${filename}`;
  const directory = path.join(process.cwd(), "public", "uploads", "properties", propertyId);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()), { flag: "wx" });
  return { storageKey, url: `/${storageKey}`, mimeType: file.type, kind: file.type === "application/pdf" ? "DOCUMENT" as const : "IMAGE" as const };
}
