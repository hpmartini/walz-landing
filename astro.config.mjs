// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.kanzlei-karstenwalz.de',
  output: 'static',
  adapter: vercel(),
  // Without trusted hosts Astro builds request.url as http://localhost behind Vercel's proxy,
  // so the origin check (and isCrossOrigin) rejected every real form POST with 403.
  security: {
    allowedDomains: [
      { hostname: 'www.kanzlei-karstenwalz.de', protocol: 'https' },
      { hostname: '**.vercel.app', protocol: 'https' },
    ],
  },
  // The dev toolbar hydrates right in the page-entrance window and causes
  // dev-only animation jank that gets mistaken for a site bug.
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()]
  }
});
