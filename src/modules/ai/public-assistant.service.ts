import { ListingType, PropertyStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { contentLocales, getSiteContentForLocale, type ContentLocale } from "@/modules/content/site-content.service";

export type PublicAssistantIntent =
  | "BUY_PROPERTY"
  | "RENT_PROPERTY"
  | "INVESTMENT"
  | "SELL_PROPERTY"
  | "RENT_OUT_PROPERTY"
  | "PROPERTY_VALUATION"
  | "REGION_RESEARCH"
  | "PROPERTY_COMPARISON"
  | "COMPANY_INFORMATION"
  | "GENERAL_REAL_ESTATE_QUESTION"
  | "HUMAN_AGENT_REQUEST";

export type PublicAssistantFilters = {
  listingType?: ListingType;
  propertyType?: string;
  city?: string;
  district?: string;
  neighborhood?: string;
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
};

export type PublicAssistantProperty = {
  id: string;
  slug: string;
  propertyId: string;
  title: string;
  listingType: ListingType;
  price: string | null;
  currencyCode: string;
  city: string;
  district: string | null;
  neighborhood: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  grossAreaM2: string | null;
  type: string;
  image: string | null;
  agent: { firstName: string; lastName: string; phone: string | null; whatsapp: string | null } | null;
};

function normalize(value: string) {
  return value.toLocaleLowerCase("tr-TR").replace(/ı/g, "i").normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

function priceRange(value: string) {
  const range = value.match(/(\d+(?:[.,]\d+)?)\s*(?:-|–|ile|to|bis|до)\s*(\d+(?:[.,]\d+)?)\s*(?:milyon|million|mio|млн|m\b)/i);
  if (range) return { minPrice: Number(range[1].replace(",", ".")) * 1_000_000, maxPrice: Number(range[2].replace(",", ".")) * 1_000_000 };
  const maximum = value.match(/(?:alt[iı]|under|below|bis zu|до|maximum|max)\s*(\d+(?:[.,]\d+)?)\s*(?:milyon|million|mio|млн|m\b)/i)
    ?? value.match(/(\d+(?:[.,]\d+)?)\s*(?:milyon|million|mio|млн)\s*(?:alt[iı]|under|below|bis zu|до)/i);
  if (maximum) return { maxPrice: Number(maximum[1].replace(",", ".")) * 1_000_000 };
  const budget = value.match(/(\d+(?:[.,]\d+)?)\s*(?:milyon|million|mio|млн)\s*(?:tl|try|lira|budget|butce|bütçe|haushalt|бюджет)/i);
  if (budget) return { maxPrice: Number(budget[1].replace(",", ".")) * 1_000_000 };
  return {};
}

export function interpretPublicAssistantMessage(message: string): { intent: PublicAssistantIntent; filters: PublicAssistantFilters } {
  const value = normalize(message);
  const intent: PublicAssistantIntent = includesAny(value, ["whatsapp", "danisman", "danışman", "agent", "berater", "агент", "beni arayin", "beni arayın", "human"])
    ? "HUMAN_AGENT_REQUEST"
    : includesAny(value, ["degerleme", "değerleme", "valuation", "bewertung", "оценк"])
      ? "PROPERTY_VALUATION"
      : includesAny(value, ["kiraya ver", "vermieten", "rent out", "сдать"])
        ? "RENT_OUT_PROPERTY"
        : includesAny(value, ["satmak", "satmak ist", "sell my", "verkaufen", "продать"])
          ? "SELL_PROPERTY"
          : includesAny(value, ["yatirim", "yatırım", "investment", "anlage", "инвест"])
            ? "INVESTMENT"
            : includesAny(value, ["kira", "kiralik", "kiralık", "rent", "miete", "аренд"])
              ? "RENT_PROPERTY"
              : includesAny(value, ["bolge", "bölge", "region", "gebiet", "район"])
                ? "REGION_RESEARCH"
                : includesAny(value, ["karsilastir", "karşılaştır", "compare", "vergleich", "сравн"])
                  ? "PROPERTY_COMPARISON"
                  : includesAny(value, ["bersu invest", "kimdir", "ofis", "office", "hizmet", "service", "services", "company", "firma", "şirket"])
                    ? "COMPANY_INFORMATION"
                    : includesAny(value, ["villa", "daire", "apartment", "haus", "квартир", "arsa", "land", "grundst", "участ"])
                    ? "BUY_PROPERTY"
                    : "GENERAL_REAL_ESTATE_QUESTION";

  const filters: PublicAssistantFilters = {};
  if (intent === "RENT_PROPERTY") filters.listingType = ListingType.FOR_RENT;
  if (intent === "BUY_PROPERTY" || intent === "INVESTMENT") filters.listingType = ListingType.FOR_SALE;

  const typeMap: Array<[string, string]> = [
    ["villa", "VILLA"], ["daire", "APARTMENT"], ["apartment", "APARTMENT"], ["residence", "RESIDENCE"],
    ["arsa", "LAND"], ["land", "LAND"], ["grundst", "LAND"], ["участ", "LAND"], ["tarla", "FIELD"],
    ["dukkan", "SHOP"], ["dükkan", "SHOP"], ["shop", "SHOP"], ["ofis", "OFFICE"], ["office", "OFFICE"],
  ];
  const type = typeMap.find(([term]) => value.includes(term));
  if (type) filters.propertyType = type[1];

  const locations: Array<[string, keyof Pick<PublicAssistantFilters, "district" | "neighborhood">, string]> = [
    ["calis", "neighborhood", "Çalış"], ["çalış", "neighborhood", "Çalış"], ["gocek", "district", "Göcek"], ["göcek", "district", "Göcek"],
    ["ovacik", "district", "Ovacık"], ["ovacık", "district", "Ovacık"], ["hisaronu", "district", "Hisarönü"], ["hisarönü", "district", "Hisarönü"],
    ["kayakoy", "district", "Kayaköy"], ["kayaköy", "district", "Kayaköy"], ["fethiye", "district", "Fethiye"], ["seydikemer", "district", "Seydikemer"],
  ];
  const location = locations.find(([term]) => value.includes(term));
  if (location) { filters.city = "Muğla"; filters[location[1]] = location[2]; }
  const bedrooms = value.match(/(\d+)\s*\+\s*\d+/);
  if (bedrooms) filters.bedrooms = Number(bedrooms[1]);
  Object.assign(filters, priceRange(value));
  return { intent, filters };
}

function localeOrTurkish(locale: string): ContentLocale {
  return contentLocales.includes(locale as ContentLocale) ? locale as ContentLocale : "tr";
}

export type PublicRegionKnowledge = { slug: string; name: string; shortDescription: string; lifestyle: string; investmentProfile: string; advantages: string; considerations: string };

export async function findPublicRegionKnowledge(message: string, locale: string): Promise<PublicRegionKnowledge[]> {
  const normalized = normalize(message);
  const records = await prisma.regionKnowledge.findMany({ where: { isPublished: true, deletedAt: null }, orderBy: { sortOrder: "asc" }, select: { slug: true, content: true } });
  const language = localeOrTurkish(locale);
  return records.flatMap((record) => {
    const content = record.content as Record<string, Record<string, string>>;
    const localized = content[language] ?? content.tr;
    const name = localized?.name ?? record.slug;
    if (!localized || (!normalized.includes(normalize(record.slug)) && !normalized.includes(normalize(name)))) return [];
    return [{ slug: record.slug, name, shortDescription: localized.shortDescription ?? "", lifestyle: localized.lifestyle ?? "", investmentProfile: localized.investmentProfile ?? "", advantages: localized.advantages ?? "", considerations: localized.considerations ?? "" }];
  });
}

export async function findPublicAssistantProperties(filters: PublicAssistantFilters, limit = 5): Promise<PublicAssistantProperty[]> {
  const properties = await prisma.property.findMany({
    where: {
      status: PropertyStatus.PUBLISHED,
      deletedAt: null,
      ...(filters.listingType ? { listingType: filters.listingType } : {}),
      ...(filters.propertyType ? { type: { key: filters.propertyType } } : {}),
      ...(filters.city ? { city: { equals: filters.city, mode: "insensitive" } } : {}),
      ...(filters.district ? { district: { equals: filters.district, mode: "insensitive" } } : {}),
      ...(filters.neighborhood ? { neighborhood: { equals: filters.neighborhood, mode: "insensitive" } } : {}),
      ...(filters.bedrooms !== undefined ? { bedrooms: { gte: filters.bedrooms } } : {}),
      ...(filters.minPrice !== undefined || filters.maxPrice !== undefined ? { price: { ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}), ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}) } } : {}),
    },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take: limit,
    select: {
      id: true, slug: true, propertyId: true, title: true, listingType: true, price: true, currencyCode: true, city: true, district: true, neighborhood: true, bedrooms: true, bathrooms: true, grossAreaM2: true,
      type: { select: { name: true } },
      media: { where: { deletedAt: null, isPublic: true }, orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }], take: 1, select: { url: true } },
      assignedAgent: { select: { firstName: true, lastName: true, phone: true, whatsapp: true } },
    },
  });
  return properties.map((property) => ({
    ...property,
    price: property.price?.toString() ?? null,
    grossAreaM2: property.grossAreaM2?.toString() ?? null,
    type: property.type.name,
    image: property.media[0]?.url ?? null,
    agent: property.assignedAgent,
  }));
}

export async function publicAssistantFallback(input: { locale: string; intent: PublicAssistantIntent; matches: PublicAssistantProperty[]; regions?: PublicRegionKnowledge[] }) {
  const language = input.locale.startsWith("en") ? "en" : input.locale.startsWith("de") ? "de" : input.locale.startsWith("ru") ? "ru" : "tr";
  if (input.intent === "SELL_PROPERTY" || input.intent === "RENT_OUT_PROPERTY" || input.intent === "PROPERTY_VALUATION") {
    return { answer: { tr: "Mülkünüz için doğru stratejiyi birlikte oluşturalım. İsterseniz bilgilerinizi kaydedip bir danışmanımızın sizinle iletişime geçmesini sağlayabilirim.", en: "Let us create the right strategy for your property. You can leave your details and a Bersu advisor can contact you.", de: "Lassen Sie uns die passende Strategie für Ihre Immobilie entwickeln. Hinterlassen Sie Ihre Kontaktdaten, damit ein Bersu-Berater Sie kontaktieren kann.", ru: "Давайте сформируем подходящую стратегию для вашей недвижимости. Оставьте контакты, и консультант Bersu свяжется с вами." }[language], needsLead: true };
  }
  if (input.intent === "HUMAN_AGENT_REQUEST") {
    return { answer: { tr: "Elbette. Görüşme talebinizi bırakabilir veya WhatsApp üzerinden ekibimizle hemen devam edebilirsiniz.", en: "Of course. Leave a call-back request or continue with our team on WhatsApp.", de: "Sehr gern. Hinterlassen Sie eine Rückrufbitte oder setzen Sie das Gespräch direkt über WhatsApp fort.", ru: "Конечно. Оставьте запрос на звонок или продолжите общение с нашей командой в WhatsApp." }[language], needsLead: true };
  }
  if (input.intent === "COMPANY_INFORMATION") {
    const content = await getSiteContentForLocale("aiAssistant", localeOrTurkish(input.locale));
    return { answer: content.companyIntro || { tr: "Bersu Invest, Fethiye ve çevresinde alım, satım, kiralama ve yatırım süreçlerinde yerel uzmanlık sunar. İsterseniz ihtiyacınızı anlatın veya bir danışmanla görüşün.", en: "Bersu Invest offers local expertise for buying, selling, renting, and investing in Fethiye and its surroundings. Tell us what you need or speak with an advisor.", de: "Bersu Invest bietet lokale Expertise für Kauf, Verkauf, Vermietung und Investment in Fethiye und Umgebung. Schildern Sie Ihren Bedarf oder sprechen Sie mit einem Berater.", ru: "Bersu Invest предлагает местную экспертизу по покупке, продаже, аренде и инвестициям в Фетхие и окрестностях. Расскажите о своей задаче или поговорите с консультантом." }[language], needsLead: false };
  }
  if ((input.intent === "REGION_RESEARCH" || input.intent === "PROPERTY_COMPARISON") && input.regions?.length) {
    const answer = input.regions.map((region) => [region.name, region.shortDescription, region.lifestyle && `${language === "tr" ? "Yaşam" : "Lifestyle"}: ${region.lifestyle}`, region.investmentProfile && `${language === "tr" ? "Yatırım profili" : "Investment profile"}: ${region.investmentProfile}`, region.advantages && `${language === "tr" ? "Avantajlar" : "Advantages"}: ${region.advantages}`, region.considerations && `${language === "tr" ? "Dikkat edilmesi gerekenler" : "Considerations"}: ${region.considerations}`].filter(Boolean).join("\n")).join("\n\n");
    return { answer, needsLead: false };
  }
  if (input.intent === "REGION_RESEARCH" || input.intent === "INVESTMENT" || input.intent === "PROPERTY_COMPARISON") {
    return { answer: { tr: "Yatırım ve bölge değerlendirmelerinde yalnızca doğrulanmış portföy ve editoryal içerikleri kullanırız. Getiri veya değer artışı garantisi veremeyiz. Bütçenizi ve hedef bölgeyi paylaşırsanız yayındaki uygun ilanları gösterebilirim; karar aşamasında danışmanımızla görüşmenizi öneririm.", en: "For investment and area research, we use only verified portfolio and editorial content. We cannot guarantee returns or appreciation. Share your budget and preferred area and I can show relevant published listings; we recommend speaking with an advisor before making a decision.", de: "Für Investment- und Regionsbewertungen nutzen wir nur verifizierte Portfolio- und Redaktionsinhalte. Renditen oder Wertsteigerungen können wir nicht garantieren. Nennen Sie Budget und Wunschregion, damit ich passende veröffentlichte Angebote zeigen kann; vor einer Entscheidung empfehlen wir ein Gespräch mit einem Berater.", ru: "Для инвестиционного и регионального анализа мы используем только проверенные данные портфеля и редакционные материалы. Мы не гарантируем доходность или рост стоимости. Укажите бюджет и предпочтительный район, и я покажу подходящие опубликованные объекты; перед решением рекомендуем консультацию специалиста." }[language], needsLead: false };
  }
  if (input.intent === "GENERAL_REAL_ESTATE_QUESTION") {
    return { answer: { tr: "Size satın alma, kiralama, yatırım veya satış sürecinde yardımcı olabilirim. Bölge, bütçe ve gayrimenkul türünü yazarsanız yalnızca gerçek, yayındaki ilanlarda arama yaparım.", en: "I can help with buying, renting, investing, or selling. Tell me the area, budget, and property type and I will search only real published listings.", de: "Ich unterstütze Sie beim Kauf, bei der Miete, beim Investment oder Verkauf. Nennen Sie Region, Budget und Immobilientyp, dann suche ich nur in echten veröffentlichten Angeboten.", ru: "Я могу помочь с покупкой, арендой, инвестициями или продажей. Укажите район, бюджет и тип объекта, и я буду искать только среди реальных опубликованных предложений." }[language], needsLead: false };
  }
  if (input.matches.length) {
    return { answer: { tr: `Kriterlerinize uyan ${input.matches.length} aktif ilan buldum. Yalnızca yayındaki gerçek Bersu Invest portföylerini gösteriyorum.`, en: `I found ${input.matches.length} active listings matching your criteria. I am showing only real published Bersu Invest listings.`, de: `Ich habe ${input.matches.length} aktive Angebote gefunden, die zu Ihren Kriterien passen. Ich zeige ausschließlich veröffentlichte Bersu-Invest-Immobilien.`, ru: `Я нашёл ${input.matches.length} активных объектов по вашим критериям. Здесь показаны только опубликованные реальные объекты Bersu Invest.` }[language], needsLead: false };
  }
  return { answer: { tr: "Şu anda kriterlerinize tam uyan aktif bir portföyümüz bulunmuyor. Talebinizi kaydederseniz uygun bir gayrimenkul portföyümüze girdiğinde danışmanlarımız sizinle iletişime geçebilir.", en: "There is currently no active listing that fully matches your criteria. Save your request and our advisors can contact you when a suitable property enters our portfolio.", de: "Derzeit gibt es kein aktives Angebot, das Ihren Kriterien vollständig entspricht. Speichern Sie Ihre Anfrage, damit unsere Berater Sie kontaktieren können, wenn eine passende Immobilie in unser Portfolio kommt.", ru: "Сейчас в нашем активном портфеле нет объекта, полностью соответствующего вашим критериям. Сохраните заявку, и наши консультанты свяжутся с вами, когда подходящий объект появится в портфеле." }[language], needsLead: true };
}
