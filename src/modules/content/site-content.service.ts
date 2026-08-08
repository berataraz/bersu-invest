import "server-only";

import { unstable_cache, revalidatePath, revalidateTag } from "next/cache";
import { type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const SITE_CONTENT_TAG = "site-content";
export const contentLocales = ["tr", "en", "de", "ru"] as const;
export type ContentLocale = (typeof contentLocales)[number];

export type LocalizedContent = Record<ContentLocale, Record<string, string>>;
export type SiteContentRecord = { key: string; content: LocalizedContent; isPublished: boolean; version: number };

// These defaults are only a safe first-run fallback. `prisma:seed` creates editable database records.
export const defaultSiteContent: Record<string, LocalizedContent> = {
  homepage: {
    tr: { heroTitle: "Fethiye’de Yaşamınızı ve Yatırımınızı Birlikte Şekillendirelim", heroSubtitle: "Bersu Invest’in yerel uzmanlığı ve yapay zekâ destekli gayrimenkul asistanıyla size en uygun yaşam ve yatırım fırsatlarını keşfedin.", primaryCta: "AI Yatırım Asistanına Sor", secondaryCta: "Gayrimenkulleri Keşfet", tertiaryCta: "Mülkünüzü Değerlendirelim", featuredTitle: "Yaşam için seçkin, yatırım için güçlü.", featuredDescription: "Her portföyü konumu, geleceği ve sizin beklentiniz ile değerlendiriyoruz.", searchTitle: "Detaylı gayrimenkul arama" },
    en: { heroTitle: "Shape Your Life and Investment in Fethiye with Us", heroSubtitle: "Discover suitable lifestyle and investment opportunities with Bersu Invest’s local expertise and AI-supported real estate assistant.", primaryCta: "Ask the AI Investment Assistant", secondaryCta: "Explore Properties", tertiaryCta: "Let Us Value Your Property", featuredTitle: "Exceptional for living, strong for investment.", featuredDescription: "We assess every listing through its setting, potential, and your priorities.", searchTitle: "Detailed property search" },
    de: { heroTitle: "Gestalten Sie Ihr Leben und Ihre Investition in Fethiye mit uns", heroSubtitle: "Entdecken Sie passende Wohn- und Investmentmöglichkeiten mit der lokalen Expertise von Bersu Invest und dem KI-gestützten Immobilienassistenten.", primaryCta: "KI-Investmentassistent fragen", secondaryCta: "Immobilien entdecken", tertiaryCta: "Immobilie bewerten lassen", featuredTitle: "Außergewöhnlich zum Leben, stark als Anlage.", featuredDescription: "Wir bewerten jedes Angebot nach Lage, Potenzial und Ihren Prioritäten.", searchTitle: "Detaillierte Immobiliensuche" },
    ru: { heroTitle: "Давайте вместе сформируем вашу жизнь и инвестиции в Фетхие", heroSubtitle: "Откройте подходящие возможности для жизни и инвестиций благодаря местному опыту Bersu Invest и AI-ассистенту по недвижимости.", primaryCta: "Спросить AI-инвестиционного ассистента", secondaryCta: "Посмотреть объекты", tertiaryCta: "Оценить мою недвижимость", featuredTitle: "Исключительные для жизни, сильные для инвестиций.", featuredDescription: "Мы оцениваем каждый объект по его месту, потенциалу и вашим приоритетам.", searchTitle: "Детальный поиск недвижимости" },
  },
  aiAssistant: {
    tr: { name: "Bersu Invest AI Gayrimenkul & Yatırım Asistanı", welcome: "Merhaba, ben Bersu Invest’in yapay zekâ destekli gayrimenkul ve yatırım asistanıyım. Hedefinizi anlatın; gerçek portföy ve onaylı bilgilerle yardımcı olayım.", description: "Ne aradığınızı birkaç cümleyle anlatın; yalnızca yayındaki gerçek portföyleri ve doğrulanmış bilgileri kullanarak size yol gösterelim.", placeholder: "Örn. 20 milyon TL bütçeyle Fethiye’de yatırım için villa arıyorum.", promptOne: "Bana bölge öner", promptTwo: "Çalış hakkında bilgi ver", promptThree: "Yatırım için gayrimenkul bul", promptFour: "Bersu Invest’i tanıt", disclaimer: "Bilgiler genel niteliktedir; hukuki, vergisel veya finansal tavsiye değildir.", companyIntro: "Bersu Invest, Fethiye ve çevresinde alım, satım, kiralama ve yatırım süreçlerinde yerel uzmanlık sunar. İhtiyacınızı anlatabilir veya bir danışmanla görüşebilirsiniz." },
    en: { name: "Bersu Invest AI Real Estate & Investment Assistant", welcome: "Hello, I am Bersu Invest’s AI-supported real estate and investment assistant. Tell me your goal and I will help using real portfolio data and approved information.", description: "Describe what you are looking for in a few words. We will guide you using only real published listings and verified information.", placeholder: "For example, I am looking for a villa in Fethiye for investment with a 20 million TL budget.", promptOne: "Recommend an area", promptTwo: "Tell me about Calis", promptThree: "Find an investment property", promptFour: "Introduce Bersu Invest", disclaimer: "Information is general in nature and is not legal, tax, or financial advice.", companyIntro: "Bersu Invest offers local expertise for buying, selling, renting, and investing in Fethiye and its surroundings. Tell us what you need or speak with an advisor." },
    de: { name: "Bersu Invest AI Immobilien- und Investment-Assistent", welcome: "Hallo, ich bin der KI-gestützte Immobilien- und Investment-Assistent von Bersu Invest. Beschreiben Sie Ihr Ziel; ich helfe mit echten Portfoliodaten und freigegebenen Informationen.", description: "Erzählen Sie uns in wenigen Worten, wonach Sie suchen. Wir leiten Sie nur mit echten veröffentlichten Angeboten und verifizierten Informationen an.", placeholder: "Zum Beispiel suche ich eine Villa in Fethiye als Investment mit 20 Millionen TL Budget.", promptOne: "Region empfehlen", promptTwo: "Über Calis informieren", promptThree: "Investmentimmobilie finden", promptFour: "Bersu Invest vorstellen", disclaimer: "Die Informationen sind allgemeiner Natur und keine Rechts-, Steuer- oder Finanzberatung.", companyIntro: "Bersu Invest bietet lokale Expertise für Kauf, Verkauf, Vermietung und Investment in Fethiye und Umgebung. Schildern Sie Ihren Bedarf oder sprechen Sie mit einem Berater." },
    ru: { name: "AI-ассистент Bersu Invest по недвижимости и инвестициям", welcome: "Здравствуйте, я AI-ассистент Bersu Invest по недвижимости и инвестициям. Расскажите о цели, и я помогу на основе реального портфеля и одобренной информации.", description: "Опишите в нескольких словах, что вы ищете. Мы подскажем, используя только реальные опубликованные объекты и проверенную информацию.", placeholder: "Например, ищу виллу в Фетхие для инвестиций с бюджетом 20 миллионов TL.", promptOne: "Посоветовать регион", promptTwo: "Рассказать о Чалыше", promptThree: "Найти объект для инвестиций", promptFour: "Представить Bersu Invest", disclaimer: "Информация носит общий характер и не является юридической, налоговой или финансовой консультацией.", companyIntro: "Bersu Invest предлагает местную экспертизу по покупке, продаже, аренде и инвестициям в Фетхие и окрестностях. Расскажите о своей задаче или поговорите с консультантом." },
  },
  footer: {
    tr: { description: "Fethiye ve çevresinde seçkin gayrimenkul danışmanlığı.", copyright: "Bersu Invest Yatırım." },
    en: { description: "Distinctive real estate advisory in Fethiye and beyond.", copyright: "Bersu Invest Yatırım." },
    de: { description: "Exklusive Immobilienberatung in Fethiye und Umgebung.", copyright: "Bersu Invest Yatırım." },
    ru: { description: "Премиальный консалтинг по недвижимости в Фетхие и окрестностях.", copyright: "Bersu Invest Yatırım." },
  },
};

function asLocalizedContent(value: Prisma.JsonValue, key: string): LocalizedContent {
  const fallback = defaultSiteContent[key];
  if (!value || typeof value !== "object" || Array.isArray(value)) return fallback;
  const parsed = value as Partial<LocalizedContent>;
  return contentLocales.reduce((result, locale) => ({ ...result, [locale]: { ...fallback[locale], ...(parsed[locale] ?? {}) } }), {} as LocalizedContent);
}

async function readSiteContent() {
  try {
    const records = await prisma.siteContent.findMany({ where: { isPublished: true, deletedAt: null }, select: { key: true, content: true, isPublished: true, version: true } });
    return records.reduce<Record<string, SiteContentRecord>>((result, record) => ({ ...result, [record.key]: { ...record, content: asLocalizedContent(record.content, record.key) } }), {});
  } catch {
    return {};
  }
}

const cachedSiteContent = unstable_cache(readSiteContent, ["site-content"], { revalidate: 60, tags: [SITE_CONTENT_TAG] });

export async function getSiteContent(key: keyof typeof defaultSiteContent): Promise<SiteContentRecord> {
  const records = await cachedSiteContent();
  return records[key] ?? { key, content: defaultSiteContent[key], isPublished: true, version: 0 };
}

export async function getSiteContentForLocale(key: keyof typeof defaultSiteContent, locale: ContentLocale) {
  const item = await getSiteContent(key);
  return item.content[locale] ?? item.content.tr;
}

export function revalidateSiteContent() {
  revalidateTag(SITE_CONTENT_TAG);
  for (const locale of contentLocales) revalidatePath(`/${locale}`);
}
