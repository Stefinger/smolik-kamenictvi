# Kamenictví Smolík — web (předání do Claude Code)

Tento adresář je **kompletní, schválený prototyp** webu Kamenictví Smolík (Dub nad Moravou).
Cíl: přepsat ho do čisté, produkční podoby **beze změny vzhledu a chování**. Prototyp je zdroj pravdy.

## Co tu je
- `site/index.html` — funkční statický web (otevři přímo v prohlížeči). Vše je v jednom HTML:
  CSS v `<style>`, JS v `<script>`; obrázky `site/assets/img/`, fonty `site/assets/fonts/`.
- `SPEC.md` — designový systém, sekce, animace, hodnoty (barvy, písma, rozměry, easing), chování JS.
- `data/materialy.json` — obsah sekce Materiály (přírodní kámen, umělý kámen s 47 dekory, 17 formátů).
- `brand/` — logo (značka + nápis jako SVG, favicon, originál z Higgsfieldu).

## Pravidla (důležité)
1. **Vzhled a chování zachovat 1:1.** Než cokoliv změníš, porovnej s `site/index.html` (desktop 1440 px, iPhone 13, iPad Mini).
2. **Obsah, texty a pořadí sekcí neměnit** (Hero → Postup → Příběh → Realizace → Materiály → Kontakt).
3. Písma jsou **self-hosted** (`assets/fonts`), latin + latin-ext (česká diakritika). Nepoužívat Google Fonts CDN.
4. Přepínač pozadí v sekci Příběh (`Světlé / Původní`) je jen pro porovnání; v produkci nechat **Světlé** a přepínač odstranit.
5. Fotky realizací v carouselu jsou skutečné zakázky (2200 px, 4K originály má klient). Mřížka Realizace = ilustrační vizualizace.
6. Nepřidávat knihovny na animace. Vše je vanilla JS + CSS (IntersectionObserver, position: sticky, rAF). Respektovat `prefers-reduced-motion`.
7. Telefon 606 923 347 je hlavní konverze: v navigaci, v hero, v mobilní spodní liště, v Materiálech i v patičce.

## Doporučený stack
- **Astro** (statický výstup) + vanilla TS + CSS (žádný Tailwind, žádný framework pro UI). Alternativa: Vite + čisté HTML.
- Obrázky přes `astro:assets`/`sharp`: AVIF + WebP, `srcset`, lazy loading mimo hero; hero `fetchpriority="high"`.
- Jedna stránka (`/`), sekce jako komponenty: `Header`, `Hero`, `Process`, `Story`, `Works` (+ `WorksRail`), `Materials` (+ `MaterialsFilters`, `MaterialDialog`), `Footer`, `CallBar`, `Menu`.
- JS rozdělit do modulů: `nav.ts` (smart header, aktivní sekce, overlay), `reveal.ts`, `story.ts` (scroll-driven sekvence), `rail.ts`, `materials.ts`, `ticker` jen CSS.
- Výkon: LCP = hero obrázek < 2,5 s, CLS 0, Lighthouse ≥ 95. Fonty `font-display: swap`, preload hero + 2 fonty.
- Hosting: Netlify/Vercel/Cloudflare Pages, `lang="cs"`, OG obrázek z hero, `theme-color` #ece9e1.

## Postup práce
1. Spusť `site/index.html`, projdi web, udělej screenshoty referencí (desktop + mobil).
2. Založ Astro projekt, přenes tokeny a fonty, pak sekci po sekci (začni Header + Hero).
3. Po každé sekci vizuálně porovnej s prototypem; rozdíly oprav v nové verzi, ne v prototypu.
4. Nakonec: odstranit přepínač pozadí, zkontrolovat reduced-motion, Lighthouse, test na skutečném iPhonu.
