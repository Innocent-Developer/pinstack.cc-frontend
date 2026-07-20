'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type ToastKind = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  kind: ToastKind;
}

interface ToastCtx {
  toast: (message: string, kind?: ToastKind) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

let _toast: ToastCtx['toast'] | null = null;

/** Call from anywhere  even outside React (e.g. api.ts wrappers). */
export function showToast(message: string, kind: ToastKind = 'info') {
  _toast?.(message, kind);
}

const ICONS: Record<ToastKind, string> = {
  success: '✓',
  error: '✕',
  info: '○',
};

const BG: Record<ToastKind, string> = {
  success: 'bg-emerald-700',
  error: 'bg-red-600',
  info: 'bg-slate-800',
};

function ToastItem({ t, onDone }: { t: Toast; onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'translateY(16px)';
    el.style.opacity = '0';
    const anim = el.animate(
      [
        { transform: 'translateY(16px)', opacity: '0' },
        { transform: 'translateY(0)', opacity: '1' },
      ],
      { duration: 220, easing: 'cubic-bezier(0.22,1,0.36,1)', fill: 'forwards' }
    );
    const timer = setTimeout(() => {
      el.animate(
        [
          { transform: 'translateY(0)', opacity: '1' },
          { transform: 'translateY(8px)', opacity: '0' },
        ],
        { duration: 180, easing: 'ease-in', fill: 'forwards' }
      ).onfinish = onDone;
    }, 3000);

    return () => {
      clearTimeout(timer);
      anim.cancel();
    };
  }, [onDone]);

  return (
    <div
      ref={ref}
      className={`flex items-center gap-2.5 ${BG[t.kind]} text-white px-4 py-2.5 rounded-full shadow-xl text-sm font-medium max-w-xs`}
      role="status"
      aria-live="polite"
    >
      <span className="text-xs font-bold opacity-80">{ICONS[t.kind]}</span>
      {t.message}
    </div>
  );
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let counter = useRef(0);

  const toast = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = `toast-${++counter.current}`;
    setToasts((prev) => [...prev, { id, message, kind }]);
  }, []);

  const success = useCallback((m: string) => toast(m, 'success'), [toast]);
  const error = useCallback((m: string) => toast(m, 'error'), [toast]);
  const info = useCallback((m: string) => toast(m, 'info'), [toast]);

  useEffect(() => { _toast = toast; return () => { _toast = null; }; }, [toast]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <Ctx.Provider value={{ toast, success, error, info }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} t={t} onDone={() => remove(t.id)} />
        ))}
      </div>
    </Ctx.Provider>
  );
}
