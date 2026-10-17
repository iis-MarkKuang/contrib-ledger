import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  envDir: "..",
  server: {
    // cloudflared quick tunnel URLs change on every restart, so allow any host.
    allowedHosts: true,
  },
});
