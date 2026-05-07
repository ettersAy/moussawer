import { Camera } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("client@example.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to log in");
    }
  }

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <span className="brand-mark large"><Camera size={22} /></span>
        <h1>Welcome back</h1>
        <p className="muted">Use admin@example.com, photographer-one@example.com, or client@example.com with password.</p>
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
        </label>
        <label>
          Password
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="solid-button full" type="submit">Log in</button>
        <p className="muted">New to Moussawer? <Link to="/register">Create an account</Link></p>
      </form>
    </section>
  );
}
