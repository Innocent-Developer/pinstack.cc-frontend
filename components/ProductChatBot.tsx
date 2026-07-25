'use client';

import { FormEvent, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
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
    setMounted(true);
  }, []);

  // Lock page scroll only on small screens while the sheet is open
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia('(max-width: 639px)');
    if (!mq.matches) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    const t = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => window.clearTimeout(t);
  }, [open, messages, busy]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

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

  if (!mounted) return null;

  return createPortal(
    <div className="product-chat-root" aria-live="polite">
      {open && (
        <button
          type="button"
          aria-label="Close chat overlay"
          className="product-chat-backdrop"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="product-chat-dock">
        {open && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="product-chat-panel"
          >
            <header className="product-chat-header">
              <div className="min-w-0">
                <p id={titleId} className="text-sm font-extrabold truncate text-white">
                  Ask about {productName}
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  On-screen helper · pinstack.cc · Code-XA & API Test Lab
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="shrink-0 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl leading-none flex items-center justify-center"
                aria-label="Close chat"
              >
                ×
              </button>
            </header>

            <div ref={listRef} className="product-chat-messages">
              {messages.map((m, i) => (
                <div
                  key={`${m.role}-${i}`}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed whitespace-pre-wrap break-words ${
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
              <div className="product-chat-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={busy}
                    onClick={() => void send(s)}
                    className="text-[11px] font-semibold px-2.5 py-1.5 rounded-full border border-borderC bg-white text-heading hover:border-primary hover:text-primary disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={onSubmit} className="product-chat-form">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={500}
                disabled={busy}
                placeholder="Ask about this product…"
                className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-borderC text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60"
                aria-label="Chat message"
                enterKeyHint="send"
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
          className="product-chat-fab btn-smooth"
          aria-label={open ? 'Close product chat' : 'Open product chat'}
          aria-expanded={open}
        >
          {!open && <span className="product-chat-fab-dot" aria-hidden />}
          {open ? (
            <span className="text-2xl leading-none" aria-hidden>
              ×
            </span>
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
    </div>,
    document.body
  );
}
