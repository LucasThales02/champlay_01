import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { ToastType } from '../types';

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} />,
  error: <AlertCircle size={18} />,
  info: <Info size={18} />,
  warning: <AlertTriangle size={18} />,
};

const colors: Record<ToastType, string> = {
  success: 'border-success text-success',
  error: 'border-destructive text-destructive',
  info: 'border-accent text-accent',
  warning: 'border-warning text-warning',
};

export function ToastContainer() {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl bg-card border-l-4 card-glow text-card-foreground text-sm font-medium animate-slide-in-right max-w-sm ${colors[toast.type]}`}
        >
          <span className="shrink-0">{icons[toast.type]}</span>
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
            aria-label="Fechar"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
