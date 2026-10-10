/** Cesta k souboru z public/ s ohledem na `base` (např. GitHub Pages v podsložce /smolik-kamenictvi/). */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  return base + path.replace(/^\//, '');
}

/** Náhledové nasazení (GitHub Pages) se nemá indexovat – ostrý web bude na vlastní doméně. */
export const NOINDEX = import.meta.env.PUBLIC_NOINDEX === '1';
