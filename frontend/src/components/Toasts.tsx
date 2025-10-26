import { useEffect, useState } from 'react';
import { subscribe, dismissToast, type Toast } from '../services/toaster';

export function Toasts() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => subscribe(setItems), []);

  return (
    <div className="fixed bottom-4 left-4 z-50 space-y-3">
      {items.map(t => (
        <div
          key={t.id}
          role="alert"
          className={[
            'rounded-lg px-5 py-3 flex items-start gap-3 border shadow-xl backdrop-blur-sm',
            t.type === 'error'
              ? 'bg-red-600/95 text-white border-red-400'
              : t.type === 'success'
              ? 'bg-emerald-600/95 text-white border-emerald-400'
              : 'bg-gray-900/95 text-white dark:bg-slate-800/95 dark:text-slate-100 border-gray-700',
          ].join(' ')}
        >
          <span className="text-sm leading-5">{t.text}</span>
          <button
            onClick={() => dismissToast(t.id)}
            className="ml-auto text-xs opacity-80 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
