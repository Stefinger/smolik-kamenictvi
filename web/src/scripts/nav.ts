/**
 * Hlavička: pevná po 80 px, schovat při scrollu dolů / ukázat nahoru, tmavá nad patičkou,
 * ukazatel posuvu, aktivní sekce (42 % výšky viewportu, v hero nic), overlay menu, mobilní lišta.
 */
export function initNav() {
  const top = document.getElementById('topbar')!;
  const prog = document.querySelector<HTMLElement>('.progress');
  const callbar = document.getElementById('callbar');
  const hero = document.getElementById('hero');
  const story = document.getElementById('pribeh');
  const kontakt = document.getElementById('kontakt');
  const darkSecs = [...document.querySelectorAll<HTMLElement>('.foot-b, .hero--dark, .story--dark')];
  const body = document.body;
  let last = 0;

  function onScroll() {
    const y = Math.max(0, scrollY);
    top.classList.toggle('is-solid', y > 80);
    // práh 16 px: drobné cuknutí prstu nebo dojezd setrvačného scrollu na iPhonu hlavičku nerozhýbe
    if (y < 80) { top.classList.remove('is-hidden'); last = y; }
    else if (Math.abs(y - last) > 16) {
      top.classList.toggle('is-hidden', y > last && y > 400 && !body.classList.contains('menu-open'));
      last = y;
    }
    const max = document.documentElement.scrollHeight - innerHeight;
    if (prog) prog.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    let dark = false;
    const hb = top.offsetHeight; // včetně výřezu iPhonu
    darkSecs.forEach((s) => { const r = s.getBoundingClientRect(); if (r.top <= hb && r.bottom > hb) dark = true; });
    top.classList.toggle('is-dark', dark);

    if (callbar && hero) {
      let hide = false;
      [story, kontakt].forEach((s) => { if (!s) return; const r = s.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) hide = true; });
      callbar.classList.toggle('show', y > innerHeight * 0.7 && !hide && !body.classList.contains('menu-open'));
    }
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* aktivní odkaz v navigaci */
  const links = [...document.querySelectorAll<HTMLAnchorElement>('.top .nav a')];
  const secs = ['hero', 'postup', 'pribeh', 'realizace', 'materialy', 'kontakt']
    .map((id) => document.getElementById(id))
    .filter((s): s is HTMLElement => !!s);
  function setActive() {
    const y = innerHeight * 0.42;
    let cur: string | null = null;
    secs.forEach((s) => { const r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) cur = s.id; });
    links.forEach((a) => a.classList.toggle('is-active', !!cur && cur !== 'hero' && a.getAttribute('href') === `#${cur}`));
  }
  addEventListener('scroll', setActive, { passive: true });
  addEventListener('resize', setActive);
  setActive();

  /* overlay menu */
  const burger = document.querySelector<HTMLButtonElement>('.burger')!;
  const menu = document.getElementById('menu')!;
  function setMenu(open: boolean) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Zavřít menu' : 'Otevřít menu');
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
      body.classList.add('menu-open');
      top.classList.remove('is-hidden', 'is-dark');
      top.classList.add('menu-open');
    } else {
      menu.classList.remove('is-open');
      body.classList.remove('menu-open');
      top.classList.remove('menu-open');
      setTimeout(() => { menu.hidden = true; onScroll(); }, 900);
    }
  }
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') setMenu(false); });
}
