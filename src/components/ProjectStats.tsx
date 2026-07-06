import { useState, useEffect } from 'react';

interface ProjectStatsProps {
  repo: string; // Формат: 'owner/repo', например 'hashicorp/terraform'
}

interface RepoStats {
  stars: number;
  forks: number;
  fetchedAt: number;
}

// Кэш на 1 час — снижает нагрузку на rate-limited GitHub API (60 запросов/час без токена)
const CACHE_TTL = 60 * 60 * 1000;
const cacheKey = (repo: string) => `gh-stats:${repo}`;

// fetch с таймаутом через AbortController
async function fetchWithTimeout(url: string, ms: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/vnd.github+json' },
    });
  } finally {
    clearTimeout(id);
  }
}

async function loadStats(repo: string): Promise<RepoStats> {
  const MAX_RETRIES = 2;
  let lastErr: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(
        `https://api.github.com/repos/${repo}`,
        5000,
      );
      if (res.status === 403) {
        // Rate limit — нет смысла ретраить, выходим
        throw new Error('RATE_LIMITED');
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const stats: RepoStats = {
        stars: data.stargazers_count,
        forks: data.forks_count,
        fetchedAt: Date.now(),
      };
      try {
        localStorage.setItem(cacheKey(repo), JSON.stringify(stats));
      } catch {
        // приватный режим/квота localStorage — не критично
      }
      return stats;
    } catch (err) {
      lastErr = err;
      if (err instanceof Error && err.message === 'RATE_LIMITED') break;
      // экспоненциальная пауза перед ретраем
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 300 * 2 ** attempt));
      }
    }
  }
  throw lastErr;
}

export default function ProjectStats({ repo }: ProjectStatsProps) {
  const [stats, setStats] = useState<RepoStats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // Сначала пытаемся отдать кэш мгновенно
      try {
        const raw = localStorage.getItem(cacheKey(repo));
        if (raw) {
          const cached: RepoStats = JSON.parse(raw);
          if (Date.now() - cached.fetchedAt < CACHE_TTL) {
            if (!cancelled) setStats(cached);
            return; // кэш свежий — сеть не дёргаем
          }
          if (!cancelled) setStats(cached); // покажем старое, пока тянем новое
        }
      } catch {
        // игнорируем
      }

      try {
        const fresh = await loadStats(repo);
        if (!cancelled) {
          setStats(fresh);
          setError(false);
        }
      } catch {
        if (!cancelled && stats === null) setError(true);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo]);

  const containerClass =
    'flex gap-4 text-sm font-mono text-gray-500 dark:text-gray-400 bg-white dark:bg-dark-900 p-3 rounded-lg border border-gray-200 dark:border-dark-700';

  if (error) {
    return (
      <div className={containerClass} role="status">
        <span aria-hidden="true">⚠️</span>
        <span>Статистика недоступна</span>
      </div>
    );
  }

  // Состояние загрузки
  if (stats === null) {
    return (
      <div className={`${containerClass} animate-pulse`} role="status" aria-live="polite">
        <span>⭐ …</span>
        <span>🍴 …</span>
      </div>
    );
  }

  // Успешная загрузка
  return (
    <div className={containerClass}>
      <span
        className="hover:text-yellow-500 transition-colors cursor-default"
        title="Звёзды GitHub"
      >
        ⭐ {stats.stars.toLocaleString('ru-RU')}
      </span>
      <span
        className="hover:text-primary transition-colors cursor-default"
        title="Форки GitHub"
      >
        🍴 {stats.forks.toLocaleString('ru-RU')}
      </span>
    </div>
  );
}
