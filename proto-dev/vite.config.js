import { defineConfig } from 'vite';

const FAVICON_RE = /(?:^|\/)favicon|apple-touch-icon|site\.webmanifest$/;

export default defineConfig({
  base: './',
  build: {
    target: 'esnext',
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        entryFileNames: 'src/[name]-[hash].js',
        chunkFileNames: 'src/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo?.name || '';

          if (name.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }

          if (FAVICON_RE.test(name)) {
            return 'assets/favicons/[name]-[hash][extname]';
          }

          if (/\.(png|jpe?g|svg|gif|webp|ico)$/.test(name)) {
            return 'assets/images/[name]-[hash][extname]';
          }

          if (/\.(wasm)$/.test(name)) {
            return 'assets/wasm/[name]-[hash][extname]';
          }

          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
