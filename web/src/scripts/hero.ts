import { RM, clamp, imgReady, onScrollFrame, withTimeout } from './util';
import { INTRO_ACTIVE, runIntro } from './intro';

/**
 * Nástup hero a paralaxa při scrollu.
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

  // paralaxa jen u klasického hero (varianty v components/heroes mají vlastní pohyb)
  const media = hero.querySelector<HTMLElement>('.hero-media');
  const kb = hero.querySelector<HTMLElement>('.hero-kb');
  const hin = document.getElementById('heroIn');
  if (!media || !kb || !hin) return;
  const update = () => {
    const y = scrollY, vh = innerHeight;
    if (y >= vh * 1.1 || RM) return;
    media.style.transform = `translate3d(0,${y * 0.18}px,0)`;
    kb.style.transform = `scale(${1 + clamp(y / vh, 0, 1) * 0.14})`;
    hin.style.transform = `translate3d(0,${y * 0.1}px,0)`;
    hin.style.opacity = String(clamp(1 - y / (vh * 0.75), 0, 1));
  };
  const request = onScrollFrame(update);
  addEventListener('load', request);
  update();
}
