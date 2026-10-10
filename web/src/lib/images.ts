import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/img/*.{webp,jpg,png}', { eager: true });

/** Vrátí metadata obrázku ze src/assets/img podle názvu souboru. */
export function img(name: string): ImageMetadata {
  const m = files[`../assets/img/${name}`];
  if (!m) throw new Error(`Chybí obrázek: ${name}`);
  return m.default;
}
