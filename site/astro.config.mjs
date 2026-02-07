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
    sitemap({
      i18n: {
        defaultLocale: 'ko',
        locales: { ko: 'ko-KR', en: 'en-US' },
      },
    }),
  ],
  site: 'https://choorai.com',
  i18n: {
    locales: ['ko', 'en'],
    defaultLocale: 'ko',
    routing: {
      prefixDefaultLocale: false,
    },
  },
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
