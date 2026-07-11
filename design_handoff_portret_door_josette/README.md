# Handoff: Portret door Josette — website redesign

## Overview
A refresh of **portretdoorjosette.nl**, the portfolio site of realistic-portrait artist Josette Spapens (Hilvarenbeek, NL). The redesign **keeps the existing bosgroen (forest-green) identity** but modernizes layout, visual hierarchy, and the mobile experience. The paintings carry the page; the UI stays restrained. Five pages: **Home, Portfolio, Over mij, Tarieven, Contact**. Language: **Dutch**.

Target stack (per client): **Next.js + React + Tailwind, mobile-first.**

## About the design files
The files in this bundle are **design references created in HTML** — a prototype showing the intended look, layout, and behavior. They are **not production code to copy directly**. The task is to **recreate these designs in the target codebase** (Next.js App Router + React + Tailwind) using its own conventions, component structure, and image pipeline (`next/image`). Where this doc gives exact hex/px values, treat them as the source of truth and encode them as Tailwind theme tokens.

The prototype is a single-file "canvas" showing every page at **desktop (1180px content)** and **mobile (390px)** widths, with two explored directions each for Home and Portfolio. Ignore the outer canvas chrome, browser bars, and phone bezels — those are presentation scaffolding, not part of the product.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, and interactions are specified. Recreate pixel-faithfully with Tailwind, adapting only where the framework demands (e.g. real `<form>` inputs, real routing).

## Selected directions
Two directions were explored for the two lead pages; the client selected:
- **Home → Direction 1b "Atelier"** (editorial split hero, green nav bar retained). *1a "Galerie" (full-bleed hero) is included as an alternate only.*
- **Portfolio → Direction 2b "Categorie-eerst"** (2×2 folder/collage category cards that open a category grid page). *2a "Portfolio-index" (filter chips + auto-rotating banner + masonry) is included as an alternate; note the auto-rotate carousel behavior described below is reusable in either.*

Build **1b** and **2b**. Keep 1a/2a in mind only if the client revisits.

---

## Design tokens

### Color
| Token | Hex | Use |
|---|---|---|
| `forest-900` | `#2C3C14` | Nav bar, footer, primary buttons, headings-on-light emphasis |
| `forest-600` | `#4D6A2A` | Links, italic accent words, secondary headers, "Klein werk" header |
| `sage-400` | `#97A678` | Active nav underline, subtle accents |
| `paper-50` | `#F4F1E9` | Page background (warm paper) |
| `paper-100`| `#EFEADE` | Alt section background, add-on info box |
| `card-50` | `#FBFAF5` | Cards, form fields |
| `line-200` | `#E6E0D2` | Card borders |
| `line-300` | `#ECE7D9` | Inner dividers / table row rules |
| `ink-900` | `#292723` | Primary heading + body text on light |
| `ink-700` | `#3A382F` | Table row labels |
| `muted-600`| `#5F5B4E` | Body / lead paragraphs |
| `muted-500`| `#6D685C` | Captions |
| `muted-400`| `#8A8574` | Eyebrows on light, meta counts |
| `nav-dim` | `#D7DCC7` | Inactive nav links (on forest bar) |
| `bezel` | `#1C1B16` | (prototype phone bezel only — not product) |

Text colors used on the forest-900 hero/cards: headings/CTA text `#F3F1E6`/`#EEF0E5`, body `#C3CCAE`, eyebrow `#A9B490`/`#CDD6B6`.

### Typography
Two families (Google Fonts):
- **Cormorant Garamond** — display & all headings. Weights 400/500/600; italic 400 used for accent words. Weight **500** is the workhorse for headings.
- **Mulish** — body, UI, nav, labels, buttons, meta. Weights 300/400/500/600/700.

Scale (mobile-first; `clamp` where it scales):
| Role | Family / weight | Size |
|---|---|---|
| display (hero H1) | Cormorant 500 | `clamp(2.125rem, 6vw, 3.75rem)`, line-height 1.02–1.05, letter-spacing -.01em |
| h1 (page title) | Cormorant 500 | `clamp(2rem, 5vw, 2.9rem)` |
| h2 (section) | Cormorant 500 | 1.75rem / lh 1.1 |
| h3 / card title | Cormorant 500 | 1.5–1.6875rem |
| lead | Mulish 400 | 1.0625rem / lh 1.65 |
| body | Mulish 400 | 1rem / lh 1.7 |
| small / caption | Mulish 400 | 0.8125–0.875rem |
| eyebrow | Mulish 600 | 0.75rem, `text-transform:uppercase`, letter-spacing .3em, color `muted-400` |

### Spacing & layout
- 4px base (Tailwind default scale).
- Content container: `max-w-6xl` (~1180px), horizontal padding `px-5` (mobile) → `px-12` (desktop).
- Section vertical rhythm: `py-14` (mobile) → `py-24` (desktop). Hero/intro can go larger.
- Nav bar padding: `py-5 px-12` desktop.

### Radius / borders / shadows
- Buttons & images: radius **2px** (intentionally crisp/gallery-like).
- Cards: radius **6px**; category folder cards **8px**.
- Card border: `1px solid line-200`; category cards add a `0 2px 0 #ECE7D9` "stacked paper" bottom edge.
- Card/print shadow: `0 14px 26px -10px rgb(40 45 20 / .6)`; softer prints `0 10px 22px -10px rgb(40 45 20 / .5)`.
- Image "print" frames (folder collages): `6px solid #fff` border (5px on side prints, 3px on mobile).
- Elevated frame shadow (hero image, over-mij photo): `0 24px 44px -22px rgb(40 45 20 / .5)`.

### Buttons
- **Primary**: bg `forest-900`, text `#F2F0E6`, `py-3.5 px-6.5`, radius 2px, Mulish 700, ~14.5px. On dark heroes the primary inverts: bg `paper-50`, text `forest-900`. Hover: bg `forest-600`. Focus: ring `sage-400`.
- **Secondary**: 1px border `forest-900`, text `forest-900`, same padding, Mulish 600. (On dark hero: 1px `rgba(255,255,255,.6)` border, white text.)
- **Text link**: `forest-900`, Mulish 600, 1px bottom border, trailing "→".

---

## Screens / views

### Global — Header / nav (Direction 1b, retained across pages)
- **Forest-900 bar**, space-between, `py-5 px-12`.
- Left: wordmark **"Portret door Josette"** (Cormorant 600, ~24px, `#F3F1E6`) with kicker below — "Realistische portrettekeningen" (Mulish, 10px, .26em caps, `#A9B490`).
- Right (desktop): nav links **Home · Portfolio · Over mij · Tarieven · Contact** (Mulish 500, 14px, `nav-dim`). Active link: white, weight 700, 2px `sage-400` bottom border.
- Mobile: wordmark + hamburger (three 22×2px bars, `#E6E8D8`). Header padding `pt-[30px] px-5 pb-3.5`.

### Global — Footer (shown on Contact; apply site-wide)
- bg `#24231D`, `py-8 px-12`, space-between. Left: wordmark (Cormorant 20px `#F3F1E6`) + line "Hilvarenbeek · info@portretdoorjosette.nl" (`#8F8B7C`, 12.5px). Right: "© 2025–2026 Portret door Josette" (`#6F6C5F`, 12px).

### 1. Home (Direction 1b — "Atelier")
- **Hero**: 2-col grid on `paper-50`, `py-16 px-12`, gap ~60px, vertically centered. Stacks to 1 col on mobile (text first, image second).
  - Left: eyebrow "Portret in opdracht · Hilvarenbeek"; H1 (display) "Uw dierbaarste herinnering, tijdloos getekend." — with **"tijdloos getekend."** in `forest-600` italic; lead paragraph (max ~420px): "Ik teken realistische portretten van mensen en huisdieren met pastelkrijt — met oog voor de juiste blik, emotie en karakter."; then primary button "Portret aanvragen" + text link "Bekijk het portfolio →".
  - Right: portrait image (`kind-groen`) `aspect-ratio .83`, radius 2px, elevated shadow, with a **-14px inset 1px `#CFC9B8` frame line** offset behind it.
- **"Een greep uit het werk"** band: bg `paper-100`, `py-11 px-12`. Header row: h3 (Cormorant 30px) + text link "Alles bekijken →". Then a **4-col grid, gap 16px** of square images (`aspect-ratio 1`, `object-fit:cover`): `hond-jongen, paard, lama, vrouw`. Mobile: fewer columns / horizontal rhythm.
- **Mobile** hero: forest nav, then text block (eyebrow, 34px H1, primary CTA), then framed portrait.

### 2. Portfolio (Direction 2b — "Categorie-eerst")
- Forest nav, then on `paper-50` `py-11 px-12`:
  - h2 "Ontdek per categorie" + sub "Kies een categorie om het volledige werk te bekijken."
  - **2×2 grid, gap 20px** of **folder/collage cards** (bg `card-50`, border `line-200`, radius 8px, stacked-paper bottom shadow, `padding: 24px 20px 18px`, `cursor:pointer`). Each card:
    - A **216px-tall relative stage**, `display:flex; align-items:center; justify-content:center`, holding **5 absolutely-positioned "photo prints"** fanned in an arc. Side prints 106×136px, `5px solid #fff` border, radius 2px, soft shadow. Center print 118×150px, `6px solid #fff`, stronger shadow, `z-index:5`. Fan transforms (from outer-left to outer-right, center last/on top):
      - `rotate(-17deg) translateX(-118px) translateY(22px)` z1
      - `rotate(-8.5deg) translateX(-60px) translateY(6px)` z2
      - `rotate(8.5deg) translateX(60px) translateY(6px)` z2
      - `rotate(17deg) translateX(118px) translateY(22px)` z1
      - `rotate(0) translateY(-10px)` z5 (center)
    - Below the stage: top rule (`1px line-300`, `pt-3`), then space-between row: category name (Cormorant 25px `forest-900`) + count "N werken →" (Mulish 600, 12.5px, `muted-400`).
    - Categories & counts: **Mensen 18**, **Kinderen 12**, **Huisdieren 24**, **Natuur 9**. (Image assignments per card are in the HTML; use `object-position` per print to keep faces framed — values are in the source.)
  - **Opened-category preview** below (illustrates the category detail route): breadcrumb "Portfolio / Huisdieren" (Cormorant 22px accent), note, then a **4-col grid, gap 14px** of square images. In production this is the `/portfolio/[categorie]` page — a calm square grid of all works in that category.
- **Mobile**: 2×2 grid of **compact folder cards** — same idea, 3 prints instead of 5 (64×80px side / 68×84px center, `3px solid #fff`), 104px stage, name (Cormorant 17px) + count.

### 3. Over mij ("Hoe het begon")
- Forest nav, then `paper-50` `py-[70px] px-12`, 2-col grid (image left, text right), gap 64px, centered. Stacks on mobile (image on top, ~280px tall cover).
  - Left: portrait (`vrouw`) `aspect-ratio .82`, radius 2px, elevated shadow, with -16px inset frame line.
  - Right: eyebrow "Over mij"; h2 "Hoe het begon"; three paragraphs (exact copy):
    1. "Mijn naam is Josette Spapens, geboren en getogen in het fantastische Brabant. Met mijn man, vier kinderen en hond woon ik in Hilvarenbeek."
    2. "De basis van mijn tekeningen ligt in mijn studie biologie en mijn werk als docent. Twintig jaar voor de klas maakte biologie voor mij meer dan een vak — het werd een passie. Talloze uren observeerden we samen de wonderen van de natuur, en tekenden die geduldig na."
    3. "Elk realistisch portret werk ik met zorg en aandacht voor detail uit, zodat het niet alleen een afbeelding wordt, maar ook een emotie oproept. Tijdens het proces houd ik graag contact — samen zorgen we dat het eindresultaat precies past bij wat u voor ogen heeft."
  - Stat row (top rule, `pt-6`, gap 32px): **20+** jaar docent biologie · **Pastel** krijt, grafiet & houtskool · **Hilvarenbeek** Noord-Brabant. (Big number = Cormorant 34px `forest-900`; label = 13px `muted-400`.)

### 4. Tarieven (prices only — no imagery)
- Forest nav, then `paper-50` `py-14 px-12`.
  - Intro (max ~620px): h2 "Tarieven" + paragraph "Een overzicht van de verschillende tekeningen die ik aanbied. Zit er niet tussen wat u zoekt? Neem gerust contact op — ik denk graag met u mee."
  - **2-col grid, gap 24px, `align-items:start`.**
    - **Left column** (flex-col gap 24px):
      - **Portretten** card (`card-50`, border `line-200`, radius 6px). Header bar `forest-900`, `#EEF0E5`: "Portretten" (Cormorant 22px) + right "EXCL. LIJST" (12px .16em caps `#A9B490`). Rows (`py-3.5`, `1px line-300` divider between, none after last), each space-between: label (Mulish 15.5px `ink-700`) + price (Cormorant 22px `forest-900`):
        - A4 — persoon of dier · **€100**
        - A4 — duo · **€175**
        - A3 — persoon of dier · **€150**
        - A3 — duo · **€225**
        - A3 — trio · **€275**
      - **Klein werk** card. Header bar `forest-600`: "Klein werk" + "INCL. LIJST". One row: "Vogels, bosdieren & insecten" with sub "15×15 cm · incl. lijst en passe-partout" · **€35**.
    - **Right column** (flex-col gap 24px):
      - **Afwerking** box (bg `paper-100`, border `#E2DCCC`, radius 6px, `p-[22px_26px]`): eyebrow "Afwerking met fotolijst & passe-partout"; two figures gap 36px — **€25** A4 formaat · **€30** A3 formaat (number Cormorant 26px `forest-900`, label 13px `muted-500`).
      - **CTA** card (bg `forest-900`, radius 6px, `p-[24px_26px]`, text `#E9ECDF`): h "Zelf een dierbare foto?" (Cormorant 21px); paragraph "Mail uw foto en ik teken deze voor u. Hoe hoger de kwaliteit, des te gedetailleerder het resultaat." (`#C3CCAE`, 13.5px); inverted primary button "Portret aanvragen".
  - **Mobile**: single column, same cards stacked (Portretten, then Afwerking figures). Compact type (~14px rows, 18px prices).

### 5. Contact
- Forest nav, then `paper-50` `py-15 px-12`, **2-col grid gap 60px** (form left, info right); stacks on mobile.
  - **Form** (left): h2 "Neem contact op"; sub "Vragen of een portret laten maken? Stuur gerust een bericht — ik reageer meestal binnen een paar dagen."; fields **Naam**, **E-mailadres** (inputs: `card-50` bg, `1px #D9D3C4`, radius 3px, 48px tall), **Bericht** (textarea ~120px). Labels: Mulish 600, 13px, `ink-700`, `mb-2`. Primary button "Verzenden".
  - **Right**: a **map** (embed real map here — prototype shows a placeholder with a `forest-900` teardrop pin; radius 6px, ~230px tall). Then h3 "Locatie" and lines: "Realistische portrettekeningen" / "Hilvarenbeek · Nederland" / "Mail: **info@portretdoorjosette.nl**" (email in `forest-600` 600). Social circles (42px, `forest-900`, white glyph) for Facebook + Instagram.

---

## Interactions & behavior
- **Auto-rotating featured carousel** (Portfolio 2a banner; reusable): a track of N=5 slides, each `width:100%; flex:none`, translated by `transform: translateX(-index*100%)` with `transition: transform .8s cubic-bezier(.45,0,.15,1)`. Auto-advances every **4200ms**; wraps modulo N. Prev/next arrow buttons and dot indicators; **any manual interaction resets the interval**. Active dot = `forest-900`, inactive = `#C9C3B2`. Implement as a client component with `useState`+`useEffect(setInterval)`, cleaned up on unmount. Respect `prefers-reduced-motion` (pause auto-advance).
- **Category folder cards** (2b): entire card is a link to `/portfolio/[categorie]`. Suggested hover: gently fan the prints wider / lift (translateY -4px) — additive, keep subtle.
- **Nav**: active route styled per the header spec. Mobile hamburger opens a full-screen or sheet menu (not drawn — use the codebase's pattern; forest-900 surface, same links).
- **Contact form**: real validation — Naam required, E-mailadres required + email format, Bericht required. Wire to the client's mail/endpoint. Success + error states.
- **Responsive**: mobile-first. All 2-col grids collapse to 1 col; hero text precedes image; galleries drop column count.

## State management
- Carousel: `index` (number) + interval ref. No global state needed.
- Contact form: field values + validation/submit state (or a form lib like react-hook-form per codebase convention).
- Portfolio: category data (name, slug, count, image list) — static/CMS-driven; drives both the cards and the `[categorie]` detail grid.

## Assets
All artwork lives in **`assets/art/`** (WebP), cropped/cleaned from the client's originals. These are Josette's actual drawings — treat as final content, feed through `next/image`:
- `vrouw.webp`, `kind-groen.webp` (cropped, process strip removed), `hond-jongen.webp` (cropped), `kinderen-knuffel.webp`, `kinderen.webp`, `lama.webp`, `paard.webp`, `trio.webp`, `natuur-grid.webp`.
- Fonts: Cormorant Garamond + Mulish via `next/font/google`.
- Icons (nav hamburger, socials, carousel arrows) are simple — use the codebase's icon set (e.g. lucide-react) rather than the prototype's hand-built glyphs.
- The prototype's browser/phone frames and the "canvas legend/style-system" section are **presentation only** — do not build them.

## Files
- `Portret door Josette - Redesign.dc.html` — the full prototype (all pages, both directions, plus an in-file style-system panel). Open in a browser to inspect exact markup/values. It uses a lightweight component runtime (`support.js`) purely for the prototype; **do not port that runtime** — read it as a static reference.
- `assets/art/*.webp` — final artwork.

Build order suggestion: tokens → layout (nav/footer) → Home (1b) → Portfolio (2b) + category detail → Over mij → Tarieven → Contact.
