import { RM, clamp } from './util';
import { INTRO_ACTIVE } from './intro';

/**
 * DOČASNÉ: chování 4 variant hero (/hero/1/ … /hero/4/). Po výběru zůstane jen vybraná.
 * Scroll se vyhlazuje (lerp), aby pohyb dojížděl měkce i na kolečku myši.
 */

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Smyčka, která vyhlazuje postup scrollu v sekci (0–1) a volá render; běží jen dokud se hodnota hýbe. */
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

/** Text hero (nadpis, tlačítka) se ukáže/schová. */
const showCopy = (hero: HTMLElement, on: boolean) => hero.querySelector('.hx-copy')?.classList.toggle('is-shown', on);

/** Po nástupu hero (#hero.is-in, viz hero.ts) zavolá fn. */
function whenIn(hero: HTMLElement, fn: () => void) {
  if (hero.classList.contains('is-in')) return fn();
  const mo = new MutationObserver(() => { if (hero.classList.contains('is-in')) { mo.disconnect(); fn(); } });
  mo.observe(hero, { attributes: true, attributeFilter: ['class'] });
}

/* ---------- 1 „Okno ve jméně“ ---------- */
export function initV1() {
  const hero = document.getElementById('hero')!;
  const stage = hero.querySelector<HTMLElement>('.hx-stage')!;
  const svg = hero.querySelector<SVGSVGElement>('.hx1-mask')!;
  const text = svg.querySelector('text')!;
  if (RM) { whenIn(hero, () => showCopy(hero, true)); return; }

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
    // střed písmene Í (index 4) = bod, do kterého kamera „vletí“
    let ext = { x: W / 2 - fs * 0.15, width: fs * 0.3 };
    try { ext = text.getExtentOfChar(4); } catch { /* text ještě není vykreslený */ }
    cx = ext.x + ext.width / 2;
    cy = H / 2 + fs * 0.06;
    // kamera se během přiblížení zároveň vystředí na Í, takže stačí, aby dřík písmene pokryl obrazovku
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
    stage.style.setProperty('--ps', (1.28 - 0.28 * easeInOut(k)).toFixed(4));
    stage.style.setProperty('--intro', clamp(1 - p / 0.1, 0, 1).toFixed(3));
    const end = clamp((k - 0.82) / 0.18, 0, 1);
    stage.style.setProperty('--end', end.toFixed(3));
    showCopy(hero, end > 0.6);
  };
  const kick = scrollDriven(hero, render);
}

/* ---------- 2 „Okénko v nadpisu“ ---------- */
export function initV2() {
  const hero = document.getElementById('hero')!;
  const stage = hero.querySelector<HTMLElement>('.hx-stage')!;
  const photo = hero.querySelector<HTMLElement>('.hx2-photo')!;
  const pill = hero.querySelector<HTMLElement>('.hx2-pill')!;
  if (RM) { whenIn(hero, () => showCopy(hero, true)); return; }

  let box = { t: 0, r: 0, b: 0, l: 0, rad: 0 }, W = 0, H = 0, ready = false;
  const layout = () => {
    // měřit bez posunů od scrollu
    ['--up', '--down', '--left', '--right'].forEach((v) => stage.style.removeProperty(v));
    const s = stage.getBoundingClientRect(), r = pill.getBoundingClientRect();
    W = s.width; H = s.height;
    box = { t: r.top - s.top, l: r.left - s.left, r: s.right - r.right, b: s.bottom - r.bottom, rad: r.height / 2 };
  };
  layout();
  document.fonts?.ready.then(() => { layout(); kick(); });
  addEventListener('resize', layout);
  // okénko se otevře až s nástupem hero (do té doby zavřené uprostřed)
  let grow = 0;
  whenIn(hero, () => {
    const t0 = performance.now();
    const step = (t: number) => {
      grow = clamp((t - t0) / 1100, 0, 1);
      kick();
      if (grow < 1) requestAnimationFrame(step);
    };
    ready = true;
    requestAnimationFrame(step);
  });

  const render = (p: number) => {
    const k = clamp((p - 0.02) / 0.8, 0, 1);
    const e = easeInOut(k), q = 1 - e;
    const g = 1 - Math.pow(1 - grow, 4);
    if (ready) {
      // úvodní „rozevření“ okénka: z úzké štěrbiny uprostřed pilulky do plné velikosti
      const pw = W - box.l - box.r, ph = H - box.t - box.b;
      const sx = (pw * (1 - g)) / 2, sy = (ph * (1 - g)) / 2;
      const f = (v: number, extra: number) => ((v + extra) * q).toFixed(1) + 'px';
      photo.style.clipPath = `inset(${f(box.t, sy)} ${f(box.r, sx)} ${f(box.b, sy)} ${f(box.l, sx)} round ${(box.rad * q).toFixed(1)}px)`;
    }
    stage.style.setProperty('--ps', (1.3 - 0.3 * e).toFixed(4));
    stage.style.setProperty('--up', `${(-e * H * 0.62).toFixed(1)}px`);
    stage.style.setProperty('--down', `${(e * H * 0.62).toFixed(1)}px`);
    stage.style.setProperty('--left', `${(-e * W * 0.55).toFixed(1)}px`);
    stage.style.setProperty('--right', `${(e * W * 0.55).toFixed(1)}px`);
    stage.style.setProperty('--intro', clamp(1 - p / 0.1, 0, 1).toFixed(3));
    stage.style.setProperty('--tt', clamp(1 - (k - 0.4) / 0.3, 0, 1).toFixed(3));
    const end = clamp((k - 0.8) / 0.2, 0, 1);
    stage.style.setProperty('--end', end.toFixed(3));
    showCopy(hero, end > 0.6);
  };
  const kick = scrollDriven(hero, render);
}

/* ---------- 3 „Řez“ ---------- */
export function initV3() {
  const hero = document.getElementById('hero')!;
  // text naskočí, když se pásy skoro složí
  whenIn(hero, () => setTimeout(() => showCopy(hero, true), RM ? 0 : INTRO_ACTIVE ? 1700 : 1000));
  if (RM) return;
  scrollDriven(hero, () => {
    hero.style.setProperty('--p', clamp(scrollY / innerHeight, 0, 1).toFixed(4));
  }, 1);
}

/* ---------- 4 „Šikmé světlo“ ---------- */
export function initV4() {
  const hero = document.getElementById('hero')!;
  const [light, soft] = hero.querySelectorAll<HTMLElement>('.hx4-light');
  whenIn(hero, () => setTimeout(() => showCopy(hero, true), RM ? 0 : INTRO_ACTIVE ? 1000 : 500));
  if (RM) return;

  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  let tx = innerWidth * 0.62, ty = innerHeight * 0.42, ax = tx, ay = ty, bx = tx, by = ty;
  let mouse = false, visible = true, raf = 0;
  const t0 = performance.now();
  const loop = (t: number) => {
    raf = 0;
    if (!mouse) {
      // bez myši (telefon) světlo pomalu bloudí po stěně
      const s = (t - t0) / 1000;
      tx = innerWidth * (0.55 + 0.28 * Math.sin(s * 0.33));
      ty = innerHeight * (0.42 + 0.2 * Math.sin(s * 0.47 + 1));
    }
    ax += (tx - ax) * 0.08; ay += (ty - ay) * 0.08;
    bx += (tx - bx) * 0.035; by += (ty - by) * 0.035;
    light.style.transform = `translate3d(${ax.toFixed(1)}px,${ay.toFixed(1)}px,0)`;
    soft.style.transform = `translate3d(${bx.toFixed(1)}px,${by.toFixed(1)}px,0)`;
    if (visible) raf = requestAnimationFrame(loop);
  };
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(loop);
  }).observe(hero);

  if (fine) {
    hero.addEventListener('pointermove', (e) => { mouse = true; tx = e.clientX; ty = e.clientY; });
    // magnetická tlačítka: lehce se natáhnou ke kurzoru
    hero.querySelectorAll<HTMLElement>('.hx-btn').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        b.style.transform = `translate(${(dx * 0.22).toFixed(1)}px,${(dy * 0.3).toFixed(1)}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }
}
