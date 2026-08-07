import type { MetadataRoute } from "next";
import { baseLocales } from "@/i18n/config";
const paths = ["", "/about", "/regions", "/projects", "/properties", "/agents", "/blog", "/contact", "/faq", "/privacy-policy", "/kvkk", "/cookie-policy"];
export default function sitemap(): MetadataRoute.Sitemap { const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://bersuinvest.com"; return baseLocales.flatMap((locale) => paths.map((path) => ({ url: `${base}/${locale}${path}`, lastModified: new Date(), changeFrequency: path === "" ? "weekly" : "monthly", priority: path === "" ? 1 : 0.7, alternates: { languages: Object.fromEntries(baseLocales.map((alternative) => [alternative, `${base}/${alternative}${path}`])) } }))); }
