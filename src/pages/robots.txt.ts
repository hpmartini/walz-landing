import type { APIRoute } from 'astro';
import { SITE } from '../data/kanzlei';

// AI crawlers are welcome on purpose (GEO): the site is public marketing content.
export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE}/sitemap.xml\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
