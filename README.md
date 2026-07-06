# DevOps Portfolio / Blog

Личная страница и блог DevOps-инженера. Статичный сайт на **Astro 6 + React 19 + Tailwind v4**.

Сайт: **https://sv9t.ru/**

## ✨ Возможности

- **Astro Content Collections** для блога (Markdown + zod-схема)
- Тёмная/светлая тема с учётом `prefers-color-scheme` и сохранением выбора
- Терминальный hero с YAML-профилем
- Карточки опыта работы в стиле CI/CD pipeline
- Виджет звёзд/forks с GitHub API (кэш + retry + timeout)
- Доступность: skip-link, `aria-*`, focus-visible, контраст WCAG AA
- SEO: meta description, Open Graph, Twitter Card

## 🚀 Локальный запуск

```sh
npm install      # установка зависимостей
npm run dev      # dev-сервер на http://localhost:4321
npm run build    # проверка типов + сборка в ./dist
npm run preview  # предпросмотр собранной версии
```

## 🏗️ Архитектура деплоя

```text
GitHub (push в main)
    │
    ▼
GitHub Actions (.github/workflows/deploy.yml)
    │
    ├─► npm ci + npm run build  →  ./dist  (сборка на раннере, не на хостинге)
    │
    └─► SFTP upload ./dist/*  →  Jino (shared-хостинг)
                                    │
                                    ▼
                          nginx Jino раздаёт статику
                          + бесплатный TLS через панель Jino
```

**Почему так:**
- Сборка на GitHub Runner — бесплатно, воспроизводимо, не грузит shared-хостинг
- SFTP (порт 22) — на shared-хостинге Jino работает по логину/паролю **без белого списка IP**
  (полноценный SSH потребовал бы внесения тысяч IP GitHub в whitelist)
- nginx уже преднастроен Jino, ничего ставить не нужно
- TLS-сертификат подключается в один клик через панель Jino (Let's Encrypt, автопродление)

## 📦 Настройка деплоя

### Один раз: секреты GitHub

В **Settings → Secrets and variables → Actions** добавьте:

| Secret | Что это | Пример |
|---|---|---|
| `SFTP_HOST` | сервер Jino | `myhosting.jino.ru` или IP |
| `SFTP_PORT` | порт SFTP | `22` |
| `SFTP_USER` | логин FTP/SFTP из панели | `u123456` |
| `SFTP_PASSWORD` | пароль | — |
| `SFTP_REMOTE_PATH` | путь от корня SFTP, куда класть сайт | `./` или `domains/sv9t.ru/` |

### Один раз: домен и TLS в панели Jino

1. В контрольной панели Jino привяжите домен `sv9t.ru` к контейнеру хостинга.
2. У регистратора домена направьте DNS:
   ```text
   A     @     <IP-сервера-Jino>
   CNAME www   sv9t.ru.
   ```
3. В панели Jino → раздел **SSL** → закажите бесплатный сертификат Let's Encrypt
   для `sv9t.ru` (и `www`). Включите автопродление.

### По пушу в main

1. CI собирает сайт (`astro check` + `astro build`).
2. SFTP заливает `dist/*` в `SFTP_REMOTE_PATH`, удаляя устаревшие файлы.
3. Сайт обновляется на https://sv9t.ru/.

> Если путь в `SFTP_REMOTE_PATH` окажется неверным, файлы зальются не туда —
> поправьте секрет на правильный путь из панели Jino (раздел «Домены» → путь к сайту).

## 🗂️ Структура

```text
src/
├── components/   # Astro/React-компоненты (ProjectStats.tsx)
├── content/blog/ # Markdown-статьи (коллекция blog)
├── layouts/      # BaseLayout, BlogPost
├── lib/          # утилиты: dates.ts, paths.ts (base-пути)
├── pages/        # маршруты: index, 404, blog/index, blog/[...slug]
└── styles/       # global.css (Tailwind v4 + @theme)

.github/workflows/
└── deploy.yml    # CI/CD: build Astro → SFTP deploy на Jino
```

## 🛠️ Стек

- **Astro 6** — статичная генерация, Content Layer
- **React 19** — острова для интерактивных виджетов
- **Tailwind CSS v4** — стилизация (через `@tailwindcss/vite`)
- **TypeScript** — строгая типизация (`astro/tsconfigs/strict`)
- **GitHub Actions + SFTP** — деплой на shared-хостинг без серверного рантайма
