import { getImage } from 'astro:assets';
import { img } from './images';

/** Na výšku (telefon/tablet) se místo širokého snímku použije portrét 1080×1920. */
export const PORTRAIT_MEDIA = '(max-width: 1100px) and (orientation: portrait)';
export const LANDSCAPE_MEDIA = `not all and ${PORTRAIT_MEDIA}`;

/**
 * Zdroje hero fotky (AVIF + WebP, srcset). Používá je hero i finále příběhu,
 * URL jsou deterministické, takže se snímek stahuje jen jednou.
 */
export async function heroSources() {
  const wide = img('hero7-d.webp');
  const tall = img('hero7-p.webp');
  const [wideAvif, wideWebp, tallAvif, tallWebp] = await Promise.all([
    getImage({ src: wide, widths: [640, 960, 1280, 1920, 2560], format: 'avif' }),
    getImage({ src: wide, widths: [640, 960, 1280, 1920, 2560], format: 'webp' }),
    getImage({ src: tall, widths: [540, 720, 1080], format: 'avif' }),
    getImage({ src: tall, widths: [540, 720, 1080], format: 'webp' }),
  ]);
  return {
    wide: { avif: wideAvif.srcSet.attribute, webp: wideWebp.srcSet.attribute, src: wideWebp.src, width: wide.width, height: wide.height },
    tall: { avif: tallAvif.srcSet.attribute, webp: tallWebp.srcSet.attribute },
  };
}
