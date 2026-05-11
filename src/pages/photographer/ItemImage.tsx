import { useState } from "react";
import { ImageOff } from "lucide-react";

export function ItemImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "160px", background: "var(--surface-muted)", color: "var(--muted-foreground)", fontSize: "0.82rem", gap: "6px" }}>
        <ImageOff size={18} /> No preview
      </div>
    );
  }
  return <img src={src} alt={alt} onError={() => setFailed(true)} />;
}
