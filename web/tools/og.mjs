/**
 * Vygeneruje náhledový obrázek pro sdílení odkazu (iMessage, WhatsApp, Facebook…) – 1200×630.
 * Kreslí se v Chrome se skutečnými fonty a logem webu. Výstup: src/assets/og.jpg (commituje se).
 * Spuštění: node tools/og.mjs
 */
import puppeteer from 'puppeteer-core';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const root = new URL('..', import.meta.url);
// fonty jako data URI (stránka z setContent nesmí číst soubory z disku)
const font = async (name) => 'data:font/woff2;base64,' + (await readFile(new URL(`src/assets/fonts/${name}`, root))).toString('base64');

const markSvg = (await readFile(new URL('src/components/Mark.astro', root), 'utf8')).replace(/^---[\s\S]*?---\s*/, '');
// kvádr travertinu z hero (průhledné pozadí) jako data URI
const stone = 'data:image/png;base64,' + (await sharp(new URL('src/assets/img/monolit.webp', root).pathname).resize({ height: 1100 }).png().toBuffer()).toString('base64');

// stejná kompozice jako hero „Monolit“: kámen uprostřed, SMO | LÍK kolem něj, nadpis vlevo dole, telefon vpravo dole
const html = `<!doctype html><html lang="cs"><head><meta charset="utf-8"><style>
@font-face{font-family:"Smolik Display";font-weight:100 900;font-stretch:125%;src:url(${await font('smolik-display-latin.woff2')}) format("woff2");unicode-range:U+0000-00FF,U+2000-206F}
@font-face{font-family:"Smolik Display";font-weight:100 900;font-stretch:125%;src:url(${await font('smolik-display-ext.woff2')}) format("woff2");unicode-range:U+0100-02FF}
@font-face{font-family:"Instrument Sans";font-weight:400 700;src:url(${await font('instrument-sans-latin.woff2')}) format("woff2");unicode-range:U+0000-00FF,U+2000-206F}
@font-face{font-family:"Instrument Sans";font-weight:400 700;src:url(${await font('instrument-sans-ext.woff2')}) format("woff2");unicode-range:U+0100-02FF}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px;overflow:hidden}
body{position:relative;background:#ece9e1;color:#282823;font-family:"Instrument Sans",sans-serif}
.logo{position:absolute;left:56px;top:44px;display:flex;align-items:center;gap:14px}
.mark{height:34px;width:auto}.mark .ink{fill:#1b1916}.mark .edge{fill:#1b1916;opacity:.35}.mark .sand{fill:#b8956a}
.wmt{font-family:"Smolik Display";font-weight:700;font-size:19px;letter-spacing:.08em;line-height:.72;transform:translateY(.25em)}
.word{position:absolute;left:0;right:0;top:150px;display:grid;grid-template-columns:1fr 1fr;column-gap:150px;
  font-family:"Smolik Display";font-weight:700;font-size:150px;line-height:.8;letter-spacing:.02em;color:#24201b}
.word span:first-child{justify-self:end}.word span:last-child{justify-self:start}
.stone{position:absolute;left:50%;bottom:44px;height:540px;transform:translateX(-50%)}
.shadow{position:absolute;left:540px;width:420px;bottom:30px;height:30px;border-radius:50%;
  background:radial-gradient(closest-side,rgba(70,52,34,.32),rgba(70,52,34,.1) 60%,rgba(70,52,34,0));filter:blur(4px)}
h1{position:absolute;left:56px;bottom:52px;font-family:"Smolik Display";font-weight:400;text-transform:uppercase;font-size:34px;line-height:.98;letter-spacing:-.035em}
.pill{position:absolute;right:56px;bottom:52px;display:inline-flex;align-items:center;height:52px;padding:0 26px;border-radius:999px;
  background:#1b1916;color:#ece9e1;font-family:"Smolik Display";font-size:20px;font-weight:500;letter-spacing:.02em;font-variant-numeric:tabular-nums}
</style></head><body>
<div class="logo">${markSvg}<span class="wmt">SMOLÍK</span></div>
<div class="word"><span>SMO</span><span>LÍK</span></div>
<div class="shadow"></div>
<img class="stone" src="${stone}" alt="">
<h1>Z přírody.<br>Do vašeho<br>prostoru.</h1>
<span class="pill">606 923 347</span>
</body></html>`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode())));
const png = await page.screenshot({ type: 'png' });
await browser.close();
await sharp(png).jpeg({ quality: 88, mozjpeg: true }).toFile(new URL('src/assets/og.jpg', root).pathname);
console.log('hotovo: src/assets/og.jpg');
