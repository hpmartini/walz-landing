import type { APIRoute } from 'astro';
import services from '../data/services.json';
import { SITE } from '../data/kanzlei';

// Every .astro page except 404 and dynamic routes; service pages come from their data.
const pages = Object.keys(import.meta.glob('./**/*.astro'))
  .filter((f) => !f.includes('[') && !f.endsWith('/404.astro'))
  .map((f) => f.slice(1).replace(/\.astro$/, '').replace(/\/index$/, '') || '/');

export const GET: APIRoute = () => {
  const urls = [...pages, ...services.map((s) => `/leistungen/${s.slug}`)].sort();
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${new URL(u, SITE).href}</loc></url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
