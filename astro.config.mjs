// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Развёртывание на GitHub Pages с собственным доменом sv9t.ru.
// При привязке apex-домена сайт живёт в КОРНЕ домена (без подпапки репозитория),
// поэтому base = '/'. Это устраняет дублирование путей (не будет /blog/blog).
//
// Хелпер url() в src/lib/paths.ts всё равно использует BASE_URL, так что
// остаётся совместимым и не требует правок шаблонов.
const BASE = process.env.BASE_URL ?? '/';

// https://astro.build/config
export default defineConfig({
  site: 'https://sv9t.ru',
  base: BASE,
  compressHTML: true,
  integrations: [
    react(),
  ],
  markdown: {
    // Подсветка синтаксиса: обе темы рендерятся в инлайновые стили,
    // а в global.css активная выбирается по классу .dark на <html>,
    // чтобы блоки кода переключались вместе с темой сайта.
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
