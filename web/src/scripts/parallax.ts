import { RM, clamp, onScrollFrame } from './util';

/** Fotky v Realizacích se při scrollu v rámečku jemně posouvají (paralaxa). */
export function initParallax() {
  if (RM) return;
  const visible = new Set<HTMLElement>();
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    const el = e.target as HTMLElement;
    if (e.isIntersecting) visible.add(el); else visible.delete(el);
  }), { rootMargin: '20% 0px' });
  document.querySelectorAll<HTMLElement>('.work .ph').forEach((el) => io.observe(el));
  const update = () => {
    const vh = innerHeight;
    visible.forEach((ph) => {
      const r = ph.getBoundingClientRect();
      const p = clamp((r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2), -1, 1); // -1 nahoře … 1 dole
      ph.style.setProperty('--py', `${(p * 7).toFixed(2)}%`);
    });
  };
  onScrollFrame(update);
  update();
}
