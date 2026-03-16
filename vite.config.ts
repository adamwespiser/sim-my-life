import { defineConfig } from "vite";

export default defineConfig({
  build: {
    cssCodeSplit: false,
    emptyOutDir: true,
    lib: {
      entry: "src/main.ts",
      fileName: () => "sim-returns.js",
      formats: ["es"]
    },
    outDir: "dist",
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  }
});
