export const locales = ["tr", "en", "de", "ru"] as const;
export type Locale = (typeof locales)[number];

// Only brand-owned local assets are used until reviewed legacy content is imported.
export const siteImages = {
  hero: "/og.png",
  villa: "/og.png",
  coast: "/og.png",
  interior: "/og.png",
  pool: "/og.png",
  marina: "/og.png",
  home: "/og.png",
  agentOne: "/og.png",
  agentTwo: "/og.png",
  agentThree: "/og.png",
};

export type PublicPropertyFixture = { slug: string; image: string; title: string; area: string; city: string; district: string; type: string; typeKey: string; listingType: "FOR_SALE" | "FOR_RENT"; beds: number; baths: number; areaM2: number; priceValue: number; price: string; tag: string; agentSlug: string };
export type RegionFixture = { slug: string; name: string; count: number; image: string; description: string };
export type AgentFixture = { slug: string; name: string; role: string; image: string; languages: string; phone: string };
export type ArticleFixture = { slug: string; category: string; title: string; excerpt: string; image: string; date: string; read: string };

// Operational content must come from Prisma or reviewed legacy imports, never fixtures.
export const properties: PublicPropertyFixture[] = [];
export const regions: RegionFixture[] = [];
export const agents: AgentFixture[] = [];
export const articles: ArticleFixture[] = [];

const dictionary = {
  tr: { homes: "Ana Sayfa", about: "Hakkımızda", regions: "Bölgeler", projects: "Projeler", properties: "Gayrimenkuller", agents: "Danışmanlar", blog: "Dergi", contact: "İletişim", faq: "Sık Sorulanlar", search: "Gayrimenkul ara", viewAll: "Tümünü görüntüle", discover: "Keşfedin", featured: "Öne çıkanlar", latest: "Yeni eklenenler", request: "Aradığınız evi anlatın", sell: "Gayrimenkulünüzü değerlendirelim", details: "İncele", footer: "Fethiye ve çevresinde seçkin gayrimenkul danışmanlığı.", menu: "Menü", language: "Dil" },
  en: { homes: "Home", about: "About", regions: "Regions", projects: "Projects", properties: "Properties", agents: "Advisors", blog: "Journal", contact: "Contact", faq: "FAQ", search: "Search properties", viewAll: "View all", discover: "Discover", featured: "Featured homes", latest: "Latest listings", request: "Tell us about your ideal home", sell: "Let us value your property", details: "View details", footer: "Distinctive real estate advisory in Fethiye and beyond.", menu: "Menu", language: "Language" },
  de: { homes: "Startseite", about: "Über uns", regions: "Regionen", projects: "Projekte", properties: "Immobilien", agents: "Berater", blog: "Journal", contact: "Kontakt", faq: "FAQ", search: "Immobilien suchen", viewAll: "Alle ansehen", discover: "Entdecken", featured: "Ausgewählte Immobilien", latest: "Neue Angebote", request: "Erzählen Sie uns von Ihrem Wunschhaus", sell: "Lassen Sie Ihre Immobilie bewerten", details: "Details ansehen", footer: "Exklusive Immobilienberatung in Fethiye und Umgebung.", menu: "Menü", language: "Sprache" },
  ru: { homes: "Главная", about: "О нас", regions: "Регионы", projects: "Проекты", properties: "Объекты", agents: "Консультанты", blog: "Журнал", contact: "Контакты", faq: "Вопросы", search: "Поиск недвижимости", viewAll: "Смотреть все", discover: "Открыть", featured: "Избранные объекты", latest: "Новые предложения", request: "Расскажите о доме вашей мечты", sell: "Оцените свою недвижимость", details: "Подробнее", footer: "Премиальный консалтинг по недвижимости в Фетхие и окрестностях.", menu: "Меню", language: "Язык" },
} as const;

export function copy(locale: Locale) { return dictionary[locale]; }
export function isLocale(value: string): value is Locale { return locales.includes(value as Locale); }
