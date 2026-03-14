import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const apiBase = env.VITE_API_BASE || "http://15.165.0.170:8000";

  return {
    plugins: [
      react(),
      VitePWA({
        devOptions: {
          enabled: true,
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
        "/api": {
          target: apiBase,
          changeOrigin: true,
        },
      },
    },
  };
});