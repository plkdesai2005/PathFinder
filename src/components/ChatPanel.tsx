import { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  Send,
  PanelRightClose,
  Trash2,
  CheckCircle2,
  Circle,
  Flag,
  ArrowRight,
} from 'lucide-react';
import { useApp, chatQuickSuggestions } from '@/store';

export function ChatPanel() {
  const { messages, sendMessage, clearChat, toggleChat } = useApp();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  // detect if last message is user awaiting reply
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last && last.role === 'user') {
      setTyping(true);
      const t = setTimeout(() => setTyping(false), 600);
      return () => clearTimeout(t);
    }
    setTyping(false);
  }, [messages]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  const renderPreview = (items: string[], type: 'roadmap' | 'skill' | 'next') => {
    if (type === 'roadmap') {
      return (
        <div className="mt-2 space-y-1.5 rounded-lg border border-iris-200 bg-iris-50 p-3 dark:border-iris-800 dark:bg-iris-900/30">
          {items.map((item, i) => {
            const done = item.includes('completed');
            return (
              <div key={i} className="flex items-start gap-2 text-xs text-iris-800 dark:text-iris-200">
                {done ? (
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-sage-500" />
                ) : (
                  <Circle size={14} className="mt-0.5 shrink-0 text-iris-400" />
                )}
                <span>{item}</span>
              </div>
            );
          })}
        </div>
      );
    }
    if (type === 'skill') {
      return (
        <div className="mt-2 space-y-1.5 rounded-lg border border-iris-200 bg-iris-50 p-3 dark:border-iris-800 dark:bg-iris-900/30">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-iris-800 dark:text-iris-200">
              <Flag size={12} className="shrink-0 text-iris-500" />
              {item}
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-900/30">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs font-medium text-amber-800 dark:text-amber-200">
            {i === 0 ? <ArrowRight size={12} className="text-amber-500" /> : <span className="w-3" />}
            {item}
          </div>
        ))}
      </div>
    );
  };

  return (
    <aside className="flex h-full w-full flex-col border-l border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-800">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-ink-100 px-4 dark:border-ink-700">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-iris-500 to-iris-700 text-white">
            <Sparkles size={17} />
          </div>
          <div>
            <div className="text-sm font-semibold text-ink-800 dark:text-ink-50">Learning Guide</div>
            <div className="flex items-center gap-1 text-2xs text-sage-500">
              <span className="h-1.5 w-1.5 rounded-full bg-sage-400" />
              online
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearChat}
            aria-label="Clear chat"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-700"
          >
            <Trash2 size={15} />
          </button>
          <button
            onClick={toggleChat}
            aria-label="Close chat"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-700"
          >
            <PanelRightClose size={17} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div
              className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-sm ${
                m.role === 'user'
                  ? 'bg-amber-400 text-ink-900'
                  : 'bg-ink-50 text-ink-700 dark:bg-ink-700 dark:text-ink-100'
              }`}
            >
              <p className="leading-relaxed">{m.text}</p>
              {m.preview && renderPreview(m.preview.items, m.preview.type)}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-xl bg-ink-50 px-4 py-3 dark:bg-ink-700">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-300 [animation-delay:-0.3s] dark:bg-ink-400" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-300 [animation-delay:-0.15s] dark:bg-ink-400" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-300 dark:bg-ink-400" />
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div className="shrink-0 px-3 pb-2">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {chatQuickSuggestions.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="chip border border-ink-200 bg-white text-ink-500 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600 dark:border-ink-600 dark:bg-ink-700 dark:text-ink-300 dark:hover:border-amber-500 dark:hover:bg-amber-900/30 dark:hover:text-amber-300"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={submit} className="shrink-0 border-t border-ink-100 p-3 dark:border-ink-700">
        <div className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your Learning Guide..."
            className="input-base pr-10"
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 flex -translate-y-1/2 h-7 w-7 items-center justify-center rounded-md bg-amber-400 text-ink-900 transition-colors hover:bg-amber-300 disabled:opacity-40"
          >
            <Send size={14} />
          </button>
        </div>
      </form>
    </aside>
  );
}
