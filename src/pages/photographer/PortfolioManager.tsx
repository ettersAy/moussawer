import { useState } from "react";
import { Edit3, Image, ImageOff, Plus, Save, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { useToast } from "../../components/shared/Toast";
import { api, type Photographer, type PortfolioItem } from "../../lib/api";
import { ItemImage } from "./ItemImage";

export function PortfolioManager({ photographer, onRefresh }: { photographer: Photographer; onRefresh: () => void }) {
  const toast = useToast();
  const items = photographer.portfolioItems;
  const [form, setForm] = useState({ title: "", description: "", imageUrl: "", categoryId: "", tags: "", isFeatured: false, sortOrder: 0 });
  const [editing, setEditing] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);

  function startEdit(item: PortfolioItem) {
    setEditing(item.id);
    setPreviewFailed(false);
    setForm({ title: item.title, description: item.description ?? "", imageUrl: item.imageUrl, categoryId: item.category?.id ?? "", tags: item.tags.join(","), isFeatured: item.isFeatured, sortOrder: item.sortOrder ?? 0 });
  }

  function resetForm() { setEditing(null); setShowCreate(false); setPreviewFailed(false); setForm({ title: "", description: "", imageUrl: "", categoryId: "", tags: "", isFeatured: false, sortOrder: 0 }); }

  function handleImageUrlChange(url: string) {
    setForm({ ...form, imageUrl: url });
    setPreviewFailed(false);
  }

  async function save() {
    try {
      const body = { ...form, tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [] };
      if (editing) {
        await api(`/portfolio/${editing}`, { method: "PATCH", body });
        toast.success("Portfolio item updated.");
      } else {
        await api("/portfolio", { method: "POST", body });
        toast.success("Portfolio item created.");
      }
      resetForm(); onRefresh();
    } catch (err: any) { toast.error(err.message); }
  }

  async function remove(id: string) {
    await api(`/portfolio/${id}`, { method: "DELETE" });
    toast.success("Item deleted.");
    setConfirmDelete(null); onRefresh();
  }

  return (
    <div className="content-stack">
      <div className="split-heading compact-heading">
        <h2>Portfolio ({items.length})</h2>
        {!showCreate && !editing && (
          <button className="solid-button compact" onClick={() => setShowCreate(true)}><Plus size={14} /> Add</button>
        )}
      </div>

      {(showCreate || editing) && (
        <div className="panel" style={{ display: "grid", gap: "12px" }}>
          <h3>{editing ? "Edit Item" : "New Portfolio Item"}</h3>
          <label>Title <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
          <div style={{ display: "grid", gap: "8px" }}>
            <label>Image URL <input value={form.imageUrl} onChange={(e) => handleImageUrlChange(e.target.value)} placeholder="https://..." /></label>
            {form.imageUrl && !previewFailed && (
              <img
                src={form.imageUrl}
                alt="Preview"
                style={{ maxWidth: "300px", maxHeight: "200px", borderRadius: "8px", objectFit: "cover", border: "1px solid var(--border)" }}
                onError={() => setPreviewFailed(true)}
              />
            )}
            {form.imageUrl && previewFailed && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", background: "var(--surface-muted)", borderRadius: "8px", color: "var(--muted-foreground)", fontSize: "0.88rem" }}>
                <ImageOff size={16} /> Unable to load image preview
              </div>
            )}
          </div>
          <label>Description <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <div className="form-row">
            <label>Category
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">None</option>
                {photographer.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label>Tags (comma-separated) <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="wedding, outdoor" /></label>
          </div>
          <label style={{ flexDirection: "row", alignItems: "center", gap: "8px" }}>
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} style={{ width: "auto" }} />
            Featured
          </label>
          <div className="inline-actions" style={{ justifyContent: "flex-end" }}>
            <button className="ghost-button compact" onClick={resetForm}><X size={14} /> Cancel</button>
            <button className="solid-button compact" onClick={save}><Save size={14} /> Save</button>
          </div>
        </div>
      )}

      {items.length ? (
        <div className="portfolio-manager-grid">
          {items.map((item) => (
            <article className="portfolio-manager-card" key={item.id}>
              <ItemImage src={item.imageUrl} alt={item.title} />
              <div className="card-body">
                <h3>{item.title} {item.isFeatured && "⭐"}</h3>
                {item.isModerated && <span className="tag tone-warning">Awaiting moderation</span>}
                <div className="inline-actions" style={{ marginTop: "8px" }}>
                  <button className="ghost-button compact" onClick={() => startEdit(item)}><Edit3 size={14} /></button>
                  <button className="ghost-button compact" style={{ color: "var(--red)" }} onClick={() => setConfirmDelete(item.id)}><Trash2 size={14} /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Image size={32} />
          <h2>No portfolio items yet</h2>
          <p>Showcase your work to attract more clients.</p>
        </div>
      )}

      <ConfirmDialog open={!!confirmDelete} title="Delete Portfolio Item" message="This will permanently remove this item from your portfolio."
        confirmLabel="Delete" variant="danger" onConfirm={() => remove(confirmDelete!)} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
