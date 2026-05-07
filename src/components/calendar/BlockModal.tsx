import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import type { CalendarBlock } from "./types";

type BlockModalProps = {
  open: boolean;
  block?: CalendarBlock;
  startDate?: string;
  endDate?: string;
  onClose: () => void;
  onSave: (data: { startAt: string; endAt: string; reason: string }, blockId?: string) => void;
};

export function BlockModal({ open, block, onClose, onSave, startDate, endDate }: BlockModalProps) {
  const [form, setForm] = useState({
    startAt: "",
    endAt: "",
    reason: "",
  });

  useEffect(() => {
    setForm({
      startAt: block?.startAt ? block.startAt.slice(0, 16) : startDate?.slice(0, 16) ?? "",
      endAt: block?.endAt ? block.endAt.slice(0, 16) : endDate?.slice(0, 16) ?? "",
      reason: block?.reason ?? "",
    });
  }, [block, startDate, endDate, open]);

  if (!open) return null;

  const handleSave = () => {
    onSave({
      startAt: new Date(form.startAt).toISOString(),
      endAt: new Date(form.endAt).toISOString(),
      reason: form.reason,
    }, block?.id);
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card" style={{ maxWidth: "440px" }}>
        <h2>{block ? "Edit Block" : "Create Block"}</h2>
        <div className="calendar-block-form">
          <div className="form-row">
            <label>
              Start
              <input type="datetime-local" value={form.startAt}
                onChange={(e) => setForm({ ...form, startAt: e.target.value })} />
            </label>
            <label>
              End
              <input type="datetime-local" value={form.endAt}
                onChange={(e) => setForm({ ...form, endAt: e.target.value })} />
            </label>
          </div>
          <label>
            Reason <small className="muted">(optional)</small>
            <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Vacation, maintenance..." />
          </label>
        </div>
        <div className="modal-actions">
          <button className="ghost-button" onClick={onClose}><X size={14} /> Cancel</button>
          <button className="solid-button" onClick={handleSave}>
            <Plus size={14} /> {block ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
