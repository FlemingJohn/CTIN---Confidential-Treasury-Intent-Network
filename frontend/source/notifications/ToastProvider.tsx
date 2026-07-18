'use client';

import { createContext, useCallback, useRef, useState, ReactNode } from 'react';
import { ToastInput, ToastMessage, ToastVariant } from '@/source/notifications/toastTypes';

interface ToastContextValue {
  show: (input: ToastInput) => number;
  update: (id: number, input: Partial<ToastInput>) => void;
  dismiss: (id: number) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

const autoDismissMilliseconds = 7000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const nextId = useRef(1);
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current[id];
    if (timer) {
      clearTimeout(timer);
      delete timers.current[id];
    }
  }, []);

  const scheduleDismiss = useCallback(
    (id: number, variant: ToastVariant) => {
      if (variant === 'pending') {
        return;
      }
      timers.current[id] = setTimeout(() => dismiss(id), autoDismissMilliseconds);
    },
    [dismiss]
  );

  const show = useCallback(
    (input: ToastInput) => {
      const id = nextId.current;
      nextId.current += 1;
      setToasts((current) => [...current, { id, ...input }]);
      scheduleDismiss(id, input.variant);
      return id;
    },
    [scheduleDismiss]
  );

  const update = useCallback(
    (id: number, input: Partial<ToastInput>) => {
      setToasts((current) =>
        current.map((toast) => (toast.id === id ? { ...toast, ...input } : toast))
      );
      if (input.variant) {
        scheduleDismiss(id, input.variant);
      }
    },
    [scheduleDismiss]
  );

  return (
    <ToastContext.Provider value={{ show, update, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

const variantBorder: Record<ToastVariant, string> = {
  pending: 'border-l-magma-ember',
  success: 'border-l-signal-settled',
  error: 'border-l-signal-reverted',
  info: 'border-l-magma-glow',
};

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[380px] max-w-[calc(100vw-2rem)] flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 border border-obsidian-border border-l-2 ${variantBorder[toast.variant]} bg-obsidian-panel/95 p-4 shadow-lg backdrop-blur`}
        >
          <ToastIcon variant={toast.variant} />
          <div className="flex flex-1 flex-col gap-1">
            <span className="font-mono text-sm text-neutral-200">{toast.message}</span>
            {toast.href ? (
              <a
                href={toast.href}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] text-magma-ember hover:text-magma-glow"
              >
                View on Etherscan
              </a>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="font-mono text-xs text-neutral-500 hover:text-neutral-200"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

function ToastIcon({ variant }: { variant: ToastVariant }) {
  if (variant === 'pending') {
    return (
      <svg className="mt-0.5 h-5 w-5 animate-spin text-magma-ember" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (variant === 'success') {
    return (
      <svg className="mt-0.5 h-5 w-5 text-signal-settled" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M8 12.5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (variant === 'error') {
    return (
      <svg className="mt-0.5 h-5 w-5 text-signal-reverted" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg className="mt-0.5 h-5 w-5 text-magma-glow" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8h.01M11 12h1v4h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
