import { defineConfig } from "vite";

export default defineConfig({
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: {
        main: "src/main.tsx",
        login: "src/login.tsx",
        i18n: "src/i18n.ts",
      },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
      cssFileName: "ui",
    },
    rollupOptions: {
      output: {
        chunkFileNames: "chunk-[name].js",
        assetFileNames: "[name][extname]",
      },
    },
  },
});
