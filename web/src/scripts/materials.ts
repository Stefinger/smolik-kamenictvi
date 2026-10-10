import { imgReady, loadNow, withTimeout } from './util';

/**
 * Materiály: přepínač kolekcí (klávesy ←/→), jeden otevřený řádek, filtry + hledání dekorů, dialog.
 * Načítání: mřížka dekorů se vykreslí až při prvním otevření záložky, velká fotka materiálu se stáhne
 * už při najetí / dotyku na řádek a dialog se otevře až s dekódovanou fotkou.
 */
type Decor = { name: string; tone: string; alt: string; src: string; webp: string; avif: string };
type Group = { name: string; description: string; items: Decor[] };
type Match = Decor & { cat: string; desc: string };

export function initMaterials() {
  const sec = document.getElementById('materialy');
  if (!sec) return;

  /* kolekce */
  const tabs = [...sec.querySelectorAll<HTMLButtonElement>('[role=tab]')];
  const panels = [...sec.querySelectorAll<HTMLElement>('[role=tabpanel]')];
  function sel(t: HTMLButtonElement) {
    tabs.forEach((b) => { const on = b === t; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
    panels.forEach((p) => { p.hidden = p.id !== t.getAttribute('aria-controls'); });
    if (t.id === 'tab-umely' && !rendered) render();
  }
  tabs.forEach((b, i) => {
    b.addEventListener('click', () => sel(b));
    b.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      sel(n); n.focus(); e.preventDefault();
    });
  });

  /* přírodní kámen: otevřený vždy jen jeden řádek */
  const rows = [...sec.querySelectorAll<HTMLDetailsElement>('.material-row')];
  rows.forEach((row) => {
    row.addEventListener('toggle', () => {
      if (row.open) rows.forEach((o) => { if (o !== row) o.open = false; });
    });
    /* záměr otevřít (najetí, fokus, dotyk) → stáhnout a dekódovat velkou fotku předem */
    const main = row.querySelector<HTMLImageElement>('.cat-gal img');
    const prefetch = () => { if (main) { loadNow(main); imgReady(main); } };
    const summary = row.querySelector('summary')!;
    ['pointerenter', 'focus', 'touchstart'].forEach((ev) => summary.addEventListener(ev, prefetch, { once: true, passive: true }));
  });

  /* umělý kámen */
  const DATA = JSON.parse(document.getElementById('decor-data')!.textContent || '[]') as Group[];
  const grid = document.getElementById('decor-grid')!;
  const search = document.getElementById('decor-search') as HTMLInputElement;
  const desc = document.getElementById('group-description')!;
  const count = document.getElementById('result-count')!;
  const empty = document.getElementById('decor-empty')!;
  const chips = [...sec.querySelectorAll<HTMLButtonElement>('.filters button')];
  const total = DATA.reduce((a, c) => a + c.items.length, 0);
  let group = -1;
  let matches: Match[] = [];
  let rendered = false;
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
  const SIZES = '(max-width: 760px) 46vw, 260px';

  function render() {
    rendered = true;
    const q = norm(search.value.trim());
    matches = [];
    DATA.forEach((c, ci) => {
      if (group !== -1 && group !== ci) return;
      c.items.forEach((m) => { if (norm(`${c.name} ${m.name} ${m.tone}`).includes(q)) matches.push({ ...m, cat: c.name, desc: c.description }); });
    });
    desc.textContent = group === -1 ? 'Všechny kolekce. Vybírejte podle struktury a odstínu.' : DATA[group].description;
    count.textContent = `${matches.length} / ${total} dekorů`;
    empty.hidden = matches.length > 0;
    grid.innerHTML = matches.map((m, i) =>
      `<button type="button" class="decor-card" data-i="${i}" aria-label="Detail: ${esc(m.alt)}"><div class="decor-img"><picture><source type="image/avif" srcset="${m.avif}" sizes="${SIZES}"><img src="${m.src}" srcset="${m.webp}" sizes="${SIZES}" width="520" height="520" alt="${esc(m.alt)}" loading="lazy" decoding="async"></picture></div><div class="meta"><h3>${esc(m.name)}</h3><span class="tone">${esc(m.tone)}</span></div><span class="group">${esc(m.cat)}</span></button>`,
    ).join('');
  }
  const setGroup = (g: number) => { group = g; chips.forEach((t) => t.setAttribute('aria-pressed', String(Number(t.dataset.group) === g))); };
  chips.forEach((b) => b.addEventListener('click', () => { setGroup(Number(b.dataset.group)); render(); }));
  search.addEventListener('input', render);
  document.getElementById('reset-search')!.addEventListener('click', () => { search.value = ''; setGroup(-1); render(); });

  /* dialog s detailem dekoru */
  const dlg = document.getElementById('mat-dialog') as HTMLDialogElement;
  const dImg = dlg.querySelector('img')!;
  let trig: HTMLElement | null = null;
  let ov = '';
  grid.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('.decor-card');
    if (!b) return;
    const m = matches[Number(b.dataset.i)];
    trig = b;
    ov = document.body.style.overflow;
    dImg.srcset = m.webp; dImg.sizes = '(max-width: 760px) 94vw, 520px';
    dImg.src = m.src; dImg.alt = m.alt;
    document.getElementById('md-cat')!.textContent = `Umělý kámen · ${m.cat}`;
    document.getElementById('md-title')!.textContent = `${m.name} / ${m.tone}`;
    document.getElementById('md-desc')!.textContent = m.desc;
    withTimeout(imgReady(dImg), 400).then(() => {
      dlg.showModal();
      dlg.focus(); // fokus na dialog, ne na „Zavřít“ (jinak kolem něj iOS kreslí rámeček); Tab vede dál na tlačítka
      document.body.style.overflow = 'hidden';
    });
  });
  dlg.querySelector('.md-close')!.addEventListener('click', () => dlg.close());
  dlg.addEventListener('close', () => { document.body.style.overflow = ov; trig?.focus({ preventScroll: true }); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
}
