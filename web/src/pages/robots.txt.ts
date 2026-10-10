import type { APIRoute } from 'astro';
import { NOINDEX, asset } from '../lib/paths';

/**
 * Vše povoleno pro všechny roboty. AI crawlery jsou vyjmenované výslovně,
 * aby bylo jasné, že web chce být dohledatelný i v AI vyhledávání (ChatGPT, Perplexity, Claude, Gemini…).
 */
const AI_BOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Perplexity-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'Google-Extended', 'Applebot-Extended', 'Bingbot', 'SeznamBot'];

export const GET: APIRoute = ({ site }) => {
  if (NOINDEX) return new Response('User-agent: *\nDisallow: /\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  const lines = [
    'User-agent: *',
    'Allow: /',
    '',
    ...AI_BOTS.flatMap((bot) => [`User-agent: ${bot}`, 'Allow: /', '']),
    `Sitemap: ${new URL(asset('sitemap-index.xml'), site).href}`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
