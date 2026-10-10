/**
 * Úvodní animace se značkou (jen první návštěva v relaci, ne při omezeném pohybu – rozhoduje inline skript v <head>).
 * Čeká jen na hero fotku a fonty: nejdřív MIN_MS (aby animace loga v klidu doběhla a byla vidět), nejpozději MAX_MS od začátku načítání.
 * Zbytek webu se nenačítá dopředu – připravuje se na pozadí (preload.ts).
 */
const MIN_MS = 2400;
const MAX_MS = 3000;
const OUT_MS = 1300; // délka zvednutí opony (viz intro.css)

const root = document.documentElement;
export const INTRO_ACTIVE = root.classList.contains('intro-on');

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, Math.max(0, ms)));

/** Vrátí promise, která se splní ve chvíli, kdy se opona začne zvedat. */
export async function runIntro(heroPhoto: Promise<void>): Promise<void> {
  const screen = document.getElementById('intro');
  if (!screen) { root.classList.remove('intro-on'); return; }

  const now = performance.now();
  const ready = Promise.all([heroPhoto, document.fonts?.ready]).then(() => wait(MIN_MS - performance.now()));
  await Promise.race([ready, wait(MAX_MS - now)]);

  screen.classList.add('is-out');
  try { sessionStorage.setItem('intro', '1'); } catch { /* soukromý režim */ }
  setTimeout(() => {
    root.classList.remove('intro-on');
    // po zvednutí opony si sekce pro jistotu přepočítají rozměry (mobilní rozvržení Příběhu)
    dispatchEvent(new Event('intro:done'));
  }, OUT_MS);
}
