'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';

type ChatRole = 'user' | 'assistant';
type ChatMsg = { role: ChatRole; content: string };

interface Props {
  productId: string;
  productName: string;
}

const SUGGESTIONS = [
  'What does this product do?',
  'Who is it for?',
  'Where can I visit the website?',
];

export default function ProductChatBot({ productId, productName }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'assistant',
      content: `Hi — I’m the Pinstack assistant for ${productName}. Ask about this listing. I’m powered by Code-XA and API Test Lab.`,
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    const t = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => window.clearTimeout(t);
  }, [open, messages, busy]);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;

    const nextHistory = [...messages, { role: 'user' as const, content: text }];
    setMessages(nextHistory);
    setInput('');
    setBusy(true);

    try {
      const res = await api.chatProduct(productId, {
        message: text,
        history: nextHistory.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
      });
      const reply = res.data?.reply?.trim() || 'Sorry, I couldn’t answer that right now.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : 'Chat is temporarily unavailable. Please try again.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: msg.includes('Too many')
            ? 'Too many messages — wait a moment and try again.'
            : 'Sorry, chat is temporarily unavailable. Please try again in a bit.',
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] flex flex-col items-end gap-3 pointer-events-none">
      {open && (
        <div
          className="pointer-events-auto w-[min(100vw-1.5rem,380px)] h-[min(72vh,520px)] flex flex-col rounded-2xl border border-borderC bg-white shadow-[0_24px_60px_-20px_rgba(15,23,42,0.45)] overflow-hidden modal-sheet-in"
          role="dialog"
          aria-label={`${productName} product chat`}
        >
          <header className="shrink-0 px-4 py-3 bg-heading text-white flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-extrabold truncate">Ask about {productName}</p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Pinstack.cc · powered by Code-XA & API Test Lab
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 text-white text-lg leading-none"
              aria-label="Close chat"
            >
              ×
            </button>
          </header>

          <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 bg-bgAlt/40">
            {messages.map((m, i) => (
              <div
                key={`${m.role}-${i}`}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-white border border-borderC text-body rounded-bl-md'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="bg-white border border-borderC rounded-2xl rounded-bl-md px-3.5 py-2 text-[13px] text-muted">
                  Thinking…
                </div>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="shrink-0 px-3 pb-2 flex flex-wrap gap-1.5 bg-bgAlt/40">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={busy}
                  onClick={() => void send(s)}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-borderC bg-white text-heading hover:border-primary hover:text-primary disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={onSubmit}
            className="shrink-0 border-t border-borderC p-2.5 bg-white flex gap-2"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
              disabled={busy}
              placeholder="Ask about this product…"
              className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-borderC text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60"
              aria-label="Chat message"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="shrink-0 px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-hover disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="pointer-events-auto btn-smooth group relative w-14 h-14 rounded-full bg-primary text-white shadow-lg shadow-primary/35 hover:bg-primary-hover flex items-center justify-center"
        aria-label={open ? 'Close product chat' : 'Open product chat'}
        aria-expanded={open}
      >
        {!open && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-300 ring-2 ring-white animate-pulse" aria-hidden />
        )}
        {open ? (
          <span className="text-2xl leading-none">×</span>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M5 16.5V7.8A2.8 2.8 0 017.8 5h8.4A2.8 2.8 0 0119 7.8v5.4a2.8 2.8 0 01-2.8 2.8H9.2L5 19v-2.5z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <circle cx="9" cy="10.5" r="1" fill="currentColor" />
            <circle cx="12" cy="10.5" r="1" fill="currentColor" />
            <circle cx="15" cy="10.5" r="1" fill="currentColor" />
          </svg>
        )}
      </button>
    </div>
  );
}
