import { imgReady, withTimeout } from './util';
import { INTRO_ACTIVE, runIntro } from './intro';

/**
 * Nástup hero (#hero.is-in, body.ready). Pohyb při scrollu řeší monolit.ts.
 * S úvodní animací: hero naskočí ve chvíli, kdy se opona zvedá (po fotce + fontech, max. 2 s).
 * Bez ní (opakovaná návštěva, omezený pohyb): hned po dekódování fotky, nejpozději za 2,2 s.
 */
export function initHero() {
  const hero = document.getElementById('hero');
  const img = document.getElementById('heroImg') as HTMLImageElement | null;
  if (!hero || !img) return;

  const go = () => {
    if (hero.classList.contains('is-in')) return;
    hero.classList.add('is-in');
    document.body.classList.add('ready');
  };
  const photo = imgReady(img);
  if (INTRO_ACTIVE) runIntro(photo).then(go);
  else withTimeout(photo, 2200).then(go);
}
