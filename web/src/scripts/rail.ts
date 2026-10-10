/** Pás realizací: scroll-snap, šipky ←/→, počítadlo „01 / 08“, klávesy. */
export function initRail() {
  const sec = document.querySelector<HTMLElement>('.rail-sec');
  if (!sec) return;
  const rail = sec.querySelector<HTMLElement>('.rail')!;
  const prev = sec.querySelector<HTMLButtonElement>('.rail-prev')!;
  const next = sec.querySelector<HTMLButtonElement>('.rail-next')!;
  const cnt = sec.querySelector<HTMLElement>('.rail-count')!;
  const kids = [...rail.children] as HTMLElement[];
  const n = kids.length;
  const rm = matchMedia('(prefers-reduced-motion:reduce)');
  const pad = (v: number) => String(v).padStart(2, '0');
  const x0 = () => rail.getBoundingClientRect().left + parseFloat(getComputedStyle(rail).paddingLeft);
  /** index poslední položky, jejíž levá hrana už dojela k začátku pásu */
  const current = () => { const x = x0(); let c = 0; kids.forEach((k, j) => { if (k.getBoundingClientRect().left - x <= 4) c = j; }); return c; };

  function upd() {
    prev.disabled = rail.scrollLeft < 3;
    next.disabled = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 3;
    const i = next.disabled ? n : current() + 1;
    cnt.textContent = `${pad(i)} / ${pad(n)}`;
  }
  function move(d: number) {
    const t = kids[Math.max(0, Math.min(n - 1, current() + d))];
    rail.scrollBy({ left: t.getBoundingClientRect().left - x0(), behavior: rm.matches ? 'instant' : 'smooth' });
  }
  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  rail.addEventListener('scroll', upd, { passive: true });
  addEventListener('resize', upd);
  rail.addEventListener('keydown', (e) => {
    if (e.target !== rail || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
    e.preventDefault();
    move(e.key === 'ArrowLeft' ? -1 : 1);
  });
  upd();
}
