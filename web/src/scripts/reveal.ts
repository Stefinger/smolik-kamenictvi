import { imgReady, loadNow, withTimeout } from './util';

/**
 * Odhalení prvků s [data-reveal] při vstupu do viewportu (přidá .in).
 * Obsahuje-li prvek fotku, počká se na její dekódování (max. 600 ms), aby stírání neodhalilo prázdné místo.
 */
export function initReveal() {
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const imgs = [...e.target.querySelectorAll('img')];
      if (!imgs.length) { e.target.classList.add('in'); return; }
      imgs.forEach(loadNow);
      withTimeout(Promise.all(imgs.map(imgReady)), 600).then(() => e.target.classList.add('in'));
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
}
