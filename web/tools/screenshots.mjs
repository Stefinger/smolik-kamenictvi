/**
 * Vizuální porovnání prototypu a nové verze po sekcích.
 * Spuštění (oba servery musí běžet – prototyp na :4320, Astro na :4321):
 *   node tools/screenshots.mjs
 * Výstup: screenshots/<zařízení>/<sekce>-{prototyp,nove}.png + screenshots/index.html (vedle sebe).
 */
import puppeteer from 'puppeteer-core';
import { mkdir, writeFile } from 'node:fs/promises';

const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SITES = { prototyp: process.env.PROTO_URL || 'http://127.0.0.1:4320/', nove: process.env.NEW_URL || 'http://127.0.0.1:4321/' };
const DEVICES = {
  'desktop-1440': { width: 1440, height: 900, deviceScaleFactor: 1 },
  'iphone-13': { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
/** sekce: [název, selektor, posun uvnitř sekce (0–1 výšky scrollovatelné části), akce před snímkem] */
const SHOTS = [
  ['01-hero', '#hero', 0],
  ['02-postup', '#postup', 0],
  ['03-pribeh-krok2', '#pribeh', 0.2],
  ['04-pribeh-krok4', '#pribeh', 0.6],
  ['05-pribeh-final', '#pribeh', 0.98],
  ['06-realizace', '#realizace', 0],
  ['07-realizace-pas', '.rail-sec', 0],
  ['08-materialy', '#materialy', 0],
  ['09-materialy-umely', '#materialy', 0, 'umely'],
  ['10-materialy-formaty', '#materialy', 0, 'formaty'],
  ['11-kontakt', '#kontakt', 0],
  ['12-menu', '#hero', 0, 'menu'],
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
for (const [dev, vp] of Object.entries(DEVICES)) {
  await mkdir(`screenshots/${dev}`, { recursive: true });
  for (const [site, url] of Object.entries(SITES)) {
    const page = await browser.newPage();
    await page.setViewport(vp);
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    await wait(5000); // úvod + nástup hero
    for (const [name, sel, prog, action] of SHOTS) {
      if (action === 'menu' && !vp.isMobile) continue; // overlay menu je jen na mobilu
      await page.evaluate(async (sel, prog, action) => {
        const el = document.querySelector(sel);
        const top = el.getBoundingClientRect().top + scrollY;
        const span = Math.max(0, el.offsetHeight - innerHeight);
        // u pásu realizací a materiálů ukázat hlavičku sekce kousek pod horní lištou
        const off = sel === '.rail-sec' || sel === '#materialy' ? -40 : 0;
        scrollTo(0, top + span * prog + off);
        if (action === 'umely') document.getElementById('tab-umely')?.click();
        if (action === 'formaty') document.getElementById('tab-formaty')?.click();
        if (action === 'menu') { scrollTo(0, 0); document.querySelector('.burger')?.click(); }
      }, sel, prog, action);
      await wait(2200);
      await page.screenshot({ path: `screenshots/${dev}/${name}-${site}.png` });
      if (action === 'menu') { await page.evaluate(() => document.querySelector('.burger')?.click()); await wait(1000); }
      if (action === 'umely' || action === 'formaty') await page.evaluate(() => document.getElementById('tab-prirodni')?.click());
    }
    await page.close();
  }
}
await browser.close();

const rows = Object.keys(DEVICES).flatMap((dev) => SHOTS.filter((s) => !(dev === 'desktop-1440' && s[0] === '12-menu')).map(([name]) =>
  `<h2>${dev} · ${name}</h2><div class="row"><figure><figcaption>Prototyp</figcaption><img src="${dev}/${name}-prototyp.png"></figure><figure><figcaption>Nová verze (Astro)</figcaption><img src="${dev}/${name}-nove.png"></figure></div>`));
await writeFile('screenshots/index.html', `<!doctype html><meta charset="utf-8"><title>Porovnání prototyp × Astro</title>
<style>body{font:14px system-ui;margin:24px;background:#f4f2ed}h2{font-size:14px;margin:32px 0 8px}.row{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start}figure{margin:0}img{width:100%;border:1px solid #ccc;display:block}figcaption{color:#666;margin-bottom:4px}</style>
<h1>Kamenictví Smolík – prototyp × nová verze</h1>${rows.join('\n')}`);
console.log('hotovo: screenshots/index.html');
