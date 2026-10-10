import type { APIRoute } from 'astro';
import data from '../data/materialy.json';
import { EMAIL, MAPS, PHONE } from '../lib/site';
import { ADDRESS, DESCRIPTION, SITE_NAME } from '../lib/seo';
import { asset } from '../lib/paths';

/** Stručné shrnutí webu pro AI asistenty (návrh standardu llms.txt). Generuje se z dat webu. */
export const GET: APIRoute = ({ site }) => {
  const url = new URL(asset(''), site).href;
  const text = `# ${SITE_NAME}

> ${DESCRIPTION}

Kamenictví z Dubu nad Moravou (okres Olomouc). Z přírodního kamene vyrábí na míru stoly, kuchyňské desky, obklady, fasády, dlažby, schodiště a nábytek. Postup: výběr materiálu, opracování ve vlastní dílně, osazení na místě.

## Stránky
- [Úvod](${url}): přírodní kámen na míru, ukázka výroby stolu z pískovce
- [Postup](${url}#postup): výběr materiálu, opracování v dílně, osazení na místě
- [Realizace](${url}#realizace): kuchyně, koupelny, terasy, schodiště, krby, fasády
- [Materiály](${url}#materialy): přírodní kámen, umělý kámen, obklady a dlažby
- [Kontakt](${url}#kontakt): telefon, adresa dílny, e-mail
- [Navigace do dílny](${MAPS}): Google Maps

## Kontakt
- Telefon: +420 ${PHONE} (nejrychlejší cesta)
- E-mail: ${EMAIL}
- Dílna: ${ADDRESS.street}, ${ADDRESS.postalCode} ${ADDRESS.locality}
- Web: ${url}

## Přírodní kámen
${data.natural.map((m) => `- ${m.name} (${m.tag.toLowerCase()}): ${m.description} ${m.facts.map(([k, v]) => `${k}: ${v}.`).join(' ')}`).join('\n')}

## Umělý kámen (obklady VASPO, ${data.artificial.reduce((a, c) => a + c.items.length, 0)} dekorů)
${data.artificial.map((c) => `- ${c.name}: ${c.description} Odstíny: ${c.items.map((i) => `${i.name} ${i.tone}`).join(', ')}.`).join('\n')}

## Obklady a dlažby (hotové formáty, rozměry v cm)
${data.formats.map((f) => `- ${f.name}${f.code ? ` (${f.code})` : ''}: formát ${f.format}, tloušťka ${f.thickness}`).join('\n')}
`;
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
