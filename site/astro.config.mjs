import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
  ],
  site: 'https://choorai.com',
  redirects: {
    '/docs': '/map',
    '/troubleshooting/cors': '/fix/cors',
    '/troubleshooting/env': '/fix/env',
    '/troubleshooting/spa-404': '/fix/spa-404',
    '/troubleshooting/build-fail': '/fix/build-fail',
    '/troubleshooting/auth-cookie': '/fix/auth-cookie',
    '/agent-recipes': '/recipes',
  },
});
