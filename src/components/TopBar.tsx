import { useState } from 'react';
import { Search, Flame, ArrowRight, Moon, Sun } from 'lucide-react';
import { useApp } from '@/store';
import { ProgressRing } from '@/components/Progress';

export function TopBar() {
  const { user, askFromSearch, dark, toggleTheme } = useApp();
  const [query, setQuery] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    askFromSearch(query);
    setQuery('');
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-ink-100 bg-white/80 px-6 backdrop-blur-md dark:border-ink-700 dark:bg-ink-800/80">
      <form onSubmit={submit} className="relative flex-1 max-w-2xl">
        <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses, topics, paths — or ask a question..."
          className="input-base pl-9 pr-20"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md bg-amber-400 px-2.5 py-1.5 text-xs font-semibold text-ink-900 transition-colors hover:bg-amber-300"
        >
          Ask
          <ArrowRight size={12} />
        </button>
      </form>

      <div className="ml-auto flex items-center gap-3">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-700 dark:hover:text-ink-100"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="flex items-center gap-2 rounded-lg border border-ink-100 bg-amber-50 px-3 py-1.5 dark:border-amber-900/40 dark:bg-amber-900/30">
          <Flame size={16} className="text-amber-500" />
          <span className="text-sm font-bold text-amber-700 dark:text-amber-300">{user.streak}</span>
          <span className="text-2xs text-amber-600/80 dark:text-amber-400/80">day streak</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <ProgressRing value={user.overallProgress} size={40} stroke={4} />
            <span className="absolute inset-0 flex items-center justify-center text-2xs font-bold text-ink-700 dark:text-ink-100">
              {user.overallProgress}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
