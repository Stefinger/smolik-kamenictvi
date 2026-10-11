import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { PORTRAIT_MEDIA, LANDSCAPE_MEDIA } from './hero';

/**
 * DOČASNÉ: obrázky pro varianty hero (/hero/1/ … /hero/5/), src/assets/img/hx.
 * Fotky jsou vygenerované v Higgsfieldu (gpt_image_2_5), ne skutečné zakázky.
 */
const files = import.meta.glob<{ default: ImageMetadata }>('../assets/img/hx/*.webp', { eager: true });
const get = (name: string) => {
  const m = files[`../assets/img/hx/${name}`];
  if (!m) throw new Error(`Chybí obrázek: hx/${name}`);
  return m.default;
};

export const WIDE = [640, 960, 1280, 1920, 2560];
export const TALL = [540, 720, 1080, 1440];

async function set(name: string, widths: number[]) {
  const src = get(name);
  const ws = widths.filter((w) => w < src.width).concat(src.width);
  const [avif, webp] = await Promise.all([
    getImage({ src, widths: ws, format: 'avif' }),
    getImage({ src, widths: ws, format: 'webp' }),
  ]);
  return { avif: avif.srcSet.attribute, webp: webp.srcSet.attribute, src: webp.src, width: src.width, height: src.height };
}

/** Zdroje obrázku; s `tall` se na výšku (telefon) použije portrét. URL jsou deterministické (preload = stejný soubor). */
export async function hxSources(wide: string, tall?: string, widths = WIDE, tallWidths = TALL) {
  const [w, t] = await Promise.all([set(wide, widths), tall ? set(tall, tallWidths) : Promise.resolve(null)]);
  return { wide: w, tall: t };
}
export { PORTRAIT_MEDIA, LANDSCAPE_MEDIA };
