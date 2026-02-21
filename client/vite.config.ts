import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import os from "os";
import path from "path";

export default defineConfig({
  plugins: [react(), basicSsl()],
  cacheDir: path.join(os.tmpdir(), "uaucode-vite-cache"),
  server: {
    port: 8080,
    host: true,
    https: {},
  },
  build: {
    target: "esnext",
  },
});
