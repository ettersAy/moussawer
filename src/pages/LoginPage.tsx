import { Camera } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLoginButton } from "../components/GoogleLoginButton";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("client@example.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await login(email, password);
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
        <GoogleLoginButton text="signin_with" />
        <p className="muted">New to Moussawer? <Link to="/register">Create an account</Link></p>
      </form>
    </section>
  );
}
