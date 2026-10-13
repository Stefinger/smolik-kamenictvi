import { getImage } from 'astro:assets';
import { img } from './images';

/** Na výšku (telefon/tablet) se místo širokého snímku použije portrét (má-li ho varianta). */
export const PORTRAIT_MEDIA = '(max-width: 1100px) and (orientation: portrait)';

/**
 * Fotka hotového stolu (finále Příběhu). `table` = obdélník stolu ve fotce [x0, y0, x1, y1] v pixelech originálu –
 * podle něj se na konci Příběhu stůl z ateliéru „usadí“ přesně na stůl ve fotce (match cut, story.ts).
 */
const PHOTO = {
  wide: 'hero7-d.webp', wideTable: [1140, 580, 2260, 1260],
  tall: 'hero7-p.webp', tallTable: [-139, 773, 1355, 1680],
  alt: 'Jídelní stůl z pískovce se štípanou hranou a dubovými židlemi ve světle pod stromy',
} as const;

const WIDE_WIDTHS = [640, 960, 1280, 1920, 2560];
const TALL_WIDTHS = [540, 720, 1080];

/**
 * Zdroje hero fotky (AVIF + WebP, srcset). Používá je hero i finále příběhu,
 * URL jsou deterministické, takže se snímek stahuje jen jednou.
 */
export async function heroSources() {
  const v = PHOTO;
  const wide = img(v.wide);
  const ww = WIDE_WIDTHS.filter((w) => w < wide.width).concat(wide.width);
  const [wideAvif, wideWebp] = await Promise.all([
    getImage({ src: wide, widths: ww, format: 'avif' }),
    getImage({ src: wide, widths: ww, format: 'webp' }),
  ]);
  let tall: { avif: string; webp: string; table: readonly number[]; width: number; height: number } | null = null;
  if (v.tall) {
    const t = img(v.tall);
    const [tallAvif, tallWebp] = await Promise.all([
      getImage({ src: t, widths: TALL_WIDTHS, format: 'avif' }),
      getImage({ src: t, widths: TALL_WIDTHS, format: 'webp' }),
    ]);
    tall = { avif: tallAvif.srcSet.attribute, webp: tallWebp.srcSet.attribute, table: v.tallTable!, width: t.width, height: t.height };
  }
  return {
    alt: v.alt,
    wide: { avif: wideAvif.srcSet.attribute, webp: wideWebp.srcSet.attribute, src: wideWebp.src, width: wide.width, height: wide.height, table: v.wideTable },
    tall,
  };
}

/**
 * Hero „Monolit“: vyříznutý kvádr travertinu (průhledné pozadí). Vygenerováno v Higgsfieldu (gpt_image_2_5 + upscale 4K
 * + odstranění pozadí), oříznuto na kámen. Šířka na obrazovce ≈ 0,37 × výška kamene → `MONOLIT_SIZES`.
 */
export const MONOLIT_SIZES = '(orientation: portrait) 56vw, 30vh';
const MONOLIT_WIDTHS = [240, 360, 480, 720, 960, 1280];
export async function monolitSources() {
  const src = img('monolit.webp');
  const ws = MONOLIT_WIDTHS.filter((w) => w < src.width).concat(src.width);
  const [avif, webp] = await Promise.all([
    getImage({ src, widths: ws, format: 'avif' }),
    getImage({ src, widths: ws, format: 'webp' }),
  ]);
  return { avif: avif.srcSet.attribute, webp: webp.srcSet.attribute, src: webp.src, width: src.width, height: src.height };
}
