import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import { sveltePreprocess } from 'svelte-preprocess';
import { defineConfig } from 'vite';
import packageExtension from './vite-plugin-package-extension';

const mode = process.env.MODE || 'development';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      $lib: path.resolve('./src/lib/'),
    },
    extensions: ['.js', '.svelte'],
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1000,
    // minify: mode === 'production',
    // sourcemap: mode === 'production',
    rollupOptions: {
      input: {
        pages: 'src/lib/pages/main.js',
        background: 'src/lib/background/background.js',
        'content/module-loader': 'src/lib/content/module-loader.js',
        'content/main': 'src/lib/content/main.js',
        sodium: 'src/lib/content/sodium/main.js',
      },
      output: {
        entryFileNames: 'scripts/[name].js',
      },
    },
    outDir: `./dist/${mode}`,
    emptyOutDir: true,
  },
  plugins: [
    svelte({
      preprocess: sveltePreprocess(),
      emitCss: false,
      compilerOptions: {
        customElement: true,
      },
    }),
    packageExtension(),
  ],
  base: '', // Use relative links in `index.html`
  envDir: './config',
  envPrefix: 'SODIUM_',
  mode,
  test: {
    exclude: [
      '**/node_modules/**',
      '**/tests/**', // Playwright
    ],
  },
});
