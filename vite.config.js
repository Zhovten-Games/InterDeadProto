import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  root: 'proto-dev',
  build: {
    target: 'esnext',
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: 'esbuild',
  },
});
