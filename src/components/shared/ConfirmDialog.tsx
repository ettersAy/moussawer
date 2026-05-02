import { AlertTriangle } from "lucide-react";
import { useEffect, useRef } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      confirmRef.current?.focus();
      const handler = (e: KeyboardEvent) => {
        if (e.key === "Escape") onCancel();
      };
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    }
  }, [open, onCancel]);

  if (!open) return null;

  const confirmClass = variant === "danger" ? "solid-button danger" : "solid-button";

  return (
    <div className="modal-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {variant !== "default" && (
          <span className="modal-icon">
            <AlertTriangle size={24} />
          </span>
        )}
        <h2 id="confirm-title">{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="ghost-button" type="button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className={confirmClass} type="button" ref={confirmRef} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
