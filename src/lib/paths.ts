// Хелпер для построения base-относительных путей.
// Astro кладёт сайт в подпапку (base) при деплое на GitHub Pages,
// поэтому все внутренние ссылки/ассеты нужно префиксить import.meta.env.BASE_URL.
//
// Пример: base = '/blog/'
//   url('/')      -> '/blog/'
//   url('/blog')  -> '/blog/blog'  (внимание: передавай путь БЕЗ повторения папки)
//   url('blog')   -> '/blog/blog'
//   url('favicon.svg') -> '/blog/favicon.svg'
//
// В .astro: <a href={url('/')}>...</a>

const base = import.meta.env.BASE_URL || '/';

/** Склеивает base с путём, гарантируя один ведущий и один завершающий слэш корректно. */
export function url(path = ''): string {
  // Нормализуем вход: убираем ведущий слэш
  const cleanPath = path.replace(/^\/+/, '');
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return `${normalizedBase}${cleanPath}`;
}
