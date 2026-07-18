'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const storageKey = 'topdanbazar-theme';

function getCurrentTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    setTheme(getCurrentTheme());
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    window.localStorage.setItem(storageKey, nextTheme);
    setTheme(nextTheme);
  }

  const isDark = theme === 'dark';

  return (
    <button
      className={`theme-toggle${className ? ` ${className}` : ''}`}
      type="button"
      aria-label={isDark ? 'Açıq temanı aktivləşdir' : 'Tünd temanı aktivləşdir'}
      aria-pressed={isDark}
      title={isDark ? 'Açıq tema' : 'Tünd tema'}
      onClick={toggleTheme}
    >
      <Sun className="theme-toggle-sun" size={18} aria-hidden="true" />
      <Moon className="theme-toggle-moon" size={18} aria-hidden="true" />
    </button>
  );
}
