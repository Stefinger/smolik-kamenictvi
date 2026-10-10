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
const wmSvg = (await readFile(new URL('src/components/Wordmark.astro', root), 'utf8')).replace(/^---[\s\S]*?---\s*/, '').replace('class={cls}', 'class="wmk"');
// fotka jako data URI
const photo = 'data:image/jpeg;base64,' + (await sharp(new URL('src/assets/img/hero7-d.webp', root).pathname).resize(1600).jpeg({ quality: 90 }).toBuffer()).toString('base64');

const html = `<!doctype html><html lang="cs"><head><meta charset="utf-8"><style>
@font-face{font-family:"Smolik Display";font-weight:100 900;font-stretch:125%;src:url(${await font('smolik-display-latin.woff2')}) format("woff2");unicode-range:U+0000-00FF,U+2000-206F}
@font-face{font-family:"Smolik Display";font-weight:100 900;font-stretch:125%;src:url(${await font('smolik-display-ext.woff2')}) format("woff2");unicode-range:U+0100-02FF}
@font-face{font-family:"Instrument Sans";font-weight:400 700;src:url(${await font('instrument-sans-latin.woff2')}) format("woff2");unicode-range:U+0000-00FF,U+2000-206F}
@font-face{font-family:"Instrument Sans";font-weight:400 700;src:url(${await font('instrument-sans-ext.woff2')}) format("woff2");unicode-range:U+0100-02FF}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px;overflow:hidden}
body{position:relative;background:#d9d4cb url(${photo}) 72% 55%/cover no-repeat;color:#282823;font-family:"Instrument Sans",sans-serif}
.shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(236,233,225,.97) 0%,rgba(236,233,225,.94) 34%,rgba(236,233,225,.62) 48%,rgba(236,233,225,0) 64%)}
.in{position:absolute;left:72px;top:64px;bottom:60px;width:560px;display:flex;flex-direction:column}
.logo{display:flex;align-items:center;gap:18px}
.mark{height:52px;width:auto}.mark .ink{fill:#1b1916}.mark .edge{fill:#1b1916;opacity:.35}.mark .sand{fill:#b8956a}
.wm{display:flex;flex-direction:column;gap:9px}.wmk{height:17px;width:auto;fill:#1b1916}
.desc{font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:#5e5850}
h1{margin-top:auto;font-family:"Smolik Display";font-weight:400;text-transform:uppercase;font-size:56px;line-height:1;letter-spacing:-.02em}
.rule{width:64px;height:2px;background:#b8956a;margin:30px 0 22px}
.foot{display:flex;align-items:center;gap:22px;font-size:22px;color:#3a3833}
.pill{display:inline-flex;align-items:center;gap:10px;height:46px;padding:0 22px;border-radius:999px;background:#1b1916;color:#ece9e1;font-size:19px;font-weight:500;font-variant-numeric:tabular-nums}
</style></head><body><div class="shade"></div><div class="in">
<div class="logo">${markSvg}<span class="wm">${wmSvg}<span class="desc">Kamenictví · Dub nad Moravou</span></span></div>
<h1>Z přírody.<br>Do vašeho<br>prostoru.</h1>
<div class="rule"></div>
<div class="foot"><span>Přírodní kámen na míru</span><span class="pill">606 923 347</span></div>
</div></body></html>`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: 'png' });
await browser.close();
await sharp(png).jpeg({ quality: 88, mozjpeg: true }).toFile(new URL('src/assets/og.jpg', root).pathname);
console.log('hotovo: src/assets/og.jpg');
