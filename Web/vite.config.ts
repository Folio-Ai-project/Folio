import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const appApiBase = env.VITE_API_BASE || "http://localhost:5000";
  const aiApiBase = env.VITE_AI_BASE || "http://localhost:8000";

  return {
    plugins: [
      react(),
      VitePWA({
        devOptions: {
          enabled: false,
        },
        manifest: {
          name: "My App",
          short_name: "App",
          start_url: "/",
          display: "standalone",
        },
      }),
    ],

    server: {
      proxy: {
        "/api/auth": {
          target: appApiBase,
          changeOrigin: true,
        },
        "/api/profile": {
          target: appApiBase,
          changeOrigin: true,
        },
        "/api/analyze": {
          target: aiApiBase,
          changeOrigin: true,
        },
        "/api/layout": {
          target: aiApiBase,
          changeOrigin: true,
        },
        "/api/ocr": {
          target: aiApiBase,
          changeOrigin: true,
        },
      },
    },
  };
});
