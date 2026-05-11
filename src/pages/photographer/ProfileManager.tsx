import { useState } from "react";
import { Save } from "lucide-react";
import { useToast } from "../../components/shared/Toast";
import { api, type Photographer } from "../../lib/api";

export function ProfileManager({ photographer, onRefresh }: { photographer: Photographer; onRefresh: () => void }) {
  const toast = useToast();
  const [form, setForm] = useState({
    bio: photographer.bio,
    city: photographer.city,
    country: photographer.country,
    profileImageUrl: photographer.profileImageUrl ?? "",
    startingPrice: photographer.startingPrice,
    timezone: photographer.timezone,
    isPublished: photographer.isPublished,
  });

  async function save() {
    try {
      await api("/me/photographer", { method: "PATCH", body: form });
      toast.success("Profile updated.");
      onRefresh();
    } catch (err: any) { toast.error(err.message); }
  }

  return (
    <div className="content-stack" style={{ maxWidth: "620px" }}>
      <div className="panel" style={{ display: "grid", gap: "14px" }}>
        <h2>Profile Settings</h2>

        <label>Bio <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></label>

        <div className="form-row">
          <label>City <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label>
          <label>Country <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></label>
        </div>

        <label>Profile Image URL <input value={form.profileImageUrl} onChange={(e) => setForm({ ...form, profileImageUrl: e.target.value })} placeholder="https://..." /></label>

        <div className="form-row">
          <label>Starting Price ($) <input type="number" value={form.startingPrice} onChange={(e) => setForm({ ...form, startingPrice: Number(e.target.value) })} /></label>
          <label>Timezone <input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} /></label>
        </div>

        <label style={{ flexDirection: "row", alignItems: "center", gap: "8px" }}>
          <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} style={{ width: "auto" }} />
          Published (visible in search)
        </label>

        <div className="card-title-row">
          <span className="muted">Verified: {photographer.verified ? "✅ Yes" : "❌ No (contact admin)"}</span>
          <span className="muted">Rating: ⭐ {photographer.rating} ({photographer.reviewCount} reviews)</span>
        </div>

        <button className="solid-button" onClick={save}><Save size={16} /> Save Profile</button>
      </div>
    </div>
  );
}
