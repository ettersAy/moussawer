import { useState } from "react";
import { Camera, Edit3, EyeOff, Plus, Save, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { useToast } from "../../components/shared/Toast";
import { api, money, type Photographer, type Service } from "../../lib/api";

export function ServiceManager({ photographer, onRefresh }: { photographer: Photographer; onRefresh: () => void }) {
  const toast = useToast();
  const [services] = useState(photographer.services);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", durationMinutes: 60, price: 100, categoryId: "" });
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function startEdit(s: Service) {
    setEditing(s.id);
    setForm({ title: s.title, description: s.description, durationMinutes: s.durationMinutes, price: s.price, categoryId: s.category?.id ?? "" });
  }

  function resetForm() { setEditing(null); setShowCreate(false); setForm({ title: "", description: "", durationMinutes: 60, price: 100, categoryId: "" }); }

  async function save() {
    try {
      if (editing) {
        await api(`/me/services/${editing}`, { method: "PATCH", body: form });
        toast.success("Service updated.");
      } else {
        await api("/me/services", { method: "POST", body: form });
        toast.success("Service created.");
      }
      resetForm(); onRefresh();
    } catch (err: any) { toast.error(err.message); }
  }

  async function toggleActive(s: Service) {
    await api(`/me/services/${s.id}`, { method: "PATCH", body: { isActive: !s.isActive } });
    toast.success(s.isActive ? "Service deactivated." : "Service activated.");
    onRefresh();
  }

  async function remove(id: string) {
    await api(`/me/services/${id}`, { method: "DELETE" });
    toast.success("Service deleted.");
    setConfirmDelete(null); onRefresh();
  }

  return (
    <div className="content-stack">
      <div className="split-heading compact-heading">
        <h2>My Services ({services.length})</h2>
        {!showCreate && !editing && (
          <button className="solid-button compact" onClick={() => setShowCreate(true)}><Plus size={14} /> Add</button>
        )}
      </div>

      {(showCreate || editing) && (
        <div className="panel" style={{ display: "grid", gap: "12px" }}>
          <h3>{editing ? "Edit Service" : "New Service"}</h3>
          <div className="form-row">
            <label>Title <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label>Category
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">None</option>
                {photographer.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          </div>
          <label>Description <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <div className="form-row">
            <label>Duration (min) <input type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} /></label>
            <label>Price ($) <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></label>
          </div>
          <div className="inline-actions" style={{ justifyContent: "flex-end" }}>
            <button className="ghost-button compact" onClick={resetForm}><X size={14} /> Cancel</button>
            <button className="solid-button compact" onClick={save}><Save size={14} /> Save</button>
          </div>
        </div>
      )}

      <div className="list-stack">
        {services.map((s) => (
          <article className="panel service-row" key={s.id} style={{ opacity: s.isActive ? 1 : 0.55 }}>
            <div>
              <div className="card-title-row">
                <h3>{s.title}</h3>
                <span className={`tag ${s.isActive ? "tone-good" : "tone-neutral"}`}>{s.isActive ? "Active" : "Inactive"}</span>
              </div>
              <p>{s.description}</p>
              <p className="muted">{s.durationMinutes} min · {money(s.price)} · {s.category?.name ?? "No category"}</p>
            </div>
            <div className="inline-actions">
              <button className="ghost-button compact" onClick={() => toggleActive(s)} title={s.isActive ? "Deactivate" : "Activate"}>
                {s.isActive ? <EyeOff size={14} /> : <Camera size={14} />}
              </button>
              <button className="ghost-button compact" onClick={() => startEdit(s)}><Edit3 size={14} /></button>
              <button className="ghost-button compact" style={{ color: "var(--red)" }} onClick={() => setConfirmDelete(s.id)}><Trash2 size={14} /></button>
            </div>
          </article>
        ))}
      </div>

      <ConfirmDialog open={!!confirmDelete} title="Delete Service" message="This will permanently remove this service. Existing bookings are not affected."
        confirmLabel="Delete" variant="danger" onConfirm={() => remove(confirmDelete!)} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
