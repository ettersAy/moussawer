import { Send } from "lucide-react";
import { useState } from "react";
import { api } from "../lib/api";

export function SupportPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    await api("/support", { method: "POST", body: form, auth: false });
    setSent(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  }

  return (
    <section className="page support-layout">
      <div>
        <span className="eyebrow">Platform support</span>
        <h1>Help for booking, safety, content, and account questions.</h1>
        <p className="muted">
          Authenticated users can also open structured incidents and disputes from the Cases workspace.
        </p>
      </div>
      <form className="panel support-form" onSubmit={submit}>
        <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
        <label>Subject<input value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} /></label>
        <label>Message<textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} /></label>
        {sent && <p className="form-success">Support request received.</p>}
        <button className="solid-button full" type="submit"><Send size={16} /> Send</button>
      </form>
    </section>
  );
}
