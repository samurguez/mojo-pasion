import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://www.mojopasion.com',
  // En Astro 6, output:'static' es el modo correcto para un sitio
  // mayoritariamente estático con uno o más endpoints serverless.
  // Las páginas se sirven desde el CDN de Vercel; los endpoints con
  // `export const prerender = false` se compilan como Vercel Functions.
  output: 'static',
  adapter: vercel(),
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/checkout') && !page.includes('/gracias'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
