import { useMemo, useState } from 'react';
import { Flame, ChevronLeft, ChevronRight, ArrowRight, Target, TrendingUp } from 'lucide-react';
import { useApp } from '@/store';
import { ProgressBar } from '@/components/Progress';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function DashboardPage() {
  const { user, skills, courses, paths, setRoute } = useApp();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const cells = useMemo(() => getMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  const activeSet = new Set(user.activeDays);

  const skillGaps = skills
    .filter((s) => !s.mastered && s.target > s.current)
    .sort((a, b) => b.target - b.current - (a.target - a.current))
    .slice(0, 5);

  const nextUp = courses.find((c) => c.status === 'in-progress' && c.progress === Math.max(...courses.filter((x) => x.status === 'in-progress').map((x) => x.progress)));
  const activePath = paths.find((p) => p.active);
  const activeStage = activePath?.stages.find((s) => s.status === 'active');

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink-800 dark:text-ink-50">
          Good to see you, {user.name}.
        </h1>
        <p className="mt-1.5 text-sm text-ink-400">
          You're on a <span className="font-semibold text-amber-500">{user.streak}-day streak</span> toward{' '}
          <span className="font-semibold text-iris-500">{user.careerGoal}</span> — {user.overallProgress}% of the way there.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Streak calendar — compact */}
        <section className="surface rounded-xl2 p-4 lg:col-span-2">
          {/* Slim single-line header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Flame size={15} className="text-amber-500" />
              <h2 className="font-display text-sm font-semibold text-ink-800 dark:text-ink-50">
                Learning Streak
              </h2>
              <span className="text-ink-300">—</span>
              <span className="text-ink-500 dark:text-ink-300">
                <span className="font-semibold text-amber-600 dark:text-amber-400">{user.streak}</span> day streak
              </span>
              <span className="text-ink-300">·</span>
              <span className="text-ink-400">
                longest <span className="font-semibold text-ink-600 dark:text-ink-200">{user.longestStreak}</span>
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              <button onClick={prevMonth} aria-label="Previous month" className="flex h-6 w-6 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-700">
                <ChevronLeft size={14} />
              </button>
              <span className="min-w-[90px] text-center text-xs font-medium text-ink-600 dark:text-ink-200">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <button onClick={nextMonth} aria-label="Next month" className="flex h-6 w-6 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-700">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Compact calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d, i) => (
              <div key={i} className="text-center text-2xs font-medium text-ink-300">{d}</div>
            ))}
            {cells.map((day, i) => {
              if (day === null) return <div key={i} />;
              const active = activeSet.has(day);
              const isToday = isCurrentMonth && day === today.getDate();
              return (
                <div
                  key={i}
                  onMouseEnter={() => active && setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`relative flex h-7 items-center justify-center rounded-md text-2xs transition-all ${
                    active
                      ? 'bg-amber-300 font-semibold text-amber-800 dark:bg-amber-400 dark:text-ink-900'
                      : 'border border-ink-100 text-ink-400 dark:border-ink-700'
                  } ${isToday ? 'ring-1.5 ring-amber-500 ring-offset-1 ring-offset-white dark:ring-offset-ink-800' : ''} ${
                    hoveredDay === day ? 'scale-110 z-10' : ''
                  }`}
                >
                  {day}
                  {hoveredDay === day && active && (
                    <div className="absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink-800 px-2 py-1 text-2xs text-white shadow-lift dark:bg-ink-950">
                      Studied that day
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Next up */}
        <section className="surface rounded-xl2 flex flex-col p-5">
          <div className="mb-3 flex items-center gap-2">
            <Target size={18} className="text-amber-400" />
            <h2 className="font-display text-base font-semibold text-ink-800 dark:text-ink-50">Next up</h2>
          </div>
          {nextUp && (
            <>
              <div className={`mb-3 h-1.5 w-12 rounded-full ${nextUp.subjectColor === 'amber' ? 'bg-amber-400' : nextUp.subjectColor === 'iris' ? 'bg-iris-500' : 'bg-sage-500'}`} />
              <h3 className="font-display text-lg font-semibold leading-tight text-ink-800 dark:text-ink-50">
                {nextUp.title}
              </h3>
              <p className="mt-1 text-xs text-ink-400">
                Part of <span className="text-iris-500">{activePath?.title}</span>
              </p>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-2xs text-ink-400">
                  <span>Progress</span>
                  <span className="font-semibold">{nextUp.progress}%</span>
                </div>
                <ProgressBar value={nextUp.progress} color="amber" />
              </div>
              <button
                onClick={() => setRoute('courses')}
                className="btn-primary mt-5 w-full"
              >
                Continue
                <ArrowRight size={15} />
              </button>
            </>
          )}
        </section>
      </div>

      {/* Skill gaps */}
      <section className="surface mt-6 rounded-xl2 p-5">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-iris-500" />
            <h2 className="font-display text-base font-semibold text-ink-800 dark:text-ink-50">
              Skill Gaps to {user.careerGoal}
            </h2>
          </div>
          <button onClick={() => setRoute('profile')} className="text-xs font-medium text-iris-500 hover:text-iris-600">
            View all skills
          </button>
        </div>
        <div className="space-y-4">
          {skillGaps.map((skill) => {
            const gap = skill.target - skill.current;
            return (
              <div key={skill.id}>
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink-700 dark:text-ink-200">{skill.name}</span>
                    <span className="text-2xs text-ink-400">{skill.level}</span>
                  </div>
                  <span className="text-xs font-semibold text-iris-500">+{gap} to go</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <ProgressBar value={skill.current} color="iris" />
                  </div>
                  <span className="w-16 text-right text-2xs tabular-nums text-ink-400">
                    {skill.current}/{skill.target}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Active stage hint */}
      {activeStage && (
        <div className="mt-6 flex items-center gap-4 rounded-xl2 border border-iris-200 bg-iris-50 p-4 dark:border-iris-800 dark:bg-iris-900/20">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-iris-500 text-white">
            <Target size={20} />
          </div>
          <div className="flex-1">
            <div className="text-2xs uppercase tracking-wider text-iris-500">Active stage</div>
            <div className="text-sm font-semibold text-ink-800 dark:text-ink-50">{activeStage.title}</div>
          </div>
          <button onClick={() => setRoute('path')} className="btn-secondary text-xs">
            View roadmap
            <ArrowRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
