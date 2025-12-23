import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((toast) => {
    const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
    const item = { id, type: 'info', title: '', message: '', ...toast };
    setToasts((prev) => [item, ...prev].slice(0, 4));

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, item.durationMs ?? 2500);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="fixed right-4 top-[84px] z-50 space-y-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              'w-[320px] rounded-2xl border px-4 py-3 backdrop-blur shadow-xl shadow-black/40',
              t.type === 'success'
                ? 'border-emerald-400/30 bg-emerald-500/10'
                : t.type === 'error'
                  ? 'border-rose-400/30 bg-rose-500/10'
                  : 'border-white/10 bg-gray-950/70',
            ].join(' ')}
          >
            {t.title ? <div className="text-sm font-semibold text-white">{t.title}</div> : null}
            {t.message ? <div className="mt-1 text-xs text-white/70">{t.message}</div> : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
