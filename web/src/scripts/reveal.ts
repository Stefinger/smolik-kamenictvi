import { imgReady, loadNow, withTimeout } from './util';

/**
 * Odhalení prvků s [data-reveal] při vstupu do viewportu (přidá .in).
 * Obsahuje-li prvek fotku, počká se na její dekódování (max. 600 ms), aby nástup neodhalil prázdné místo.
 * data-reveal="lite" = jen odhalit, na fotky nečekat (pás realizací – nestahovat všech 8 fotek najednou).
 */
export function initReveal() {
  fadeInImages();
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target as HTMLElement;
      io.unobserve(el);
      const imgs = el.dataset.reveal === 'lite' ? [] : [...el.querySelectorAll('img')];
      if (!imgs.length) { el.classList.add('in'); return; }
      imgs.forEach(loadNow);
      withTimeout(Promise.all(imgs.map(imgReady)), 600).then(() => el.classList.add('in'));
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
}

/** Fotky realizací, které se ještě načítají, jsou skryté a po načtení se jemně prolnou (bez „probliknutí“). */
function fadeInImages() {
  document.querySelectorAll<HTMLImageElement>('.work .ph img, .rail-item img').forEach((img) => {
    if (img.complete && img.naturalWidth) return;
    img.classList.add('img-wait');
    const show = () => img.classList.remove('img-wait');
    img.addEventListener('load', () => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(show), { once: true });
    img.addEventListener('error', show, { once: true });
  });
}
