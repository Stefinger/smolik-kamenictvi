/** Uživatel si přeje omezit pohyb (vyhodnoceno jednou při načtení, stejně jako v prototypu). */
export const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Zavolá fn nejvýš jednou za snímek při scrollu/resize; vrací funkci pro ruční vyvolání. */
export function onScrollFrame(fn: () => void): () => void {
  let ticking = false;
  const request = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; fn(); });
  };
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request);
  return request;
}

/** Počká, až je obrázek stažený a dekódovaný (připravený k vykreslení bez cuknutí). Chyby ignoruje. */
export function imgReady(img: HTMLImageElement): Promise<void> {
  const decode = () => (img.decode ? img.decode().catch(() => {}) : Promise.resolve());
  if (img.complete) return img.naturalWidth ? decode() : Promise.resolve();
  return new Promise<void>((res) => {
    img.addEventListener('load', () => decode().then(res), { once: true });
    img.addEventListener('error', () => res(), { once: true });
  });
}

/** Spustí načtení líného obrázku hned (loading="lazy" → "eager"). */
export function loadNow(img: HTMLImageElement) {
  if (img.loading === 'lazy') img.loading = 'eager';
}

/** Promise se splní nejpozději za ms milisekund. */
export const withTimeout = (p: Promise<unknown>, ms: number) =>
  Promise.race([p, new Promise((r) => setTimeout(r, ms))]).then(() => {});

/** Pomalé nebo úsporné připojení – pak nic nepřednačítáme navíc. */
export function isConstrained(): boolean {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !!c && (!!c.saveData || /(^|-)2g$/.test(c.effectiveType || ''));
}

/** Zavolá fn, až má prohlížeč volnou chvíli. */
export const whenIdle = (fn: () => void) =>
  'requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 2000 }) : setTimeout(fn, 200);
