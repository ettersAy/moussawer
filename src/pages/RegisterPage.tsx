import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLoginButton } from "../components/GoogleLoginButton";
import { useAuth } from "../hooks/useAuth";

export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "CLIENT" as "CLIENT" | "PHOTOGRAPHER", location: "", bio: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await register(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to register");
    }
  }

  return (
    <section className="auth-page">
      <form className="auth-card wide" onSubmit={submit}>
        <h1>Create your account</h1>
        <div className="segmented">
          <button type="button" className={form.role === "CLIENT" ? "active" : ""} onClick={() => setForm({ ...form, role: "CLIENT" })}>Client</button>
          <button type="button" className={form.role === "PHOTOGRAPHER" ? "active" : ""} onClick={() => setForm({ ...form, role: "PHOTOGRAPHER" })}>Photographer</button>
        </div>
        <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
        <label>Password<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
        <label>Location<input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></label>
        <label>Bio<textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} /></label>
        {error && <p className="form-error">{error}</p>}
        <button className="solid-button full" type="submit">Create account</button>
        <GoogleLoginButton text="signup_with" />
        <p className="muted">Already have an account? <Link to="/login">Log in</Link></p>
      </form>
    </section>
  );
}
