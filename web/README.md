# Kamenictví Smolík – produkční web (Astro)

Jednostránkový web kamenictví v Astru: statický výstup, vanilla TS + CSS, bez UI frameworku a knihoven na animace.
Původně přepsán z HTML prototypu (ten už v repozitáři není, je v historii gitu).

## Příkazy

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # statický výstup do dist/
npm run check      # typová kontrola
```

Náhled pro sdílení odkazu (`src/assets/og.jpg`) se generuje příkazem `node tools/og.mjs`.

## Struktura

- `src/pages/index.astro` – jediná stránka, pořadí sekcí Hero → Postup → Příběh → Realizace → Materiály → Kontakt
- `src/components/` – `Header`, `Menu`, `CallBar`, `Hero` („Monolit“: kvádr travertinu + SMO | LÍK), `Process`,
  `Story` (+ `StoryLayer`, `HeroPicture` = fotka hotového stolu ve finále), `Works` (+ `WorksRail`),
  `Materials` (+ `MaterialDialog`), `Footer`, `Mark`, `Wordmark`
- `src/styles/` – CSS po sekcích (`hero-monolit.css` = hero)
- `src/scripts/` – `nav.ts`, `hero.ts` + `monolit.ts`, `reveal.ts`, `story.ts`, `rail.ts`, `materials.ts` (vanilla TS, bez knihoven)
- `src/data/materialy.json` – obsah sekce Materiály
- `src/lib/site.ts` – telefon, e-mail, navigace
- `src/assets/img/` – zdrojové obrázky; Astro generuje AVIF + WebP se `srcset`
- `src/assets/fonts/` – self-hosted fonty, latin + latin-ext (česká diakritika)

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
  Doplnit od klienta: otevírací dobu, odkazy na Google profil a Firmy.cz (`sameAs`).
- `pages/robots.txt.ts` (vše povoleno, AI crawlery výslovně), `pages/llms.txt.ts` (shrnutí z dat webu),
  sitemap přes `@astrojs/sitemap`, OG obrázek 1200×630 z hero, canonical, ikony a manifest v `public/`.

## Poznámky

- Příběh běží v tmavém ateliéru (`Story variant="dark"`), v posledním kroku je světlá fotka hotového stolu.
  Na telefonu/tabletu na výšku je finále široký záběr (`.fin-wide`), jehož stůl leží přesně na stole z kroku 5;
  prázdnou plochu scény pod textem po dojetí překryje sekce Realizace (`--tail`).
- iPhone (Safari iOS 26): `color-scheme: light` a světlé pozadí stránky (barví oblast pod hodinami), u patičky tmavé
  (`html.at-foot`); mobilní „Zavolat“ jako plovoucí tlačítko (ukáže se až pod hero); odkazy na sekce bez `#` v adrese.
- `prefers-reduced-motion`: vypnuté přechody, paralaxa i ticker; Příběh ukazuje jen klidové stavy kroků.
- Pozor na `overflow: hidden` u předků Příběhu – rozbije `position: sticky` (použít `overflow: clip`, nikdy na `html`).
- `site` v `astro.config.mjs` je zatím odhad (`https://www.prirodni-kameny.eu`) – doplnit finální doménu.
- 4K originály realizací patří mimo repozitář.
