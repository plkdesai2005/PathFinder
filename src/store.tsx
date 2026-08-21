import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  Assessment,
  ChatMessage,
  Course,
  LearningPath,
  Route,
  Skill,
  UserProfile,
} from '@/types';
import {
  chatQuickSuggestions,
  mockAssessments,
  mockCourses,
  mockPaths,
  mockSkills,
  mockUser,
} from '@/data';

interface AppState {
  // routing
  route: Route;
  setRoute: (r: Route) => void;

  // theme
  dark: boolean;
  toggleTheme: () => void;

  // sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // chat
  chatOpen: boolean;
  toggleChat: () => void;
  messages: ChatMessage[];
  sendMessage: (text: string) => void;
  clearChat: () => void;

  // data
  user: UserProfile;
  updateUser: (patch: Partial<UserProfile>) => void;
  skills: Skill[];
  nudgeSkill: (id: string, delta: number) => void;
  courses: Course[];
  toggleBookmark: (id: string) => void;
  paths: LearningPath[];
  assessments: Assessment[];
  setAssessmentStatus: (id: string, status: Assessment['status']) => void;

  // search -> chat routing
  askFromSearch: (text: string) => void;
}

const Ctx = createContext<AppState | null>(null);

let idCounter = 0;
const nextId = () => `m${Date.now()}_${idCounter++}`;

const initialGuideMessages: ChatMessage[] = [
  {
    id: 'g0',
    role: 'guide',
    text: "Hey Maya — I'm your Learning Guide. I can help you set goals, find skill gaps, or re-rank your path. What's on your mind?",
    ts: Date.now() - 60000,
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>('dashboard');
  const [dark, setDark] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>(initialGuideMessages);
  const [user, setUser] = useState<UserProfile>(mockUser);
  const [skills, setSkills] = useState<Skill[]>(mockSkills);
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [paths] = useState<LearningPath[]>(mockPaths);
  const [assessments, setAssessments] = useState<Assessment[]>(mockAssessments);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [dark]);

  const toggleTheme = useCallback(() => setDark((d) => !d), []);
  const toggleSidebar = useCallback(() => setSidebarCollapsed((c) => !c), []);
  const toggleChat = useCallback(() => setChatOpen((o) => !o), []);
  const clearChat = useCallback(() => setMessages(initialGuideMessages), []);

  const generateGuideReply = useCallback(
    (text: string): { text: string; preview?: ChatMessage['preview'] } => {
      const lower = text.toLowerCase();
      if (lower.includes('skill gap') || lower.includes('gap')) {
        const gaps = skills.filter((s) => !s.mastered && s.target - s.current > 0);
        const sorted = [...gaps].sort((a, b) => b.target - b.current - (a.target - a.current));
        const top = sorted.slice(0, 3);
        return {
          text: `Your widest skill gaps toward ${user.careerGoal}:`,
          preview: {
            type: 'skill',
            items: top.map((s) => `${s.name}: ${s.current}/${s.target} — ${s.target - s.current} to go`),
          },
        };
      }
      if (lower.includes('roadmap') || lower.includes('path')) {
        const active = paths.find((p) => p.active);
        if (active) {
          return {
            text: `Here's your active roadmap — ${active.title}:`,
            preview: {
              type: 'roadmap',
              items: active.stages.map((s) => `${s.index}. ${s.title} — ${s.status}`),
            },
          };
        }
        return { text: 'You have no active path yet. Want me to recommend one based on your goal?' };
      }
      if (lower.includes('re-rank') || lower.includes('rerank') || lower.includes('reorder')) {
        return {
          text: "I re-ranked your path stages by gap size. Testing Strategies now moves up since it's your widest gap. Your roadmap updated.",
          preview: { type: 'roadmap', items: ['1. React Patterns Core — completed', '2. Testing Strategies — moved up', '3. TypeScript for Libraries', '4. Frontend Architecture'] },
        };
      }
      if (lower.includes('testing') && (lower.includes('better') || lower.includes('more'))) {
        return {
          text: "Got it — I'll nudge your Testing skill up by 8 points to 62. That reflects your self-assessment and will feed into your skill gaps and path ranking.",
          preview: { type: 'skill', items: ['Testing: 54 → 62', 'Next milestone: Pass Testing Strategies quiz'] },
        };
      }
      if (lower.includes('streak')) {
        return { text: `You're on a ${user.streak}-day streak — your longest is ${user.longestStreak} days. Keep it alive with even a 15-minute session today.` };
      }
      if (lower.includes('next') || lower.includes('continue')) {
        return {
          text: 'Your next milestone is TypeScript Generics Deep-Dive, part of your Senior Frontend track.',
          preview: { type: 'next', items: ['TypeScript Generics Deep-Dive', '35% complete', '~6 hours remaining'] },
        };
      }
      if (lower.includes('goal') || lower.includes('career')) {
        return {
          text: `Your goal is ${user.careerGoal}, committing ${user.weeklyHours}h/week. At your current pace you're roughly 10 weeks from finishing the active path. Want me to adjust the pace?`,
        };
      }
      return {
        text: "I can help with skill gaps, your roadmap, re-ranking, streaks, or adjusting your goal. Try one of the chips above, or tell me what you're working on.",
      };
    },
    [skills, paths, user],
  );

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const userMsg: ChatMessage = { id: nextId(), role: 'user', text: trimmed, ts: Date.now() };
      setMessages((prev) => [...prev, userMsg]);

      // self-assessment correction nudge
      const lower = trimmed.toLowerCase();
      if (lower.includes('testing') && (lower.includes('better') || lower.includes('more'))) {
        setSkills((prev) => prev.map((s) => (s.id === 'testing' ? { ...s, current: Math.min(s.target, s.current + 8) } : s)));
      }

      window.setTimeout(() => {
        const reply = generateGuideReply(trimmed);
        const guideMsg: ChatMessage = {
          id: nextId(),
          role: 'guide',
          text: reply.text,
          preview: reply.preview,
          ts: Date.now(),
        };
        setMessages((prev) => [...prev, guideMsg]);
      }, 550);
    },
    [generateGuideReply],
  );

  const askFromSearch = useCallback(
    (text: string) => {
      setChatOpen(true);
      sendMessage(text);
    },
    [sendMessage],
  );

  const updateUser = useCallback((patch: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...patch }));
  }, []);

  const nudgeSkill = useCallback((id: string, delta: number) => {
    setSkills((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, current: Math.max(0, Math.min(100, s.current + delta)) } : s,
      ),
    );
  }, []);

  const toggleBookmark = useCallback((id: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, bookmarked: !c.bookmarked } : c)),
    );
  }, []);

  const setAssessmentStatus = useCallback(
    (id: string, status: Assessment['status']) => {
      setAssessments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    },
    [],
  );

  const value = useMemo<AppState>(
    () => ({
      route,
      setRoute,
      dark,
      toggleTheme,
      sidebarCollapsed,
      toggleSidebar,
      chatOpen,
      toggleChat,
      messages,
      sendMessage,
      clearChat,
      user,
      updateUser,
      skills,
      nudgeSkill,
      courses,
      toggleBookmark,
      paths,
      assessments,
      setAssessmentStatus,
      askFromSearch,
    }),
    [
      route,
      dark,
      toggleTheme,
      sidebarCollapsed,
      toggleSidebar,
      chatOpen,
      toggleChat,
      messages,
      sendMessage,
      clearChat,
      user,
      updateUser,
      skills,
      nudgeSkill,
      courses,
      toggleBookmark,
      paths,
      assessments,
      setAssessmentStatus,
      askFromSearch,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { chatQuickSuggestions };
