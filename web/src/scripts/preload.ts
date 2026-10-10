import { imgReady, isConstrained, loadNow, whenIdle } from './util';

/**
 * Chytré načítání na pozadí:
 * 1) po nástupu hero v klidových chvílích postupně připraví vrstvy Příběhu, pak mřížku Realizací a první fotky pásu,
 * 2) každý líný obrázek stáhne a dekóduje s předstihem, než dojede do obrazu (i vodorovně v pásu realizací).
 * Na pomalém / úsporném připojení se dopředu připravuje jen Příběh.
 */
const GROUPS = ['#pribeh img', '.works .grid img', '.rail-item:nth-child(-n+3) img'];

export function initPreload() {
  const run = () => whenIdle(() => { prepareAhead(); preloadGroups(); });
  // až po načtení stránky (hero fotka, fonty), aby nic nesoupeřilo o síť s prvním dojmem
  if (document.readyState === 'complete') run();
  else addEventListener('load', run, { once: true });
}

/** 2) každý líný obrázek stáhne a dekóduje ~1 výšku obrazovky dopředu (v pásu realizací i do stran) */
function prepareAhead() {
  const ahead = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      const img = e.target as HTMLImageElement;
      ahead.unobserve(img);
      loadNow(img);
      imgReady(img);
    });
  }, { rootMargin: '100% 100% 100% 100%' });
  document.querySelectorAll<HTMLImageElement>('main img[loading=lazy]').forEach((img) => {
    if (!img.closest('details, [hidden], dialog')) ahead.observe(img);
  });
}

/** 1) postupné přednačtení skupin v klidových chvílích */
async function preloadGroups() {
  const groups = isConstrained() ? GROUPS.slice(0, 1) : GROUPS;
  for (const sel of groups) {
    const imgs = [...document.querySelectorAll<HTMLImageElement>(sel)];
    imgs.forEach(loadNow);
    await Promise.all(imgs.map(imgReady));
    await new Promise<void>((r) => whenIdle(() => r()));
  }
}
