import { useEffect, useState } from "react";
import { api, type User } from "../../lib/api";

type FormData = {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "CLIENT" | "PHOTOGRAPHER";
  avatarUrl: string;
  // Client fields
  location: string;
  bio: string;
  phone: string;
  // Photographer fields
  city: string;
  startingPrice: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

type UserFormModalProps = {
  open: boolean;
  user?: User | null;
  onClose: () => void;
  onSaved: () => void;
};

const emptyForm: FormData = {
  name: "",
  email: "",
  password: "",
  role: "CLIENT",
  avatarUrl: "",
  location: "",
  bio: "",
  phone: "",
  city: "",
  startingPrice: "",
};

export function UserFormModal({ open, user, onClose, onSaved }: UserFormModalProps) {
  const isCreate = !user;
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (user) {
        setForm({
          name: user.name,
          email: user.email,
          password: "",
          role: user.role,
          avatarUrl: user.avatarUrl ?? "",
          location: user.clientProfile?.location ?? "",
          bio: user.clientProfile?.bio ?? "",
          phone: user.clientProfile?.phone ?? "",
          city: user.photographerProfile?.city ?? "",
          startingPrice: user.photographerProfile?.startingPrice ? String(user.photographerProfile.startingPrice) : "",
        });
      } else {
        setForm(emptyForm);
      }
      setErrors({});
      setServerError(null);
    }
  }, [open, user]);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email format";
    if (isCreate && !form.password) errs.password = "Password is required";
    else if (isCreate && form.password.length < 6) errs.password = "Password must be at least 6 characters";
    if (form.avatarUrl && !/^https?:\/\//.test(form.avatarUrl)) errs.avatarUrl = "Must be a valid URL";
    if (form.role === "PHOTOGRAPHER" && !form.city.trim()) errs.city = "City is required";
    if (form.role === "PHOTOGRAPHER" && form.startingPrice && isNaN(Number(form.startingPrice))) errs.startingPrice = "Must be a number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setServerError(null);

    try {
      const body: Record<string, unknown> = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        avatarUrl: form.avatarUrl || null,
      };

      if (isCreate) {
        body.password = form.password;
      }

      if (form.role === "CLIENT") {
        body.location = form.location || null;
        body.bio = form.bio || null;
        body.phone = form.phone || null;
      } else if (form.role === "PHOTOGRAPHER") {
        body.city = form.city || "Toronto";
        body.bio = form.bio || "Available for curated photography sessions.";
        body.startingPrice = form.startingPrice ? Number(form.startingPrice) : 250;
      }

      if (isCreate) {
        await api(`/admin/users`, { method: "POST", body });
      } else {
        await api(`/admin/users/${user!.id}`, { method: "PATCH", body });
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setServerError(err.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="user-form-title">
      <div className="modal-card user-form-modal" onClick={(e) => e.stopPropagation()}>
        <h2 id="user-form-title">{isCreate ? "Create User" : `Edit User: ${user!.name}`}</h2>

        {serverError && <p className="form-error">{serverError}</p>}

        <form onSubmit={handleSubmit} className="user-form">
          <label>
            Name *
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className={errors.name ? "input-error" : ""}
              autoFocus
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </label>

          <label>
            Email *
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </label>

          {isCreate && (
            <label>
              Password *
              <input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className={errors.password ? "input-error" : ""}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </label>
          )}

          <label>
            Avatar URL
            <input
              type="url"
              value={form.avatarUrl}
              onChange={(e) => update("avatarUrl", e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className={errors.avatarUrl ? "input-error" : ""}
            />
            {errors.avatarUrl && <span className="field-error">{errors.avatarUrl}</span>}
          </label>

          <label>
            Role *
            <select
              value={form.role}
              onChange={(e) => update("role", e.target.value as FormData["role"])}
            >
              <option value="CLIENT">Client</option>
              <option value="PHOTOGRAPHER">Photographer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>

          {/* Client-specific fields */}
          {form.role === "CLIENT" && (
            <div className="user-form-section">
              <h4>Client Profile</h4>
              <label>
                Location
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="e.g. Toronto, ON"
                />
              </label>
              <label>
                Bio
                <textarea
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  placeholder="Short bio..."
                  rows={3}
                />
              </label>
              <label>
                Phone
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="e.g. +1 416-555-0123"
                />
              </label>
            </div>
          )}

          {/* Photographer-specific fields */}
          {form.role === "PHOTOGRAPHER" && (
            <div className="user-form-section">
              <h4>Photographer Profile</h4>
              <label>
                City *
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="e.g. Toronto"
                  className={errors.city ? "input-error" : ""}
                />
                {errors.city && <span className="field-error">{errors.city}</span>}
              </label>
              <label>
                Starting Price ($)
                <input
                  type="number"
                  value={form.startingPrice}
                  onChange={(e) => update("startingPrice", e.target.value)}
                  placeholder="e.g. 250"
                  min={0}
                  className={errors.startingPrice ? "input-error" : ""}
                />
                {errors.startingPrice && <span className="field-error">{errors.startingPrice}</span>}
              </label>
              <label>
                Bio
                <textarea
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  placeholder="Short bio..."
                  rows={3}
                />
              </label>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="ghost-button" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="solid-button" disabled={saving}>
              {saving ? "Saving…" : isCreate ? "Create User" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
