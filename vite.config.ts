/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import vue from "@vitejs/plugin-vue";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiPort = env.PORT || "4000";

  return {
    plugins: [react(), vue()],
    server: {
      port: 5173,
      proxy: {
        "/api": `http://localhost:${apiPort}`
      }
    },
    test: {
      // Only include .test.ts files; .spec.ts files are for Playwright
      include: ["**/*.test.{ts,js,mjs,cjs,tsx,jsx}"],
      exclude: ["**/*.spec.{ts,js,mjs,cjs,tsx,jsx}", "node_modules/**"]
    }
  };
});
