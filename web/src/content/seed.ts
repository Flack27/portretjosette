import type {
  Category,
  ContentMap,
  Portrait,
  PriceRow,
  SiteSettings,
} from "@/lib/types";

/*
  Seed + fallback content for "Portret door Josette".

  This module is the single source of truth used in two places:
    1. As a FALLBACK — lib/content.ts serves this when PocketBase is empty or
       unreachable, so the site always renders and always builds.
    2. As the SEED — scripts/seed.ts imports it to populate a fresh PocketBase.

  Titles/categories below are a sensible first pass over Josette's exported
  artwork; she refines them in the PocketBase admin UI (they are not final).
*/

// ─── Categories ──────────────────────────────────────────────────────────────
export const CATEGORIES: Category[] = [
  {
    slug: "mensen",
    name: "Mensen",
    blurb: "Portretten van volwassenen, koppels en families.",
    order: 1,
  },
  {
    slug: "kinderen",
    name: "Kinderen",
    blurb: "Kinderportretten vol spontaniteit en karakter.",
    order: 2,
  },
  {
    slug: "huisdieren",
    name: "Huisdieren",
    blurb: "Honden, katten, paarden en andere trouwe metgezellen.",
    order: 3,
  },
  {
    slug: "natuur",
    name: "Natuur",
    blurb: "Vogels, bosdieren en wild — geobserveerd en geduldig nagetekend.",
    order: 4,
  },
];

// ─── Portraits ───────────────────────────────────────────────────────────────
// [filename (in /public/art), title, category, featured?]
type Seed = [file: string, title: string, category: Portrait["category"], featured?: boolean];

const PORTRAIT_SEED: Seed[] = [
  // Mensen
  ["vrouw.webp", "Vrouw", "mensen", true],
  ["bner.webp", "Vrouwenportret", "mensen"],
  ["familie.webp", "Familieportret", "mensen"],
  ["koppel.webp", "Koppel", "mensen"],
  ["trio.webp", "Trio", "mensen"],
  ["oma-baby.webp", "Oma en kleinkind", "mensen"],
  ["oudeman.webp", "Oude man", "mensen"],
  ["man-tulban.webp", "Man met tulband", "mensen"],
  ["zwarte-man.webp", "Mannenportret", "mensen"],
  ["zwartere-man.webp", "Mannenportret II", "mensen"],
  ["koningin.webp", "Koningin", "mensen"],
  ["max-verstappen.webp", "Max Verstappen", "mensen"],
  ["ronald-goedemond.webp", "Ronald Goedemond", "mensen"],
  ["gandalf.webp", "Gandalf", "mensen"],
  ["zelfportret-josette.webp", "Zelfportret", "mensen"],
  ["twee-meiden.webp", "Twee meiden", "mensen"],

  // Kinderen
  ["kind-groen.webp", "Kind in het groen", "kinderen"],
  ["kind-blond.webp", "Blond kind", "kinderen"],
  ["kind-muts.webp", "Kind met muts", "kinderen"],
  ["kind-muur.webp", "Kind bij de muur", "kinderen"],
  ["kind-rood.webp", "Kind in het rood", "kinderen"],
  ["kind-zw.webp", "Kind in zwart-wit", "kinderen"],
  ["kinderen.webp", "Kinderen", "kinderen"],
  ["kinderen-knuffel.webp", "Kinderen met knuffel", "kinderen"],
  ["meisje.webp", "Meisje", "kinderen"],
  ["zwarte-baby.webp", "Baby", "kinderen"],

  // Huisdieren
  ["hond-jongen.webp", "Jongen met hond", "huisdieren", true],
  ["hond-meisje.webp", "Meisje met hond", "huisdieren"],
  ["hond.webp", "Hond", "huisdieren"],
  ["hond2.webp", "Hond", "huisdieren"],
  ["hond-kist.webp", "Hond", "huisdieren"],
  ["flip-hond.webp", "Hond Flip", "huisdieren"],
  ["dalmatier.webp", "Dalmatiër", "huisdieren"],
  ["kat-hond.webp", "Kat en hond", "huisdieren"],
  ["paard.webp", "Paard", "huisdieren", true],
  ["lama.webp", "Lama", "huisdieren", true],

  // Natuur
  ["zeearend.webp", "Zeearend", "natuur"],
  ["uil.webp", "Uil", "natuur"],
  ["blauwborst.webp", "Blauwborst", "natuur"],
  ["vogel.webp", "Vogel", "natuur"],
  ["haas.webp", "Haas", "natuur"],
  ["hertje.webp", "Hertje", "natuur"],
  ["leeuw.webp", "Leeuw", "natuur"],
  ["giraffe.webp", "Giraffe", "natuur"],
];

const categoryName = (slug: Portrait["category"]) =>
  CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;

export const PORTRAITS: Portrait[] = PORTRAIT_SEED.map(
  ([file, title, category, featured], i) => {
    const slug = file.replace(/\.webp$/, "");
    return {
      id: slug,
      slug,
      title,
      category,
      medium: "Pastelkrijt",
      image: `/art/${file}`,
      alt: `Realistisch pastelportret — ${title} (${categoryName(category)})`,
      featured: Boolean(featured),
      order: i + 1,
    };
  },
);

/** Filenames left out of the individual gallery (multi-work collages). */
export const EXCLUDED_ART = [
  "dier-collage.webp",
  "boerderij-dieren.webp",
  "natuur-grid.webp",
  "vogels2x2.webp",
];

// ─── Prices ──────────────────────────────────────────────────────────────────
const priceSeed: Omit<PriceRow, "id" | "order">[] = [
  { group: "Portretten", label: "A4 — persoon of dier", price: "€100" },
  { group: "Portretten", label: "A4 — duo", price: "€175" },
  { group: "Portretten", label: "A3 — persoon of dier", price: "€150" },
  { group: "Portretten", label: "A3 — duo", price: "€225" },
  { group: "Portretten", label: "A3 — trio", price: "€275" },
  {
    group: "Klein werk",
    label: "Vogels, bosdieren & insecten",
    sublabel: "15×15 cm · incl. lijst en passe-partout",
    price: "€35",
  },
  { group: "Afwerking", label: "A4 formaat", price: "€25" },
  { group: "Afwerking", label: "A3 formaat", price: "€30" },
];

export const PRICES: PriceRow[] = priceSeed.map((p, i) => ({
  ...p,
  id: `price-${i + 1}`,
  order: i + 1,
}));

// ─── Settings ────────────────────────────────────────────────────────────────
export const SETTINGS: SiteSettings = {
  email: "info@portretdoorjosette.nl",
  locality: "Hilvarenbeek",
  region: "Noord-Brabant",
  countryName: "Nederland",
  // Defaults; overridable via env or in the PocketBase settings record.
  facebook:
    process.env.NEXT_PUBLIC_FACEBOOK_URL ??
    "https://facebook.com/profile.php?id=61560156520268",
  instagram:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://instagram.com/josettespapens16",
  responseTime: "Ik reageer meestal binnen een paar dagen.",
  // Keyless Google Maps embed; overridable in settings.
  mapEmbedUrl: "https://www.google.com/maps?q=Hilvarenbeek,+Nederland&output=embed",
  // Brand photos — defaults used until Josette uploads her own in settings.
  heroImage: "/art/kind-groen.webp",
  overMijImage: "/art/vrouw.webp",
};

// ─── Editable copy blocks ────────────────────────────────────────────────────
// key → default value. `label`/`group` metadata for the admin UI lives in
// CONTENT_FIELDS below (used by the seed script), kept parallel to this map.
export const CONTENT: ContentMap = {
  // Home
  "home.hero_eyebrow": "Portret in opdracht · Hilvarenbeek",
  "home.hero_title_lead": "Uw dierbaarste herinnering,",
  "home.hero_title_accent": "tijdloos getekend.",
  "home.hero_lead":
    "Ik teken realistische portretten van mensen en huisdieren met oog voor de juiste blik, emotie en karakter.",
  "home.hero_cta": "Portret aanvragen",
  "home.featured_title": "Een greep uit het werk",

  // Portfolio
  "portfolio.title": "Ontdek per categorie",
  "portfolio.subtitle": "Kies een categorie om het volledige werk te bekijken.",

  // Over mij
  "over.eyebrow": "Over mij",
  "over.title": "Hoe het begon",
  "over.p1":
    "Mijn naam is Josette Spapens, geboren en getogen in het fantastische Brabant. Met mijn man, vier kinderen en hond woon ik in Hilvarenbeek.",
  "over.p2":
    "De basis van mijn tekeningen ligt in mijn studie biologie en mijn werk als docent. Twintig jaar voor de klas maakte biologie meer dan een vak voor mij; het werd een passie. Een van de meest geliefde manieren om die passie over te brengen, was door praktijklessen en vooral ook door leerlingen natuurgetrouw en realistisch te laten tekenen. Niet zomaar wat schetsen maar gedetailleerde, nauwkeurige potloodtekeningen van de wonderen van de natuur, zowel plant als dier.",
  "over.p3":
    "Als tekenaar maak ik nu realistische portretten van mensen en dieren in opdracht, telkens een mooie uitdaging om de juiste blik, emotie en karakter te vangen. Ik werk graag met pastelkrijt, dat de tekeningen een warme, levendige uitstraling geeft. Elk portret werk ik met zorg en oog voor detail uit, en ik houd graag contact tijdens het proces, zodat het eindresultaat precies past bij wat u voor ogen heeft.",
  "over.stat1_num": "20+",
  "over.stat1_label": "jaar docent biologie",
  "over.stat2_num": "Pastel",
  "over.stat2_label": "krijt, grafiet & houtskool",
  "over.stat3_num": "Hilvarenbeek",
  "over.stat3_label": "Noord-Brabant",

  // Tarieven
  "tarieven.title": "Tarieven",
  "tarieven.intro":
    "Een overzicht van de verschillende tekeningen die ik aanbied. Zit er niet tussen wat u zoekt? Neem gerust contact op, ik denk graag met u mee.",
  "tarieven.afwerking_title": "Afwerking met fotolijst & passe-partout",
  "tarieven.cta_title": "Zelf een dierbare foto?",
  "tarieven.cta_body":
    "Mail uw foto en ik teken deze voor u. Hoe hoger de kwaliteit, des te gedetailleerder het resultaat.",
  "tarieven.cta_button": "Portret aanvragen",
  "tarieven.werkwijze_title": "Werken met foto's",
  "tarieven.werkwijze_p1":
    "Voor mijn portrettekeningen werk ik op basis van foto's. Om een goed gelijkend portret te kunnen tekenen, is het belangrijk dat de foto voldoende scherp is. Een perfect scherpe foto is echt niet nodig, maar de belangrijkste details moeten wel zichtbaar zijn. Ik controleer vooraf altijd of de foto geschikt is om mee te werken.",
  "tarieven.werkwijze_p2":
    "Soms zijn er geen foto's waarop iedereen samen staat. In een tekening kan ik dierbaren samenbrengen, ook als ze niet op hetzelfde moment of zelfs niet meer in hetzelfde leven bij elkaar waren. Zo ontstaat een portret dat verbindt, herinnert en troost. Uit respect voor de privacy van mijn opdrachtgevers deel ik portretten zelden; via andere tekeningen laat ik graag mijn stijl zien.",

  // Contact
  "contact.title": "Neem contact op",
  "contact.subtitle":
    "Vragen of een portret laten maken? Stuur gerust een bericht, ik reageer meestal binnen een paar dagen.",
  "contact.location_title": "Locatie",
};

/** Human labels for the editable copy blocks (drives the PocketBase seed). */
export const CONTENT_FIELDS: Record<string, { label: string; group: string }> = {
  "home.hero_eyebrow": { label: "Hero — bovenschrift", group: "Home" },
  "home.hero_title_lead": { label: "Hero — titel", group: "Home" },
  "home.hero_title_accent": { label: "Hero — titel (accent, cursief groen)", group: "Home" },
  "home.hero_lead": { label: "Hero — introtekst", group: "Home" },
  "home.hero_cta": { label: "Hero — knoptekst", group: "Home" },
  "home.featured_title": { label: "Uitgelicht werk — kop", group: "Home" },
  "portfolio.title": { label: "Portfolio — kop", group: "Portfolio" },
  "portfolio.subtitle": { label: "Portfolio — subtekst", group: "Portfolio" },
  "over.eyebrow": { label: "Bovenschrift", group: "Over mij" },
  "over.title": { label: "Titel", group: "Over mij" },
  "over.p1": { label: "Alinea 1", group: "Over mij" },
  "over.p2": { label: "Alinea 2", group: "Over mij" },
  "over.p3": { label: "Alinea 3", group: "Over mij" },
  "over.stat1_num": { label: "Statistiek 1 — getal", group: "Over mij" },
  "over.stat1_label": { label: "Statistiek 1 — label", group: "Over mij" },
  "over.stat2_num": { label: "Statistiek 2 — getal", group: "Over mij" },
  "over.stat2_label": { label: "Statistiek 2 — label", group: "Over mij" },
  "over.stat3_num": { label: "Statistiek 3 — getal", group: "Over mij" },
  "over.stat3_label": { label: "Statistiek 3 — label", group: "Over mij" },
  "tarieven.title": { label: "Titel", group: "Tarieven" },
  "tarieven.intro": { label: "Introtekst", group: "Tarieven" },
  "tarieven.afwerking_title": { label: "Afwerking — kop", group: "Tarieven" },
  "tarieven.cta_title": { label: "CTA-kaart — kop", group: "Tarieven" },
  "tarieven.cta_body": { label: "CTA-kaart — tekst", group: "Tarieven" },
  "tarieven.cta_button": { label: "CTA-kaart — knoptekst", group: "Tarieven" },
  "tarieven.werkwijze_title": { label: "Werkwijze — kop", group: "Tarieven" },
  "tarieven.werkwijze_p1": { label: "Werkwijze — alinea 1 (foto's)", group: "Tarieven" },
  "tarieven.werkwijze_p2": { label: "Werkwijze — alinea 2", group: "Tarieven" },
  "contact.title": { label: "Titel", group: "Contact" },
  "contact.subtitle": { label: "Subtekst", group: "Contact" },
  "contact.location_title": { label: "Locatie — kop", group: "Contact" },
};
