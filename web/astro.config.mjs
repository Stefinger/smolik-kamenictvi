// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Ostrý web: https://www.prirodni-kameny.eu (výchozí). Náhled na GitHub Pages nastavuje SITE_URL a BASE_PATH
  // ve workflow .github/workflows/deploy.yml (web pak běží v podsložce /<repozitář>/).
  site: process.env.SITE_URL || 'https://www.prirodni-kameny.eu',
  base: process.env.BASE_PATH || '/',
  output: 'static',
  integrations: [sitemap()],
  build: { inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
});
