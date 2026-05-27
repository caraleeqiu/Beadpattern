import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig(({ mode }) => ({
  plugins: mode === "singlefile" ? [react(), viteSingleFile()] : [react()],
  // GitHub Pages serves the site under /<repo>/ — use that as the base in CI
  // builds; locally (dev / preview / singlefile) keep the root path.
  base: mode === "production" ? "/Beadpattern/" : "/",
  server: { host: true, port: 5173 },
  build:
    mode === "singlefile"
      ? { outDir: "dist-single", assetsInlineLimit: 100000000, cssCodeSplit: false, reportCompressedSize: false, rollupOptions: { output: { inlineDynamicImports: true } } }
      : {},
}));
