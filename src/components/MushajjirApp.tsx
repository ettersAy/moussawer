import { useEffect, useRef } from "react";
import { createApp } from "vue";
import { createPinia } from "pinia";
import CanvasView from "../views/CanvasView.vue";
import "../styles/mushajjir.css";

export default function MushajjirApp() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const app = createApp(CanvasView);
    app.use(createPinia());

    const mountPoint = document.createElement("div");
    mountPoint.style.width = "100%";
    mountPoint.style.height = "100%";
    containerRef.current.appendChild(mountPoint);
    app.mount(mountPoint);

    return () => {
      app.unmount();
      if (containerRef.current?.contains(mountPoint)) {
        containerRef.current.removeChild(mountPoint);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    />
  );
}
