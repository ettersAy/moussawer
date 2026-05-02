import { CheckCircle2, Edit3, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";

type AdminCategory = { id: string; name: string; slug: string; _count: { photographers: number; services: number; portfolio: number } };

export function CategoriesTab({
  categories,
  onCreate,
  onUpdate,
  onDelete
}: {
  categories: AdminCategory[];
  onCreate: (name: string) => Promise<void>;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [categoryName, setCategoryName] = useState("");
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!categoryName.trim()) return;
    await onCreate(categoryName.trim());
    setCategoryName("");
  }

  async function handleUpdate(id: string) {
    if (!editCatName.trim()) return;
    await onUpdate(id, editCatName.trim());
    setEditingCat(null);
  }

  async function handleDelete(id: string) {
    await onDelete(id);
    setConfirmDelete(null);
  }

  return (
    <div className="admin-section">
      <section className="panel">
        <h2>Create a new category</h2>
        <form className="inline-form" onSubmit={handleCreate}>
          <input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Category name" />
          <button className="solid-button compact" type="submit"><Plus size={15} /> Create</button>
        </form>
      </section>
      <section className="panel" style={{ marginTop: "1rem" }}>
        <h2>Existing categories ({categories.length})</h2>
        <div className="table-list">
          {categories.map((cat) => (
            <div className="table-row" key={cat.id}>
              <div>
                {editingCat === cat.id ? (
                  <div className="inline-actions">
                    <input value={editCatName} onChange={(e) => setEditCatName(e.target.value)} style={{ minWidth: "200px" }} />
                    <button className="solid-button compact" onClick={() => handleUpdate(cat.id)}><CheckCircle2 size={14} /> Save</button>
                    <button className="ghost-button compact" onClick={() => setEditingCat(null)}>Cancel</button>
                  </div>
                ) : (
                  <strong>{cat.name}</strong>
                )}
                <p className="muted">{cat._count.photographers} photographers · {cat._count.services} services · {cat._count.portfolio} items</p>
              </div>
              <div className="inline-actions">
                <button className="ghost-button compact" onClick={() => { setEditingCat(cat.id); setEditCatName(cat.name); }}>
                  <Edit3 size={14} />
                </button>
                <button className="ghost-button compact" style={{ color: "var(--red)" }}
                  onClick={() => setConfirmDelete(cat.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {!categories.length && <p className="muted">No categories yet.</p>}
        </div>
      </section>
      <ConfirmDialog open={!!confirmDelete} title="Delete Category"
        message="This will permanently delete this category if no photographers are assigned."
        confirmLabel="Delete" variant="danger"
        onConfirm={() => handleDelete(confirmDelete!)}
        onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
