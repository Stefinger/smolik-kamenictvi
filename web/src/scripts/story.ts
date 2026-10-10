import { RM, clamp, imgReady, onScrollFrame } from './util';

/**
 * Příběh „od kvádru ke stolu“: průhledné vrstvy řízené scrollem (rAF), 6 kroků + finále (match cut do hero fotky).
 * Přeneseno 1:1 z prototypu (storyRender, mcalc, mlayout).
 */
export function initStory() {
  const story = document.getElementById('pribeh');
  if (!story) return;

  const items = [...story.querySelectorAll<HTMLElement>('.s-item')];
  const bars = [...story.querySelectorAll<HTMLElement>('.ticks b')];
  const num = document.getElementById('num')!;
  const N = items.length;
  let cur = -2;

  function activate(a: number) {
    if (a === cur) return;
    cur = a;
    const k = a < 0 ? 0 : Math.min(a, N - 1);
    items.forEach((el, i) => el.classList.toggle('on', i === k));
    num.style.transform = `translateY(${-k * 100 / N}%)`;
    bars.forEach((b, i) => { b.style.transform = `scaleX(${i <= k ? 1 : 0})`; });
  }

  const LS = document.getElementById('lstage')!;
  const FIN = document.getElementById('Lfin') as HTMLImageElement;
  const ids = ['SHB', 'SHT', 'L1', 'L1sh', 'L2t', 'L2x', 'L2r', 'L2f', 'L3', 'L4', 'L3s', 'L4s'] as const;
  const L = Object.fromEntries(ids.map((id) => [id, document.getElementById(id) as HTMLElement])) as Record<(typeof ids)[number], HTMLElement>;
  let SC = 1;

  function lsize() {
    const w = LS.getBoundingClientRect().width || LS.offsetWidth;
    if (!w) return;
    const hh = w * 9 / 16;
    LS.style.height = `${hh}px`;
    SC = hh / 2160;
  }

  const eout = (t: number) => 1 - Math.pow(1 - t, 3);
  const eio = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const sm = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  function tr(el: HTMLElement, dy: number, op: number, br?: number) {
    el.style.transform = `translate3d(0,${(dy * SC).toFixed(2)}px,0)`;
    el.style.opacity = op.toFixed(3);
    if (br !== undefined) el.style.filter = br < 0.999 ? `brightness(${br.toFixed(3)})` : 'none';
  }

  /* konstanty pohybu v souřadnicích plátna (2160 px na výšku) */
  const LIFT = 120, FLOAT = 60, SEAT = 88, LEGIN = 1750;

  /* broušení: měkká hrana přejede přes desku zleva doprava (masky v souřadnicích plátna) */
  type Geo = { l: number; w: number };
  const geoOf = (el: HTMLElement): Geo => ({ l: parseFloat(el.style.left), w: parseFloat(el.style.width) });
  const gFin = geoOf(L.L2f), gExt = geoOf(L.L2x), gRim = geoOf(L.L2r);
  const SOFT = 3, X0 = 22, X1 = 80;
  let maskOn = false;
  const grad = (g: Geo, X: number) => {
    const p = (X - g.l) / g.w * 100, s = SOFT / g.w * 100;
    return `linear-gradient(90deg,#000 ${(p - s).toFixed(2)}%,transparent ${p.toFixed(2)}%)`;
  };
  const gradHard = (g: Geo, X: number) => {
    const p = (X - g.l) / g.w * 100, s = 0.6 / g.w * 100;
    return `linear-gradient(90deg,transparent ${(p - s).toFixed(2)}%,#000 ${p.toFixed(2)}%)`;
  };
  const setMask = (el: HTMLElement, v: string) => { el.style.webkitMaskImage = v; el.style.maskImage = v; };
  function grind(w: number) {
    if (w <= 0 || w >= 1) {
      if (maskOn) { setMask(L.L2f, 'none'); setMask(L.L2x, 'none'); setMask(L.L2r, 'none'); maskOn = false; }
      return;
    }
    const X = X0 + (X1 - X0 + SOFT) * w;
    setMask(L.L2f, grad(gFin, X));
    const Xe = X - SOFT * 0.5;
    setMask(L.L2x, gradHard(gExt, Xe));
    setMask(L.L2r, gradHard(gRim, Xe));
    maskOn = true;
  }

  /* match cut: stůl z ateliéru se usadí na místo stolu na hero fotce, kamera jemně odjede */
  const STAGE = story.querySelector<HTMLElement>('.stage')!;
  const LM = document.getElementById('lmove')!;
  const MC = { s: 1, tx: 0, ty: 0, hx: 0, hy: 0 };
  const ZF = 1.08;
  const HTD = [1140, 580, 2260, 1260], HTP = [-139, 773, 1355, 1680];
  const ST = [1 - 2899 / 3840, 695 / 2160, 1 - 947 / 3840, 1836 / 2160];
  function mcalc() {
    const sr = STAGE.getBoundingClientRect(), lr = LS.getBoundingClientRect();
    if (!sr.width) return;
    const P = FIN.naturalWidth && FIN.naturalWidth < FIN.naturalHeight;
    const IW = P ? 1080 : 2560, IH = P ? 1920 : 1440, HT = P ? HTP : HTD;
    const c = Math.max(sr.width / IW, sr.height / IH);
    const px = parseFloat(getComputedStyle(FIN).objectPosition) || 50;
    const ox = (sr.width - IW * c) * px / 100, oy = (sr.height - IH * c) / 2;
    MC.hx = ox + (HT[0] + HT[2]) / 2 * c;
    MC.hy = oy + (HT[1] + HT[3]) / 2 * c;
    const hw = (HT[2] - HT[0]) * c * ZF;
    const sx = lr.left - sr.left + (ST[0] + ST[2]) / 2 * lr.width;
    const sy = lr.top - sr.top + (ST[1] + ST[3]) / 2 * lr.height;
    const sw = (ST[2] - ST[0]) * lr.width;
    MC.s = hw / sw;
    MC.tx = MC.hx - MC.s * sx;
    MC.ty = MC.hy - MC.s * sy;
    FIN.style.transformOrigin = `${MC.hx.toFixed(1)}px ${MC.hy.toFixed(1)}px`;
  }
  const moveTr = (m: number) => {
    LM.style.transform = m > 0 ? `translate3d(${(MC.tx * m).toFixed(1)}px,${(MC.ty * m).toFixed(1)}px,0) scale(${(1 + (MC.s - 1) * m).toFixed(4)})` : 'none';
  };
  const finTr = (z: number) => { FIN.style.transform = `scale(${(ZF - (ZF - 1) * z).toFixed(4)})`; };

  let MOB = false;
  const UI = story.querySelector<HTMLElement>('.s-ui')!;
  const KICK = story.querySelector<HTMLElement>('.s-ui > .kicker')!;
  const COPY = story.querySelector<HTMLElement>('.s-copy')!;

  function storyRender(p: number) {
    const x = clamp(p, 0, 1) * 5;
    let i = Math.min(4, Math.floor(x));
    let u = clamp((x - i - 0.15) / 0.7, 0, 1);
    if (x >= 5) { i = 4; u = 1; }
    let dyS = 0, dyB = 0, dyL = LEGIN, oL = 0, oLs = 0, oSh = 0, oB = 1, bB = 1, bL = 1, oF = 0, oSt = 1, oRaw = 1, oFin = 0, w = 0, zoom = 0, mv = 0;
    if (i === 0) { dyS = -LIFT * eio(u); oSh = sm(0.2, 0.9, u); }
    else if (i === 1) {
      const v = clamp(u / 0.5, 0, 1);
      dyS = -LIFT + (LIFT - FLOAT) * eio(v); dyB = 2160 * eio(v); bB = 1 - 0.3 * v; oSh = 1 - sm(0, 0.35, u);
      if (MOB) oB = 1 - sm(0.15, 0.6, v);
      w = eio(clamp((u - 0.45) / 0.5, 0, 1));
      if (w > 0) { oFin = 1; oRaw = w >= 1 ? 0 : 1; }
    } else if (i === 2) {
      dyS = -FLOAT; oB = 0; oRaw = 0; oFin = 1; w = 1; oL = u > 0 ? 1 : 0; dyL = LEGIN * (1 - eout(u)); bL = 0.85 + 0.15 * eout(u);
      if (MOB) { dyL = 820 * (1 - eout(u)); oL = sm(0, 0.55, u); }
    } else if (i === 3) {
      dyS = -FLOAT + (FLOAT + SEAT) * eio(u); oB = 0; oRaw = 0; oFin = 1; w = 1; oL = 1; dyL = 0; oLs = u;
    } else {
      dyS = SEAT; oB = 0; oRaw = 0; oFin = 1; w = 1; oL = 1; dyL = 0; oLs = 1;
      mv = eio(clamp(u / 0.4, 0, 1)); oF = sm(0.3, 0.65, u); oSt = 1 - sm(0.45, 0.7, u); zoom = eio(clamp((u - 0.55) / 0.45, 0, 1));
    }
    grind(w);
    tr(L.SHB, dyB, oB); tr(L.SHT, dyL, oL * (0.45 + 0.55 * oLs));
    tr(L.L1, dyB, oB, bB); tr(L.L1sh, dyB, oSh * oB);
    tr(L.L2t, dyS, oRaw); tr(L.L2x, dyS, oRaw); tr(L.L2r, dyS, oRaw); tr(L.L2f, dyS, oFin);
    tr(L.L3, dyL, oL, bL); tr(L.L4, dyL, oL, bL); tr(L.L3s, dyL, oLs); tr(L.L4s, dyL, oLs);
    LS.style.opacity = oSt.toFixed(3);
    FIN.style.opacity = oF.toFixed(3);
    finTr(zoom); moveTr(mv);
    let oC = 1;
    if (MOB && i === 4) oC = Math.max(1 - sm(0, 0.1, u), sm(0.55, 0.75, u));
    COPY.style.opacity = oC.toFixed(3);
  }

  /* mobil / tablet: vlastní rozvržení – stůl mezi horním řádkem a textem */
  function mlayout() {
    const LAND = matchMedia('(orientation:landscape) and (max-height:520px)').matches || matchMedia('(orientation:landscape) and (max-aspect-ratio:3/2) and (max-width:1400px)').matches;
    const PORT = matchMedia('(orientation:portrait) and (max-width:1100px)').matches || (matchMedia('(max-width:760px)').matches && !LAND);
    MOB = PORT || LAND;
    if (!MOB) {
      (['left', 'top', 'width', 'height', 'transform'] as const).forEach((k) => { LS.style[k] = ''; });
      lsize(); mcalc();
      return;
    }
    const sr = STAGE.getBoundingClientRect(), kr = KICK.getBoundingClientRect(), vw = sr.width;
    let copyH = 0;
    for (let q = 0; q < items.length - 1; q++) copyH = Math.max(copyH, items[q].offsetHeight); // poslední krok (hero fotka) se nepočítá
    const OW = 0.52, OT = 0.215, OB = 0.865, VC = 0.535; // rozměr a vizuální střed kamene/stolu v plátně
    let x0: number, x1: number, topY: number, botY: number;
    if (LAND) { x0 = 0.42 * vw; x1 = 0.97 * vw; topY = kr.bottom - sr.top + 10; botY = sr.height - 16; }
    else {
      const padB = parseFloat(getComputedStyle(UI).paddingBottom) || 32;
      const itemB = parseFloat(getComputedStyle(items[0]).bottom) || 40;
      x0 = 0.05 * vw; x1 = 0.95 * vw; topY = kr.bottom - sr.top + 16; botY = sr.height - padB - itemB - copyH - 10;
    }
    const regH = Math.max(120, botY - topY), regW = x1 - x0;
    const w = Math.min(regW / OW, regH / ((OB - OT) * 9 / 16)), hh = w * 9 / 16;
    LS.style.width = `${w.toFixed(1)}px`;
    LS.style.height = `${hh.toFixed(1)}px`;
    LS.style.left = `${((x0 + x1) / 2 - w / 2).toFixed(1)}px`;
    LS.style.top = `${(topY + regH / 2 - VC * hh).toFixed(1)}px`;
    LS.style.transform = 'scaleX(-1)';
    SC = hh / 2160;
    mcalc();
  }

  function update() {
    const vh = innerHeight;
    const r = story!.getBoundingClientRect(), tot = story!.offsetHeight - vh, p = -r.top / tot;
    if (r.top > 2) { activate(-1); storyRender(0); }
    else {
      const pp = clamp(p, 0, 1), k = clamp(Math.round(pp * (N - 1)), 0, N - 1);
      activate(k);
      // omezený pohyb: místo plynulé sekvence jen klidové stavy jednotlivých kroků (SPEC § 5)
      storyRender(RM ? (k === 0 ? 0 : k === N - 1 ? 1 : (k - 1 + 0.85) / 5) : pp);
    }
  }

  /* resize: na mobilu ignorovat změny výšky (lišta prohlížeče), jen šířku / orientaci */
  let rzT = 0, lastW = 0;
  function onResize() {
    const w_ = innerWidth;
    if (MOB && Math.abs(w_ - lastW) < 2 && !matchMedia('(orientation:landscape)').matches === (innerHeight > innerWidth)) return;
    lastW = w_;
    clearTimeout(rzT);
    rzT = window.setTimeout(() => { lsize(); mlayout(); update(); }, 60);
  }

  /* pojistka: dokud nejsou všechny vrstvy stažené a dekódované, scéna (kámen/stůl) je skrytá a pak se prolne */
  const layers = [...LS.querySelectorAll<HTMLImageElement>('img')];
  if (!layers.every((i) => i.complete && i.naturalWidth)) {
    story.classList.add('is-waiting');
    Promise.all(layers.map(imgReady)).then(() => story.classList.remove('is-waiting'));
  }

  lsize(); mlayout(); lastW = innerWidth;
  addEventListener('resize', onResize);
  addEventListener('load', () => { mlayout(); lsize(); });
  FIN.addEventListener('load', mcalc);
  document.fonts?.ready.then(() => mlayout());
  addEventListener('orientationchange', () => setTimeout(lsize, 250));
  addEventListener('intro:done', () => { lsize(); mlayout(); update(); });

  const request = onScrollFrame(update);
  addEventListener('load', request);
  update();
}
