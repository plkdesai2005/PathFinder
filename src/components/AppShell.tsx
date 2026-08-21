import { PanelRightOpen } from 'lucide-react';
import { useApp } from '@/store';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { ChatPanel } from '@/components/ChatPanel';
import type { Route } from '@/types';

export function AppShell({ children, route }: { children: React.ReactNode; route: Route }) {
  const { chatOpen, toggleChat } = useApp();

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50 dark:bg-ink-900">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <div key={route} className="animate-fade-in">
              {children}
            </div>
          </main>

          {chatOpen ? (
            <div className="w-[340px] shrink-0">
              <ChatPanel />
            </div>
          ) : (
            <button
              onClick={toggleChat}
              aria-label="Open Learning Guide"
              className="flex w-12 shrink-0 flex-col items-center justify-center gap-2 border-l border-ink-100 bg-white text-ink-400 transition-colors hover:bg-ink-50 hover:text-iris-500 dark:border-ink-700 dark:bg-ink-800 dark:hover:bg-ink-700"
            >
              <PanelRightOpen size={18} />
              <span className="text-2xs [writing-mode:vertical-rl] rotate-180 font-medium">Guide</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
