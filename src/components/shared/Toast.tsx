import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

type ToastVariant = "success" | "error" | "warning" | "info";

type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const add = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = String(++nextId);
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo<ToastContextValue>(() => ({
    toast: add,
    success: (message: string) => add(message, "success"),
    error: (message: string) => add(message, "error"),
  }), [add]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container" role="status" aria-live="polite">
        {toasts.map((item) => (
          <ToastEntry key={item.id} item={item} onDismiss={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastEntry({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(item.id), 5000);
    return () => clearTimeout(timer);
  }, [item.id, onDismiss]);

  const icons: Record<ToastVariant, ReactNode> = {
    success: <CheckCircle2 size={18} />,
    error: <XCircle size={18} />,
    warning: <AlertTriangle size={18} />,
    info: <Info size={18} />,
  };

  return (
    <div className={`toast toast-${item.variant}`} role="alert">
      <span className="toast-icon">{icons[item.variant]}</span>
      <span className="toast-message">{item.message}</span>
      <button className="toast-close" onClick={() => onDismiss(item.id)} aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
