// Единое форматирование дат для блога/портфолио.
// Используется в src/pages/index.astro, src/pages/blog/index.astro, src/layouts/BlogPost.astro.

const RU_LOCALE = 'ru-RU';
const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

// memo-кэш форматтера, чтобы не пересоздавать его на каждый вызов
let formatter: Intl.DateTimeFormat | null = null;
function getFormatter() {
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(RU_LOCALE, DATE_OPTIONS);
  }
  return formatter;
}

/** Отформатирует дату в формате «25 октября 2023 г.» */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return getFormatter().format(d);
}

/** ISO-строка для атрибута datetime в <time> */
export function toISO(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}
