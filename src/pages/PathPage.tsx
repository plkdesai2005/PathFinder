import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Lock,
  Play,
  ChevronDown,
  Clock,
  BarChart3,
  Layers,
  Sparkles,
  Calendar,
  Flag,
} from 'lucide-react';
import { useApp } from '@/store';
import { Icon } from '@/components/Icon';
import { pathDomainFilters } from '@/data';
import type { PathType, StageStatus } from '@/types';

const PATH_TYPE_TABS: { id: PathType | 'all'; label: string }[] = [
  { id: 'beginner', label: 'Beginner Paths' },
  { id: 'career', label: 'Career Paths' },
  { id: 'skill', label: 'Skill-based Paths' },
  { id: 'interview', label: 'Interview Prep' },
];

const colorBand = {
  amber: 'bg-amber-400',
  iris: 'bg-iris-500',
  sage: 'bg-sage-500',
};

const statusMeta: Record<StageStatus, { icon: typeof CheckCircle2; label: string; color: string }> = {
  completed: { icon: CheckCircle2, label: 'Completed', color: 'text-sage-500' },
  active: { icon: Play, label: 'In progress', color: 'text-amber-500' },
  upcoming: { icon: Circle, label: 'Upcoming', color: 'text-iris-500' },
  locked: { icon: Lock, label: 'Locked', color: 'text-ink-300' },
};

export function PathPage() {
  const { paths, user, skills } = useApp();
  const [view, setView] = useState<'browse' | 'active'>('active');
  const [domain, setDomain] = useState('all');
  const [typeTab, setTypeTab] = useState<PathType | 'all'>('career');
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [pace, setPace] = useState(user.weeklyHours);

  const activePath = paths.find((p) => p.active);

  const filteredPaths = useMemo(() => {
    return paths.filter((p) => {
      if (domain !== 'all' && p.domain !== domain) return false;
      if (typeTab !== 'all' && p.type !== typeTab) return false;
      return true;
    });
  }, [paths, domain, typeTab]);

  // pace-based time-to-goal recalculation
  const remainingStages = activePath?.stages.filter((s) => s.status !== 'completed') ?? [];
  const remainingWeeks = remainingStages.reduce((sum, s) => sum + s.durationWeeks, 0);
  const adjustedWeeks = pace > 0 ? Math.ceil((remainingWeeks * user.weeklyHours) / pace) : remainingWeeks;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-800 dark:text-ink-50">Learning Path</h1>
          <p className="mt-1.5 text-sm text-ink-400">
            {view === 'active' ? 'Your personalized roadmap to goal' : 'Browse and pick a new path'}
          </p>
        </div>
        {/* Toggle */}
        <div className="flex rounded-lg border border-ink-200 p-0.5 dark:border-ink-700">
          <button
            onClick={() => setView('browse')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              view === 'browse' ? 'bg-amber-400 text-ink-900' : 'text-ink-400 hover:text-ink-700'
            }`}
          >
            Browse paths
          </button>
          <button
            onClick={() => setView('active')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              view === 'active' ? 'bg-amber-400 text-ink-900' : 'text-ink-400 hover:text-ink-700'
            }`}
          >
            My active path
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 no-scrollbar flex gap-2 overflow-x-auto py-1">
        {pathDomainFilters.map((t) => {
          const active = domain === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setDomain(t.id)}
              className={`chip border ${
                active
                  ? 'border-iris-500 bg-iris-500 text-white shadow-sm'
                  : 'border-ink-200 bg-white text-ink-500 hover:border-ink-300 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-300'
              }`}
            >
              <Icon name={t.icon} size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="mb-6 flex gap-6 border-b border-ink-100 dark:border-ink-700">
        {PATH_TYPE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTypeTab(tab.id)}
            className={`tab-underline ${typeTab === tab.id ? 'tab-underline-active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {view === 'browse' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredPaths.map((p) => (
            <div key={p.id} className="surface group overflow-hidden rounded-xl2 transition-all hover:shadow-lift hover:-translate-y-0.5">
              <div className={`h-2 ${colorBand[p.color]}`} />
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-base font-semibold text-ink-800 dark:text-ink-50">{p.title}</h3>
                    <p className="mt-1 text-xs text-ink-400">{p.subtitle}</p>
                  </div>
                  {p.active && (
                    <span className="chip bg-amber-400 text-ink-900">
                      <Sparkles size={11} /> Active
                    </span>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-2xs text-ink-400">
                  <span className="flex items-center gap-1"><Layers size={12} /> {p.stageCount} stages</span>
                  <span className="flex items-center gap-1"><Calendar size={12} /> {p.durationWeeks} weeks</span>
                  <span className="flex items-center gap-1"><BarChart3 size={12} /> {p.difficulty}</span>
                </div>
                <button className={`mt-4 w-full ${p.active ? 'btn-secondary' : 'btn-primary'} text-xs`}>
                  {p.active ? 'View roadmap' : 'Activate path'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        activePath && (
          <div>
            {/* Pace slider */}
            <div className="surface mb-6 rounded-xl2 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="label">Active path</div>
                  <h2 className="font-display text-lg font-semibold text-ink-800 dark:text-ink-50">{activePath.title}</h2>
                </div>
                <div className="text-right">
                  <div className="font-display text-2xl font-bold text-amber-500">{adjustedWeeks}</div>
                  <div className="text-2xs text-ink-400">weeks to goal</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-ink-500">
                    <Clock size={13} /> Weekly pace
                  </span>
                  <span className="font-semibold text-amber-500">{pace}h / week</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={30}
                  value={pace}
                  onChange={(e) => setPace(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-ink-100 accent-amber-400 dark:bg-ink-700"
                />
                <div className="mt-1 flex justify-between text-2xs text-ink-300">
                  <span>2h (casual)</span>
                  <span>{user.weeklyHours}h (your commitment)</span>
                  <span>30h (intensive)</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-ink-100 dark:bg-ink-700" />
              <div className="space-y-3">
                {activePath.stages.map((stage) => {
                  const meta = statusMeta[stage.status];
                  const StatusIcon = meta.icon;
                  const expanded = expandedStage === stage.id;
                  return (
                    <div key={stage.id} className="relative">
                      <div className={`absolute left-5 top-6 z-10 -translate-x-1/2`}>
                        <div className={`flex h-5 w-5 items-center justify-center rounded-full ${
                          stage.status === 'completed' ? 'bg-sage-500' :
                          stage.status === 'active' ? 'bg-amber-400' :
                          stage.status === 'upcoming' ? 'bg-iris-500' : 'bg-ink-300'
                        }`}>
                          <StatusIcon size={11} className="text-white" />
                        </div>
                      </div>
                      <div
                        className={`ml-12 surface rounded-xl p-4 transition-all ${
                          stage.status === 'active' ? 'ring-1 ring-amber-400/30' : ''
                        } ${stage.status === 'locked' ? 'opacity-60' : ''}`}
                      >
                        <button
                          onClick={() => stage.status !== 'locked' && setExpandedStage(expanded ? null : stage.id)}
                          className="flex w-full items-center justify-between text-left"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-2xs font-semibold text-ink-300">Stage {stage.index}</span>
                              <span className={`text-2xs font-semibold ${meta.color}`}>{meta.label}</span>
                            </div>
                            <h3 className="mt-0.5 font-display text-sm font-semibold text-ink-800 dark:text-ink-50">
                              {stage.title}
                            </h3>
                          </div>
                          {stage.status !== 'locked' && (
                            <ChevronDown size={16} className={`shrink-0 text-ink-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                          )}
                        </button>

                        {expanded && (
                          <div className="mt-4 animate-fade-in border-t border-ink-100 pt-4 dark:border-ink-700">
                            <p className="text-xs leading-relaxed text-ink-500 dark:text-ink-300">{stage.description}</p>

                            <div className="mt-3 flex items-center gap-1.5 text-2xs text-ink-400">
                              <Clock size={11} /> {stage.durationWeeks} weeks
                            </div>

                            {/* Milestones */}
                            <div className="mt-3">
                              <div className="label mb-2">Milestones</div>
                              <div className="space-y-1.5">
                                {stage.milestones.map((m, i) => (
                                  <div key={i} className="flex items-center gap-2 text-xs text-ink-600 dark:text-ink-300">
                                    <Flag size={11} className="shrink-0 text-iris-400" /> {m}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Prerequisites */}
                            <div className="mt-3">
                              <div className="label mb-2">Prerequisites</div>
                              <div className="flex flex-wrap gap-1.5">
                                {stage.prerequisites.map((p, i) => (
                                  <span key={i} className="chip border border-ink-200 text-2xs text-ink-500 dark:border-ink-600">
                                    {p}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Why */}
                            <div className="mt-3 rounded-lg border border-iris-200 bg-iris-50 p-3 dark:border-iris-800 dark:bg-iris-900/20">
                              <div className="label mb-1 text-iris-500">Why this stage</div>
                              <p className="text-xs leading-relaxed text-iris-800 dark:text-iris-200">{stage.why}</p>
                            </div>

                            {/* Skills targeted */}
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {stage.skillIds.map((sid) => {
                                const skill = skills.find((s) => s.id === sid);
                                if (!skill) return null;
                                return (
                                  <span key={sid} className="chip bg-iris-50 text-2xs text-iris-600 dark:bg-iris-900/30 dark:text-iris-300">
                                    {skill.name}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
