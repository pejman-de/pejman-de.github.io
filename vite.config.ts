import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";


// Schreibt beim Build eine CNAME-Datei in das Ausgabeverzeichnis.
// Die Domain kommt aus der Umgebungsvariable SITE_DOMAIN. Damit laesst
// sich derselbe Build auf die pjslm-Subdomain oder auf die Zieldomain
// unter ed-rent.de veroeffentlichen, ohne eine Datei zu aendern.
function cnameSchreiben(vorgabe: string): Plugin {
  return {
    name: "ed-cname-schreiben",
    apply: "build",
    generateBundle() {
      const domain = (process.env.SITE_DOMAIN || vorgabe).trim();
      this.emitFile({
        type: "asset",
        fileName: "CNAME",
        source: domain + "\n",
      });
    },
  };
}

const plugins = [
  react(),
  tailwindcss(),
  cnameSchreiben("lp1.pjslm.de"),
];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: false, // Will find next available port if 3000 is busy
    host: true,
    allowedHosts: ["localhost", "127.0.0.1"],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
