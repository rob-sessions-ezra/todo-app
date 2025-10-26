export type ToastType = 'success' | 'error' | 'info';
export type Toast = { id: number; text: string; type: ToastType };

let toasts: Toast[] = [];
const listeners = new Set<(toasts: Toast[]) => void>();

function notify() {
  for (const l of listeners) {
    l(toasts);
  }
}

export function subscribe(listener: (toasts: Toast[]) => void): () => void {
  listeners.add(listener);
  listener(toasts);
  return () => {
    listeners.delete(listener);
  };
}

export function pushToast(text: string, type: ToastType = 'info', ttlMs = 3000) {
  const id = Date.now() + Math.floor(Math.random() * 1000);
  toasts = [...toasts, { id, text, type }];
  notify();
  if (ttlMs > 0) {
    setTimeout(() => dismissToast(id), ttlMs);
  }
}

export function dismissToast(id: number) {
  toasts = toasts.filter(t => t.id !== id);
  notify();
}
