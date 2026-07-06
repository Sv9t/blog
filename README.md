# DevOps Portfolio / Blog

Личная страница и блог DevOps-инженера. Статичный сайт на **Astro 7 + React 19 + Tailwind v4**.

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
    ├─► npm ci + astro check + astro build  →  ./dist
    │
    └─► upload-pages-artifact  →  GitHub Pages
                                    │
                                    ▼
                          GitHub раздаёт статику на sv9t.ru
                          + бесплатный TLS (Let's Encrypt от GitHub)
```

**Почему так:**
- Хостинг, сборка и TLS — бесплатно от GitHub, без внешних серверов и секретов
- Деплой идёт прямо из репозитория: push → сборка → публикация, без ручных шагов
- Кастомный домен привязывается файлом `public/CNAME` (sv9t.ru)
- TLS-сертификат заказывается в один клик в настройках репозитория

## 📦 Настройка деплоя

### 1. Включить GitHub Pages

В репозитории **Settings → Pages → Build and deployment → Source** выберите
**«GitHub Actions»**. Это разрешает воркфлоу `deploy.yml` публиковать сайт.

### 2. Настроить DNS у регистратора домена

Сайт живёт в корне домена `sv9t.ru` (apex), `www` редиректится на apex:

```text
A     @     185.199.108.153
A     @     185.199.109.153
A     @     185.199.110.153
A     @     185.199.111.153
CNAME www   sv9t.github.io.
```

### 3. Привязать домен в репозитории

В **Settings → Pages → Custom domain** впишите `sv9t.ru` и подождите проверки DNS.
Затем включите **Enforce HTTPS** — GitHub выпустит бесплатный сертификат Let's Encrypt.

### По пушу в main

1. CI собирает сайт (`astro check` + `astro build`).
2. Артефакт `./dist` загружается в GitHub Pages.
3. Сайт обновляется на https://sv9t.ru/ (≈ через минуту после зелёной галки на коммите).

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
└── deploy.yml    # CI/CD: build Astro → публикация на GitHub Pages
```

## 🛠️ Стек

- **Astro 7** — статичная генерация, Content Layer
- **React 19** — острова для интерактивных виджетов
- **Tailwind CSS v4** — стилизация (через `@tailwindcss/vite`)
- **TypeScript** — строгая типизация (`astro/tsconfigs/strict`)
- **GitHub Actions + Pages** — бесплатный деплой и хостинг без серверного рантайма
