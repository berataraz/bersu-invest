import "server-only";

import { revalidateTag } from "next/cache";

export const PUBLIC_PROPERTIES_CACHE_TAG = "public-properties";

export function revalidatePublicPropertyCache() {
  revalidateTag(PUBLIC_PROPERTIES_CACHE_TAG);
}
