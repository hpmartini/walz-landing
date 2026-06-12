// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  adapter: vercel(),
  // The dev toolbar hydrates right in the page-entrance window and causes
  // dev-only animation jank that gets mistaken for a site bug.
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()]
  }
});
