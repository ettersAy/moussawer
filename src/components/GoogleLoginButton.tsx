import { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";

interface GoogleLoginButtonProps {
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
}

export function GoogleLoginButton({ text = "signin_with" }: GoogleLoginButtonProps) {
  const { googleLogin } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const initialized = useRef(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

  useEffect(() => {
    if (!clientId || initialized.current) return;
    initialized.current = true;

    if (window.google?.accounts) {
      initButton();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => initButton();
    script.onerror = () => setError("Failed to load Google sign-in");
    document.head.appendChild(script);
  }, [clientId]);

  function initButton() {
    if (!window.google || !buttonRef.current) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredential
    });
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      text,
      width: buttonRef.current.offsetWidth || 300
    });
    setReady(true);
  }

  async function handleCredential(response: { credential: string }) {
    setError("");
    try {
      await googleLogin(response.credential);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    }
  }

  if (!clientId) {
    return (
      <p className="muted" style={{ fontSize: "0.8rem", textAlign: "center" }}>
        Google sign-in is not configured (missing VITE_GOOGLE_CLIENT_ID).
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div className="auth-divider">
        <span>or continue with</span>
      </div>
      <div ref={buttonRef} style={{ minHeight: 40 }} />
      {!ready && !error && <p className="muted" style={{ fontSize: "0.8rem" }}>Loading Google sign-in...</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
