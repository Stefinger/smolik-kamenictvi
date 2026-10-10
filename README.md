# Kamenictví Smolík — web

- `web/` – produkční web (Astro). Návod, struktura a poznámky v [web/README.md](web/README.md).
- `site/` – schválený prototyp (zdroj pravdy pro vzhled a chování), otevřít `site/index.html`.
- `SPEC.md`, `CLAUDE.md` – specifikace designu a pravidla projektu.
- `data/materialy.json` – obsah sekce Materiály, `brand/` – logo a favicon.

Náhled: GitHub Pages se nasazuje automaticky při každém pushi do `main` (`.github/workflows/deploy.yml`).
Ostrý web poběží na https://www.prirodni-kameny.eu.

Lokálně:

```bash
cd web
npm install
npm run dev
```
