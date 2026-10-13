/**
 * Hlavička: pevná po 80 px, schovat při scrollu dolů / ukázat nahoru, tmavá nad patičkou,
 * ukazatel posuvu, aktivní sekce (42 % výšky viewportu, v hero nic), overlay menu, mobilní lišta.
 */
export function initNav() {
  const top = document.getElementById('topbar')!;
  const prog = document.querySelector<HTMLElement>('.progress');
  const callbar = document.getElementById('callbar');
  const hero = document.getElementById('hero');
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

    // u patičky tmavé pozadí stránky – Safari na iOS 26 jím vyplní i místo pod spodní lištou
    const foot = darkSecs.find((el) => el.classList.contains('foot-b'));
    if (foot) document.documentElement.classList.toggle('at-foot', foot.getBoundingClientRect().top < innerHeight * 0.5);

    if (callbar && hero) {
      let hide = false;
      // v Příběhu tlačítko zůstává (texty mají místo), schová se jen u kontaktu – tam je číslo velké
      [kontakt].forEach((s) => { if (!s) return; const r = s.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) hide = true; });
      // až mimo hero (zbývá z něj méně než třetina obrazovky)
      const past = hero.getBoundingClientRect().bottom < innerHeight * 0.3;
      callbar.classList.toggle('show', past && !hide && !body.classList.contains('menu-open'));
    }
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* otevřená klávesnice (fokus v textovém poli) → schovat plovoucí „Zavolat“ */
  const isField = (el: EventTarget | null) => el instanceof HTMLElement && el.matches('input, textarea, select, [contenteditable]');
  addEventListener('focusin', (e) => { if (isField(e.target)) document.documentElement.classList.add('kb-open'); });
  addEventListener('focusout', (e) => { if (isField(e.target)) document.documentElement.classList.remove('kb-open'); });

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
      // menu nad tmavou částí (patička, tmavý Příběh) je tmavé – hlavička si barvu drží, nic nepřeblikne
      document.documentElement.classList.toggle('menu-dark', top.classList.contains('is-dark'));
      top.classList.remove('is-hidden');
      top.classList.add('menu-open');
    } else {
      menu.classList.remove('is-open');
      body.classList.remove('menu-open');
      top.classList.remove('menu-open');
      onScroll(); // barvu hlavičky hned podle obsahu pod ní (ne až po animaci)
      setTimeout(() => { menu.hidden = true; document.documentElement.classList.remove('menu-dark'); }, 300); // = délka zavření karty v header.css
    }
  }
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') setMenu(false); });
  // klepnutí mimo menu ho zavře (u menu přes celou obrazovku se nestane, u menu jako karty ano)
  addEventListener('click', (e) => {
    if (burger.getAttribute('aria-expanded') !== 'true') return;
    const t = e.target as Node;
    if (!menu.contains(t) && !burger.contains(t)) setMenu(false);
  });
}
