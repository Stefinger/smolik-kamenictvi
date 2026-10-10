# SPEC — Kamenictví Smolík

Vše níže je implementováno v `site/index.html`; tento dokument je mapa, aby šlo prototyp přepsat beze ztráty.

## 1. Designový systém
**Barvy (tokeny):** `--ink #1b1916` (text, tmavé sekce), `--bone #ece9e1` (světlý podklad), `--alt #e2ddd2` (sekce Materiály),
`--card #f5f3ee`, `--muted-l #5e5850` (sekundární text na světlé), `--muted-d rgba(236,233,225,.64)`,
`--line-l rgba(27,25,22,.14)`, `--line-d rgba(236,233,225,.16)`, `--pisek #d3b48a` (pískovec, na tmavé), `--sand2 #b8956a` (pískovec na světlé, jen linky/ukazatel),
`--rez #8c4d32` (hover, aktivní stav; nikdy plochy). Rytmus sekcí: Hero (foto) → Postup (světlá) → Příběh (světlé studio) → Realizace (světlá) → Materiály (alt) → Kontakt (ink).

**Písma (self-hosted, latin+latin-ext):**
- `Smolik Display` = Archivo variable, `font-stretch` zafixovaný na **125 %** (široký řez). Nadpisy, čísla, logo-nápis, ticker, obří SMOLÍK v patičce.
- `Archivo` (stejné soubory, rozsah šířky 62–125 %) pro podnadpisy v užší šířce (`font-stretch:112%`).
- `Instrument Sans` — běžný text (17 px / 1.6), popisky, navigace. `Smolik Sans` (Nimbus) jen jako fallback.
- Velikosti: H1 hero `clamp(2rem,3.7vw,4.9rem)` verzálky, line-height .96, tracking −.02em; nadpisy sekcí `clamp(36px,4.6vw,76px)` sentence case, tracking −.035em; kickery 11 px, tracking .14em, verzálky.

**Mřížka a prostor:** okraj `--gut: 4vw`, sekce `padding: clamp(90px,13vh,150px)`, meta řádek nad každou sekcí: vlevo `0N — Název`, vpravo doplňující label, pod ním 1px linka.
**Easing:** vstupy `--ease-out cubic-bezier(.16,1,.3,1)` (0,9–1,1 s), stírání `--ease-io cubic-bezier(.76,0,.24,1)`, hover `--ease-q cubic-bezier(.25,1,.5,1)` (0,35–0,5 s).
**Mikrodetaily:** ukazatel posuvu 2 px nahoře (`--sand2`), `::selection` pískovec, focus `outline 2px currentColor offset 4px`, `text-wrap: balance` na nadpisech, tabulkové číslice u telefonu.

## 2. Hlavička a navigace (`.top`, `.menu`, `.callbar`)
- Fixní, 72 px (mobil 60). Nad hero průhledná s tmavým textem; po 80 px scrollu `is-solid` (rgba(236,233,225,.92) + blur 14 px, 1px linka). Schová se při scrollu dolů (>400 px, práh 8 px), ukáže při scrollu nahoru. Nad tmavými sekcemi (`.story.bg-orig/.bg-dark`, `.foot-b`) `is-dark` (krémový text).
- Logo: značka (SVG kámen, `currentColor` + pískovcová ploška) + nápis SMOLÍK (SVG) + popisek „Kamenictví · Dub nad Moravou“ (na mobilu skrytý). Zdroje v `brand/`.
- Odkazy Postup / Realizace / Materiály / Kontakt: hover = linka pod textem zleva doprava (`::after scaleX`, origin vlevo při hoveru, vpravo při odchodu). Aktivní sekce = linka trvale; počítá se podle sekce ve 42 % výšky viewportu, v hero nic.
- CTA: pilulka `606 923 347` (ink/bone, hover rez). Mobil: kulatá ikona telefonu + burger.
- Overlay menu (mobil): světlé, řádky `01 Postup ↗` … oddělené linkami, odhalení po řádcích s 60 ms odstupem, dole telefon a „Dub nad Moravou / Z přírody. Do vašeho prostoru.“ Esc zavírá, scroll zamknutý.
- `.callbar` (mobil ≤ 900 px): fixní dole „Zavolat 606 923 347“, ukáže se po 70 % výšky hero, schová v Příběhu a Kontaktu.

## 3. Hero (`#hero`)
Foto stolu z pískovce (`hero7-d.webp` desktop, `hero7-p.webp` portrét na mobilu), Ken-Burns 1.12→1.0 a světlý přechod shora/zdola. Blok textu vlevo začíná na hraně stěna/podlaha (desktop `top:54%`, šířka `min(46vw,660px)`): H1 „Z PŘÍRODY. / DO VAŠEHO / PROSTORU.“ (vysouvání slov s letter-spacing), odstavec, tlačítka „Zavolat 606 923 347“ (pilulka) a „Vybrat materiál →“ (obrys). Mobil: H1 nahoře, text a tlačítka dole nad tmavším přechodem. Vpravo nahoře kickery „Pískovec · jídelní stůl“.

## 4. Postup (`#postup`)
Meta „01 — Postup / Od výběru po osazení“. Nadpis plakátově „OD VÝBĚRU / PO OSAZENÍ.“ (druhý řádek odsazený `padding-left clamp(0,22vw,26rem)`), odhalení po řádcích. Tři sloupce s linkami: 01 Výběr (Materiál), 02 Opracování (Výroba v dílně), 03 Osazení (Montáž na místě), každý s krátkým popisem; naskakují s odstupem 90 ms.

## 5. Příběh — od kvádru ke stolu (`#pribeh`, výška 700vh, sticky scéna 100svh)
- Scéna `.lstage` 3840×2160 zrcadlená `scaleX(-1)`, pozadí `.studio` (světlé studio `studio-light.webp`, varianta `pozadi-atelier.jpg`). V produkci jen světlé.
- Vrstvy (průhledné WebP v `assets/img`): `ly11-L2f` deska hotová, `ly11-L2t/L2x/L2r` surová deska/odřezek, `ly6-L3/L4` podnože (+ `L3s/L4s` stíny na podnoži), `sh-block`/`sh-table` kontaktní stíny pod kvádrem a stolem, `L1` spodek kvádru, `L1sh` stín desky na řezu.
- 6 kroků + finále: 01 Surový kvádr → 02 Řez → 03 Kamenná deska → 04 Dvě masivní podnože → 05 Stůl na míru → 06 match cut do hero fotky (`Lfin`). Funkce `storyRender(p)` v JS: konstanty `LIFT=120`, `FLOAT=60`, `SEAT=88`, `LEGIN=1750`, easingy `ein/eout/sm`. Texty vlevo dole (kicker, H3, odstavec), velké číslo kroku vlevo nahoře („05 / 06“), ukazatel kroků dole (6 linek).
- Mobil: vlastní rozvržení `mlayout()` — stůl mezi hlavičkou a textem, přechod `film-shade`.
- Reduced motion: statické zobrazení kroků.

## 6. Realizace (`#realizace`)
Meta „03 — Realizace / 05 ukázek“. Nadpis „Materiál, který / utváří prostor.“ Mřížka 5 vizualizací (kuchyň, koupelna, terasa, schodiště, krb) se stíráním zdola (`.wipe`), popisky: číslo R.0N · název (Instrument Sans 500) · materiál.
**Pás „Jiný pohled. Stejný materiál.“** (`.rail-sec`): 8 skutečných realizací (`real-*.webp`), položky `min(56vw,860px)` 1.6:1, na výšku `.tall` 2:3; scroll-snap, šipky ←/→ (kulaté 44 px), počítadlo „01 / 08“, klávesy. Mobil: 84vw, nativní swipe. Ticker „Pískovec · Vápenec · …“ pod sekcí (55 s, pauza na hover).

## 7. Materiály (`#materialy`, data v `data/materialy.json`)
Meta „04 — Materiály“. Nadpis „Materiály, / ze kterých vybíráte.“ + úvod. Přepínač kolekcí (decentní, podtržení aktivní): **01 Přírodní kámen** (8 druhů) · **02 Umělý kámen** (47 dekorů) · **03 Obklady a dlažby** (17 formátů). Klávesy ←/→.
- Přírodní: řádky `details/summary` P.01–P.08 (název, tag, swatch, +), rozbalení = velké foto + popis + fakta (dl) + „Zeptat se na … ↗“ tel. Jen jeden otevřený.
- Umělý: filtry-pilulky Vše/Kámen 15/Skála 7/Břidlice 13/Pískovec 7/Cihlovka 3/Travertin 2, hledání (bez diakritiky), řádek s popisem kolekce + „N / 47 dekorů“, mřížka karet (auto-fill 180 px; mobil 2 sloupce): foto 1:1, název, odstín, kolekce. Klik → `<dialog>` (foto, kolekce, název/odstín, popis, „Probrat tento dekor ↗“). Prázdný stav s resetem.
- Obklady a dlažby: tabulka Materiál (kód) · Formát (cm) · Tloušťka; hover řádku s odsazením 16 px; mobil stohované karty.
- Závěr: „Z vybraného kamene vyrobíme desku, obklad, dlažbu i nábytek na míru.“ + „Probrat zakázku ↗“ (bez linky nad).

## 8. Kontakt / patička (`#kontakt`, `.foot-b`, ink)
Meta „05 — Kontakt / Nejrychleji po telefonu“. Nadpis „VÁŠ PROSTOR. / NÁŠ DALŠÍ PŘÍBĚH.“ Čtyři sloupce: Telefon (606 923 347, velké), Dílna (Sokolská 317, 783 75 Dub nad Moravou, „Navigovat ↗“ s plným podtržením → Google Maps), E-mail (info@prirodni-kameny.eu), Materiál (text). Spodní řádek: © 2026 Kamenictví Smolík · „Dub nad Moravou · HH:MM“ (místní čas, Europe/Prague) · „Nahoru ↑“. Pod ním obří nápis SMOLÍK z loga přes celou šířku, utíkající ze spodního okraje.

## 9. Obrázky
- Hero 2560 px + portrét 1080×1920; vrstvy příběhu v plném rozlišení (3840 plátno); realizace 2200 px (4K originály u klienta); dekory 520 px čtverec; swatche `sw-*` 1:1.
- Doporučení: generovat AVIF/WebP `srcset` (640/1280/2200), `loading="lazy"` mimo hero, `decoding="async"`.

## 10. Kontrola kvality
Desktop 1440/1920, iPhone SE/13, Pixel 7, iPad Mini (portrét i landscape). Žádné vodorovné přetečení, příběh plynulý (sticky nesmí rozbít `overflow` na předcích — používat `overflow: clip`, ne `hidden`, nikdy na `html`). iOS: `100svh`, safe-area insets, `-webkit-backdrop-filter`.
