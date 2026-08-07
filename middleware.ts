import createMiddleware from "next-intl/middleware";
import { baseLocales, defaultLocale } from "@/i18n/config";

export default createMiddleware({ locales: baseLocales, defaultLocale, localePrefix: "always", localeDetection: true });
export const config = { matcher: ["/", "/(tr|en|de|ru)/:path*"] };
