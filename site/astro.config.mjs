import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  site: 'https://choorai.com',
  redirects: {
    // Docs 리다이렉트 (기존 페이지가 없는 경로만)
    '/docs': '/map',
  },
});
