import { RM, clamp } from './util';

/**
 * Hero „Monolit“: scroll (vyhlazený) → --p 0–1 na scéně; myš → --mx/--my (−1…1), kámen a jméno se posouvají
 * proti sobě (hloubka). Transformace počítá CSS (hero-monolit.css), tady se jen nastavují proměnné.
 */
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function initMonolit() {
  const hero = document.getElementById('hero');
  const stage = hero?.querySelector<HTMLElement>('.hm-stage');
  if (!hero || !stage || RM) return;

  // scroll: lerp, smyčka běží jen dokud se hodnota hýbe
  let cur = -1, target = 0, raf = 0;
  const tick = () => {
    raf = 0;
    cur = cur < 0 ? target : cur + (target - cur) * 0.14;
    if (Math.abs(target - cur) < 0.0005) cur = target;
    stage.style.setProperty('--p', easeInOut(clamp(cur / 0.9, 0, 1)).toFixed(4));
    if (cur !== target) raf = requestAnimationFrame(tick);
  };
  const kick = () => {
    // bez přišpendlení (na výšku) běží pohyb během odjíždění hero: 0 → 1 za 70 % výšky obrazovky
    let range = hero.offsetHeight - innerHeight;
    if (range < 50) range = innerHeight * 0.7;
    target = range > 0 ? clamp(-hero.getBoundingClientRect().top / range, 0, 1) : 0;
    if (!raf) raf = requestAnimationFrame(tick);
  };
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', kick);
  kick();

  // myš (jen zařízení s myší)
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  let tx = 0, ty = 0, x = 0, y = 0, mraf = 0;
  const mtick = () => {
    x += (tx - x) * 0.07; y += (ty - y) * 0.07;
    stage.style.setProperty('--mx', x.toFixed(4));
    stage.style.setProperty('--my', y.toFixed(4));
    mraf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(mtick) : 0;
  };
  hero.addEventListener('pointermove', (e) => {
    tx = (e.clientX / innerWidth) * 2 - 1; ty = (e.clientY / innerHeight) * 2 - 1;
    if (!mraf) mraf = requestAnimationFrame(mtick);
  });
}
