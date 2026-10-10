# Kamenictví Smolík – produkční web (Astro)

Přepis schváleného prototypu `../site/index.html` do Astra. Vzhled a chování odpovídají prototypu 1:1
(ověřeno měřením poloh, rozměrů a computed styles na 1440×900, iPhone 13, iPad Mini na výšku i na šířku).

## Příkazy

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # statický výstup do dist/
npm run check      # typová kontrola
```

Vizuální porovnání s prototypem (prototyp na :4320, např. `python3 -m http.server 4320 --directory ../site`):

```bash
node tools/screenshots.mjs   # → screenshots/index.html (prototyp × nová verze vedle sebe)
```

## Struktura

- `src/pages/index.astro` – jediná stránka, pořadí sekcí Hero → Postup → Příběh → Realizace → Materiály → Kontakt
- `src/components/` – `Header`, `Menu`, `CallBar`, `Hero` (+ `HeroPicture`), `Process`, `Story` (+ `StoryLayer`),
  `Works` (+ `WorksRail`), `Materials` (+ `MaterialDialog`), `Footer`, `Mark`, `Wordmark`
- `src/styles/` – CSS po sekcích; hodnoty jsou výsledek kaskády prototypu (bez mrtvého kódu a starých variant)
- `src/scripts/` – `nav.ts`, `hero.ts`, `reveal.ts`, `story.ts`, `rail.ts`, `materials.ts` (vanilla TS, bez knihoven)
- `src/data/materialy.json` – obsah sekce Materiály (ověřeno, že sedí s prototypem)
- `src/lib/site.ts` – telefon, e-mail, navigace
- `src/assets/img/` – zdrojové obrázky; Astro generuje AVIF + WebP se `srcset`
- `public/fonts/` – self-hosted fonty, latin + latin-ext (česká diakritika)

## Načítání a úvod

- `Intro.astro` + `styles/intro.css` + `scripts/intro.ts` – úvodní animace se značkou. Jen první návštěva v relaci
  (sessionStorage), ne při `prefers-reduced-motion`. Čeká jen na hero fotku a fonty: min. 2,4 s, max. 3 s (+ 1,3 s zvednutí opony).
  Třída na `<html>` je `intro-on` (pozor: `.intro` je třída sekce Postup).
- `scripts/preload.ts` – po načtení stránky v klidových chvílích připraví vrstvy Příběhu, mřížku Realizací a první fotky pásu;
  každý líný obrázek stáhne a dekóduje ~1 obrazovku dopředu. Na úsporném/pomalém připojení jen Příběh.
- `story.ts` – dokud nejsou vrstvy připravené, scéna je skrytá (`.is-waiting`) a pak se prolne.
- `reveal.ts` – stírání fotek začne až po jejich dekódování (max. 600 ms).
- Materiály – mřížka dekorů se vykreslí až při otevření záložky, velká fotka se stahuje už při najetí na řádek,
  dialog se otevře s připravenou fotkou.

## SEO

- `lib/seo.ts` – titulek, popis, strukturovaná data (schema.org `HomeAndConstructionBusiness`, `WebSite`, `WebPage`).
  Doplnit od klienta: otevírací dobu, souřadnice, odkazy na Google profil a Firmy.cz (`sameAs`).
- `pages/robots.txt.ts` (vše povoleno, AI crawlery výslovně), `pages/llms.txt.ts` (shrnutí z dat webu),
  sitemap přes `@astrojs/sitemap`, OG obrázek 1200×630 z hero, canonical, ikony a manifest v `public/`.

## Poznámky

- Přepínač pozadí v Příběhu je odstraněn, v produkci je jen světlé studio.
- Záměrné odchylky od prototypu (po testu na iPhonu): Příběh 400vh místo 600vh + jemný dojezd pohybu; hlavička se schovává
  animovaně; `color-scheme: light` a světlé pozadí stránky (Safari na iOS 26 z nich barví oblast pod hodinami);
  bez `padding` na `html` podle safe-area; mobilní „Zavolat“ jako plovoucí tlačítko; neprůhledná hlavička po odscrollování.
- Náhled pro sdílení odkazu: `src/assets/og.jpg`, generuje `node tools/og.mjs`.
- `prefers-reduced-motion`: vypnuté přechody, paralaxa i ticker; Příběh ukazuje jen klidové stavy kroků.
- Pozor na `overflow: hidden` u předků Příběhu – rozbije `position: sticky` (použít `overflow: clip`, nikdy na `html`).
- `site` v `astro.config.mjs` je zatím odhad (`https://www.prirodni-kameny.eu`) – doplnit finální doménu.
- 4K originály realizací patří mimo repozitář.
