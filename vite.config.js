import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import sveltePreprocess from 'svelte-preprocess';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      $lib: path.resolve('./src/lib/'),
    },
    extensions: ['.js', '.svelte'],
  },
  build: {
    // minify: process.env.MODE === 'production',
    // sourcemap: process.env.MODE === 'production',
    rollupOptions: {
      input: {
        pages: 'src/lib/pages/main.js',
        background: 'src/lib/background/background.js',
        content: 'src/lib/content/content.js',
        sodium: 'src/lib/content/sodium/main.js',
      },
      output: {
        entryFileNames: 'scripts/[name].js',
      },
    },
  },
  plugins: [
    svelte({
      preprocess: sveltePreprocess(),
      emitCss: false,
    }),
  ],
  base: '', // Use relative links in `index.html`
  envDir: './config',
  envPrefix: 'SODIUM_',
  mode: process.env.MODE || 'development',
});
