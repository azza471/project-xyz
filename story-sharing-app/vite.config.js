import { defineConfig } from "vite";

export default defineConfig({
  base: "/project-xyz/",
  root: "src",
  publicDir: "public",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
