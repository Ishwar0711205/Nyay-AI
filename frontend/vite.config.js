import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/auth": "http://127.0.0.1:8000",
      "/query": "http://127.0.0.1:8000",
      "/ask": "http://127.0.0.1:8000",
      "/upload": "http://127.0.0.1:8000",
      "/documents": "http://127.0.0.1:8000",
      "/corpus": "http://127.0.0.1:8000",
      "/sessions": "http://127.0.0.1:8000",
      "/health": "http://127.0.0.1:8000",
      "/diagnostics": "http://127.0.0.1:8000",
    },
  },
});
