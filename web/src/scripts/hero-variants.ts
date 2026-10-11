import { RM, clamp, isConstrained } from './util';
import { INTRO_ACTIVE } from './intro';

/**
 * DOČASNÉ: chování 5 variant hero (/hero/1/ … /hero/5/). Po výběru zůstane jen vybraná.
 * Scroll i myš se vyhlazují (lerp), aby pohyb dojížděl měkce i na kolečku myši.
 */

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const fine = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Vyhlazený postup scrollu v sekci (0–1); render běží jen dokud se hodnota hýbe. */
function scrollDriven(hero: HTMLElement, render: (p: number) => void, smooth = 0.14) {
  let cur = -1, target = 0, raf = 0;
  const measure = () => {
    const range = hero.offsetHeight - innerHeight;
    target = range > 0 ? clamp(-hero.getBoundingClientRect().top / range, 0, 1) : 0;
  };
  const tick = () => {
    raf = 0;
    cur = cur < 0 ? target : cur + (target - cur) * smooth;
    if (Math.abs(target - cur) < 0.0005) cur = target;
    render(cur);
    if (cur !== target) raf = requestAnimationFrame(tick);
  };
  const kick = () => { measure(); if (!raf) raf = requestAnimationFrame(tick); };
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', kick);
  kick();
  return kick;
}

/** Po nástupu hero (#hero.is-in, viz hero.ts) zavolá fn. */
function whenIn(hero: HTMLElement, fn: () => void) {
  if (hero.classList.contains('is-in')) return fn();
  const mo = new MutationObserver(() => { if (hero.classList.contains('is-in')) { mo.disconnect(); fn(); } });
  mo.observe(hero, { attributes: true, attributeFilter: ['class'] });
}

/** Myš → vyhlazené --mx/--my (−1…1) na prvku. Jen na zařízeních s myší. */
function pointerVars(hero: HTMLElement, el: HTMLElement) {
  if (!fine()) return;
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  const tick = () => {
    x += (tx - x) * 0.07; y += (ty - y) * 0.07;
    el.style.setProperty('--mx', x.toFixed(4));
    el.style.setProperty('--my', y.toFixed(4));
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(tick) : 0;
  };
  hero.addEventListener('pointermove', (e) => {
    tx = (e.clientX / innerWidth) * 2 - 1; ty = (e.clientY / innerHeight) * 2 - 1;
    if (!raf) raf = requestAnimationFrame(tick);
  });
}

/* ---------- 1 „Monolit“ ---------- */
export function initH1() {
  const hero = document.getElementById('hero')!;
  const stage = hero.querySelector<HTMLElement>('.hx-stage')!;
  if (RM) return;
  scrollDriven(hero, (p) => stage.style.setProperty('--p', easeInOut(clamp(p / 0.9, 0, 1)).toFixed(4)));
  pointerVars(hero, stage);
}

/* ---------- 2 „Okno do kamene“ ---------- */
export function initH2() {
  const hero = document.getElementById('hero')!;
  const stage = hero.querySelector<HTMLElement>('.hx-stage')!;
  const svg = hero.querySelector<SVGSVGElement>('.ho-mask')!;
  const text = svg.querySelector('text')!;
  const copy = hero.querySelector<HTMLElement>('.ho-copy')!;
  const video = hero.querySelector<HTMLVideoElement>('.ho-video');

  // živý mramor: video se stáhne až po nástupu hero (fotka je zatím plakát), ne na úsporném připojení
  whenIn(hero, () => {
    if (!video || RM || isConstrained()) return;
    video.src = video.dataset.src!;
    video.addEventListener('playing', () => video.classList.add('is-playing'), { once: true });
    video.play().catch(() => {});
  });
  if (RM) { whenIn(hero, () => copy.classList.add('is-shown')); hero.classList.add('is-dark'); return; }

  let cx = 0, cy = 0, dx = 0, dy = 0, smax = 1;
  const layout = () => {
    const W = stage.clientWidth, H = stage.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    text.setAttribute('x', String(W / 2));
    text.setAttribute('y', String(H / 2));
    text.setAttribute('font-size', '100');
    const w100 = text.getComputedTextLength() || 600;
    const fs = Math.min((W * 0.88 * 100) / w100, H * 0.34);
    text.setAttribute('font-size', fs.toFixed(1));
    // střed písmene Í (index 4) = bod, do kterého kamera „vletí“ a zároveň se na něj vystředí
    let ext = { x: W / 2 - fs * 0.15, width: fs * 0.3 };
    try { ext = text.getExtentOfChar(4); } catch { /* text ještě není vykreslený */ }
    cx = ext.x + ext.width / 2;
    cy = H / 2 + fs * 0.06;
    dx = cx - W / 2; dy = cy - H / 2;
    const stem = Math.max(ext.width * 0.2, 4);
    smax = Math.max(W / stem, H / (fs * 0.55)) * 1.25;
    svg.style.transformOrigin = `${cx}px ${cy}px`;
  };
  layout();
  document.fonts?.ready.then(() => { layout(); kick(); });
  addEventListener('resize', layout);

  const render = (p: number) => {
    const k = clamp((p - 0.03) / 0.72, 0, 1);
    const s = Math.exp(Math.log(smax) * Math.pow(k, 1.7));
    const c = easeInOut(k);
    svg.style.transform = `translate(${(-dx * c).toFixed(1)}px,${(-dy * c).toFixed(1)}px) scale(${s.toFixed(4)})`;
    svg.style.visibility = k >= 0.995 ? 'hidden' : '';
    stage.style.setProperty('--ps', (1.25 - 0.25 * easeInOut(k)).toFixed(4));
    stage.style.setProperty('--intro', clamp(1 - p / 0.1, 0, 1).toFixed(3));
    const end = clamp((k - 0.82) / 0.18, 0, 1);
    stage.style.setProperty('--end', end.toFixed(3));
    copy.classList.toggle('is-shown', end > 0.6);
    // hlavička: světlá nad mramorem (nav.ts čte .hx-dyn.is-dark)
    hero.classList.toggle('is-dark', k > 0.6);
  };
  const kick = scrollDriven(hero, render);
}

/* ---------- 3 „Lom“ ---------- */
export function initH3() {
  const hero = document.getElementById('hero')!;
  const stage = hero.querySelector<HTMLElement>('.hx-stage')!;
  if (RM) return;
  scrollDriven(hero, (p) => stage.style.setProperty('--p', easeInOut(clamp(p / 0.95, 0, 1)).toFixed(4)));
}

/* ---------- 4 „Vzorník“ ---------- */
export function initH4() {
  const hero = document.getElementById('hero')!;
  const panels = [...hero.querySelectorAll<HTMLElement>('.hv-panel')];
  let cur = 0, timer = 0, user = false, visible = true;
  const set = (i: number) => { cur = i; panels.forEach((p, j) => p.classList.toggle('is-on', j === i)); };
  const auto = () => {
    clearInterval(timer);
    if (RM || user) return;
    timer = window.setInterval(() => { if (visible && !document.hidden) set((cur + 1) % panels.length); }, 3600);
  };
  panels.forEach((p, i) => {
    // myš: deska pod kurzorem se rozevře, automatické střídání se zastaví
    p.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'mouse') return; user = true; clearInterval(timer); set(i); });
    p.querySelector('a')!.addEventListener('focus', () => { user = true; clearInterval(timer); set(i); });
  });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(hero);
  whenIn(hero, () => setTimeout(auto, INTRO_ACTIVE ? 2600 : 1800));
}

/* ---------- 5 „Světlo“ ---------- */
export function initH5() {
  const hero = document.getElementById('hero')!;
  const lit = hero.querySelector<HTMLElement>('.hs-lit')!;
  const copy = hero.querySelector<HTMLElement>('.hs-copy')!;
  whenIn(hero, () => copy.classList.add('is-shown'));
  if (RM) return;

  const R = () => Math.max(innerWidth, innerHeight) * (innerWidth < 760 ? 0.5 : 0.3);
  let tx = innerWidth * 0.3, ty = innerHeight * 0.32, x = tx, y = ty, r = 0, tr = 0;
  let lastInput = -1e9, visible = true, raf = 0;
  const t0 = performance.now();
  const tick = (t: number) => {
    raf = 0;
    if (t - lastInput > 2500) {
      // bez myši / prstu reflektor pomalu bloudí po stěně
      const s = (t - t0) / 1000;
      tx = innerWidth * (0.5 + 0.3 * Math.sin(s * 0.31));
      ty = innerHeight * (0.42 + 0.22 * Math.sin(s * 0.47 + 0.8));
    }
    x += (tx - x) * 0.085; y += (ty - y) * 0.085; r += (tr - r) * 0.04;
    lit.style.setProperty('--x', `${x.toFixed(1)}px`);
    lit.style.setProperty('--y', `${y.toFixed(1)}px`);
    lit.style.setProperty('--r', `${r.toFixed(1)}px`);
    if (visible) raf = requestAnimationFrame(tick);
  };
  const aim = (cx: number, cy: number) => {
    const b = hero.getBoundingClientRect();
    tx = cx - b.left; ty = cy - b.top; lastInput = performance.now();
  };
  hero.addEventListener('pointermove', (e) => aim(e.clientX, e.clientY));
  hero.addEventListener('touchmove', (e) => aim(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  hero.addEventListener('touchstart', (e) => aim(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  addEventListener('resize', () => { tr = R(); });
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(tick);
  }).observe(hero);
  // reflektor se rozsvítí, až se zvedne opona
  whenIn(hero, () => setTimeout(() => { tr = R(); }, INTRO_ACTIVE ? 700 : 200));
}
